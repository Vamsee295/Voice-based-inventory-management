from sqlalchemy import Column, String, DateTime, Text, JSON
import uuid
from datetime import datetime
from app.core.database import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    document_type = Column(String, nullable=False, index=True)
    # document_type values: PRODUCT_ALIAS, TRADE_UNIT, LANGUAGE_PHRASE, BUSINESS_TERM, COMMAND_EXAMPLE, SOP
    source = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    embedding_json = Column(JSON, nullable=True)  # List[float] stored as JSON (numpy fallback for SQLite)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
