"""
Knowledge Seeder — Seeds product aliases, trade-unit terminology,
Telugu/Tenglish language phrases, and command examples into the RAG knowledge base.

Run once (or re-run after clearing the table):
  cd backend
  python -m app.scripts.seed_knowledge

Or via FastAPI startup (idempotent — checks before inserting).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import logging
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.knowledge_document import KnowledgeDocument
from app.services import rag_service

logger = logging.getLogger(__name__)

# Use the mock business ID from auth (matches demo setup)
BUSINESS_ID = "00000000-0000-0000-0000-000000000001"

KNOWLEDGE_ENTRIES = [
    # ----------------------------------------------------------------
    # PRODUCT ALIASES — Telugu/Tenglish names
    # ----------------------------------------------------------------
    {
        "content": "Rice, biyyam, sona masoori, sona masuri, sonamasuri, white rice — all refer to Sona Masoori Rice",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Sona Masoori Rice", "languages": ["en", "te"]}
    },
    {
        "content": "Sugar, chini, cukkar, chakkara — refer to sugar products",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Sugar", "languages": ["en", "te", "tenglish"]}
    },
    {
        "content": "Salt, uppu, rock salt, crystal salt, namak — refer to salt products",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Salt", "languages": ["en", "te", "tenglish"]}
    },
    {
        "content": "Dal, pappu, toor dal, lentils, kandi pappu — refer to lentil/dal products",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Dal", "languages": ["en", "te", "tenglish"]}
    },
    {
        "content": "Oil, nune, cooking oil, sunflower oil, palm oil, vanaspati — refer to oil products",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Oil", "languages": ["en", "te", "tenglish"]}
    },
    {
        "content": "Wheat flour, maida, goduma pindi, atta — refer to flour products",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Wheat Flour", "languages": ["en", "te"]}
    },
    {
        "content": "Milk, paalu, paal, fresh milk, full cream milk — refer to milk products",
        "document_type": "PRODUCT_ALIAS",
        "metadata": {"product_name": "Milk", "languages": ["en", "te"]}
    },

    # ----------------------------------------------------------------
    # TRADE UNIT TERMINOLOGY
    # ----------------------------------------------------------------
    {
        "content": "Bag = 25 KG for rice and grains. One bag of rice equals 25 kilograms.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "bag", "base_quantity": 25, "base_unit": "kg", "product_category": "grains"}
    },
    {
        "content": "Sack, borsa = 50 KG. One sack equals 50 kilograms, commonly used for bulk rice.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "sack", "aliases": ["borsa"], "base_quantity": 50, "base_unit": "kg"}
    },
    {
        "content": "Katta = 50 KG in Telugu wholesale markets. Same as sack for grains.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "katta", "base_quantity": 50, "base_unit": "kg"}
    },
    {
        "content": "Tin, dabba = 15 to 16 KG depending on product. Common for cooking oil.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "tin", "aliases": ["dabba"], "base_quantity": 15, "base_unit": "kg"}
    },
    {
        "content": "Packet = unit for consumer goods, sugar, salt. 1 packet usually = 1 KG for sugar/salt.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "packet", "base_quantity": 1, "base_unit": "kg"}
    },
    {
        "content": "Dozen = 12 pieces. Used for eggs, bottles, small consumer goods.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "dozen", "base_quantity": 12, "base_unit": "pcs"}
    },
    {
        "content": "Carton, box = case of 12 to 24 units depending on product type.",
        "document_type": "TRADE_UNIT",
        "metadata": {"unit_name": "carton", "aliases": ["box", "case"], "base_quantity": 12, "base_unit": "pcs"}
    },

    # ----------------------------------------------------------------
    # LANGUAGE PHRASES — Telugu numbers and quantity words
    # ----------------------------------------------------------------
    {
        "content": "Telugu number words: okati/oka=1, rendu=2, moodu=3, nalugu=4, aidu=5, aaru=6, edu=7, enimidi=8, tommidi=9, padi=10",
        "document_type": "LANGUAGE_PHRASE",
        "metadata": {"language": "telugu", "category": "numbers"}
    },
    {
        "content": "Telugu quantity modifiers: konjam=a little/some, chala=a lot/many, ardha=half, mukkalu=three-quarters",
        "document_type": "LANGUAGE_PHRASE",
        "metadata": {"language": "telugu", "category": "quantity_modifiers"}
    },
    {
        "content": "STOCK_IN action words in Telugu/Tenglish: vachayi, vachindi, teesukovandi, lo vestundi, stock vestunnaru, vachesindi, stock vachindi",
        "document_type": "LANGUAGE_PHRASE",
        "metadata": {"language": "tenglish", "category": "action_words", "intent": "STOCK_IN"}
    },
    {
        "content": "STOCK_OUT action words in Telugu/Tenglish: ammamu, ammandi, poindi, vellindi, isthamu, icchamu, ammesamu, sold aindi, stock poyindi",
        "document_type": "LANGUAGE_PHRASE",
        "metadata": {"language": "tenglish", "category": "action_words", "intent": "STOCK_OUT"}
    },
    {
        "content": "STOCK_LOOKUP query words: entha undi, evvaro undi, stock undi, chekku, stock chudandi, balance enti, enni unnai",
        "document_type": "LANGUAGE_PHRASE",
        "metadata": {"language": "tenglish", "category": "query_words", "intent": "STOCK_LOOKUP"}
    },
    {
        "content": "LOW_STOCK query words: thakkuva undi, takkuva stock, low stock, stock thakkuva, reorder avuthundi",
        "document_type": "LANGUAGE_PHRASE",
        "metadata": {"language": "tenglish", "category": "query_words", "intent": "LOW_STOCK_QUERY"}
    },

    # ----------------------------------------------------------------
    # COMMAND EXAMPLES — Full sentence examples
    # ----------------------------------------------------------------
    {
        "content": "Rice rendu bags vachayi — means: received 2 bags of rice (STOCK_IN, quantity=2, unit=bag, product=rice)",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_IN", "language": "tenglish"}
    },
    {
        "content": "Sugar aidu packets ammamu — means: sold 5 packets of sugar (STOCK_OUT, quantity=5, unit=packet, product=sugar)",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_OUT", "language": "tenglish"}
    },
    {
        "content": "Salt moodu packets vachayi — means: received 3 packets of salt (STOCK_IN, quantity=3, unit=packet, product=salt)",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_IN", "language": "tenglish"}
    },
    {
        "content": "Rice entha undi? — means: how much rice is in stock? (STOCK_LOOKUP, product=rice)",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_LOOKUP", "language": "tenglish"}
    },
    {
        "content": "Salt thakkuva unda? — means: is salt running low? (LOW_STOCK_QUERY, product=salt)",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "LOW_STOCK_QUERY", "language": "tenglish"}
    },
    {
        "content": "Add 3 bags of rice — English command: STOCK_IN, quantity=3, unit=bag, product=rice",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_IN", "language": "en"}
    },
    {
        "content": "Remove 10 packets of sugar — English command: STOCK_OUT, quantity=10, unit=packet, product=sugar",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_OUT", "language": "en"}
    },
    {
        "content": "How much rice is available? — English stock lookup: STOCK_LOOKUP, product=rice",
        "document_type": "COMMAND_EXAMPLE",
        "metadata": {"intent": "STOCK_LOOKUP", "language": "en"}
    },

    # ----------------------------------------------------------------
    # BUSINESS TERMS — Wholesale terminology
    # ----------------------------------------------------------------
    {
        "content": "TUNE = Trade Unit Normalization Engine. Converts trade units (bags, sacks, tins) to base units (KG, liters). Always deterministic.",
        "document_type": "BUSINESS_TERM",
        "metadata": {"term": "TUNE"}
    },
    {
        "content": "Reorder level = minimum stock threshold. When current stock falls below this, the item appears in replenishment queue.",
        "document_type": "BUSINESS_TERM",
        "metadata": {"term": "reorder_level"}
    },
    {
        "content": "Shelf clock = expiry tracking system. Items expiring within 30 days appear in shelf clock alerts.",
        "document_type": "BUSINESS_TERM",
        "metadata": {"term": "shelf_clock"}
    },
]


def seed(db: Session, force: bool = False) -> int:
    """
    Seed knowledge documents into the database.
    Skips if already seeded (unless force=True).
    Returns count of inserted documents.
    """
    existing_count = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.business_id == BUSINESS_ID
    ).count()

    if existing_count > 0 and not force:
        logger.info(f"RAG knowledge base already has {existing_count} documents. Skipping seed.")
        return 0

    if force:
        db.query(KnowledgeDocument).filter(
            KnowledgeDocument.business_id == BUSINESS_ID
        ).delete()
        db.commit()
        logger.info("Cleared existing knowledge documents for re-seeding")

    inserted = 0
    for entry in KNOWLEDGE_ENTRIES:
        try:
            rag_service.index_document(
                db=db,
                business_id=BUSINESS_ID,
                content=entry["content"],
                document_type=entry["document_type"],
                source="seed_knowledge",
                metadata=entry.get("metadata", {}),
            )
            inserted += 1
        except Exception as e:
            logger.error(f"Failed to index document: {entry['content'][:50]} — {e}")

    logger.info(f"RAG knowledge base seeded with {inserted} documents")
    return inserted


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    db = SessionLocal()
    try:
        count = seed(db, force="--force" in sys.argv)
        print(f"✓ Seeded {count} knowledge documents")
    finally:
        db.close()
