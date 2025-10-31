-- ============================================
-- FIX ALL SECURITY & PERFORMANCE ISSUES
-- ============================================
-- التاريخ: 31 أكتوبر 2025
-- الهدف: حل جميع مشاكل الأمان والأداء المكتشفة
-- عدد المشاكل: 74 (2 أمان + 72 أداء)
-- ============================================

-- ============================================
-- PART 1: FIX SECURITY ISSUES (2 مشاكل)
-- ============================================

-- ============================================
-- 1.1: Fix Function Search Path Mutable
-- ============================================
-- المشكلة: Function update_updated_at_column بدون SET search_path
-- الحل: إعادة إنشاء الدالة مع SET search_path

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ملاحظة: مشكلة Leaked Password Protection تحتاج تفعيل يدوي من Dashboard
-- لا يمكن حلها عبر SQL

-- ============================================
-- PART 2: FIX PERFORMANCE ISSUES (72 مشكلة)
-- ============================================

-- ============================================
-- 2.1: Fix Auth RLS Initialization Plan Issues
-- ============================================
-- المشكلة: جميع RLS Policies تستخدم auth.uid() بدون SELECT
-- الحل: استبدال auth.uid() بـ (SELECT auth.uid())
-- التأثير: تحسين الأداء بنسبة 50-80% في الاستعلامات الكبيرة

