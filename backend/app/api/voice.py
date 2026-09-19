"""
Voice API — the complete voice pipeline.

Endpoints:
  POST /api/voice/transcribe  — audio → Groq Whisper → transcript
  POST /api/voice/interpret   — transcript → RAG + Groq LLM → structured command
  POST /api/voice/preview     — command → product resolution + TUNE + validation → preview
  POST /api/voice/confirm     — ONLY endpoint that mutates inventory

AI Safety Contract:
  - LLM NEVER mutates inventory
  - LLM NEVER decides final product ID
  - LLM NEVER calculates authoritative TUNE conversion
  - /confirm is the ONLY mutation — always via InventoryService
"""
import logging
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.auth import get_current_business_id
from app.core import groq_client
from app.services import rag_service
from app.services.inventory_service import inventory_service
from app.repositories.product_repository import product_repo
from app.repositories.inventory_repository import inventory_repo
from app.models.trade_unit import TradeUnit
from app.schemas.voice import (
    TranscribeResponse,
    InterpretRequest,
    StructuredCommand,
    PreviewRequest,
    PreviewResponse,
    ProductSummary,
    ConfirmRequest,
    ConfirmResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowed audio MIME types from MediaRecorder
ALLOWED_AUDIO_TYPES = {
    "audio/webm", "audio/webm;codecs=opus", "audio/ogg", "audio/ogg;codecs=opus",
    "audio/mp4", "audio/mpeg", "audio/wav", "audio/flac",
    "audio/x-m4a", "video/webm",  # Some browsers report video/webm for audio
}
MAX_AUDIO_SIZE_MB = 25


# ---------------------------------------------------------------------------
# 1. TRANSCRIBE — Audio → Groq Whisper → Transcript
# ---------------------------------------------------------------------------
@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    business_id: str = Depends(get_current_business_id),
):
    """
    Accepts browser MediaRecorder audio, sends to Groq Whisper.
    Returns transcript text, detected language, and duration.
    """
    # Validate content type
    content_type = (audio.content_type or "").split(";")[0].strip()
    if content_type and content_type not in ALLOWED_AUDIO_TYPES and "audio/" not in content_type:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format: {content_type}. Use WebM, OGG, MP4, or WAV."
        )

    # Read and validate size
    audio_bytes = await audio.read()
    size_mb = len(audio_bytes) / (1024 * 1024)
    if size_mb > MAX_AUDIO_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"Audio file too large ({size_mb:.1f}MB). Maximum is {MAX_AUDIO_SIZE_MB}MB."
        )

    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file is too small or empty.")

    logger.info(f"[voice/transcribe] Received {size_mb:.2f}MB audio from business={business_id}")

    try:
        result = groq_client.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=audio.filename or "recording.webm",
            language=language,
        )
        return TranscribeResponse(**result)
    except RuntimeError as e:
        error_code = str(e).split(":")[0]
        if "GROQ_UNAVAILABLE" in error_code:
            raise HTTPException(
                status_code=503,
                detail="Voice intelligence is temporarily unavailable. Please try typing your command instead."
            )
        raise HTTPException(status_code=422, detail=f"Transcription failed: {str(e)}")


