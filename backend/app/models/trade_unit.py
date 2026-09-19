from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class TradeUnit(Base):
    __tablename__ = "trade_units"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    
    name = Column(String, nullable=False) # e.g. "Bag", "Sack", "Tin"
    base_unit = Column(String, nullable=False) # e.g. "KG", "L"
    conversion_factor = Column(Float, nullable=False) # e.g. 25.0
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    business = relationship("Business")
    product = relationship("Product", back_populates="trade_units")
