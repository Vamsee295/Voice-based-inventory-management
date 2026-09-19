from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    product_id: str
    type: str # STOCK_IN, STOCK_OUT, ADJUSTMENT
    quantity: float
    normalized_quantity: float
    prev_balance: float
    new_balance: float
    source: str # VOICE, SCAN, INVOICE, MANUAL
    operation_id: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    source: Optional[str] = None
    operation_id: Optional[str] = None

class TransactionInDBBase(TransactionBase):
    id: str
    business_id: str
    operator_id: Optional[str] = None
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Transaction(TransactionInDBBase):
    pass
