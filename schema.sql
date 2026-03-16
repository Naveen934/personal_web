-- Personal Dashboard Schema
-- Run this in Supabase SQL Editor to create all tables

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Working', 'Future Planning', 'In Process', 'Closed')),
    monthly_revenue NUMERIC(15, 2) DEFAULT 0,
    total_invested NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings Table
CREATE TABLE IF NOT EXISTS savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    subcategory TEXT,
    quantity TEXT,
    value NUMERIC(15, 2) DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('asset', 'liability')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Economy / Bank Table
CREATE TABLE IF NOT EXISTS economy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name TEXT NOT NULL,
    account_type TEXT,
    balance NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_name TEXT NOT NULL,
    number TEXT,
    drive_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data (optional – uncomment to pre-populate)
-- INSERT INTO companies (name, status, monthly_revenue, total_invested, notes)
-- VALUES ('Chain Company', 'Working', 9000, 300000, 'Main operational business');

-- INSERT INTO savings (category, subcategory, quantity, value, type, notes)
-- VALUES 
--   ('Stock Market', NULL, NULL, 65000, 'asset', 'Equity portfolio'),
--   ('Gold', 'Loan', '28 grams', -175000, 'liability', 'Gold pledged for loan'),
--   ('Gold', 'Holdings', '6 grams', 65000, 'asset', 'Physical gold');

-- INSERT INTO economy (bank_name, account_type, balance, notes)
-- VALUES ('Primary Bank', 'Savings', 16000, 'No active loans');

-- INSERT INTO documents (document_name, number, drive_link)
-- VALUES ('Aadhar', '4855 4XXX XXXX', 'https://drive.google.com/');

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_name TEXT NOT NULL,
    amount NUMERIC(15, 2) DEFAULT 0,
    payment_type TEXT NOT NULL,
    time_cycle_days INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
