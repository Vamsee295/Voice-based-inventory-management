from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel

from app.core.database import get_db
from app.api.auth import get_current_business_id, get_current_user_id
from app.services.inventory_service import inventory_service
from app.schemas.transaction import Transaction

router = APIRouter()

class StockAdjustmentRequest(BaseModel):
    product_id: str
    quantity: float
    source: str
    operation_id: str = None

@router.post("/transactions", response_model=Transaction)
def create_inventory_transaction(
    req: StockAdjustmentRequest,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
    user_id: str = Depends(get_current_user_id)
):
    """
    Atomically creates a stock adjustment.
    """
    transaction = inventory_service.adjust_stock(
        db=db,
        business_id=business_id,
        product_id=req.product_id,
        quantity=req.quantity,
        source=req.source,
        operation_id=req.operation_id,
        operator_id=user_id
    )
    return transaction
