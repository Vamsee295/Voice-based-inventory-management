from pydantic import BaseModel, ConfigDict
from datetime import datetime

class InventoryBase(BaseModel):
    current_stock: float = 0.0

class InventoryCreate(InventoryBase):
    product_id: str

class InventoryUpdate(InventoryBase):
    pass

class InventoryInDBBase(InventoryBase):
    id: str
    product_id: str
    last_updated: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Inventory(InventoryInDBBase):
    pass
