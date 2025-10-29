-- Fix Remaining Performance Issues - Version 3
-- This migration fixes the remaining 11 performance issues
-- Focus: Timezone caching and query optimization

-- ============================================
-- 1. CREATE TIMEZONE CACHE TABLE
-- ============================================

-- Create timezone cache to avoid repeated queries
CREATE TABLE IF NOT EXISTS timezone_cache (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    cached_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_timezone_name UNIQUE (name)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_timezone_cache_name 
    ON timezone_cache(name);

-- ============================================
-- 2. POPULATE TIMEZONE CACHE
-- ============================================

-- Insert all timezones from pg_timezone_names
INSERT INTO timezone_cache (name)
SELECT DISTINCT name FROM pg_timezone_names
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. OPTIMIZE MIGRATION QUERIES
-- ============================================

-- Add indexes for migration-related queries
CREATE INDEX IF NOT EXISTS idx_migrations_name 
    ON migrations(name);

CREATE INDEX IF NOT EXISTS idx_migrations_executed_at 
    ON migrations(executed_at DESC);

-- ============================================
-- 4. OPTIMIZE TRANSACTION QUERIES
-- ============================================

-- Ensure composite indexes exist for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_date 
    ON transactions(user_id, card_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type_date 
    ON transactions(type, transaction_date DESC);

-- ============================================
-- 5. OPTIMIZE PAYMENT QUERIES
-- ============================================

-- Add indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_payments_user_date 
    ON payments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status_date 
    ON payments(status, created_at DESC);

-- ============================================
-- 6. OPTIMIZE CREDIT CARD QUERIES
-- ============================================

-- Add indexes for credit card queries
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_status 
    ON credit_cards(user_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_cards_card_type 
    ON credit_cards(card_type, status);

-- ============================================
-- 7. CREATE MATERIALIZED VIEW FOR REPORTS
-- ============================================

-- Create materialized view for faster reporting
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_transaction_summary AS
SELECT 
    u.id as user_id,
    COUNT(t.id) as total_transactions,
    SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END) as total_withdrawals,
    SUM(CASE WHEN t.type = 'payment' THEN t.amount ELSE 0 END) as total_payments,
    AVG(t.amount) as avg_transaction_amount,
    MAX(t.transaction_date) as last_transaction_date
FROM auth.users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_user_transaction_summary_user_id 
    ON mv_user_transaction_summary(user_id);

-- ============================================
-- 8. REFRESH STATISTICS
-- ============================================

-- Analyze all tables to update query planner statistics
ANALYZE credit_cards;
ANALYZE transactions;
ANALYZE payments;
ANALYZE timezone_cache;

-- ============================================
-- 9. ADD QUERY PERFORMANCE COMMENTS
-- ============================================

COMMENT ON TABLE timezone_cache IS 'Cache for timezone names to avoid repeated queries to pg_timezone_names';

COMMENT ON MATERIALIZED VIEW mv_user_transaction_summary IS 'Materialized view for fast user transaction reporting';

-- ============================================
-- 10. ENABLE QUERY OPTIMIZATION
-- ============================================

-- Set work_mem for better query performance
SET work_mem = '256MB';

-- ============================================
-- END OF MIGRATION
-- ============================================

