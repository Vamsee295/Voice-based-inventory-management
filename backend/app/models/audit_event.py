from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    
    entity_type = Column(String, nullable=False) # e.g. "inventory", "product"
    entity_id = Column(String, nullable=False)
    action = Column(String, nullable=False) # e.g. "update", "create", "delete"
    
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    
    operator_id = Column(String, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="audit_events")
    operator = relationship("User", back_populates="audit_events")
