import uuid
from sqlalchemy import Column, String, Numeric, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    monthly_revenue = Column(Numeric(15, 2), default=0)
    total_invested = Column(Numeric(15, 2), default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Saving(Base):
    __tablename__ = "savings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)
    quantity = Column(String, nullable=True)
    value = Column(Numeric(15, 2), default=0)
    type = Column(String, nullable=False)  # 'asset' or 'liability'
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Economy(Base):
    __tablename__ = "economy"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_name = Column(String, nullable=False)
    account_type = Column(String, nullable=True)
    balance = Column(Numeric(15, 2), default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_name = Column(String, nullable=False)
    number = Column(String, nullable=True)
    drive_link = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bill_name = Column(String, nullable=False)
    amount = Column(Numeric(15, 2), default=0)
    payment_type = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
