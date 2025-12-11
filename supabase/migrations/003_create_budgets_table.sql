-- ============================================
-- Migration: Create Budgets Table
-- Date: 2025-11-01
-- Description: إنشاء جدول الميزانيات الشهرية
-- ============================================

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- معلومات الميزانية
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- التتبع
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - spent_amount) STORED,
  
  -- الحالة
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'exceeded')),
  alert_threshold DECIMAL(5, 2) DEFAULT 80, -- تنبيه عند 80%
  
  -- التواريخ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period_start, period_end);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets"
ON budgets FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
CREATE POLICY "Users can insert own budgets"
ON budgets FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets"
ON budgets FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
CREATE POLICY "Users can delete own budgets"
ON budgets FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at 
BEFORE UPDATE ON budgets 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ Budgets table created successfully
-- ============================================

