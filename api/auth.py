import os
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET = os.getenv("JWT_SECRET", "secret")
ALGORITHM = "HS256"
EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: str, tenant_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=EXPIRE_DAYS)
    return jwt.encode(
        {"userId": user_id, "tenantId": tenant_id, "email": email, "exp": expire},
        SECRET,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return {}
