import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Document
from api.schemas import DocumentCreate, DocumentOut
from api.deps import get_db, get_current_user

router = APIRouter()

UPLOADS_DIR = Path("uploads")
ALLOWED_EXTENSIONS = {".pdf", ".dwg", ".docx", ".bimx", ".png", ".jpg", ".jpeg", ".xlsx", ".dxf"}
MAX_SIZE = 50 * 1024 * 1024  # 50 MB


@router.get("/")
async def list_documents(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Document).where(Document.tenant_id == user["tenant_id"]).order_by(Document.created_at.desc())
    )
    return [DocumentOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("/")
async def create_document(data: DocumentCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    doc = Document(
        id=str(uuid.uuid4()),
        name=data.name,
        category=data.category,
        uploaded_by=data.uploadedBy,
        uploaded_at=data.uploadedAt,
        size=data.size,
        file_type=data.fileType,
        file_url=data.fileUrl,
        tenant_id=user["tenant_id"],
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentOut.from_orm_row(doc)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(None),
    category: str = Form("Blueprints"),
    uploadedBy: str = Form("Team Member"),
    fileType: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    UPLOADS_DIR.mkdir(exist_ok=True)
    unique = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOADS_DIR / unique
    dest.write_bytes(content)

    size_mb = f"{len(content) / (1024 * 1024):.1f} MB"
    file_url = f"/uploads/{unique}"

    doc = Document(
        id=str(uuid.uuid4()),
        name=name or file.filename,
        category=category,
        uploaded_by=uploadedBy,
        uploaded_at="Today, Just Now",
        size=size_mb,
        file_type=fileType or file.content_type or ext,
        file_url=file_url,
        tenant_id=user["tenant_id"],
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentOut.from_orm_row(doc)


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.tenant_id == user["tenant_id"])
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.file_url:
        file_path = Path(doc.file_url.lstrip("/"))
        if file_path.exists():
            file_path.unlink(missing_ok=True)

    await db.delete(doc)
    await db.commit()
    return {"success": True}
