import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.database import SessionLocal
from api.models import Tenant, User
from api.auth import hash_password, verify_password, create_token
from api.schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut
from api.deps import get_db

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if not data.email or not data.password or not data.companyName:
        raise HTTPException(status_code=400, detail="Email, password, and company name are required")

    tenant = Tenant(id=str(uuid.uuid4()), name=data.companyName)
    db.add(tenant)
    await db.flush()

    display_name = data.name or data.email.split("@")[0]
    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        password=hash_password(data.password),
        name=display_name,
        role="admin",
        tenant_id=tenant.id,
    )
    db.add(user)

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered")

    token = create_token(user.id, tenant.id, user.email)
    return AuthResponse(token=token, user=UserOut(id=user.id, email=user.email, tenantId=tenant.id))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user.id, user.tenant_id, user.email)
    return AuthResponse(token=token, user=UserOut(id=user.id, email=user.email, tenantId=user.tenant_id))
