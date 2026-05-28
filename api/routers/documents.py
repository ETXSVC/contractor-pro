import re
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Document, Tenant
from api.schemas import DocumentCreate, DocumentUpdate, DocumentOut
from api.deps import get_db, get_current_user
from api.worker import parse_dwg

router = APIRouter()

UPLOADS_DIR = Path("uploads")
ALLOWED_EXTENSIONS = {".pdf", ".dwg", ".docx", ".bimx", ".png", ".jpg", ".jpeg", ".xlsx", ".dxf"}
MAX_SIZE = 50 * 1024 * 1024  # 50 MB


def _company_slug(name: str) -> str:
    """Convert a company name to a safe directory name: lowercase, dashes, no special chars."""
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-") or "tenant"
    return slug


async def _tenant_dir(tenant_id: str, db: AsyncSession) -> Path:
    """Return (and create) the upload directory for this tenant."""
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalars().first()
    slug = _company_slug(tenant.name) if tenant else tenant_id
    tenant_path = UPLOADS_DIR / slug
    tenant_path.mkdir(parents=True, exist_ok=True)
    return tenant_path


@router.get("")
async def list_documents(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Document).where(Document.tenant_id == user["tenant_id"]).order_by(Document.created_at.desc())
    )
    return [DocumentOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("")
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
        raise HTTPException(status_code=400, detail=f"File type '{ext}' is not allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50 MB limit")

    tenant_path = await _tenant_dir(user["tenant_id"], db)
    unique = f"{uuid.uuid4().hex}{ext}"
    (tenant_path / unique).write_bytes(content)

    # Reconstruct slug from the path so the URL matches the actual directory
    slug = tenant_path.name
    size_label = f"{len(content) / (1024 * 1024):.1f} MB"
    file_url = f"/uploads/{slug}/{unique}"

    doc = Document(
        id=str(uuid.uuid4()),
        name=name or file.filename,
        category=category,
        uploaded_by=uploadedBy,
        uploaded_at="Today, Just Now",
        size=size_label,
        file_type=fileType or file.content_type or ext,
        file_url=file_url,
        tenant_id=user["tenant_id"],
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    if ext in {".dwg", ".dxf"}:
        parse_dwg.delay(str(tenant_path / unique))

    return DocumentOut.from_orm_row(doc)


@router.patch("/{doc_id}")
async def update_document(doc_id: str, data: DocumentUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.tenant_id == user["tenant_id"])
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    field_map = {"uploadedBy": "uploaded_by", "uploadedAt": "uploaded_at", "fileType": "file_type"}
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(doc, field_map.get(key, key), val)

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
        file_path.unlink(missing_ok=True)

    await db.delete(doc)
    await db.commit()
    return {"success": True}
