from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "VoiceMate API"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Database
    DATABASE_URL: str
    
    # CORS
    BACKEND_CORS_ORIGINS: str = ""
    
    # Groq AI
    GROQ_API_KEY: str = ""
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_LLM_MODEL: str = "openai/gpt-oss-20b"
    GROQ_STT_MODEL: str = "whisper-large-v3-turbo"
    GROQ_TIMEOUT_SECONDS: float = 15.0
    
    # RAG
    RAG_ENABLED: bool = True
    RAG_TOP_K: int = 5
    RAG_SCORE_THRESHOLD: float = 0.45
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-small"
    
    # Runtime
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    @property
    def cors_origins(self) -> List[str]:
        if not self.BACKEND_CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
