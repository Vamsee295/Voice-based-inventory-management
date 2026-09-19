from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    type = Column(String, nullable=False) # STOCK_IN, STOCK_OUT, ADJUSTMENT
    quantity = Column(Float, nullable=False)
    normalized_quantity = Column(Float, nullable=False)
    prev_balance = Column(Float, nullable=False)
    new_balance = Column(Float, nullable=False)
    
    source = Column(String, nullable=False) # VOICE, SCAN, INVOICE, MANUAL
    operator_id = Column(String, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Metadata for tracking operations
    operation_id = Column(String, nullable=True, index=True) # Used for idempotency

    business = relationship("Business", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")
    operator = relationship("User", back_populates="transactions")
