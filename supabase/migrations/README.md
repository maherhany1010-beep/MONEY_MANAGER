# 📁 Database Migrations

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع migrations قاعدة البيانات للمشروع.

## 🗂️ الملفات

### 001_create_missing_tables.sql
**الوصف:** إنشاء جميع الجداول الناقصة في قاعدة البيانات

**الجداول المُنشأة:**
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

**الميزات:**
- ✅ جميع الجداول تحتوي على `user_id` للربط بالمستخدم
- ✅ Indexes للأداء على `user_id`
- ✅ Foreign Keys مع CASCADE
- ✅ Constraints للتحقق من صحة البيانات
- ✅ Timestamps (created_at, updated_at)

---

### 002_enable_rls_policies.sql
**الوصف:** تفعيل Row Level Security وإنشاء Policies

**الميزات:**
- ✅ RLS مفعّل على جميع الجداول
- ✅ Policies منفصلة لكل عملية (SELECT, INSERT, UPDATE, DELETE)
- ✅ كل مستخدم يرى بياناته فقط
- ✅ Policy خاصة لـ `invoice_items` (تعتمد على `sales_invoices`)

---

### 003_create_triggers.sql
**الوصف:** إنشاء Triggers لتحديث `updated_at` تلقائياً

**الميزات:**
- ✅ Function واحدة `update_updated_at_column()`
- ✅ Trigger لكل جدول يحتوي على `updated_at`
- ✅ تحديث تلقائي عند أي UPDATE

---

## 🚀 كيفية التطبيق

### الطريقة 1: Supabase Dashboard (موصى بها)

1. **افتح Supabase Dashboard:**
   - اذهب إلى: https://app.supabase.com/
   - اختر مشروعك

2. **افتح SQL Editor:**
   - من القائمة الجانبية: `SQL Editor`
   - انقر على `New query`

3. **نفّذ الملفات بالترتيب:**
   
   **أولاً:** انسخ محتوى `001_create_missing_tables.sql` والصقه ثم اضغط `Run`
   
   **ثانياً:** انسخ محتوى `002_enable_rls_policies.sql` والصقه ثم اضغط `Run`
   
   **ثالثاً:** انسخ محتوى `003_create_triggers.sql` والصقه ثم اضغط `Run`

4. **تحقق من النجاح:**
   - اذهب إلى `Table Editor`
   - يجب أن ترى جميع الجداول الجديدة

---

### الطريقة 2: Supabase CLI

```bash
# 1. تثبيت Supabase CLI (إذا لم يكن مثبتاً)
npm install -g supabase

# 2. تسجيل الدخول
supabase login

# 3. ربط المشروع
supabase link --project-ref your-project-ref

# 4. تطبيق الـ migrations
supabase db push

# أو تطبيق ملف واحد
supabase db execute -f supabase/migrations/001_create_missing_tables.sql
supabase db execute -f supabase/migrations/002_enable_rls_policies.sql
supabase db execute -f supabase/migrations/003_create_triggers.sql
```

---

### الطريقة 3: psql (للمتقدمين)

```bash
# الاتصال بقاعدة البيانات
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# تنفيذ الملفات
\i supabase/migrations/001_create_missing_tables.sql
\i supabase/migrations/002_enable_rls_policies.sql
\i supabase/migrations/003_create_triggers.sql
```

---

## ✅ التحقق من التطبيق

### 1. التحقق من الجداول

```sql
-- عرض جميع الجداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

يجب أن ترى:
- bank_accounts
- cash_vaults
- cashback
- central_transfers
- credit_cards (موجود مسبقاً)
- customers
- e_wallets
- investments
- invoice_items
- merchants
- otp_codes (موجود مسبقاً)
- payments (موجود مسبقاً)
- pos_machines
- prepaid_cards
- products
- reconciliation
- sales_invoices
- savings_circles
- transactions (موجود مسبقاً)

---

### 2. التحقق من RLS

```sql
-- التحقق من تفعيل RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

يجب أن تكون `rowsecurity = true` لجميع الجداول.

---

### 3. التحقق من Policies

```sql
-- عرض جميع الـ Policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

يجب أن ترى 4 policies لكل جدول (SELECT, INSERT, UPDATE, DELETE).

---

### 4. التحقق من Triggers

```sql
-- عرض جميع الـ Triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

---

## 🔄 Rollback (التراجع)

إذا احتجت للتراجع عن الـ migrations:

```sql
-- حذف الـ Triggers
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_e_wallets_updated_at ON e_wallets;
-- ... (كرر لجميع الـ triggers)

-- حذف الـ Function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- حذف الجداول (احذر: سيحذف جميع البيانات!)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS sales_invoices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS reconciliation CASCADE;
DROP TABLE IF EXISTS cashback CASCADE;
DROP TABLE IF EXISTS central_transfers CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS savings_circles CASCADE;
DROP TABLE IF EXISTS pos_machines CASCADE;
DROP TABLE IF EXISTS prepaid_cards CASCADE;
DROP TABLE IF EXISTS cash_vaults CASCADE;
DROP TABLE IF EXISTS e_wallets CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
```

---

## 📝 ملاحظات مهمة

### ⚠️ قبل التطبيق

1. **نسخة احتياطية:** تأكد من أخذ نسخة احتياطية من قاعدة البيانات
2. **البيئة:** طبّق على بيئة التطوير أولاً
3. **الاختبار:** اختبر جميع الوظائف بعد التطبيق

### ✅ بعد التطبيق

1. **اختبر RLS:** تأكد أن كل مستخدم يرى بياناته فقط
2. **اختبر Triggers:** تأكد أن `updated_at` يتحدث تلقائياً
3. **اختبر الأداء:** تحقق من أن الـ Indexes تعمل بشكل صحيح

### 🔐 الأمان

- ✅ جميع الجداول محمية بـ RLS
- ✅ كل مستخدم يصل لبياناته فقط
- ✅ Foreign Keys تمنع البيانات اليتيمة
- ✅ Constraints تضمن صحة البيانات

---

## 🆘 المساعدة

إذا واجهت أي مشاكل:

1. **راجع الأخطاء:** اقرأ رسالة الخطأ بعناية
2. **تحقق من الترتيب:** تأكد من تنفيذ الملفات بالترتيب الصحيح
3. **راجع التوثيق:** [Supabase Documentation](https://supabase.com/docs)
4. **افتح Issue:** على GitHub إذا استمرت المشكلة

---

**آخر تحديث:** 30 أكتوبر 2025  
**الإصدار:** 1.0

