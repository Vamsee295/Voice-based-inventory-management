from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False, index=True)
    gtin = Column(String, nullable=True, index=True)
    category = Column(String, nullable=True)
    base_unit = Column(String, nullable=False)
    min_stock = Column(Float, default=0.0)
    price = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    business = relationship("Business", back_populates="products")
    inventory = relationship("Inventory", back_populates="product", uselist=False)
    trade_units = relationship("TradeUnit", back_populates="product", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="product")

    @property
    def current_stock(self) -> float:
        return self.inventory.current_stock if self.inventory else 0.0

    @property
    def barcode(self) -> str:
        return self.gtin
