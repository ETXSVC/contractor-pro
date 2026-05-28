import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Project
from api.schemas import ProjectCreate, ProjectUpdate, ProjectOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("")
async def list_projects(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Project).where(Project.tenant_id == user["tenant_id"]).order_by(Project.created_at.desc())
    )
    return [ProjectOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("")
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    project = Project(
        id=str(uuid.uuid4()),
        name=data.name,
        category=data.category,
        status=data.status,
        progress=data.progress,
        duration=data.duration,
        description=data.description,
        image=data.image,
        client_name=data.clientName,
        budget=data.budget,
        spent=data.spent,
        unread_messages=data.unreadMessages,
        tasks_count=data.tasksCount,
        last_viewed_date=data.lastViewedDate,
        alert=data.alert,
        tenant_id=user["tenant_id"],
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectOut.from_orm_row(project)


@router.patch("/{project_id}")
async def update_project(project_id: str, data: ProjectUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.tenant_id == user["tenant_id"])
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = data.model_dump(exclude_unset=True)
    field_map = {"clientName": "client_name", "unreadMessages": "unread_messages", "tasksCount": "tasks_count", "lastViewedDate": "last_viewed_date"}
    for key, val in updates.items():
        setattr(project, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(project)
    return ProjectOut.from_orm_row(project)


@router.delete("/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.tenant_id == user["tenant_id"])
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return {"success": True}
