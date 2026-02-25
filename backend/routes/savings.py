from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Saving
import uuid

router = APIRouter(prefix="/savings", tags=["savings"])


class SavingCreate(BaseModel):
    category: str
    subcategory: Optional[str] = None
    quantity: Optional[str] = None
    value: Optional[float] = 0
    type: str  # 'asset' or 'liability'
    notes: Optional[str] = None


def serialize(s: Saving) -> dict:
    return {
        "id": str(s.id),
        "category": s.category,
        "subcategory": s.subcategory,
        "quantity": s.quantity,
        "value": float(s.value or 0),
        "type": s.type,
        "notes": s.notes,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


@router.get("/")
async def list_savings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Saving).order_by(Saving.created_at.desc()))
    return [serialize(s) for s in result.scalars().all()]


@router.post("/", status_code=201)
async def create_saving(data: SavingCreate, db: AsyncSession = Depends(get_db)):
    saving = Saving(**data.dict())
    db.add(saving)
    await db.commit()
    await db.refresh(saving)
    return serialize(saving)


@router.delete("/{saving_id}", status_code=204)
async def delete_saving(saving_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Saving).where(Saving.id == uuid.UUID(saving_id)))
    saving = result.scalar_one_or_none()
    if not saving:
        raise HTTPException(status_code=404, detail="Saving not found")
    await db.delete(saving)
    await db.commit()
