import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import Proposal
from api.schemas import ProposalCreate, ProposalUpdate, ProposalOut
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


@router.patch("/{proposal_id}")
async def update_proposal(proposal_id: str, data: ProposalUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Proposal).where(Proposal.id == proposal_id, Proposal.tenant_id == user["tenant_id"])
    )
    proposal = result.scalars().first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")

    field_map = {"projectName": "project_name", "clientName": "client_name", "dateSent": "date_sent"}
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(proposal, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(proposal)
    return ProposalOut.from_orm_row(proposal)


@router.delete("/{proposal_id}")
async def delete_proposal(proposal_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(Proposal).where(Proposal.id == proposal_id, Proposal.tenant_id == user["tenant_id"])
    )
    proposal = result.scalars().first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    await db.delete(proposal)
    await db.commit()
    return {"success": True}
