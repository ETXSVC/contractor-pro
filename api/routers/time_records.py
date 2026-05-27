import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import TimeRecord
from api.schemas import TimeRecordCreate, TimeRecordOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("/")
async def list_time_records(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(TimeRecord).where(TimeRecord.tenant_id == user["tenant_id"]).order_by(TimeRecord.created_at.desc())
    )
    return [TimeRecordOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("/")
async def create_time_record(data: TimeRecordCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    record = TimeRecord(
        id=str(uuid.uuid4()),
        project_id=data.projectId,
        project_name=data.projectName,
        employee_id=data.employeeId,
        employee_name=data.employeeName,
        date=data.date,
        hours=data.hours,
        billable=data.billable,
        description=data.description,
        tenant_id=user["tenant_id"],
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return TimeRecordOut.from_orm_row(record)


@router.delete("/{record_id}")
async def delete_time_record(record_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(TimeRecord).where(TimeRecord.id == record_id, TimeRecord.tenant_id == user["tenant_id"])
    )
    record = result.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="Time record not found")
    await db.delete(record)
    await db.commit()
    return {"success": True}
