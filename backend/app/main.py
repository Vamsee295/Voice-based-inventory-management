import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.api.router import api_router
from app.core.database import SessionLocal, engine, Base
from app.models.business import Business
from app.models.user import User
from app.api.auth import MOCK_BUSINESS_ID, MOCK_USER_ID

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL, "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="VoiceMate — Voice-first AI Inventory Operating System"
)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_event():
    # Ensure all tables exist (creates new ones without dropping existing)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create demo business and user if not exists
        if not db.query(Business).filter(Business.id == MOCK_BUSINESS_ID).first():
            business = Business(id=MOCK_BUSINESS_ID, name="Sri Balaji Wholesale")
            db.add(business)
            db.commit()
            logger.info(f"Created demo business: {MOCK_BUSINESS_ID}")
            
        if not db.query(User).filter(User.id == MOCK_USER_ID).first():
            user = User(
                id=MOCK_USER_ID,
                business_id=MOCK_BUSINESS_ID,
                email="demo@voicemate.local",
                hashed_password="mock",
                role="ADMIN"
            )
            db.add(user)
            db.commit()
            logger.info(f"Created demo user: {MOCK_USER_ID}")

        # Seed RAG knowledge base (idempotent — only runs if empty)
        try:
            from app.scripts.seed_knowledge import seed
            count = seed(db)
            if count > 0:
                logger.info(f"Seeded {count} RAG knowledge documents")
        except Exception as e:
            logger.warning(f"Knowledge seeding failed (non-fatal): {e}")

    finally:
        db.close()


@app.get("/api/health")
def health_check():
    groq_configured = bool(
        settings.GROQ_API_KEY and 
        settings.GROQ_API_KEY != "PASTE_YOUR_GROQ_API_KEY_HERE"
    )
    return {
        "status": "ok",
        "version": "2.0.0",
        "groq_configured": groq_configured,
        "rag_enabled": settings.RAG_ENABLED,
        "environment": settings.ENVIRONMENT,
    }
