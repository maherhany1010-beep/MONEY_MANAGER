-- ============================================
-- Migration: Enable RLS and Create Policies
-- Date: 2025-10-30
-- Description: تفعيل Row Level Security وإنشاء Policies لجميع الجداول
-- ============================================

-- ============================================
-- تفعيل RLS على جميع الجداول
-- ============================================
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

-- ============================================
-- Policies: Bank Accounts
-- ============================================
CREATE POLICY "Users can view their own bank accounts"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
  ON bank_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: E-Wallets
-- ============================================
CREATE POLICY "Users can view their own e-wallets"
  ON e_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own e-wallets"
  ON e_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own e-wallets"
  ON e_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own e-wallets"
  ON e_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Cash Vaults
-- ============================================
CREATE POLICY "Users can view their own cash vaults"
  ON cash_vaults FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash vaults"
  ON cash_vaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash vaults"
  ON cash_vaults FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash vaults"
  ON cash_vaults FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Prepaid Cards
-- ============================================
CREATE POLICY "Users can view their own prepaid cards"
  ON prepaid_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prepaid cards"
  ON prepaid_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prepaid cards"
  ON prepaid_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prepaid cards"
  ON prepaid_cards FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Customers
-- ============================================
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Products
-- ============================================
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Sales Invoices
-- ============================================
CREATE POLICY "Users can view their own sales invoices"
  ON sales_invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales invoices"
  ON sales_invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales invoices"
  ON sales_invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales invoices"
  ON sales_invoices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Invoice Items
-- ============================================
-- Note: Invoice items are accessed through their parent invoice
CREATE POLICY "Users can view invoice items for their invoices"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales_invoices
      WHERE sales_invoices.id = invoice_items.invoice_id
      AND sales_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoice items for their invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_invoices
      WHERE sales_invoices.id = invoice_items.invoice_id
      AND sales_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoice items for their invoices"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sales_invoices
      WHERE sales_invoices.id = invoice_items.invoice_id
      AND sales_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete invoice items for their invoices"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sales_invoices
      WHERE sales_invoices.id = invoice_items.invoice_id
      AND sales_invoices.user_id = auth.uid()
    )
  );

-- ============================================
-- Policies: POS Machines
-- ============================================
CREATE POLICY "Users can view their own POS machines"
  ON pos_machines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own POS machines"
  ON pos_machines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own POS machines"
  ON pos_machines FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own POS machines"
  ON pos_machines FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Savings Circles
-- ============================================
CREATE POLICY "Users can view their own savings circles"
  ON savings_circles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings circles"
  ON savings_circles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings circles"
  ON savings_circles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings circles"
  ON savings_circles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Investments
-- ============================================
CREATE POLICY "Users can view their own investments"
  ON investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
  ON investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
  ON investments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
  ON investments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Merchants
-- ============================================
CREATE POLICY "Users can view their own merchants"
  ON merchants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own merchants"
  ON merchants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merchants"
  ON merchants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own merchants"
  ON merchants FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Central Transfers
-- ============================================
CREATE POLICY "Users can view their own central transfers"
  ON central_transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own central transfers"
  ON central_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own central transfers"
  ON central_transfers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Cashback
-- ============================================
CREATE POLICY "Users can view their own cashback"
  ON cashback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cashback"
  ON cashback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cashback"
  ON cashback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cashback"
  ON cashback FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Policies: Reconciliation
-- ============================================
CREATE POLICY "Users can view their own reconciliation"
  ON reconciliation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reconciliation"
  ON reconciliation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reconciliation"
  ON reconciliation FOR DELETE
  USING (auth.uid() = user_id);

