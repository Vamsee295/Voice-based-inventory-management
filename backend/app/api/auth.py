from fastapi import APIRouter, Depends, HTTPException
from typing import Dict

router = APIRouter()

# For the MVP, we will simulate a logged-in user and business context.
# In a full implementation, this would use OAuth2/JWT and query the User model.

MOCK_BUSINESS_ID = "00000000-0000-0000-0000-000000000001"
MOCK_USER_ID = "11111111-1111-1111-1111-111111111111"

def get_current_business_id() -> str:
    return MOCK_BUSINESS_ID

def get_current_user_id() -> str:
    return MOCK_USER_ID

@router.get("/me")
def get_current_user():
    return {
        "id": MOCK_USER_ID,
        "business_id": MOCK_BUSINESS_ID,
        "email": "demo@voicemate.local",
        "role": "ADMIN"
    }

@router.post("/login")
def login():
    return {"access_token": "mock-jwt-token", "token_type": "bearer"}
