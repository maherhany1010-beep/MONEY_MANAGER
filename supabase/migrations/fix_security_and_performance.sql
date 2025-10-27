-- Fix Security and Performance Issues
-- This migration fixes all security warnings and performance issues

-- ============================================
-- 1. FIX FUNCTION SEARCH PATHS
-- ============================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix update_card_balance function
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update card balance based on transaction type
        IF NEW.type = 'withdrawal' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.card_id;
        ELSIF NEW.type = 'payment' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.card_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the balance update when transaction is deleted
        IF OLD.type = 'withdrawal' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.card_id;
        ELSIF OLD.type = 'payment' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + OLD.amount
            WHERE id = OLD.card_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix calculate_monthly_cashback function
CREATE OR REPLACE FUNCTION calculate_monthly_cashback(
    p_user_id UUID,
    p_card_id UUID DEFAULT NULL,
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW()),
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())
)
RETURNS DECIMAL AS $$
DECLARE
    v_total_cashback DECIMAL := 0;
    v_cashback_rate DECIMAL;
    v_transaction_amount DECIMAL;
BEGIN
    -- Get all transactions for the user in the specified month
    FOR v_transaction_amount, v_cashback_rate IN
        SELECT t.amount, c.cashback_rate
        FROM transactions t
        JOIN credit_cards c ON t.card_id = c.id
        WHERE t.user_id = p_user_id
        AND EXTRACT(MONTH FROM t.transaction_date) = p_month
        AND EXTRACT(YEAR FROM t.transaction_date) = p_year
        AND (p_card_id IS NULL OR t.card_id = p_card_id)
        AND t.type IN ('withdrawal', 'payment')
    LOOP
        v_total_cashback := v_total_cashback + (v_transaction_amount * v_cashback_rate / 100);
    END LOOP;
    
    RETURN v_total_cashback;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================
-- 2. ENSURE RLS IS ENABLED
-- ============================================

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. ADD PERFORMANCE INDEXES
-- ============================================

-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
    ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_card_date 
    ON transactions(card_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_payments_user_status 
    ON payments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_card_status 
    ON payments(card_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_balance 
    ON credit_cards(user_id, current_balance);

CREATE INDEX IF NOT EXISTS idx_otp_email_expires 
    ON otp_codes(email, expires_at DESC);

-- ============================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp when a record is modified';

COMMENT ON FUNCTION update_card_balance() IS 'Automatically updates card balance when transactions are inserted or deleted';

COMMENT ON FUNCTION calculate_monthly_cashback(UUID, UUID, INTEGER, INTEGER) IS 'Calculates monthly cashback for a user or specific card';

-- ============================================
-- 5. VERIFY RLS POLICIES
-- ============================================

-- Verify that all policies are in place
-- (These should already exist from schema.sql)

-- For credit_cards:
-- - Users can view their own credit cards
-- - Users can insert their own credit cards
-- - Users can update their own credit cards
-- - Users can delete their own credit cards

-- For transactions:
-- - Users can view their own transactions
-- - Users can insert their own transactions
-- - Users can update their own transactions
-- - Users can delete their own transactions

-- For payments:
-- - Users can view their own payments
-- - Users can insert their own payments
-- - Users can update their own payments
-- - Users can delete their own payments

-- For otp_codes:
-- - Allow anyone to insert OTP codes
-- - Allow anyone to select their own OTP codes
-- - Allow anyone to update their own OTP codes
-- - Allow anyone to delete expired OTP codes

-- ============================================
-- 6. PERFORMANCE OPTIMIZATION
-- ============================================

-- Analyze tables to update statistics
ANALYZE credit_cards;
ANALYZE transactions;
ANALYZE payments;
ANALYZE otp_codes;

-- ============================================
-- END OF MIGRATION
-- ============================================

