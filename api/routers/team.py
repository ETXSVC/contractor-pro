import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import TeamMember
from api.schemas import TeamMemberCreate, TeamMemberUpdate, TeamMemberOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("")
async def list_team(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(TeamMember).where(TeamMember.tenant_id == user["tenant_id"]).order_by(TeamMember.created_at.desc())
    )
    return [TeamMemberOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("")
async def create_member(data: TeamMemberCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    member = TeamMember(
        id=str(uuid.uuid4()),
        name=data.name,
        role=data.role,
        avatar=data.avatar,
        active_projects=data.activeProjects,
        status=data.status,
        department=data.department,
        phone=data.phone,
        email=data.email,
        tenant_id=user["tenant_id"],
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return TeamMemberOut.from_orm_row(member)


@router.patch("/{member_id}")
async def update_member(member_id: str, data: TeamMemberUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(TeamMember).where(TeamMember.id == member_id, TeamMember.tenant_id == user["tenant_id"])
    )
    member = result.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    field_map = {"activeProjects": "active_projects"}
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(member, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(member)
    return TeamMemberOut.from_orm_row(member)


@router.delete("/{member_id}")
async def delete_member(member_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(TeamMember).where(TeamMember.id == member_id, TeamMember.tenant_id == user["tenant_id"])
    )
    member = result.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    await db.delete(member)
    await db.commit()
    return {"success": True}
