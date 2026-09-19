"""
RAG Service — Retrieval-Augmented Generation for VoiceMate.

Uses multilingual-e5-small embeddings with numpy cosine similarity (SQLite-compatible).
In production with PostgreSQL + pgvector, this can be upgraded transparently.

DO NOT use RAG to answer live inventory questions (stock levels, balances).
RAG is for: product aliases, trade-unit terminology, Telugu/Tenglish phrases,
            command examples, business vocabulary, SOPs.
"""
import json
import logging
import numpy as np
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.knowledge_document import KnowledgeDocument
from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embedding model — loaded once at startup
# ---------------------------------------------------------------------------
_embedding_model = None
_model_load_error = None

def _get_model():
    global _embedding_model, _model_load_error
    if _embedding_model is not None:
        return _embedding_model
    if _model_load_error is not None:
        return None
    try:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully")
        return _embedding_model
    except Exception as e:
        _model_load_error = str(e)
        logger.error(f"Failed to load embedding model: {e}")
        return None


def _encode(text: str) -> Optional[List[float]]:
    """Encode text to embedding vector. Returns None if model unavailable."""
    model = _get_model()
    if model is None:
        return None
    try:
        # multilingual-e5 expects "query: " prefix for asymmetric search
        embedding = model.encode(f"query: {text}", normalize_embeddings=True)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Encoding failed: {e}")
        return None


def _encode_for_indexing(text: str) -> Optional[List[float]]:
    """Encode document (passage prefix for e5 model)."""
    model = _get_model()
    if model is None:
        return None
    try:
        embedding = model.encode(f"passage: {text}", normalize_embeddings=True)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Indexing encoding failed: {e}")
        return None


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    va = np.array(a)
    vb = np.array(b)
    denom = (np.linalg.norm(va) * np.linalg.norm(vb))
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def index_document(
    db: Session,
    business_id: str,
    content: str,
    document_type: str,
    source: str = None,
    metadata: dict = None,
) -> KnowledgeDocument:
    """
    Encode and store a document in the knowledge base.
    Returns the persisted KnowledgeDocument.
    """
    embedding = _encode_for_indexing(content)

    doc = KnowledgeDocument(
        business_id=business_id,
        content=content,
        document_type=document_type,
        source=source,
        metadata_json=metadata or {},
        embedding_json=embedding,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    logger.debug(f"Indexed document [{document_type}]: {content[:60]}")
    return doc


# Cache for loaded documents to prevent repetitive DB queries
_docs_cache = {}

def get_cached_docs(db: Session, business_id: str) -> List[KnowledgeDocument]:
    global _docs_cache
    if business_id not in _docs_cache or not _docs_cache[business_id]:
        docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.business_id == business_id).all()
        _docs_cache[business_id] = docs
    return _docs_cache[business_id]

def search(
    db: Session,
    business_id: str,
    query: str,
    top_k: int = None,
    threshold: float = None,
    document_type: str = None,
) -> List[Tuple[KnowledgeDocument, float]]:
    """
    Vector similarity search with fast keyword/phrase matching over knowledge documents.
    Returns list of (document, score) sorted by descending score.
    """
    if not settings.RAG_ENABLED:
        return []

    top_k = top_k or settings.RAG_TOP_K
    threshold = threshold if threshold is not None else settings.RAG_SCORE_THRESHOLD

    docs = get_cached_docs(db, business_id)
    if document_type:
        docs = [d for d in docs if d.document_type == document_type]

    if not docs:
        return []

    # If embedding model is already loaded and ready in memory, try embedding search
    global _embedding_model
    if _embedding_model is not None:
        try:
            query_embedding = _encode(query)
            if query_embedding:
                results = []
                for doc in docs:
                    if not doc.embedding_json:
                        continue
                    score = _cosine_similarity(query_embedding, doc.embedding_json)
                    if score >= threshold:
                        results.append((doc, score))
                if results:
                    results.sort(key=lambda x: x[1], reverse=True)
                    return results[:top_k]
        except Exception as e:
            logger.warning(f"Embedding search failed, using keyword search: {e}")

    # Fast keyword and phrase matching fallback (sub-millisecond, highly reliable)
    return _keyword_fallback(docs, query, top_k)


def retrieve_context(
    db: Session,
    business_id: str,
    query: str,
    top_k: int = None,
) -> str:
    """
    Retrieve top-K relevant knowledge and format as context string for LLM.
    Returns empty string if no relevant context found.
    """
    results = search(db, business_id=business_id, query=query, top_k=top_k)
    if not results:
        return ""

    context_lines = []
    for doc, score in results:
        context_lines.append(f"[{doc.document_type}] {doc.content} (relevance: {score:.2f})")

    return "\n".join(context_lines)


def _keyword_fallback(
    docs: List[KnowledgeDocument],
    query: str,
    top_k: int,
) -> List[Tuple[KnowledgeDocument, float]]:
    """Robust multi-token and phrase match over cached knowledge documents."""
    query_lower = query.lower()
    words = [w for w in query_lower.replace(",", " ").replace(".", " ").split() if len(w) > 1]
    if not words:
        return []

    results = []
    for doc in docs:
        content_lower = doc.content.lower()
        score = 0.0

        # Exact phrase bonus
        if query_lower in content_lower:
            score += 0.5

        # Individual word matches
        matched_words = sum(1 for w in words if w in content_lower)
        word_ratio = matched_words / len(words)
        score += word_ratio * 0.5

        # Check metadata match (e.g. product_name)
        if doc.metadata_json:
            p_name = str(doc.metadata_json.get("product_name", "")).lower()
            if any(w in p_name for w in words):
                score += 0.3

        if score > 0.2:
            results.append((doc, min(score, 1.0)))

    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]