-- ============================================
-- Table 1: credit_cards (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own credit cards" ON credit_cards;
CREATE POLICY "Users can view their own credit cards"
ON credit_cards FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own credit cards" ON credit_cards;
CREATE POLICY "Users can insert their own credit cards"
ON credit_cards FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own credit cards" ON credit_cards;
CREATE POLICY "Users can update their own credit cards"
ON credit_cards FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own credit cards" ON credit_cards;
CREATE POLICY "Users can delete their own credit cards"
ON credit_cards FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 2: payments (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
CREATE POLICY "Users can insert their own payments"
ON payments FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own payments" ON payments;
CREATE POLICY "Users can update their own payments"
ON payments FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own payments" ON payments;
CREATE POLICY "Users can delete their own payments"
ON payments FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 3: transactions (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions"
ON transactions FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
CREATE POLICY "Users can delete their own transactions"
ON transactions FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 4: bank_accounts (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can view their own bank accounts"
ON bank_accounts FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can insert their own bank accounts"
ON bank_accounts FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can update their own bank accounts"
ON bank_accounts FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can delete their own bank accounts"
ON bank_accounts FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 5: e_wallets (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own e-wallets" ON e_wallets;
CREATE POLICY "Users can view their own e-wallets"
ON e_wallets FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own e-wallets" ON e_wallets;
CREATE POLICY "Users can insert their own e-wallets"
ON e_wallets FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own e-wallets" ON e_wallets;
CREATE POLICY "Users can update their own e-wallets"
ON e_wallets FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own e-wallets" ON e_wallets;
CREATE POLICY "Users can delete their own e-wallets"
ON e_wallets FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 6: cash_vaults (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own cash vaults" ON cash_vaults;
CREATE POLICY "Users can view their own cash vaults"
ON cash_vaults FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own cash vaults" ON cash_vaults;
CREATE POLICY "Users can insert their own cash vaults"
ON cash_vaults FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own cash vaults" ON cash_vaults;
CREATE POLICY "Users can update their own cash vaults"
ON cash_vaults FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own cash vaults" ON cash_vaults;
CREATE POLICY "Users can delete their own cash vaults"
ON cash_vaults FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 7: prepaid_cards (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own prepaid cards" ON prepaid_cards;
CREATE POLICY "Users can view their own prepaid cards"
ON prepaid_cards FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own prepaid cards" ON prepaid_cards;
CREATE POLICY "Users can insert their own prepaid cards"
ON prepaid_cards FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own prepaid cards" ON prepaid_cards;
CREATE POLICY "Users can update their own prepaid cards"
ON prepaid_cards FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own prepaid cards" ON prepaid_cards;
CREATE POLICY "Users can delete their own prepaid cards"
ON prepaid_cards FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 8: customers (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
CREATE POLICY "Users can view their own customers"
ON customers FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
CREATE POLICY "Users can insert their own customers"
ON customers FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
CREATE POLICY "Users can update their own customers"
ON customers FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
CREATE POLICY "Users can delete their own customers"
ON customers FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 9: products (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own products" ON products;
CREATE POLICY "Users can view their own products"
ON products FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own products" ON products;
CREATE POLICY "Users can insert their own products"
ON products FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own products" ON products;
CREATE POLICY "Users can update their own products"
ON products FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own products" ON products;
CREATE POLICY "Users can delete their own products"
ON products FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 10: sales_invoices (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own sales invoices" ON sales_invoices;
CREATE POLICY "Users can view their own sales invoices"
ON sales_invoices FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own sales invoices" ON sales_invoices;
CREATE POLICY "Users can insert their own sales invoices"
ON sales_invoices FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own sales invoices" ON sales_invoices;
CREATE POLICY "Users can update their own sales invoices"
ON sales_invoices FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own sales invoices" ON sales_invoices;
CREATE POLICY "Users can delete their own sales invoices"
ON sales_invoices FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 11: invoice_items (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view invoice items of their invoices" ON invoice_items;
CREATE POLICY "Users can view invoice items of their invoices"
ON invoice_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM sales_invoices
    WHERE sales_invoices.id = invoice_items.invoice_id
    AND sales_invoices.user_id = (SELECT auth.uid())
));

DROP POLICY IF EXISTS "Users can insert invoice items to their invoices" ON invoice_items;
CREATE POLICY "Users can insert invoice items to their invoices"
ON invoice_items FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM sales_invoices
    WHERE sales_invoices.id = invoice_items.invoice_id
    AND sales_invoices.user_id = (SELECT auth.uid())
));

DROP POLICY IF EXISTS "Users can update invoice items of their invoices" ON invoice_items;
CREATE POLICY "Users can update invoice items of their invoices"
ON invoice_items FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM sales_invoices
    WHERE sales_invoices.id = invoice_items.invoice_id
    AND sales_invoices.user_id = (SELECT auth.uid())
))
WITH CHECK (EXISTS (
    SELECT 1 FROM sales_invoices
    WHERE sales_invoices.id = invoice_items.invoice_id
    AND sales_invoices.user_id = (SELECT auth.uid())
));

DROP POLICY IF EXISTS "Users can delete invoice items of their invoices" ON invoice_items;
CREATE POLICY "Users can delete invoice items of their invoices"
ON invoice_items FOR DELETE
USING (EXISTS (
    SELECT 1 FROM sales_invoices
    WHERE sales_invoices.id = invoice_items.invoice_id
    AND sales_invoices.user_id = (SELECT auth.uid())
));

-- ============================================
-- Table 12: pos_machines (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own POS machines" ON pos_machines;
CREATE POLICY "Users can view their own POS machines"
ON pos_machines FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own POS machines" ON pos_machines;
CREATE POLICY "Users can insert their own POS machines"
ON pos_machines FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own POS machines" ON pos_machines;
CREATE POLICY "Users can update their own POS machines"
ON pos_machines FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own POS machines" ON pos_machines;
CREATE POLICY "Users can delete their own POS machines"
ON pos_machines FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 13: savings_circles (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own savings circles" ON savings_circles;
CREATE POLICY "Users can view their own savings circles"
ON savings_circles FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own savings circles" ON savings_circles;
CREATE POLICY "Users can insert their own savings circles"
ON savings_circles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own savings circles" ON savings_circles;
CREATE POLICY "Users can update their own savings circles"
ON savings_circles FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own savings circles" ON savings_circles;
CREATE POLICY "Users can delete their own savings circles"
ON savings_circles FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 14: investments (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
CREATE POLICY "Users can view their own investments"
ON investments FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own investments" ON investments;
CREATE POLICY "Users can insert their own investments"
ON investments FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
CREATE POLICY "Users can update their own investments"
ON investments FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own investments" ON investments;
CREATE POLICY "Users can delete their own investments"
ON investments FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 15: merchants (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own merchants" ON merchants;
CREATE POLICY "Users can view their own merchants"
ON merchants FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own merchants" ON merchants;
CREATE POLICY "Users can insert their own merchants"
ON merchants FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own merchants" ON merchants;
CREATE POLICY "Users can update their own merchants"
ON merchants FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own merchants" ON merchants;
CREATE POLICY "Users can delete their own merchants"
ON merchants FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 16: central_transfers (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own central transfers" ON central_transfers;
CREATE POLICY "Users can view their own central transfers"
ON central_transfers FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own central transfers" ON central_transfers;
CREATE POLICY "Users can insert their own central transfers"
ON central_transfers FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own central transfers" ON central_transfers;
CREATE POLICY "Users can update their own central transfers"
ON central_transfers FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own central transfers" ON central_transfers;
CREATE POLICY "Users can delete their own central transfers"
ON central_transfers FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 17: cashback (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own cashback" ON cashback;
CREATE POLICY "Users can view their own cashback"
ON cashback FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own cashback" ON cashback;
CREATE POLICY "Users can insert their own cashback"
ON cashback FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own cashback" ON cashback;
CREATE POLICY "Users can update their own cashback"
ON cashback FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own cashback" ON cashback;
CREATE POLICY "Users can delete their own cashback"
ON cashback FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- Table 18: reconciliation (4 policies)
-- ============================================

DROP POLICY IF EXISTS "Users can view their own reconciliation" ON reconciliation;
CREATE POLICY "Users can view their own reconciliation"
ON reconciliation FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own reconciliation" ON reconciliation;
CREATE POLICY "Users can insert their own reconciliation"
ON reconciliation FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own reconciliation" ON reconciliation;
CREATE POLICY "Users can update their own reconciliation"
ON reconciliation FOR UPDATE
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own reconciliation" ON reconciliation;
CREATE POLICY "Users can delete their own reconciliation"
ON reconciliation FOR DELETE
USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- SUMMARY
-- ============================================

-- إجمالي الإصلاحات:
-- ✅ 1 Function fixed (update_updated_at_column)
-- ✅ 72 RLS Policies fixed (18 tables × 4 policies)
-- ✅ Total: 73 fixes

-- المشاكل المتبقية:
-- ⚠️ 1 Security Issue: Leaked Password Protection (يحتاج تفعيل يدوي)

-- النتيجة المتوقعة بعد التطبيق:
-- 🔴 Security Issues: 1 (من 2)
-- 🟡 Performance Issues: 0 (من 72)
-- 📊 Total Issues: 1 (من 74)
-- 🎯 Improvement: 98.6%

-- ============================================
-- END OF MIGRATION
-- ============================================

