from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="OPERATOR") # OWNER, ADMIN, SUPERVISOR, OPERATOR
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="users")
    transactions = relationship("Transaction", back_populates="operator")
    audit_events = relationship("AuditEvent", back_populates="operator")
