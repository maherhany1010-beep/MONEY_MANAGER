# 💼 نظام إدارة مالية شامل - Money Manager

نظام إدارة مالية متكامل وعصري يوفر حلاً شاملاً لإدارة جميع جوانب الحياة المالية الشخصية والتجارية.

## 🚀 الميزات الرئيسية

### 💳 إدارة البطاقات الائتمانية
- عرض قائمة البطاقات مع تفاصيل شاملة
- إضافة وتعديل وحذف البطاقات
- تتبع الرصيد والحد الائتماني
- حساب نسبة الاستخدام والتنبيهات
- إدارة الرسوم والعمولات
- نظام الأقساط المتقدم

### 🏦 إدارة الحسابات البنكية
- تتبع الحسابات البنكية المتعددة
- إدارة الأرصدة والعمليات
- تسجيل الإيداعات والسحوبات
- تقارير شاملة للحسابات

### 💰 المحافظ الإلكترونية
- إدارة المحافظ الرقمية
- تتبع الأرصدة والتحويلات
- عمليات الشحن والسحب
- سجل المعاملات الكامل

### 🔐 الخزائن النقدية
- إدارة الأموال النقدية
- تتبع الإيداعات والسحوبات
- تقارير الخزائن المفصلة
- تنبيهات الأرصدة المنخفضة

### 🎫 البطاقات المدفوعة مسبقاً
- إدارة البطاقات المدفوعة مسبقاً
- تتبع الأرصدة والمعاملات
- تقارير الاستخدام والتحليلات

### 🛒 أجهزة نقاط البيع (POS)
- إدارة أجهزة POS المتعددة
- تتبع المبيعات والإيرادات
- تقارير الأداء والإحصائيات
- إدارة الفروع والمواقع

### 👥 إدارة العملاء
- قاعدة بيانات العملاء الشاملة
- تتبع سجل المعاملات لكل عميل
- إدارة الحسابات والديون
- تقارير العملاء والتحليلات

### 💎 دوائر الادخار
- إنشاء وإدارة دوائر الادخار
- تتبع المساهمات والأرصدة
- جدولة التوزيعات
- تقارير الأداء والعوائد

### 📈 الاستثمارات
- إدارة محافظ الاستثمار
- تتبع الأسهم والسندات
- حساب العوائد والأرباح
- تقارير الأداء والتحليلات

### 📦 إدارة المخزون والمبيعات
- إدارة المنتجات والمخزون
- تتبع المبيعات والإيرادات
- إدارة الفواتير والطلبات
- تقارير المبيعات والأرباح

### 💰 العمليات المالية المتقدمة
- تسجيل المعاملات (سحب، إيداع، تحويلات)
- تصنيف المعاملات حسب الفئات
- فلترة وبحث متقدم
- ملخص المعاملات والإحصائيات

### 🎁 نظام الكاش باك المتقدم
- حساب وعرض الكاش باك المكتسب
- إحصائيات شهرية وسنوية مفصلة
- تتبع الكاش باك حسب الفئات
- نظام استرداد متعدد الخيارات
- تحليل أداء البطاقات

### 📊 كشوفات الحساب والتقارير
- عرض كشوفات مفصلة لكل حساب
- فلترة حسب التاريخ والحساب
- تصدير الكشوفات (PDF/Excel)
- ملخص الرصيد والمدفوعات
- تقارير شاملة ومتقدمة

### 💳 إدارة المدفوعات
- تتبع المدفوعات المستحقة والمعلقة
- تقويم المدفوعات مع عرض بصري
- تنبيهات المدفوعات المتأخرة
- إعدادات التذكيرات الذكية

### 📈 لوحة التحكم الشاملة
- نظرة عامة على جميع الأنشطة المالية
- رسوم بيانية تفاعلية ومتقدمة
- إحصائيات مفصلة ومؤشرات الأداء
- تنبيهات ذكية وتوصيات مخصصة
- لوحات معلومات قابلة للتخصيص

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

## 🌐 النشر على Vercel

### المتطلبات الأساسية
- حساب GitHub
- حساب Vercel
- مستودع GitHub للمشروع

### خطوات النشر

#### 1. إعداد المتغيرات البيئية محلياً
```bash
# انسخ ملف المثال
cp .env.example .env.local

# ملء القيم المطلوبة
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

#### 2. اختبار البناء محلياً
```bash
npm run build
npm start
```

#### 3. رفع المشروع إلى GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### 4. نشر على Vercel
1. اذهب إلى [vercel.com/new](https://vercel.com/new)
2. اختر مستودع GitHub الخاص بك
3. اضغط **Import**
4. في صفحة الإعدادات:
   - **Project Name**: اختر اسماً للمشروع
   - **Framework Preset**: Next.js (يجب أن يكون مختاراً تلقائياً)
   - **Root Directory**: `.` (الجذر)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 5. إضافة متغيرات البيئة على Vercel
1. اذهب إلى **Project Settings** > **Environment Variables**
2. أضف المتغيرات التالية:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (اختياري)

#### 6. اضغط Deploy
- اضغط الزر الأزرق **Deploy**
- انتظر 3-5 دقائق حتى ينتهي البناء
- ستحصل على رابط مباشر للتطبيق

### استكشاف الأخطاء

**المشكلة: 404 Not Found**
- تأكد من أن `vercel.json` موجود وصحيح
- تحقق من Build Logs على Vercel
- تأكد من أن جميع المتغيرات البيئية موجودة

**المشكلة: Build Failed**
- تحقق من `npm run build` محلياً
- تأكد من أن جميع الـ dependencies مثبتة
- تحقق من Build Logs على Vercel

**المشكلة: بطء التطبيق**
- استخدم Vercel Analytics لتتبع الأداء
- تحقق من حجم الـ bundle
- استخدم `npm run build:analyze` لتحليل الحجم

## 🎯 وضع التطوير

التطبيق يعمل حالياً في وضع التطوير مع mock client، مما يسمح بتجربة جميع الميزات بدون إعداد قاعدة بيانات.

## 📱 الصفحات والمسارات

### الصفحات الرئيسية
- `/` - لوحة التحكم الرئيسية
- `/login` - تسجيل الدخول

### إدارة البطاقات والحسابات
- `/cards` - إدارة البطاقات الائتمانية
- `/bank-accounts` - إدارة الحسابات البنكية
- `/cash-vaults` - إدارة الخزائن النقدية
- `/e-wallets` - إدارة المحافظ الإلكترونية
- `/prepaid-cards` - إدارة البطاقات المدفوعة مسبقاً

### العمليات المالية
- `/transactions` - المعاملات المالية
- `/statements` - كشوفات الحساب
- `/payments` - إدارة المدفوعات
- `/cashback` - نظام الكاش باك

### إدارة الأعمال
- `/pos-machines` - أجهزة نقاط البيع
- `/customers` - إدارة العملاء
- `/merchants` - إدارة التجار
- `/products` - إدارة المنتجات
- `/sales` - إدارة المبيعات

### الاستثمارات والادخار
- `/savings-circles` - دوائر الادخار
- `/investments` - إدارة الاستثمارات

### التحويلات والتسويات
- `/central-transfers` - التحويلات المركزية
- `/reconciliation` - التسويات والمطابقة

### الإعدادات
- `/settings` - إعدادات التطبيق

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
