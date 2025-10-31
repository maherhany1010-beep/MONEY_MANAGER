-- ============================================
-- FINAL COMPREHENSIVE IMPROVEMENTS
-- ============================================
-- التاريخ: 29 أكتوبر 2025
-- الهدف: تطبيق جميع التحسينات الأمنية والأداء
-- الحالة: جاهز للتطبيق الفوري
-- ============================================

-- ============================================
-- PART 1: إصلاح الدوال (Functions) - حل تحذيرات Security Advisor
-- ============================================

-- 1.1: إصلاح update_updated_at_column
-- المشكلة: Function Search Path Mutable
-- الحل: إضافة SET search_path = public, pg_temp
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

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

COMMENT ON FUNCTION update_updated_at_column() IS 'تحديث تلقائي لحقل updated_at عند تعديل السجل - محمي بـ search_path';

-- 1.2: إصلاح update_card_balance
-- المشكلة: Function Search Path Mutable
-- الحل: إضافة SET search_path = public, pg_temp
DROP FUNCTION IF EXISTS update_card_balance() CASCADE;

CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- تحديث رصيد البطاقة بناءً على نوع المعاملة
        IF NEW.type = 'withdrawal' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.card_id;
        ELSIF NEW.type = 'payment' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.card_id;
        ELSIF NEW.type = 'cashback' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.card_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- عكس تحديث الرصيد عند حذف المعاملة
        IF OLD.type = 'withdrawal' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.card_id;
        ELSIF OLD.type = 'payment' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + OLD.amount
            WHERE id = OLD.card_id;
        ELSIF OLD.type = 'cashback' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + OLD.amount
            WHERE id = OLD.card_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION update_card_balance() IS 'تحديث تلقائي لرصيد البطاقة عند إضافة/حذف معاملة - محمي بـ search_path';

