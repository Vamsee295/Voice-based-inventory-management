from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BusinessSettingsBase(BaseModel):
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    voice_languages: List[str] = ["English", "Telugu", "Tenglish"]
    voice_confirmation_required: bool = True
    default_base_unit: str = "kg"
    low_stock_behavior: str = "Alert"

class BusinessSettingsCreate(BusinessSettingsBase):
    pass

class BusinessSettingsUpdate(BaseModel):
    currency: Optional[str] = None
    timezone: Optional[str] = None
    voice_languages: Optional[List[str]] = None
    voice_confirmation_required: Optional[bool] = None
    default_base_unit: Optional[str] = None
    low_stock_behavior: Optional[str] = None

class BusinessSettings(BusinessSettingsBase):
    id: str
    business_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
