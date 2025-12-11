-- ============================================
-- تحسين جدول البطاقات المدفوعة مسبقاً
-- Enhance Prepaid Cards Table
-- Date: 2025-12-09
-- ============================================

-- إضافة الحقول الناقصة إلى جدول prepaid_cards
-- Adding missing fields to prepaid_cards table

-- 1. إضافة حقل العملة (currency) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'SAR';

-- 2. إضافة حقل الرصيد الأولي (initial_balance) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS initial_balance DECIMAL(12, 2);

-- 3. إضافة حقل نوع البطاقة (card_type) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS card_type TEXT;

-- 4. إضافة حقل مزود الخدمة (provider) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS provider TEXT;

-- 5. إضافة حقل الحد اليومي (daily_limit) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(12, 2) DEFAULT 0;

-- 6. إضافة حقل الحد الشهري (monthly_limit) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(12, 2) DEFAULT 0;

-- 7. إضافة حقل الحد الأقصى للرصيد (max_balance) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS max_balance DECIMAL(12, 2);

-- 8. إضافة حقل الحد الأقصى للمعاملة (transaction_limit) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS transaction_limit DECIMAL(12, 2);

-- 9. إضافة حقل الرسوم (fees) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS fees DECIMAL(12, 2) DEFAULT 0;

-- 10. إضافة حقل الملاحظات (notes) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 11. إضافة حقل قابلة لإعادة الشحن (is_reloadable) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS is_reloadable BOOLEAN DEFAULT true;

-- 12. إضافة حقل اسم حامل البطاقة (holder_name) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS holder_name TEXT;

-- 13. إضافة حقل رقم هاتف حامل البطاقة (holder_phone) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS holder_phone TEXT;

-- 14. إضافة حقل رقم الهوية الوطنية (holder_national_id) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS holder_national_id TEXT;

-- 15. إضافة حقل تاريخ الإصدار (issue_date) إذا لم يكن موجوداً
ALTER TABLE prepaid_cards 
ADD COLUMN IF NOT EXISTS issue_date DATE;

-- 16. جعل حقل card_number اختياري (nullable)
DO $$
BEGIN
  ALTER TABLE prepaid_cards
  ALTER COLUMN card_number DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 17. جعل حقل card_type اختياري (nullable) إذا كان مطلوباً
DO $$
BEGIN
  ALTER TABLE prepaid_cards
  ALTER COLUMN card_type DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 18. جعل حقل initial_balance اختياري (nullable)
DO $$
BEGIN
  ALTER TABLE prepaid_cards
  ALTER COLUMN initial_balance DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 19. تحديث الحقول الموجودة لتكون متوافقة مع البيانات الحالية
-- Update initial_balance to match current balance for existing records
UPDATE prepaid_cards
SET initial_balance = balance
WHERE initial_balance IS NULL;

-- ============================================
-- إنشاء الفهارس (Indexes)
-- ============================================

-- فهرس على user_id (إذا لم يكن موجوداً)
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_user_id ON prepaid_cards(user_id);

-- فهرس على status للبحث السريع
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_status ON prepaid_cards(status);

-- فهرس على provider للتصفية حسب مزود الخدمة
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_provider ON prepaid_cards(provider);

-- فهرس على expiry_date للبحث عن البطاقات المنتهية
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_expiry_date ON prepaid_cards(expiry_date);

-- فهرس مركب على user_id و status
CREATE INDEX IF NOT EXISTS idx_prepaid_cards_user_status ON prepaid_cards(user_id, status);

-- ============================================
-- إنشاء Trigger لتحديث updated_at
-- ============================================

-- إنشاء دالة لتحديث updated_at إذا لم تكن موجودة
CREATE OR REPLACE FUNCTION update_prepaid_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS update_prepaid_cards_updated_at_trigger ON prepaid_cards;
CREATE TRIGGER update_prepaid_cards_updated_at_trigger
  BEFORE UPDATE ON prepaid_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_prepaid_cards_updated_at();

-- ============================================
-- إضافة Constraints
-- ============================================

-- التأكد من أن الرصيد لا يكون سالباً
ALTER TABLE prepaid_cards 
DROP CONSTRAINT IF EXISTS check_prepaid_balance_positive;

ALTER TABLE prepaid_cards 
ADD CONSTRAINT check_prepaid_balance_positive 
CHECK (balance >= 0);

-- التأكد من أن الحدود موجبة
ALTER TABLE prepaid_cards 
DROP CONSTRAINT IF EXISTS check_prepaid_limits_positive;

ALTER TABLE prepaid_cards 
ADD CONSTRAINT check_prepaid_limits_positive 
CHECK (
  (daily_limit IS NULL OR daily_limit >= 0) AND
  (monthly_limit IS NULL OR monthly_limit >= 0) AND
  (max_balance IS NULL OR max_balance >= 0) AND
  (transaction_limit IS NULL OR transaction_limit >= 0)
);

-- التأكد من صحة الحالة (status)
ALTER TABLE prepaid_cards 
DROP CONSTRAINT IF EXISTS check_prepaid_status_valid;

ALTER TABLE prepaid_cards 
ADD CONSTRAINT check_prepaid_status_valid 
CHECK (status IN ('active', 'suspended', 'blocked', 'expired', 'cancelled'));

-- ============================================
-- تعليقات على الجدول والأعمدة
-- ============================================

COMMENT ON TABLE prepaid_cards IS 'جدول البطاقات المدفوعة مسبقاً (فوري، أمان، ممكن، مصاري)';
COMMENT ON COLUMN prepaid_cards.card_name IS 'اسم البطاقة';
COMMENT ON COLUMN prepaid_cards.card_number IS 'رقم البطاقة (اختياري)';
COMMENT ON COLUMN prepaid_cards.balance IS 'الرصيد الحالي';
COMMENT ON COLUMN prepaid_cards.currency IS 'العملة (افتراضي: SAR)';
COMMENT ON COLUMN prepaid_cards.initial_balance IS 'الرصيد الأولي';
COMMENT ON COLUMN prepaid_cards.expiry_date IS 'تاريخ انتهاء الصلاحية';
COMMENT ON COLUMN prepaid_cards.status IS 'حالة البطاقة (active, suspended, blocked, expired, cancelled)';
COMMENT ON COLUMN prepaid_cards.provider IS 'مزود الخدمة (فوري، أمان، ممكن، مصاري)';
COMMENT ON COLUMN prepaid_cards.daily_limit IS 'الحد اليومي للمعاملات';
COMMENT ON COLUMN prepaid_cards.monthly_limit IS 'الحد الشهري للمعاملات';

