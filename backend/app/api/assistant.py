"""
Assistant API — AI-powered inventory queries using Groq + live DB.

CRITICAL: The LLM never sources inventory truth — it only synthesizes readable
responses from data returned by domain services. Read-only mutations always
return ACTION_REQUIRES_CONFIRMATION and route through the voice pipeline.
"""
import logging
from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_business_id
from app.core import groq_client
from app.services import rag_service
from app.repositories.product_repository import product_repo
from app.repositories.inventory_repository import inventory_repo
from app.repositories.transaction_repository import transaction_repo
from app.models.inventory import Inventory
from app.models.product import Product

router = APIRouter()
logger = logging.getLogger(__name__)

ASSISTANT_SYSTEM_PROMPT = """You are the VoiceMate inventory assistant for a wholesale grocery business.

You help operators understand their inventory status, identify issues, and make decisions.

CRITICAL RULES:
- You NEVER make up inventory numbers — all data is provided to you from the live database
- You NEVER execute inventory changes automatically
- For any stock change request, you MUST respond with ACTION_REQUIRES_CONFIRMATION
- Be concise and actionable — this is a busy shop floor
- Support English, Telugu, and Tenglish naturally
- Format numbers clearly (e.g., "400 KG" not "400kg")
- Highlight urgent issues (expiry, low stock) prominently

When data is provided, synthesize it naturally. If data shows 0 items, say so clearly.
Use bullet points for lists of items.
"""


class AssistantRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class AssistantResponse(BaseModel):
    reply: str
    intent: str
    data: Optional[dict] = None
    action_required: bool = False
    spoken_text: Optional[str] = None  # For TTS (shorter version)


@router.post("/query", response_model=AssistantResponse)
async def query_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    """
    Main assistant endpoint. Classifies intent, fetches live data from DB,
    and uses Groq to generate a natural response.
    """
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Empty message")

    logger.info(f"[assistant/query] '{message[:80]}' (business={business_id})")

    # 1. Classify intent using lightweight local rules
    intent = _classify_intent(message)
    logger.info(f"[assistant] Intent: {intent}")

    # 2. Fetch live data from domain services (NOT the LLM)
    data = {}
    tool_results = ""

    try:
        if intent == "LOW_STOCK_QUERY":
            data = _get_low_stock(db, business_id)
            tool_results = _format_low_stock(data)

        elif intent == "EXPIRY_QUERY":
            data = _get_expiry_attention(db, business_id)
            tool_results = _format_expiry(data)

        elif intent == "TRANSACTION_QUERY":
            data = _get_recent_transactions(db, business_id)
            tool_results = _format_transactions(data)

        elif intent == "STOCK_LOOKUP":
            product_query = _extract_product_name(message)
            data = _get_product_stock(db, business_id, product_query)
            tool_results = _format_product_stock(data)

        elif intent == "REPLENISHMENT_QUERY":
            data = _get_low_stock(db, business_id)
            tool_results = _format_replenishment(data)

        elif intent in ("STOCK_IN", "STOCK_OUT", "ADJUSTMENT"):
            # Mutation requested — route to voice pipeline
            return AssistantResponse(
                reply="To add or remove stock, please use the Voice Console or type a command like 'Rice rendu bags vachayi'. I'll guide you through the confirmation process.",
                intent="ACTION_REQUIRES_CONFIRMATION",
                action_required=True,
                spoken_text="Please use the Voice Console to make stock changes.",
            )

        else:
            # General query — use RAG context
            rag_context = rag_service.retrieve_context(db=db, business_id=business_id, query=message)
            tool_results = rag_context or "No specific context found."

    except Exception as e:
        logger.error(f"[assistant] Tool execution failed: {e}")
        tool_results = "Data temporarily unavailable."

    # 3. Generate response via Groq (synthesizes data — never invents it)
    try:
        reply = groq_client.generate_response(
            system_prompt=ASSISTANT_SYSTEM_PROMPT,
            user_message=message,
            tool_results=tool_results,
        )
    except Exception as e:
        logger.error(f"[assistant] Response generation failed: {e}")
        # Return raw data without LLM synthesis
        reply = tool_results or "I encountered an issue. Please check the inventory screens directly."

    # Generate shorter spoken version (first sentence)
    spoken = reply.split(".")[0] + "." if "." in reply else reply[:150]

    return AssistantResponse(
        reply=reply,
        intent=intent,
        data=data,
        action_required=False,
        spoken_text=spoken,
    )


