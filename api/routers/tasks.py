import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Task
from api.schemas import TaskCreate, TaskUpdate, TaskOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("/")
async def list_tasks(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Task).where(Task.tenant_id == user["tenant_id"]).order_by(Task.created_at.desc())
    )
    return [TaskOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("/")
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    task = Task(
        id=str(uuid.uuid4()),
        title=data.title,
        assignee_id=data.assigneeId,
        due_date=data.dueDate,
        priority=data.priority,
        status=data.status,
        project_id=data.projectId,
        tenant_id=user["tenant_id"],
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return TaskOut.from_orm_row(task)


@router.patch("/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.tenant_id == user["tenant_id"])
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    field_map = {"assigneeId": "assignee_id", "dueDate": "due_date", "projectId": "project_id"}
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(task, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(task)
    return TaskOut.from_orm_row(task)


@router.delete("/{task_id}")
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.tenant_id == user["tenant_id"])
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    await db.commit()
    return {"success": True}
