import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Invoice
from api.schemas import InvoiceCreate, InvoiceUpdate, InvoiceOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("")
async def list_invoices(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Invoice).where(Invoice.tenant_id == user["tenant_id"]).order_by(Invoice.created_at.desc())
    )
    return [InvoiceOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("")
async def create_invoice(data: InvoiceCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    invoice = Invoice(
        id=str(uuid.uuid4()),
        project_name=data.projectName,
        amount=data.amount,
        due_date=data.dueDate,
        status=data.status,
        tenant_id=user["tenant_id"],
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return InvoiceOut.from_orm_row(invoice)


@router.patch("/{invoice_id}")
async def update_invoice(invoice_id: str, data: InvoiceUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.tenant_id == user["tenant_id"])
    )
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    field_map = {"projectName": "project_name", "dueDate": "due_date"}
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(invoice, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(invoice)
    return InvoiceOut.from_orm_row(invoice)
