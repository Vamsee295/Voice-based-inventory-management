"""
Voice API schemas — structured contracts for the voice pipeline.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal


# ---------------------------------------------------------------------------
# Transcription
# ---------------------------------------------------------------------------
class TranscribeResponse(BaseModel):
    text: str
    language: str
    duration_ms: int


# ---------------------------------------------------------------------------
# Command Interpretation (LLM output)
# ---------------------------------------------------------------------------
class InterpretRequest(BaseModel):
    text: str
    language_hint: Optional[str] = None


class StructuredCommand(BaseModel):
    intent: Literal[
        "STOCK_IN", "STOCK_OUT", "STOCK_LOOKUP",
        "LOW_STOCK_QUERY", "EXPIRY_QUERY", "TRANSACTION_QUERY",
        "UNKNOWN"
    ]
    product_query: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    language: Optional[str] = None
    confidence: float = 0.0
    clarification_required: bool = False
    clarification_reason: Optional[str] = None
    rag_context_used: Optional[str] = None  # For debugging


# ---------------------------------------------------------------------------
# Preview (product resolution + TUNE + validation)
# ---------------------------------------------------------------------------
class PreviewRequest(BaseModel):
    command: StructuredCommand
    operation_id: Optional[str] = None  # Client-supplied idempotency key


class ProductSummary(BaseModel):
    id: str
    name: str
    sku: str
    base_unit: str
    current_stock: float
    category: Optional[str] = None


class PreviewResponse(BaseModel):
    status: Literal[
        "READY", "PRODUCT_NOT_FOUND", "AMBIGUOUS_PRODUCT",
        "MISSING_QUANTITY", "INVALID_UNIT", "INSUFFICIENT_STOCK",
        "QUERY_RESULT", "CLARIFICATION_REQUIRED", "UNKNOWN_INTENT"
    ]
    operation_id: str
    product: Optional[ProductSummary] = None
    quantity: Optional[float] = None
    input_unit: Optional[str] = None
    normalized_quantity: Optional[float] = None
    base_unit: Optional[str] = None
    current_stock: Optional[float] = None
    projected_stock: Optional[float] = None
    tune_note: Optional[str] = None  # e.g. "1 Bag = 25 KG"
    validation: Optional[str] = None
    message: Optional[str] = None  # Human readable status
    candidates: Optional[list] = None  # For AMBIGUOUS_PRODUCT


# ---------------------------------------------------------------------------
# Confirmation (the ONLY mutation endpoint)
# ---------------------------------------------------------------------------
class ConfirmRequest(BaseModel):
    operation_id: str
    product_id: str
    quantity_delta: float  # Already normalized (positive=IN, negative=OUT)
    source: str = "VOICE"
    operator_note: Optional[str] = None


class ConfirmResponse(BaseModel):
    success: bool
    transaction_id: str
    product_name: str
    previous_stock: float
    new_stock: float
    base_unit: str
    source: str
    message: str
