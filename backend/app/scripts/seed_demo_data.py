import os
import sys
import uuid
import logging
from sqlalchemy.orm import Session

# Ensure we can import app modules when running as a script
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.product import Product
from app.models.trade_unit import TradeUnit
from app.models.inventory import Inventory
from app.api.auth import MOCK_BUSINESS_ID

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_demo_data(db: Session):
    logger.info("Seeding demo products, trade units, and inventory...")
    
    products_data = [
        {
            "name": "Sona Masoori Rice",
            "sku": "RICE-001",
            "gtin": "8901030383801",
            "category": "Grains",
            "base_unit": "KG",
            "min_stock": 100.0,
            "price": 45.0,
            "trade_units": [
                {"name": "Bag", "base_unit": "KG", "conversion_factor": 25.0},
                {"name": "Sack", "base_unit": "KG", "conversion_factor": 50.0}
            ],
            "initial_stock": 250.0
        },
        {
            "name": "Basmati Rice",
            "sku": "RICE-002",
            "gtin": None,
            "category": "Grains",
            "base_unit": "KG",
            "min_stock": 50.0,
            "price": 120.0,
            "trade_units": [
                {"name": "Bag", "base_unit": "KG", "conversion_factor": 25.0},
                {"name": "Packet", "base_unit": "KG", "conversion_factor": 5.0}
            ],
            "initial_stock": 45.0 # Low stock
        },
        {
            "name": "Toor Dal",
            "sku": "DAL-001",
            "gtin": None,
            "category": "Pulses",
            "base_unit": "KG",
            "min_stock": 150.0,
            "price": 160.0,
            "trade_units": [
                {"name": "Bag", "base_unit": "KG", "conversion_factor": 30.0}
            ],
            "initial_stock": 500.0
        },
        {
            "name": "Moong Dal",
            "sku": "DAL-002",
            "gtin": None,
            "category": "Pulses",
            "base_unit": "KG",
            "min_stock": 50.0,
            "price": 110.0,
            "trade_units": [
                {"name": "Bag", "base_unit": "KG", "conversion_factor": 25.0}
            ],
            "initial_stock": 20.0 # Low stock
        },
        {
            "name": "Refined Sunflower Oil",
            "sku": "OIL-001",
            "gtin": None,
            "category": "Oils",
            "base_unit": "L",
            "min_stock": 50.0,
            "price": 105.0,
            "trade_units": [
                {"name": "Tin", "base_unit": "L", "conversion_factor": 15.0},
                {"name": "Carton", "base_unit": "L", "conversion_factor": 10.0} # 10x1L pouches
            ],
            "initial_stock": 150.0
        },
        {
            "name": "Crystal Sugar",
            "sku": "SUG-001",
            "gtin": "8901030383802",
            "category": "Essentials",
            "base_unit": "KG",
            "min_stock": 200.0,
            "price": 42.0,
            "trade_units": [
                {"name": "Sack", "base_unit": "KG", "conversion_factor": 50.0}
            ],
            "initial_stock": 1000.0
        },
        {
            "name": "Iodized Salt",
            "sku": "SALT-001",
            "gtin": "8901058852654",
            "category": "Essentials",
            "base_unit": "KG",
            "min_stock": 50.0,
            "price": 25.0,
            "trade_units": [
                {"name": "Packet", "base_unit": "KG", "conversion_factor": 1.0},
                {"name": "Sack", "base_unit": "KG", "conversion_factor": 25.0}
            ],
            "initial_stock": 200.0
        }
    ]

    for p_data in products_data:
        # Check if product already exists
        existing = db.query(Product).filter(
            Product.business_id == MOCK_BUSINESS_ID,
            Product.sku == p_data["sku"]
        ).first()

        if existing:
            if existing.gtin != p_data.get("gtin"):
                existing.gtin = p_data.get("gtin")
                db.commit()
                logger.info(f"Updated GTIN for {p_data['name']}")
            else:
                logger.info(f"Product {p_data['name']} already exists. Skipping.")
            continue
        
        # Create product
        p = Product(
            id=str(uuid.uuid4()),
            business_id=MOCK_BUSINESS_ID,
            name=p_data["name"],
            sku=p_data["sku"],
            category=p_data["category"],
            base_unit=p_data["base_unit"],
            min_stock=p_data["min_stock"],
            price=p_data["price"]
        )
        db.add(p)
        db.flush() # flush to get product.id

        # Create trade units
        for tu_data in p_data["trade_units"]:
            tu = TradeUnit(
                id=str(uuid.uuid4()),
                business_id=MOCK_BUSINESS_ID,
                product_id=p.id,
                name=tu_data["name"],
                base_unit=tu_data["base_unit"],
                conversion_factor=tu_data["conversion_factor"]
            )
            db.add(tu)

        # Create initial inventory
        inv = Inventory(
            id=str(uuid.uuid4()),
            product_id=p.id,
            current_stock=p_data["initial_stock"]
        )
        db.add(inv)

    db.commit()
    logger.info("Demo data seeding complete.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
