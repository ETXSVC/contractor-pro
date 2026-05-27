from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from api.database import SessionLocal
from api.auth import decode_token

bearer = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    payload = decode_token(credentials.credentials)
    if not payload.get("userId"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {
        "user_id": payload["userId"],
        "tenant_id": payload["tenantId"],
        "email": payload["email"],
    }
