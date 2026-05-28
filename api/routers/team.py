import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import TeamMember
from api.schemas import TeamMemberCreate, TeamMemberOut
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
