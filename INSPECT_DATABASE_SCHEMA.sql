-- ============================================
-- INSPECT DATABASE SCHEMA
-- ============================================

-- 1. Check credit_cards table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'credit_cards'
ORDER BY ordinal_position;

-- 2. Check payments table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- 3. Check transactions table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- 4. List all tables in public schema
SELECT 
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

