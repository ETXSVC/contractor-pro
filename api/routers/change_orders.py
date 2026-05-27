import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import ChangeOrder
from api.schemas import ChangeOrderCreate, ChangeOrderUpdate, ChangeOrderOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("/")
async def list_change_orders(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(ChangeOrder).where(ChangeOrder.tenant_id == user["tenant_id"]).order_by(ChangeOrder.created_at.desc())
    )
    return [ChangeOrderOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("/")
async def create_change_order(data: ChangeOrderCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    co = ChangeOrder(
        id=str(uuid.uuid4()),
        title=data.title,
        project_id=data.projectId,
        project_name=data.projectName,
        amount=data.amount,
        status=data.status,
        date_requested=data.dateRequested,
        tenant_id=user["tenant_id"],
    )
    db.add(co)
    await db.commit()
    await db.refresh(co)
    return ChangeOrderOut.from_orm_row(co)


@router.patch("/{co_id}")
async def update_change_order(co_id: str, data: ChangeOrderUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(ChangeOrder).where(ChangeOrder.id == co_id, ChangeOrder.tenant_id == user["tenant_id"])
    )
    co = result.scalars().first()
    if not co:
        raise HTTPException(status_code=404, detail="Change order not found")

    field_map = {"projectId": "project_id", "projectName": "project_name", "dateRequested": "date_requested"}
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(co, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(co)
    return ChangeOrderOut.from_orm_row(co)
