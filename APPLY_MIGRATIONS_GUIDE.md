# 🚀 دليل تطبيق Database Migrations

## 📋 نظرة عامة

هذا الدليل يشرح كيفية تطبيق migrations على قاعدة بيانات Supabase خطوة بخطوة.

---

## ⚡ الطريقة السريعة (موصى بها)

### الخطوة 1: تشغيل Migration Script

```bash
npm run migrate
```

هذا السكريبت سيعرض لك محتوى كل migration ويرشدك خطوة بخطوة.

### الخطوة 2: التحقق من النجاح

```bash
npm run migrate:verify
```

هذا السكريبت سيتحقق من:
- ✅ وجود جميع الجداول
- ✅ إمكانية الوصول للجداول
- ✅ عمليات البيانات (إضافة/حذف)

---

## 📝 الطريقة اليدوية (خطوة بخطوة)

### الخطوة 1: فتح Supabase Dashboard

1. افتح متصفحك
2. اذهب إلى: https://app.supabase.com
3. سجّل دخول
4. اختر مشروعك: `jzcvhxxuhiqblqttpjjg`

### الخطوة 2: فتح SQL Editor

1. من القائمة الجانبية، اختر **SQL Editor**
2. أو اذهب مباشرة إلى:
   ```
   https://app.supabase.com/project/jzcvhxxuhiqblqttpjjg/sql
   ```

### الخطوة 3: تطبيق Migration 001

1. افتح ملف: `supabase/migrations/001_create_missing_tables.sql`
2. انسخ المحتوى بالكامل (Ctrl+A ثم Ctrl+C)
3. الصق في SQL Editor (Ctrl+V)
4. اضغط **Run** أو اضغط `Ctrl+Enter`
5. انتظر حتى تظهر رسالة "Success"

**ما يفعله هذا Migration:**
- ✅ إنشاء 15 جدول جديد
- ✅ إضافة Indexes للأداء
- ✅ إضافة Foreign Keys
- ✅ إضافة Constraints

**الجداول التي سيتم إنشاؤها:**
1. `bank_accounts` - الحسابات البنكية
2. `e_wallets` - المحافظ الإلكترونية
3. `cash_vaults` - الخزائن النقدية
4. `prepaid_cards` - البطاقات المدفوعة مسبقاً
5. `customers` - العملاء
6. `products` - المنتجات
7. `sales_invoices` - فواتير المبيعات
8. `invoice_items` - عناصر الفاتورة
9. `pos_machines` - أجهزة نقاط البيع
10. `savings_circles` - دوائر الادخار
11. `investments` - الاستثمارات
12. `merchants` - التجار
13. `central_transfers` - التحويلات المركزية
14. `cashback` - الاسترداد النقدي
15. `reconciliation` - التسوية

### الخطوة 4: تطبيق Migration 002

1. افتح ملف: `supabase/migrations/002_enable_rls_policies.sql`
2. انسخ المحتوى بالكامل
3. الصق في SQL Editor (امسح المحتوى السابق أولاً)
4. اضغط **Run**
5. انتظر حتى تظهر رسالة "Success"

**ما يفعله هذا Migration:**
- ✅ تفعيل Row Level Security (RLS) على جميع الجداول
- ✅ إنشاء 4 policies لكل جدول:
  - `SELECT` - قراءة البيانات
  - `INSERT` - إضافة بيانات
  - `UPDATE` - تحديث بيانات
  - `DELETE` - حذف بيانات

**الأمان:**
- 🔒 كل مستخدم يرى بياناته فقط
- 🔒 لا يمكن الوصول لبيانات مستخدمين آخرين
- 🔒 جميع العمليات محمية بـ `auth.uid() = user_id`

### الخطوة 5: تطبيق Migration 003

1. افتح ملف: `supabase/migrations/003_create_triggers.sql`
2. انسخ المحتوى بالكامل
3. الصق في SQL Editor
4. اضغط **Run**
5. انتظر حتى تظهر رسالة "Success"

