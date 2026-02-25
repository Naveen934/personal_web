from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Company
import uuid

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyCreate(BaseModel):
    name: str
    status: str
    monthly_revenue: Optional[float] = 0
    total_invested: Optional[float] = 0
    notes: Optional[str] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    status: str
    monthly_revenue: float
    total_invested: float
    notes: Optional[str]
    created_at: Optional[str]

    class Config:
        from_attributes = True


def serialize(c: Company) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "status": c.status,
        "monthly_revenue": float(c.monthly_revenue or 0),
        "total_invested": float(c.total_invested or 0),
        "notes": c.notes,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.get("/")
async def list_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).order_by(Company.created_at.desc()))
    companies = result.scalars().all()
    return [serialize(c) for c in companies]


@router.get("/{company_id}")
async def get_company(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).where(Company.id == uuid.UUID(company_id)))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return serialize(company)


@router.post("/", status_code=201)
async def create_company(data: CompanyCreate, db: AsyncSession = Depends(get_db)):
    company = Company(**data.dict())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return serialize(company)


@router.delete("/{company_id}", status_code=204)
async def delete_company(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).where(Company.id == uuid.UUID(company_id)))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await db.delete(company)
    await db.commit()
