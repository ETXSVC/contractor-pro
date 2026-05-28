import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Proposal
from api.schemas import ProposalCreate, ProposalOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("")
async def list_proposals(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Proposal).where(Proposal.tenant_id == user["tenant_id"]).order_by(Proposal.created_at.desc())
    )
    return [ProposalOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("")
async def create_proposal(data: ProposalCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    proposal = Proposal(
        id=str(uuid.uuid4()),
        project_name=data.projectName,
        client_name=data.clientName,
        value=data.value,
        status=data.status,
        date_sent=data.dateSent,
        notes=data.notes,
        tenant_id=user["tenant_id"],
    )
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)
    return ProposalOut.from_orm_row(proposal)
