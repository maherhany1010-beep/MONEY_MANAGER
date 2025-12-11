-- ============================================
-- Add Missing Fields to Sales Invoices Table
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

