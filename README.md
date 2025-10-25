# تطبيق إدارة البطاقات الائتمانية

تطبيق ويب احترافي وعصري لإدارة البطاقات الائتمانية مع ميزات شاملة للعمليات المالية والكاش باك.

## 🚀 الميزات

### 📱 إدارة البطاقات الائتمانية
- عرض قائمة البطاقات مع تفاصيل شاملة
- إضافة وتعديل وحذف البطاقات
- تتبع الرصيد والحد الائتماني
- حساب نسبة الاستخدام

### 💰 العمليات المالية
- تسجيل المعاملات (سحب، إيداع، مدفوعات)
- تصنيف المعاملات حسب الفئات
- فلترة وبحث متقدم
- ملخص المعاملات والإحصائيات

### 📊 كشوفات الحساب
- عرض كشوفات مفصلة لكل بطاقة
- فلترة حسب التاريخ والبطاقة
- تصدير الكشوفات (PDF/Excel)
- ملخص الرصيد والمدفوعات

### 💳 إدارة المدفوعات
- تتبع المدفوعات المستحقة والمعلقة
- تقويم المدفوعات مع عرض بصري
- تنبيهات المدفوعات المتأخرة
- إعدادات التذكيرات

### 🎁 نظام الكاش باك المتقدم
- حساب وعرض الكاش باك المكتسب
- إحصائيات شهرية وسنوية مفصلة
- تتبع الكاش باك حسب الفئات
- نظام استرداد متعدد الخيارات
- تحليل أداء البطاقات

### 📈 لوحة التحكم الشاملة
- نظرة عامة على جميع الأنشطة المالية
- رسوم بيانية تفاعلية
- إحصائيات مفصلة ومؤشرات الأداء
- تنبيهات ذكية وتوصيات مخصصة

## 🛠️ التقنيات المستخدمة

- **الإطار**: Next.js 15.5.4 مع App Router وTurbopack
- **اللغة**: TypeScript
- **التصميم**: Tailwind CSS v4 مع دعم RTL
- **قاعدة البيانات**: Supabase مع PostgreSQL
- **المصادقة**: Supabase Auth
- **مكونات الواجهة**: Radix UI
- **الخط**: Noto Sans Arabic
- **إدارة النماذج**: react-hook-form مع Zod validation

## 🚀 التشغيل السريع

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. تشغيل التطبيق

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 🎯 وضع التطوير

التطبيق يعمل حالياً في وضع التطوير مع mock client، مما يسمح بتجربة جميع الميزات بدون إعداد قاعدة بيانات.

## 📱 الصفحات والمسارات

- `/` - لوحة التحكم الرئيسية
- `/cards` - إدارة البطاقات
- `/transactions` - المعاملات المالية
- `/statements` - كشوفات الحساب
- `/payments` - إدارة المدفوعات
- `/cashback` - نظام الكاش باك
- `/login` - تسجيل الدخول

## 🎨 مميزات التصميم

- **واجهة عربية كاملة** مع دعم RTL
- **تصميم متجاوب** يعمل على جميع الأجهزة
- **ألوان متناسقة** مع نظام ألوان احترافي
- **تجربة مستخدم سلسة** مع انتقالات ناعمة
- **إمكانية الوصول** مع دعم قارئات الشاشة

## 🔧 إعداد Supabase (اختياري)

للاستخدام مع قاعدة بيانات حقيقية:

### 1. إنشاء مشروع Supabase

1. اذهب إلى [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. انسخ URL والمفاتيح من إعدادات المشروع

### 2. تحديث متغيرات البيئة

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. إنشاء الجداول

قم بتشغيل SQL التالي في Supabase SQL Editor:

```sql
-- إنشاء جدول البطاقات الائتمانية
CREATE TABLE credit_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  card_number_last_four TEXT NOT NULL,
  card_type TEXT CHECK (card_type IN ('visa', 'mastercard', 'amex', 'other')) NOT NULL,
  credit_limit DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) DEFAULT 0,
  cashback_rate DECIMAL(5,2) DEFAULT 0,
  due_date INTEGER CHECK (due_date >= 1 AND due_date <= 31) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المعاملات
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('withdrawal', 'deposit', 'payment', 'cashback')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'أخرى',
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المدفوعات
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إعداد Row Level Security
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان (مثال للبطاقات)
CREATE POLICY "Users can view own cards" ON credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON credit_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cards" ON credit_cards FOR DELETE USING (auth.uid() = user_id);
```

## 🔒 الأمان والخصوصية

- **Row Level Security** في قاعدة البيانات
- **مصادقة آمنة** مع Supabase Auth
- **حماية البيانات** مع تشفير المعلومات الحساسة
- **إدارة الجلسات** الآمنة

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح issue أو pull request.

## 📞 الدعم

للدعم والاستفسارات، يرجى فتح issue في المستودع.
