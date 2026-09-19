from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Business(Base):
    __tablename__ = "businesses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="business")
    products = relationship("Product", back_populates="business")
    transactions = relationship("Transaction", back_populates="business")
    audit_events = relationship("AuditEvent", back_populates="business")
