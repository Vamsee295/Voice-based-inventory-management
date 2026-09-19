from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False, unique=True)
    
    currency = Column(String, default="INR")
    timezone = Column(String, default="Asia/Kolkata")
    
    # Store list of supported languages, e.g. ["English", "Telugu", "Tenglish"]
    voice_languages = Column(JSON, default=lambda: ["English", "Telugu", "Tenglish"])
    voice_confirmation_required = Column(Boolean, default=True)
    
    default_base_unit = Column(String, default="kg")
    low_stock_behavior = Column(String, default="Alert")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    business = relationship("Business")
