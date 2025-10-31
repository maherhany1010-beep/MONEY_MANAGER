-- ============================================
-- 🚀 ALL MIGRATIONS COMBINED
-- Date: 2025-10-30
-- Description: جميع migrations في ملف واحد لسهولة التطبيق
-- 
-- الاستخدام:
-- 1. افتح Supabase Dashboard → SQL Editor
-- 2. انسخ هذا الملف بالكامل
-- 3. الصق في SQL Editor
-- 4. اضغط Run
-- 
-- ملاحظة: هذا الملف يجمع:
-- - 001_create_missing_tables.sql
-- - 002_enable_rls_policies.sql
-- - 003_create_triggers.sql
-- ============================================

-- ============================================
-- PART 1: CREATE MISSING TABLES
-- ============================================

-- 1. Bank Accounts (الحسابات البنكية)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('current', 'savings', 'investment')),
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  iban TEXT,
  swift_code TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);

-- 2. E-Wallets (المحافظ الإلكترونية)
CREATE TABLE IF NOT EXISTS e_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_name TEXT NOT NULL,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('stc_pay', 'apple_pay', 'mada_pay', 'urpay', 'other')),
  phone_number TEXT,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_e_wallets_user_id ON e_wallets(user_id);

-- 3. Cash Vaults (الخزائن النقدية)
CREATE TABLE IF NOT EXISTS cash_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_name TEXT NOT NULL,
  location TEXT,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_vaults_user_id ON cash_vaults(user_id);

-- 4. Prepaid Cards (البطاقات المدفوعة مسبقاً)
CREATE TABLE IF NOT EXISTS prepaid_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  card_number TEXT,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prepaid_cards_user_id ON prepaid_cards(user_id);

-- 5. Customers (العملاء)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 6. Products (المنتجات)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  cost DECIMAL(12, 2),
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- 7. Sales Invoices (فواتير المبيعات)
CREATE TABLE IF NOT EXISTS sales_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_invoices_user_id ON sales_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_id ON sales_invoices(customer_id);

-- 8. Invoice Items (عناصر الفاتورة)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 9. POS Machines (أجهزة نقاط البيع)
CREATE TABLE IF NOT EXISTS pos_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  machine_name TEXT NOT NULL,
  machine_number TEXT,
  provider TEXT,
  commission_rate DECIMAL(5, 2),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_machines_user_id ON pos_machines(user_id);

-- 10. Savings Circles (دوائر الادخار)
CREATE TABLE IF NOT EXISTS savings_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_name TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  monthly_payment DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_circles_user_id ON savings_circles(user_id);

-- 11. Investments (الاستثمارات)
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_name TEXT NOT NULL,
  investment_type TEXT,
  initial_amount DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2),
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);

-- 12. Merchants (التجار)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  category TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);

-- 13. Central Transfers (التحويلات المركزية)
CREATE TABLE IF NOT EXISTS central_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_type TEXT NOT NULL,
  from_account_id UUID NOT NULL,
  to_account_type TEXT NOT NULL,
  to_account_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_central_transfers_user_id ON central_transfers(user_id);

-- 14. Cashback (الاسترداد النقدي)
CREATE TABLE IF NOT EXISTS cashback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  cashback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cashback_user_id ON cashback(user_id);

-- 15. Reconciliation (التسوية)
CREATE TABLE IF NOT EXISTS reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL,
  account_id UUID NOT NULL,
  expected_balance DECIMAL(12, 2) NOT NULL,
  actual_balance DECIMAL(12, 2) NOT NULL,
  difference DECIMAL(12, 2) NOT NULL,
  reconciliation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_user_id ON reconciliation(user_id);

-- ============================================
-- PART 2: ENABLE RLS AND CREATE POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE prepaid_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashback ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation ENABLE ROW LEVEL SECURITY;

-- Policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts" ON bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank accounts" ON bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank accounts" ON bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank accounts" ON bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- Policies for e_wallets
CREATE POLICY "Users can view their own e-wallets" ON e_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own e-wallets" ON e_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own e-wallets" ON e_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own e-wallets" ON e_wallets FOR DELETE USING (auth.uid() = user_id);

