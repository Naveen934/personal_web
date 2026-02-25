from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Document
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentCreate(BaseModel):
    document_name: str
    number: Optional[str] = None
    drive_link: Optional[str] = None


class DocumentUpdate(BaseModel):
    document_name: Optional[str] = None
    number: Optional[str] = None
    drive_link: Optional[str] = None


def serialize(d: Document) -> dict:
    return {
        "id": str(d.id),
        "document_name": d.document_name,
        "number": d.number,
        "drive_link": d.drive_link,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


@router.get("/")
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.created_at.asc()))
    return [serialize(d) for d in result.scalars().all()]


@router.post("/", status_code=201)
async def create_document(data: DocumentCreate, db: AsyncSession = Depends(get_db)):
    doc = Document(**data.dict())
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return serialize(doc)


@router.put("/{doc_id}")
async def update_document(doc_id: str, data: DocumentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == uuid.UUID(doc_id)))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(doc, key, value)
    await db.commit()
    await db.refresh(doc)
    return serialize(doc)


@router.delete("/{doc_id}", status_code=204)
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == uuid.UUID(doc_id)))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
