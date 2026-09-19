from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.auth import get_current_business_id
from app.repositories.transaction_repository import transaction_repo
from app.schemas.transaction import Transaction

router = APIRouter()

@router.get("/", response_model=List[Transaction])
def get_transactions(
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
    skip: int = 0,
    limit: int = 100
):
    transactions = transaction_repo.get_multi_by_business(db, business_id=business_id, skip=skip, limit=limit)
    return transactions