# ---------------------------------------------------------------------------
# Intent classification (lightweight, local — no LLM)
# ---------------------------------------------------------------------------
def _classify_intent(text: str) -> str:
    text_lower = text.lower()

    # Mutation detection — these should be routed to voice pipeline
    mutation_words = [
        "add ", "remove ", "stock in", "stock out", "vachayi", "ammamu",
        "vachindi", "poindi", "received", "sold", "adjust"
    ]
    for word in mutation_words:
        if word in text_lower:
            return "STOCK_IN" if any(w in text_lower for w in ["add", "vachayi", "vachindi", "received"]) else "STOCK_OUT"

    # Low stock / replenishment
    if any(w in text_lower for w in ["low", "thakkuva", "running out", "reorder", "replenish"]):
        return "LOW_STOCK_QUERY"

    # Expiry
    if any(w in text_lower for w in ["expir", "shelf", "expire", "best before", "fresh"]):
        return "EXPIRY_QUERY"

    # Transactions / movements
    if any(w in text_lower for w in ["transaction", "movement", "today", "history", "ledger", "recent"]):
        return "TRANSACTION_QUERY"

    # Specific stock lookup
    if any(w in text_lower for w in ["how much", "how many", "stock", "entha", "available", "balance", "undi"]):
        return "STOCK_LOOKUP"

    # Replenishment
    if "replenish" in text_lower:
        return "REPLENISHMENT_QUERY"

    return "GENERAL"


def _extract_product_name(text: str) -> str:
    """Very basic product name extraction from query text."""
    # Remove common question words and return the core subject
    remove_words = [
        "how", "much", "many", "what", "is", "what's", "tell", "me", "show",
        "do", "we", "have", "there", "entha", "undi", "stock", "available",
        "of", "the", "a", "an", "we've", "weve"
    ]
    # Clean punctuation
    clean_text = text.replace("?", "").replace(".", "").replace(",", "")
    words = clean_text.lower().split()
    
    product_words = []
    for word in words:
        if word not in remove_words and len(word) > 2:
            product_words.append(word)
            
    if product_words:
        return " ".join(product_words)
    return text  # Return full text as fallback


# ---------------------------------------------------------------------------
# Domain service calls (ALL live from DB — NEVER LLM)
# ---------------------------------------------------------------------------

def _get_low_stock(db: Session, business_id: str) -> dict:
    """Get products below their minimum stock level."""
    products = product_repo.search_products(db, business_id=business_id, query="", limit=500)
    low_stock_items = []
    for p in products:
        inv = inventory_repo.get_by_product(db, product_id=p.id)
        current = inv.current_stock if inv else 0.0
        if current <= p.min_stock:
            low_stock_items.append({
                "product_id": p.id,
                "name": p.name,
                "sku": p.sku,
                "current_stock": current,
                "min_stock": p.min_stock,
                "base_unit": p.base_unit,
                "deficit": round(p.min_stock - current, 2),
            })
    return {"low_stock_items": low_stock_items, "total": len(low_stock_items)}


def _get_expiry_attention(db: Session, business_id: str) -> dict:
    """Get items expiring soon or already expired (from inventory batches if available)."""
    # Basic implementation — returns products with potential expiry issues
    # In full system, this would query the batches table
    return {
        "expiring_soon": [],
        "expired": [],
        "message": "Expiry data managed in the Expiry & Shelf Clock section."
    }


