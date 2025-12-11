-- ============================================
-- Add Missing Fields to Customers Table
-- ============================================

-- Add total_payments field if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_payments DECIMAL(12, 2) DEFAULT 0;

-- Add total_purchases field if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchases DECIMAL(12, 2) DEFAULT 0;

-- Add due_date field if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add last_payment_date field if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_payment_date DATE;

-- Add last_invoice_date field if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_invoice_date DATE;

-- Add notes field if not exists
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_current_debt ON customers(current_debt);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_credit_limit ON customers(credit_limit);

-- Add constraint to ensure current_debt is not negative
ALTER TABLE customers DROP CONSTRAINT IF EXISTS check_current_debt_not_negative;
ALTER TABLE customers ADD CONSTRAINT check_current_debt_not_negative CHECK (current_debt >= 0);

-- Add constraint to ensure opening_balance is not negative
ALTER TABLE customers DROP CONSTRAINT IF EXISTS check_opening_balance_not_negative;
ALTER TABLE customers ADD CONSTRAINT check_opening_balance_not_negative CHECK (opening_balance >= 0);

-- Add constraint to ensure total_payments is not negative
ALTER TABLE customers DROP CONSTRAINT IF EXISTS check_total_payments_not_negative;
ALTER TABLE customers ADD CONSTRAINT check_total_payments_not_negative CHECK (total_payments >= 0);

-- Add constraint to ensure total_purchases is not negative
ALTER TABLE customers DROP CONSTRAINT IF EXISTS check_total_purchases_not_negative;
ALTER TABLE customers ADD CONSTRAINT check_total_purchases_not_negative CHECK (total_purchases >= 0);

