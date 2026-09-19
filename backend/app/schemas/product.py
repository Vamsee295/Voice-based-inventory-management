from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    gtin: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    base_unit: str
    min_stock: float = 0.0
    price: float = 0.0
    current_stock: float = 0.0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    gtin: Optional[str] = None
    category: Optional[str] = None
    base_unit: Optional[str] = None
    min_stock: Optional[float] = None
    price: Optional[float] = None

class ProductInDBBase(ProductBase):
    id: str
    business_id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Product(ProductInDBBase):
    pass
