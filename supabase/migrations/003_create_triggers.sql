-- ============================================
-- Migration: Create Triggers for updated_at
-- Date: 2025-10-30
-- Description: إنشاء Triggers لتحديث updated_at تلقائياً
-- ============================================

-- ============================================
-- Function: تحديث updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers: تطبيق على جميع الجداول
-- ============================================

-- Bank Accounts
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- E-Wallets
CREATE TRIGGER update_e_wallets_updated_at
  BEFORE UPDATE ON e_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cash Vaults
CREATE TRIGGER update_cash_vaults_updated_at
  BEFORE UPDATE ON cash_vaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Prepaid Cards
CREATE TRIGGER update_prepaid_cards_updated_at
  BEFORE UPDATE ON prepaid_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sales Invoices
CREATE TRIGGER update_sales_invoices_updated_at
  BEFORE UPDATE ON sales_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- POS Machines
CREATE TRIGGER update_pos_machines_updated_at
  BEFORE UPDATE ON pos_machines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Savings Circles
CREATE TRIGGER update_savings_circles_updated_at
  BEFORE UPDATE ON savings_circles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Investments
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Merchants
CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cashback
CREATE TRIGGER update_cashback_updated_at
  BEFORE UPDATE ON cashback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ملاحظة: الجداول التالية لا تحتاج updated_at trigger
-- لأنها لا تحتوي على عمود updated_at:
-- - invoice_items
-- - central_transfers
-- - reconciliation
-- ============================================