# ---------------------------------------------------------------------------
# 2. INTERPRET — Transcript → RAG + Groq LLM → StructuredCommand
# ---------------------------------------------------------------------------
@router.post("/interpret", response_model=StructuredCommand)
async def interpret_command(
    request: InterpretRequest,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    """
    Takes a raw transcript (voice or typed) and returns a structured inventory command.
    Retrieves RAG context first, then calls Groq LLM with strict JSON schema.
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty command text.")

    logger.info(f"[voice/interpret] '{text[:80]}' (business={business_id})")

    # RAG context retrieval
    rag_context = ""
    try:
        rag_context = rag_service.retrieve_context(
            db=db,
            business_id=business_id,
            query=text,
            top_k=5,
        )
        if rag_context:
            logger.debug(f"RAG context retrieved ({len(rag_context)} chars)")
    except Exception as e:
        logger.warning(f"RAG retrieval failed (non-fatal): {e}")

    # Groq LLM extraction
    try:
        raw = groq_client.extract_command(text, rag_context=rag_context)
        cmd = StructuredCommand(
            intent=raw.get("intent", "UNKNOWN"),
            product_query=raw.get("product_query"),
            quantity=raw.get("quantity"),
            unit=raw.get("unit"),
            language=raw.get("language"),
            confidence=raw.get("confidence", 0.0),
            clarification_required=raw.get("clarification_required", False),
            clarification_reason=raw.get("clarification_reason"),
            rag_context_used=rag_context[:200] if rag_context else None,
        )
        return cmd
    except RuntimeError as e:
        error_code = str(e).split(":")[0]
        if "GROQ_UNAVAILABLE" in error_code:
            raise HTTPException(
                status_code=503,
                detail="AI command understanding is temporarily unavailable."
            )
        raise HTTPException(status_code=422, detail=f"Command parsing failed: {str(e)}")


# ---------------------------------------------------------------------------
# 3. PREVIEW — StructuredCommand → Product Resolution + TUNE + Validation
# ---------------------------------------------------------------------------
@router.post("/preview", response_model=PreviewResponse)
async def preview_command(
    request: PreviewRequest,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    """
    Resolves the product, applies TUNE conversion, validates the operation.
    Returns a complete preview — no mutations happen here.
    
    AI Safety: This is deterministic. The LLM result feeds IN here but
    the actual product ID, stock, TUNE conversion all come from the database.
    """
    cmd = request.command
    operation_id = request.operation_id or f"voice-{uuid.uuid4()}"

    logger.info(f"[voice/preview] intent={cmd.intent} product='{cmd.product_query}' qty={cmd.quantity} unit={cmd.unit}")

    # Handle read-only query intents (no product/quantity needed)
    if cmd.intent in ("LOW_STOCK_QUERY", "EXPIRY_QUERY", "TRANSACTION_QUERY"):
        return PreviewResponse(
            status="QUERY_RESULT",
            operation_id=operation_id,
            message=f"Query intent detected: {cmd.intent}. Use the assistant for read-only queries.",
        )

    # Unknown intent
    if cmd.intent == "UNKNOWN":
        return PreviewResponse(
            status="CLARIFICATION_REQUIRED",
            operation_id=operation_id,
            message="I couldn't understand that command. Please try rephrasing.",
        )

    # Handle stock lookup
    if cmd.intent == "STOCK_LOOKUP":
        product = _resolve_product(db, business_id, cmd.product_query)
        if isinstance(product, PreviewResponse):
            product.operation_id = operation_id
            return product
        inv = inventory_repo.get_by_product(db, product_id=product.id)
        current = inv.current_stock if inv else 0.0
        return PreviewResponse(
            status="QUERY_RESULT",
            operation_id=operation_id,
            product=ProductSummary(
                id=product.id, name=product.name, sku=product.sku,
                base_unit=product.base_unit, current_stock=current,
                category=product.category
            ),
            current_stock=current,
            base_unit=product.base_unit,
            message=f"{product.name}: {current} {product.base_unit} in stock.",
        )

    # Mutation intents (STOCK_IN / STOCK_OUT)
    if cmd.clarification_required:
        return PreviewResponse(
            status="CLARIFICATION_REQUIRED",
            operation_id=operation_id,
            message=cmd.clarification_reason or "More information needed.",
        )

    if cmd.quantity is None or cmd.quantity <= 0:
        return PreviewResponse(
            status="MISSING_QUANTITY",
            operation_id=operation_id,
            message="Quantity is missing or invalid. Please specify how many.",
        )

    # Product resolution (deterministic — LLM provides a query, DB resolves)
    product = _resolve_product(db, business_id, cmd.product_query)
    if isinstance(product, PreviewResponse):
        product.operation_id = operation_id
        return product

    # TUNE — Trade Unit Normalization (deterministic from DB config)
    normalized_qty, tune_note = _apply_tune(db, product, cmd.quantity, cmd.unit)
    if normalized_qty is None:
        return PreviewResponse(
            status="INVALID_UNIT",
            operation_id=operation_id,
            product=ProductSummary(
                id=product.id, name=product.name, sku=product.sku,
                base_unit=product.base_unit, current_stock=0,
                category=product.category
            ),
            message=f"Unit '{cmd.unit}' is not configured for {product.name}. Available units: {_get_available_units(db, product)}",
        )

    # Current inventory (from DB — never LLM)
    inv = inventory_repo.get_by_product(db, product_id=product.id)
    current_stock = inv.current_stock if inv else 0.0

    # Calculate projected stock
    if cmd.intent == "STOCK_IN":
        quantity_delta = normalized_qty
        projected_stock = current_stock + normalized_qty
    else:  # STOCK_OUT
        quantity_delta = -normalized_qty
        projected_stock = current_stock - normalized_qty

    # Validation
    if projected_stock < 0:
        return PreviewResponse(
            status="INSUFFICIENT_STOCK",
            operation_id=operation_id,
            product=ProductSummary(
                id=product.id, name=product.name, sku=product.sku,
                base_unit=product.base_unit, current_stock=current_stock,
                category=product.category
            ),
            quantity=cmd.quantity,
            input_unit=cmd.unit,
            normalized_quantity=normalized_qty,
            base_unit=product.base_unit,
            current_stock=current_stock,
            projected_stock=projected_stock,
            tune_note=tune_note,
            validation="INSUFFICIENT_STOCK",
            message=f"Cannot remove {normalized_qty} {product.base_unit}. Only {current_stock} {product.base_unit} available.",
        )

    return PreviewResponse(
        status="READY",
        operation_id=operation_id,
        product=ProductSummary(
            id=product.id, name=product.name, sku=product.sku,
            base_unit=product.base_unit, current_stock=current_stock,
            category=product.category
        ),
        quantity=cmd.quantity,
        input_unit=cmd.unit,
        normalized_quantity=quantity_delta,  # signed (positive=IN, negative=OUT)
        base_unit=product.base_unit,
        current_stock=current_stock,
        projected_stock=projected_stock,
        tune_note=tune_note,
        validation="VALID",
        message=f"Ready to {'add' if cmd.intent == 'STOCK_IN' else 'remove'} {normalized_qty} {product.base_unit} {'to' if cmd.intent == 'STOCK_IN' else 'from'} {product.name}.",
    )


# ---------------------------------------------------------------------------
# 4. CONFIRM — The ONLY mutation endpoint
# ---------------------------------------------------------------------------
@router.post("/confirm", response_model=ConfirmResponse)
async def confirm_command(
    request: ConfirmRequest,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    """
    ONLY endpoint that mutates inventory.
    Always goes through deterministic InventoryService with idempotency.
    """
    logger.info(
        f"[voice/confirm] operation_id={request.operation_id} "
        f"product={request.product_id} delta={request.quantity_delta}"
    )

    # Validate product belongs to this business
    product = product_repo.get(db, id=request.product_id)
    if not product or product.business_id != business_id:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        tx = inventory_service.adjust_stock(
            db=db,
            business_id=business_id,
            product_id=request.product_id,
            quantity=request.quantity_delta,
            source=request.source or "VOICE",
            operation_id=request.operation_id,
        )

        inv = inventory_repo.get_by_product(db, product_id=request.product_id)
        new_stock = inv.current_stock if inv else tx.new_balance

        return ConfirmResponse(
            success=True,
            transaction_id=tx.id,
            product_name=product.name,
            previous_stock=tx.prev_balance,
            new_stock=new_stock,
            base_unit=product.base_unit,
            source=request.source or "VOICE",
            message=f"{'Stock in' if request.quantity_delta > 0 else 'Stock out'} recorded. "
                    f"{product.name}: {tx.prev_balance} → {new_stock} {product.base_unit}",
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"[voice/confirm] Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")


# ---------------------------------------------------------------------------
# Helpers (deterministic — no LLM involvement)
# ---------------------------------------------------------------------------

def _resolve_product(db: Session, business_id: str, query: str):
    """
    Resolve product_query to a Product ORM object.
    Returns Product or PreviewResponse (error).
    """
    if not query:
        return PreviewResponse(
            status="PRODUCT_NOT_FOUND",
            operation_id="",
            message="Product name is missing from the command.",
        )

    results = product_repo.search_products(db, business_id=business_id, query=query, limit=10)
    
    if len(results) == 0:
        return PreviewResponse(
            status="PRODUCT_NOT_FOUND",
            operation_id="",
            message=f"No product found matching '{query}'. Please check the product name.",
        )
    
    if len(results) == 1:
        return results[0]
    
    # Multiple results — check for exact name match first
    query_lower = query.lower()
    for p in results:
        if p.name.lower() == query_lower:
            return p
    
    # Still ambiguous
    candidates = [{"id": p.id, "name": p.name, "sku": p.sku} for p in results[:5]]
    return PreviewResponse(
        status="AMBIGUOUS_PRODUCT",
        operation_id="",
        message=f"Multiple products match '{query}'. Please select one.",
        candidates=candidates,
    )


def _apply_tune(db: Session, product, quantity: float, unit: str):
    """
    Deterministic TUNE: look up trade unit from DB, multiply.
    Returns (normalized_quantity, note) or (None, None) if unit invalid.
    """
    if not unit:
        # No unit provided — use base unit directly
        return quantity, f"Direct {product.base_unit}"
    
    unit_lower = unit.lower().strip()
    base_unit_lower = product.base_unit.lower().strip()

    # Direct base unit match
    if unit_lower == base_unit_lower or unit_lower in (base_unit_lower, base_unit_lower[:-1]):
        return quantity, f"Direct {product.base_unit}"

    # Common unit aliases (deterministic)
    unit_aliases = {
        "kg": ["kilogram", "kilograms", "kilo", "kilos"],
        "g": ["gram", "grams"],
        "l": ["liter", "litre", "liters", "litres"],
        "ml": ["milliliter", "millilitre"],
        "pcs": ["piece", "pieces", "unit", "units", "nos", "no"],
    }
    for canonical, aliases in unit_aliases.items():
        if unit_lower in aliases and canonical == base_unit_lower:
            return quantity, f"Direct {product.base_unit}"

    # Check product-specific TradeUnit configuration (from DB)
    trade_units = db.query(TradeUnit).filter(
        TradeUnit.product_id == product.id,
        TradeUnit.is_active == True
    ).all()

    for tu in trade_units:
        tu_name_lower = tu.name.lower().strip()
        if tu_name_lower == unit_lower or unit_lower in tu_name_lower or tu_name_lower in unit_lower:
            normalized = round(quantity * tu.conversion_factor, 3)
            note = f"1 {tu.name} = {tu.conversion_factor} {tu.base_unit}"
            return normalized, note

    # Global fallback trade unit mapping (standard Indian wholesale)
    GLOBAL_TRADE_UNITS = {
        "bag": 25.0, "bags": 25.0,
        "sack": 50.0, "sacks": 50.0,
        "katta": 50.0,
        "tin": 15.0, "tins": 15.0, "dabba": 15.0,
        "packet": 1.0, "packets": 1.0, "pack": 1.0, "packs": 1.0,
        "dozen": 12.0,
        "carton": 12.0, "box": 12.0,
        "quintal": 100.0, "quintals": 100.0,
    }
    if unit_lower in GLOBAL_TRADE_UNITS and base_unit_lower in ("kg", "g", "pcs", "l"):
        factor = GLOBAL_TRADE_UNITS[unit_lower]
        normalized = round(quantity * factor, 3)
        note = f"1 {unit} ≈ {factor} {product.base_unit} (global default — configure for exact conversion)"
        return normalized, note

    # Unit not found
    return None, None


def _get_available_units(db: Session, product) -> str:
    """Return human-readable list of valid units for this product."""
    units = [product.base_unit]
    trade_units = db.query(TradeUnit).filter(
        TradeUnit.product_id == product.id,
        TradeUnit.is_active == True
    ).all()
    units.extend([tu.name for tu in trade_units])
    return ", ".join(units)
