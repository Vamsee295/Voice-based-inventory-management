from typing import Optional, List
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from sqlalchemy import or_

class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_sku(self, db: Session, *, business_id: str, sku: str) -> Optional[Product]:
        return db.query(self.model).filter(
            self.model.business_id == business_id,
            self.model.sku == sku
        ).first()

    def search_products(
        self, db: Session, *, business_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> List[Product]:
        search_filter = or_(
            Product.name.ilike(f"%{query}%"),
            Product.sku.ilike(f"%{query}%"),
            Product.gtin.ilike(f"%{query}%")
        )
        return (
            db.query(self.model)
            .filter(self.model.business_id == business_id)
            .filter(search_filter)
            .offset(skip)
            .limit(limit)
            .all()
        )

product_repo = CRUDProduct(Product)