**ما يفعله هذا Migration:**
- ✅ إنشاء function لتحديث `updated_at` تلقائياً
- ✅ إضافة triggers على 12 جدول
- ✅ تحديث `updated_at` عند كل UPDATE

---

## ✅ التحقق من النجاح

### 1. التحقق من الجداول

في SQL Editor، نفّذ:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**النتيجة المتوقعة:**
- يجب أن ترى **19 جدول على الأقل**
- 4 جداول موجودة مسبقاً + 15 جدول جديد

### 2. التحقق من RLS

في SQL Editor، نفّذ:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**النتيجة المتوقعة:**
- `rowsecurity` يجب أن يكون `true` لجميع الجداول

### 3. التحقق من Policies

في SQL Editor، نفّذ:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

**النتيجة المتوقعة:**
- 4 policies لكل جدول (SELECT, INSERT, UPDATE, DELETE)
- المجموع: ~60 policy

### 4. التحقق من Triggers

في SQL Editor، نفّذ:

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**النتيجة المتوقعة:**
- trigger واحد لكل جدول يحتوي على `updated_at`
- المجموع: ~12 trigger

---

## 🔍 استكشاف الأخطاء

### خطأ: "relation already exists"

**السبب:** الجدول موجود مسبقاً

**الحل:**
- ✅ هذا طبيعي إذا كنت تعيد تطبيق migration
- ✅ يمكنك تجاهل هذا الخطأ
- ✅ أو احذف الجدول أولاً:
  ```sql
  DROP TABLE IF EXISTS table_name CASCADE;
  ```

### خطأ: "policy already exists"

**السبب:** الـ policy موجودة مسبقاً

**الحل:**
- ✅ هذا طبيعي إذا كنت تعيد تطبيق migration
- ✅ يمكنك تجاهل هذا الخطأ
- ✅ أو احذف الـ policy أولاً:
  ```sql
  DROP POLICY IF EXISTS policy_name ON table_name;
  ```

### خطأ: "permission denied"

**السبب:** ليس لديك صلاحيات كافية

**الحل:**
- ❌ تأكد أنك مسجل دخول كـ Owner للمشروع
- ❌ تأكد أنك في المشروع الصحيح

### خطأ: "syntax error"

**السبب:** خطأ في SQL

**الحل:**
- ❌ تأكد أنك نسخت المحتوى بالكامل
- ❌ تأكد أنك لم تعدّل على SQL
- ❌ جرّب نسخ ولصق مرة أخرى

---

## 📊 الحالة الحالية

### قبل Migrations:
- ❌ 4 جداول فقط
- ❌ معظم البيانات في localStorage
- ❌ لا real-time sync
- ❌ لا نسخ احتياطي

### بعد Migrations:
- ✅ 19 جدول
- ✅ جميع البيانات في Supabase
- ✅ Real-time sync جاهز
- ✅ نسخ احتياطي تلقائي
- ✅ RLS محكم
- ✅ Triggers تلقائية

---

## 🎯 الخطوات التالية

بعد تطبيق Migrations بنجاح:

### 1. تحديث Contexts ✅

تم تحديث:
- ✅ `bank-accounts-context.tsx`

يجب تحديث:
- ⏳ `e-wallets-context.tsx`
- ⏳ `cash-vaults-context.tsx`
- ⏳ `prepaid-cards-context.tsx`
- ⏳ ... (14 context آخر)

### 2. اختبار التطبيق

```bash
npm run dev
```

- افتح http://localhost:3000
- سجّل دخول
- جرّب إضافة حساب بنكي
- تحقق من حفظ البيانات في Supabase

### 3. اختبار Real-time

- افتح التطبيق في نافذتين
- أضف حساب في نافذة
- يجب أن يظهر تلقائياً في النافذة الأخرى

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. **راجع استكشاف الأخطاء** أعلاه
2. **تحقق من Supabase Logs:**
   - اذهب إلى: Database → Logs
3. **تحقق من Console في المتصفح:**
   - اضغط F12
   - اذهب إلى Console
   - ابحث عن أخطاء

---

**آخر تحديث:** 30 أكتوبر 2025  
**الحالة:** جاهز للتطبيق ✅

