from typing import Optional
from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from fastapi.encoders import jsonable_encoder
from app.repositories.base import CRUDBase

class CRUDInventory:
    def __init__(self, model):
        self.model = model

    def get_by_product(self, db: Session, *, product_id: str) -> Optional[Inventory]:
        # Wait, inventory doesn't have business_id directly, it links to product. 
        # But we assume the service level enforces business isolation via product_id.
        return db.query(self.model).filter(self.model.product_id == product_id).first()

    def get_by_product_with_lock(self, db: Session, *, product_id: str) -> Optional[Inventory]:
        return db.query(self.model).filter(self.model.product_id == product_id).with_for_update().first()

    def create(self, db: Session, *, obj_in: InventoryCreate) -> Inventory:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.flush()
        return db_obj

    def update(self, db: Session, *, db_obj: Inventory, obj_in: InventoryUpdate) -> Inventory:
        obj_data = jsonable_encoder(db_obj)
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.flush()
        return db_obj

inventory_repo = CRUDInventory(Inventory)
