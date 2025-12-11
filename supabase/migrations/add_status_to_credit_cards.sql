-- إضافة عمود status إلى جدول credit_cards
-- Date: 2025-12-07

-- إنشاء نوع enum للحالة إذا لم يكن موجوداً
DO $$ BEGIN
  CREATE TYPE card_status AS ENUM ('active', 'blocked', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- إضافة عمود status إلى جدول credit_cards
ALTER TABLE credit_cards 
ADD COLUMN IF NOT EXISTS status card_status NOT NULL DEFAULT 'active';

-- إنشاء index على عمود status لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_credit_cards_status ON credit_cards(status);

-- تحديث البطاقات الموجودة لتكون active
UPDATE credit_cards 
SET status = 'active' 
WHERE status IS NULL;

