"""
Trade Units API — CRUD for product-specific trade unit conversions.
These power the TUNE (Trade Unit Normalization Engine).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.database import get_db
from app.api.auth import get_current_business_id
from app.models.trade_unit import TradeUnit

router = APIRouter()


class TradeUnitCreate(BaseModel):
    product_id: str
    name: str
    base_unit: str
    conversion_factor: float
    is_active: bool = True


class TradeUnitUpdate(BaseModel):
    name: Optional[str] = None
    base_unit: Optional[str] = None
    conversion_factor: Optional[float] = None
    is_active: Optional[bool] = None


class TradeUnitOut(BaseModel):
    id: str
    business_id: str
    product_id: str
    name: str
    base_unit: str
    conversion_factor: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TradeUnitOut])
def get_trade_units(
    product_id: Optional[str] = None,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    q = db.query(TradeUnit).filter(TradeUnit.business_id == business_id)
    if product_id:
        q = q.filter(TradeUnit.product_id == product_id)
    return q.all()


@router.post("/", response_model=TradeUnitOut)
def create_trade_unit(
    data: TradeUnitCreate,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    tu = TradeUnit(
        id=str(uuid.uuid4()),
        business_id=business_id,
        **data.model_dump()
    )
    db.add(tu)
    db.commit()
    db.refresh(tu)
    return tu


@router.patch("/{trade_unit_id}", response_model=TradeUnitOut)
def update_trade_unit(
    trade_unit_id: str,
    data: TradeUnitUpdate,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    tu = db.query(TradeUnit).filter(
        TradeUnit.id == trade_unit_id,
        TradeUnit.business_id == business_id
    ).first()
    if not tu:
        raise HTTPException(status_code=404, detail="Trade unit not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(tu, field, value)
    db.commit()
    db.refresh(tu)
    return tu


@router.delete("/{trade_unit_id}")
def delete_trade_unit(
    trade_unit_id: str,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    tu = db.query(TradeUnit).filter(
        TradeUnit.id == trade_unit_id,
        TradeUnit.business_id == business_id
    ).first()
    if not tu:
        raise HTTPException(status_code=404, detail="Trade unit not found")
    db.delete(tu)
    db.commit()
    return {"status": "deleted"}