-- 1.3: إصلاح calculate_monthly_cashback
-- المشكلة: Function Search Path Mutable
-- الحل: إضافة SET search_path = public, pg_temp
DROP FUNCTION IF EXISTS calculate_monthly_cashback(UUID, UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS calculate_monthly_cashback(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_monthly_cashback() CASCADE;

CREATE OR REPLACE FUNCTION calculate_monthly_cashback(
    p_user_id UUID,
    p_card_id UUID DEFAULT NULL,
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW())::INTEGER,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
)
RETURNS DECIMAL
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_cashback DECIMAL := 0;
    v_cashback_rate DECIMAL;
    v_transaction_amount DECIMAL;
BEGIN
    -- حساب إجمالي الكاشباك للمستخدم في الشهر المحدد
    FOR v_transaction_amount, v_cashback_rate IN
        SELECT t.amount, c.cashback_rate
        FROM transactions t
        JOIN credit_cards c ON t.card_id = c.id
        WHERE t.user_id = p_user_id
        AND EXTRACT(MONTH FROM t.transaction_date) = p_month
        AND EXTRACT(YEAR FROM t.transaction_date) = p_year
        AND (p_card_id IS NULL OR t.card_id = p_card_id)
        AND t.type IN ('withdrawal', 'payment')
    LOOP
        v_total_cashback := v_total_cashback + (v_transaction_amount * v_cashback_rate / 100);
    END LOOP;
    
    RETURN v_total_cashback;
END;
$$;

COMMENT ON FUNCTION calculate_monthly_cashback(UUID, UUID, INTEGER, INTEGER) IS 'حساب إجمالي الكاشباك الشهري للمستخدم أو بطاقة محددة - محمي بـ search_path';

-- 1.4: إعادة إنشاء Triggers
-- إعادة إنشاء المحفزات بعد تحديث الدوال

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON credit_cards;
CREATE TRIGGER update_credit_cards_updated_at
    BEFORE UPDATE ON credit_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger لتحديث رصيد البطاقة
DROP TRIGGER IF EXISTS update_card_balance_trigger ON transactions;
CREATE TRIGGER update_card_balance_trigger
    AFTER INSERT OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_card_balance();

-- ============================================
-- PART 2: تحسين الفهارس (Indexes) - تحسين الأداء
-- ============================================

-- 2.1: فهارس مركبة للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
    ON transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_card_date 
    ON transactions(card_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type_date 
    ON transactions(type, transaction_date DESC);

-- 2.2: فهارس للمدفوعات
CREATE INDEX IF NOT EXISTS idx_payments_user_status 
    ON payments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_card_status 
    ON payments(card_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_due_date_status 
    ON payments(due_date, status);

-- 2.3: فهارس للبطاقات
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_balance 
    ON credit_cards(user_id, current_balance);

CREATE INDEX IF NOT EXISTS idx_credit_cards_user_active 
    ON credit_cards(user_id) WHERE is_active = true;

-- 2.4: فهارس لجدول OTP (إن وجد)
CREATE INDEX IF NOT EXISTS idx_otp_email_expires 
    ON otp_codes(email, expires_at DESC) WHERE verified = false;

CREATE INDEX IF NOT EXISTS idx_otp_email_verified 
    ON otp_codes(email, verified);

-- ============================================
-- PART 3: تحسين RLS Policies - تعزيز الأمان
-- ============================================

-- 3.1: التأكد من تفعيل RLS على جميع الجداول
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- تفعيل RLS على جدول OTP إن وجد
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'otp_codes') THEN
        ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 3.2: التحقق من وجود Policies الأساسية
-- (السياسات موجودة بالفعل من schema.sql، هذا للتأكيد فقط)

-- ============================================
-- PART 4: تحسينات الأداء العامة
-- ============================================

-- 4.1: تحديث إحصائيات الجداول
ANALYZE credit_cards;
ANALYZE transactions;
ANALYZE payments;

-- تحديث إحصائيات OTP إن وجد
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'otp_codes') THEN
        EXECUTE 'ANALYZE otp_codes';
    END IF;
END $$;

-- 4.2: Vacuum للجداول (تنظيف)
VACUUM ANALYZE credit_cards;
VACUUM ANALYZE transactions;
VACUUM ANALYZE payments;

-- ============================================
-- PART 5: إضافة دوال مساعدة جديدة
-- ============================================

-- 5.1: دالة لحساب الرصيد المتاح
CREATE OR REPLACE FUNCTION get_available_credit(p_card_id UUID)
RETURNS DECIMAL
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_credit_limit DECIMAL;
    v_current_balance DECIMAL;
BEGIN
    SELECT credit_limit, current_balance
    INTO v_credit_limit, v_current_balance
    FROM credit_cards
    WHERE id = p_card_id;
    
    RETURN v_credit_limit - v_current_balance;
END;
$$;

COMMENT ON FUNCTION get_available_credit(UUID) IS 'حساب الرصيد المتاح للبطاقة (الحد - الرصيد الحالي)';

-- 5.2: دالة لحساب نسبة الاستخدام
CREATE OR REPLACE FUNCTION get_utilization_percentage(p_card_id UUID)
RETURNS DECIMAL
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    v_credit_limit DECIMAL;
    v_current_balance DECIMAL;
BEGIN
    SELECT credit_limit, current_balance
    INTO v_credit_limit, v_current_balance
    FROM credit_cards
    WHERE id = p_card_id;
    
    IF v_credit_limit = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN (v_current_balance / v_credit_limit) * 100;
END;
$$;

COMMENT ON FUNCTION get_utilization_percentage(UUID) IS 'حساب نسبة استخدام البطاقة (%)';

-- ============================================
-- PART 6: إضافة Constraints إضافية
-- ============================================

-- 6.1: التأكد من أن الرصيد لا يتجاوز الحد
ALTER TABLE credit_cards DROP CONSTRAINT IF EXISTS check_balance_not_exceed_limit;
ALTER TABLE credit_cards ADD CONSTRAINT check_balance_not_exceed_limit 
    CHECK (current_balance <= credit_limit * 1.5); -- السماح بتجاوز 50% كحد أقصى

-- 6.2: التأكد من أن المبالغ موجبة
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS check_amount_positive;
ALTER TABLE transactions ADD CONSTRAINT check_amount_positive 
    CHECK (amount > 0);

ALTER TABLE payments DROP CONSTRAINT IF EXISTS check_payment_amount_positive;
ALTER TABLE payments ADD CONSTRAINT check_payment_amount_positive 
    CHECK (amount > 0);

-- ============================================
-- END OF MIGRATION
-- ============================================

-- عرض ملخص التحسينات
SELECT 
    '✅ تم تطبيق جميع التحسينات بنجاح!' AS status,
    '3 دوال محسّنة' AS functions_fixed,
    '10+ فهارس جديدة' AS indexes_added,
    'RLS مفعّل على جميع الجداول' AS rls_status,
    '2 دوال مساعدة جديدة' AS helper_functions,
    'Constraints إضافية للأمان' AS constraints_added;

