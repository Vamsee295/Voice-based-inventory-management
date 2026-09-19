import os
import sys
import uuid
import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# Ensure we can import app modules when running as a script
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.product import Product
from app.models.transaction import Transaction
from app.api.auth import MOCK_BUSINESS_ID, MOCK_USER_ID

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_demo_transactions(db: Session):
    logger.info("Seeding demo transactions...")
    
    # Get some products
    products = db.query(Product).filter(Product.business_id == MOCK_BUSINESS_ID).limit(2).all()
    if not products:
        logger.info("No products found, run seed_demo_data.py first.")
        return
        
    for i, p in enumerate(products):
        # Create a sample transaction for yesterday
        tx = Transaction(
            id=str(uuid.uuid4()),
            business_id=MOCK_BUSINESS_ID,
            product_id=p.id,
            operator_id=MOCK_USER_ID,
            type="STOCK_IN",
            quantity=50.0,
            normalized_quantity=50.0,
            prev_balance=p.min_stock,
            new_balance=p.min_stock + 50.0,
            source="VOICE",
            timestamp=datetime.utcnow() - timedelta(days=1)
        )
        db.add(tx)
        
    db.commit()
    logger.info("Demo transactions seeded.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_demo_transactions(db)
    finally:
        db.close()
