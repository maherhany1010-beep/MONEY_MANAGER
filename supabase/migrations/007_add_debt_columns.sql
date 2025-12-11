-- ============================================
-- إضافة أعمدة المديونية لجدول العملاء
-- Add Debt Columns to Customers Table
-- ============================================

-- إضافة عمود المديونية المبدئية
ALTER TABLE customers ADD COLUMN IF NOT EXISTS opening_balance DECIMAL(12, 2) DEFAULT 0;

-- إضافة عمود المديونية الحالية
ALTER TABLE customers ADD COLUMN IF NOT EXISTS current_debt DECIMAL(12, 2) DEFAULT 0;

-- إضافة عمود الحد الائتماني
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12, 2) DEFAULT 0;

-- إضافة عمود إجمالي المدفوعات
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_payments DECIMAL(12, 2) DEFAULT 0;

-- إضافة عمود إجمالي المشتريات
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchases DECIMAL(12, 2) DEFAULT 0;

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_customers_current_debt ON customers(current_debt);
CREATE INDEX IF NOT EXISTS idx_customers_credit_limit ON customers(credit_limit);

-- ============================================
-- تطبيق هذا الملف على قاعدة البيانات:
-- 1. افتح Supabase Dashboard
-- 2. اذهب إلى SQL Editor
-- 3. انسخ والصق هذا الكود
-- 4. اضغط Run
-- ============================================

