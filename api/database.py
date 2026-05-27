import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

_url = os.getenv("DATABASE_URL", "postgresql://contractor:contractor_pass@localhost:5434/contractor_pro")

# asyncpg requires postgresql+asyncpg:// scheme
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _url.startswith("postgresql://"):
    _url = _url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    _url,
    echo=False,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
)

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass
