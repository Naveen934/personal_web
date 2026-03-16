from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Expense
import uuid

router = APIRouter(prefix="/expenses", tags=["expenses"])


class ExpenseCreate(BaseModel):
    bill_name: str
    amount: Optional[float] = 0
    payment_type: str
    notes: Optional[str] = None


def serialize(e: Expense) -> dict:
    return {
        "id": str(e.id),
        "bill_name": e.bill_name,
        "amount": float(e.amount or 0),
        "payment_type": e.payment_type,
        "notes": e.notes,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


@router.get("/")
async def list_expenses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).order_by(Expense.created_at.desc()))
    return [serialize(e) for e in result.scalars().all()]


@router.post("/", status_code=201)
async def create_expense(data: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    entry = Expense(**data.dict())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return serialize(entry)


@router.delete("/{entry_id}", status_code=204)
async def delete_expense(entry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Expense).where(Expense.id == uuid.UUID(entry_id)))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
