-- ============================================
-- Create Customer Payments Table
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

