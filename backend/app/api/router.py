from fastapi import APIRouter

from app.api import auth, products, inventory, transactions
from app.api import voice, assistant
from app.api import trade_units, settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(trade_units.router, prefix="/trade-units", tags=["trade-units"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
