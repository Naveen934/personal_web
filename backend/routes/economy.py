from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Economy
import uuid

router = APIRouter(prefix="/economy", tags=["economy"])


class EconomyCreate(BaseModel):
    bank_name: str
    account_type: Optional[str] = None
    balance: Optional[float] = 0
    notes: Optional[str] = None


def serialize(e: Economy) -> dict:
    return {
        "id": str(e.id),
        "bank_name": e.bank_name,
        "account_type": e.account_type,
        "balance": float(e.balance or 0),
        "notes": e.notes,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }


@router.get("/")
async def list_economy(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Economy).order_by(Economy.created_at.desc()))
    return [serialize(e) for e in result.scalars().all()]


@router.post("/", status_code=201)
async def create_economy(data: EconomyCreate, db: AsyncSession = Depends(get_db)):
    entry = Economy(**data.dict())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return serialize(entry)


@router.delete("/{entry_id}", status_code=204)
async def delete_economy(entry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Economy).where(Economy.id == uuid.UUID(entry_id)))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
