from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.auth import get_current_business_id
from app.repositories.product_repository import product_repo
from app.schemas.product import Product, ProductCreate

router = APIRouter()

@router.get("/", response_model=List[Product])
def get_products(
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id),
    skip: int = 0,
    limit: int = 100,
    search: str = None
):
    if search:
        products = product_repo.search_products(db, business_id=business_id, query=search, skip=skip, limit=limit)
    else:
        # We need a get_multi_by_business in product_repo ideally. Let's reuse search with empty query
        products = product_repo.search_products(db, business_id=business_id, query="", skip=skip, limit=limit)
    return products

@router.post("/", response_model=Product)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    business_id: str = Depends(get_current_business_id)
):
    existing = product_repo.get_by_sku(db, business_id=business_id, sku=product_in.sku)
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
        
    product = product_repo.create(db, obj_in=product_in, business_id=business_id)
    db.commit()
    return product
