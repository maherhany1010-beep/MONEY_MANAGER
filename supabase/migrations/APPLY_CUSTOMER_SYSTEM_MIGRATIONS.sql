-- ============================================
-- Apply Customer System Migrations
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. Create Customer Payments Table
-- ============================================

CREATE TABLE IF NOT EXISTS customer_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank-transfer', 'check', 'credit-card', 'e-wallet', 'other')),
  reference_number TEXT,
  notes TEXT,
  receiving_account_type TEXT CHECK (receiving_account_type IN ('bank', 'e-wallet', 'pos', 'cash-vault', 'prepaid-card')),
  receiving_account_id UUID,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_payments_user_id ON customer_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_payment_date ON customer_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_customer_payments_receiving_account ON customer_payments(receiving_account_type, receiving_account_id);

-- Enable RLS
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own customer payments" ON customer_payments;
CREATE POLICY "Users can view their own customer payments"
  ON customer_payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own customer payments" ON customer_payments;
CREATE POLICY "Users can insert their own customer payments"
  ON customer_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own customer payments" ON customer_payments;
CREATE POLICY "Users can update their own customer payments"
  ON customer_payments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own customer payments" ON customer_payments;
CREATE POLICY "Users can delete their own customer payments"
  ON customer_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_customer_payments_updated_at ON customer_payments;
CREATE TRIGGER update_customer_payments_updated_at
  BEFORE UPDATE ON customer_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Add Missing Fields to Customers Table
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

-- ============================================
-- 3. Add Missing Fields to Sales Invoices Table
-- ============================================

-- Add due_date field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add source_account_type field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS source_account_type TEXT CHECK (source_account_type IN ('bank', 'e-wallet', 'pos', 'cash-vault', 'prepaid-card'));

-- Add source_account_id field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS source_account_id UUID;

-- Add actual_paid_amount field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS actual_paid_amount DECIMAL(12, 2);

-- Add charged_amount field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS charged_amount DECIMAL(12, 2);

-- Add fees_type field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS fees_type TEXT CHECK (fees_type IN ('fixed', 'percentage'));

-- Add fees_value field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS fees_value DECIMAL(12, 2);

-- Add calculated_fees field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS calculated_fees DECIMAL(12, 2);

-- Add profit field if not exists
ALTER TABLE sales_invoices ADD COLUMN IF NOT EXISTS profit DECIMAL(12, 2);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_id ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_invoice_date ON sales_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(status);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_source_account ON sales_invoices(source_account_type, source_account_id);

-- Add constraint to ensure amounts are positive
ALTER TABLE sales_invoices DROP CONSTRAINT IF EXISTS check_total_amount_positive;
ALTER TABLE sales_invoices ADD CONSTRAINT check_total_amount_positive CHECK (total_amount > 0);

ALTER TABLE sales_invoices DROP CONSTRAINT IF EXISTS check_paid_amount_not_negative;
ALTER TABLE sales_invoices ADD CONSTRAINT check_paid_amount_not_negative CHECK (paid_amount >= 0);

-- ============================================
-- DONE! All migrations applied successfully
-- ============================================

