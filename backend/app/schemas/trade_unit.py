from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TradeUnitBase(BaseModel):
    name: str = Field(..., example="Bag")
    base_unit: str = Field(..., example="KG")
    conversion_factor: float = Field(..., example=25.0, gt=0)
    is_active: bool = True

class TradeUnitCreate(TradeUnitBase):
    product_id: str

class TradeUnitUpdate(BaseModel):
    name: Optional[str] = None
    base_unit: Optional[str] = None
    conversion_factor: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class TradeUnit(TradeUnitBase):
    id: str
    business_id: str
    product_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