-- Policies for cash_vaults
CREATE POLICY "Users can view their own cash vaults" ON cash_vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cash vaults" ON cash_vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cash vaults" ON cash_vaults FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cash vaults" ON cash_vaults FOR DELETE USING (auth.uid() = user_id);

-- Policies for prepaid_cards
CREATE POLICY "Users can view their own prepaid cards" ON prepaid_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prepaid cards" ON prepaid_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prepaid cards" ON prepaid_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prepaid cards" ON prepaid_cards FOR DELETE USING (auth.uid() = user_id);

-- Policies for customers
CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- Policies for products
CREATE POLICY "Users can view their own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Policies for sales_invoices
CREATE POLICY "Users can view their own sales invoices" ON sales_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sales invoices" ON sales_invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales invoices" ON sales_invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales invoices" ON sales_invoices FOR DELETE USING (auth.uid() = user_id);

-- Policies for invoice_items (based on parent invoice)
CREATE POLICY "Users can view invoice items of their invoices" ON invoice_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM sales_invoices WHERE sales_invoices.id = invoice_items.invoice_id AND sales_invoices.user_id = auth.uid()));
CREATE POLICY "Users can insert invoice items to their invoices" ON invoice_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM sales_invoices WHERE sales_invoices.id = invoice_items.invoice_id AND sales_invoices.user_id = auth.uid()));
CREATE POLICY "Users can update invoice items of their invoices" ON invoice_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM sales_invoices WHERE sales_invoices.id = invoice_items.invoice_id AND sales_invoices.user_id = auth.uid()));
CREATE POLICY "Users can delete invoice items of their invoices" ON invoice_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM sales_invoices WHERE sales_invoices.id = invoice_items.invoice_id AND sales_invoices.user_id = auth.uid()));

-- Policies for pos_machines
CREATE POLICY "Users can view their own POS machines" ON pos_machines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own POS machines" ON pos_machines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own POS machines" ON pos_machines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own POS machines" ON pos_machines FOR DELETE USING (auth.uid() = user_id);

-- Policies for savings_circles
CREATE POLICY "Users can view their own savings circles" ON savings_circles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own savings circles" ON savings_circles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own savings circles" ON savings_circles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own savings circles" ON savings_circles FOR DELETE USING (auth.uid() = user_id);

-- Policies for investments
CREATE POLICY "Users can view their own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON investments FOR DELETE USING (auth.uid() = user_id);

-- Policies for merchants
CREATE POLICY "Users can view their own merchants" ON merchants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own merchants" ON merchants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own merchants" ON merchants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own merchants" ON merchants FOR DELETE USING (auth.uid() = user_id);

-- Policies for central_transfers
CREATE POLICY "Users can view their own central transfers" ON central_transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own central transfers" ON central_transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own central transfers" ON central_transfers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own central transfers" ON central_transfers FOR DELETE USING (auth.uid() = user_id);

-- Policies for cashback
CREATE POLICY "Users can view their own cashback" ON cashback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cashback" ON cashback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cashback" ON cashback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cashback" ON cashback FOR DELETE USING (auth.uid() = user_id);

-- Policies for reconciliation
CREATE POLICY "Users can view their own reconciliation" ON reconciliation FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reconciliation" ON reconciliation FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reconciliation" ON reconciliation FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reconciliation" ON reconciliation FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 3: CREATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_e_wallets_updated_at BEFORE UPDATE ON e_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_vaults_updated_at BEFORE UPDATE ON cash_vaults FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prepaid_cards_updated_at BEFORE UPDATE ON prepaid_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_invoices_updated_at BEFORE UPDATE ON sales_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_machines_updated_at BEFORE UPDATE ON pos_machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_circles_updated_at BEFORE UPDATE ON savings_circles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cashback_updated_at BEFORE UPDATE ON cashback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ MIGRATIONS COMPLETED
-- ============================================
--
-- تم إنشاء:
-- - 15 جدول جديد
-- - 60 RLS policy
-- - 12 trigger
--
-- الخطوات التالية:
-- 1. تحقق من نجاح التطبيق
-- 2. شغّل: npm run migrate:verify
-- 3. ابدأ بتحديث Contexts
-- ============================================

