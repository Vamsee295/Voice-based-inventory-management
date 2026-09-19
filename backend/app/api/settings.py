"""
Business Settings API — GET/PATCH workspace configuration.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.database import get_db
from app.api.auth import get_current_business_id
from app.models.business_settings import BusinessSettings

router = APIRouter()


class SettingsUpdate(BaseModel):
    currency: Optional[str] = None
    timezone: Optional[str] = None
    voice_languages: Optional[List[str]] = None
    voice_confirmation_required: Optional[bool] = None
    default_base_unit: Optional[str] = None
    low_stock_behavior: Optional[str] = None


class SettingsOut(BaseModel):
    id: str
    business_id: str
    currency: str
    timezone: str
    voice_languages: List[str]
    voice_confirmation_required: bool
    default_base_unit: str
    low_stock_behavior: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


def _get_or_create(db: Session, business_id: str) -> BusinessSettings:
    s = db.query(BusinessSettings).filter(BusinessSettings.business_id == business_id).first()
    if not s:
        s = BusinessSettings(
            id=str(uuid.uuid4()),
            business_id=business_id,
            currency="INR",
            timezone="Asia/Kolkata",
            voice_languages=["en", "te"],
            voice_confirmation_required=True,
            default_base_unit="kg",
            low_stock_behavior="Alert",
        )
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("/", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    return _get_or_create(db, business_id)


@router.patch("/", response_model=SettingsOut)
def update_settings(
    data: SettingsUpdate,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
):
    s = _get_or_create(db, business_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    return s