def _get_recent_transactions(db: Session, business_id: str) -> dict:
    """Get today's and recent transactions."""
    try:
        # Fetch recent 20 transactions
        from sqlalchemy import desc
        from app.models.transaction import Transaction
        txs = (
            db.query(Transaction)
            .filter(Transaction.business_id == business_id)
            .order_by(desc(Transaction.timestamp))
            .limit(20)
            .all()
        )
        
        tx_list = []
        for tx in txs:
            product = product_repo.get(db, id=tx.product_id)
            tx_list.append({
                "id": tx.id[:8],
                "type": tx.type,
                "product_name": product.name if product else "Unknown",
                "quantity": tx.quantity,
                "base_unit": product.base_unit if product else "",
                "source": tx.source,
                "timestamp": tx.timestamp.isoformat() if tx.timestamp else "",
                "prev_balance": tx.prev_balance,
                "new_balance": tx.new_balance,
            })
        return {"transactions": tx_list, "total": len(tx_list)}
    except Exception as e:
        logger.error(f"Transaction fetch failed: {e}")
        return {"transactions": [], "total": 0}


def _get_product_stock(db: Session, business_id: str, product_query: str) -> dict:
    """Get stock level for a specific product."""
    results = product_repo.search_products(db, business_id=business_id, query=product_query, limit=5)
    if not results:
        return {"found": False, "query": product_query}
    
    items = []
    for p in results:
        inv = inventory_repo.get_by_product(db, product_id=p.id)
        current = inv.current_stock if inv else 0.0
        items.append({
            "name": p.name, "sku": p.sku,
            "current_stock": current, "base_unit": p.base_unit,
            "min_stock": p.min_stock,
            "is_low": current <= p.min_stock,
        })
    return {"found": True, "items": items, "query": product_query}


# ---------------------------------------------------------------------------
# Data formatting (for LLM synthesis context)
# ---------------------------------------------------------------------------

def _format_low_stock(data: dict) -> str:
    items = data.get("low_stock_items", [])
    if not items:
        return "All products are above their minimum stock levels. No low stock alerts."
    lines = [f"LOW STOCK ALERT — {len(items)} items need attention:"]
    for item in items:
        lines.append(
            f"  • {item['name']} (SKU: {item['sku']}): "
            f"{item['current_stock']} {item['base_unit']} current, "
            f"minimum {item['min_stock']} {item['base_unit']} "
            f"(deficit: {item['deficit']} {item['base_unit']})"
        )
    return "\n".join(lines)


def _format_expiry(data: dict) -> str:
    return data.get("message", "Check the Expiry & Shelf Clock section for details.")


def _format_transactions(data: dict) -> str:
    txs = data.get("transactions", [])
    if not txs:
        return "No transactions recorded yet."
    lines = [f"RECENT TRANSACTIONS ({len(txs)} records):"]
    for tx in txs[:10]:
        sign = "+" if tx["type"] == "STOCK_IN" else "-"
        lines.append(
            f"  • {tx['type']} | {tx['product_name']}: "
            f"{sign}{abs(tx['quantity'])} {tx['base_unit']} "
            f"[{tx['source']}] at {tx['timestamp'][:16]}"
        )
    return "\n".join(lines)


def _format_product_stock(data: dict) -> str:
    if not data.get("found"):
        return f"No product found matching '{data.get('query', '')}'."
    items = data.get("items", [])
    lines = []
    for item in items:
        status = " ⚠️ LOW STOCK" if item["is_low"] else ""
        lines.append(
            f"{item['name']}: {item['current_stock']} {item['base_unit']}"
            f" (min: {item['min_stock']} {item['base_unit']}){status}"
        )
    return "\n".join(lines)


def _format_replenishment(data: dict) -> str:
    items = data.get("low_stock_items", [])
    if not items:
        return "No items currently require replenishment."
    lines = [f"REPLENISHMENT QUEUE — {len(items)} items:"]
    for item in sorted(items, key=lambda x: x["deficit"], reverse=True):
        lines.append(f"  • {item['name']}: order at least {item['deficit']} {item['base_unit']}")
    return "\n".join(lines)
