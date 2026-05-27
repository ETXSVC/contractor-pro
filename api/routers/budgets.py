import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import BudgetCostCode
from api.schemas import BudgetCreate, BudgetUpdate, BudgetOut
from api.deps import get_db, get_current_user

router = APIRouter()


@router.get("/")
async def list_budgets(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(BudgetCostCode).where(BudgetCostCode.tenant_id == user["tenant_id"]).order_by(BudgetCostCode.created_at.desc())
    )
    return [BudgetOut.from_orm_row(r) for r in result.scalars().all()]


@router.post("/")
async def create_budget(data: BudgetCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    budget = BudgetCostCode(
        id=str(uuid.uuid4()),
        code=data.code,
        description=data.description,
        category=data.category,
        budgeted=data.budgeted,
        actual=data.actual,
        committed=data.committed,
        tenant_id=user["tenant_id"],
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return BudgetOut.from_orm_row(budget)


@router.patch("/{budget_id}")
async def update_budget(budget_id: str, data: BudgetUpdate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(
        select(BudgetCostCode).where(BudgetCostCode.id == budget_id, BudgetCostCode.tenant_id == user["tenant_id"])
    )
    budget = result.scalars().first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(budget, key, val)

    await db.commit()
    await db.refresh(budget)
    return BudgetOut.from_orm_row(budget)
