# 📧 إعدادات البريد الإلكتروني في Supabase

**التاريخ:** 26 أكتوبر 2025  
**الحالة:** 📋 دليل الإعداد

---

## 🔧 خطوات الإعداد

### الخطوة 1: الوصول إلى Supabase Dashboard

1. اذهب إلى: https://app.supabase.com/
2. اختر المشروع: `MONEY_MANAGER`
3. اذهب إلى: **Authentication** → **Email Templates**

---

### الخطوة 2: تخصيص Email Templates

#### 2.1 تخصيص اسم المرسل

في كل قالب بريد:

1. اضغط على القالب
2. ابحث عن: `From: support@example.com`
3. غيّره إلى: `noreply@moneymanager.com`
4. غيّر الاسم إلى: `الإدارة المالية الشاملة`

#### 2.2 القوالب المطلوبة

**1. Confirm signup (تأكيد التسجيل)**
```
Subject: تأكيد حسابك - الإدارة المالية الشاملة
From: الإدارة المالية الشاملة <noreply@moneymanager.com>

محتوى مخصص:
- شعار الموقع
- رسالة ترحيب
- رابط التأكيد أو رمز OTP
```

**2. Invite user (دعوة مستخدم)**
```
Subject: أنت مدعو للانضمام - الإدارة المالية الشاملة
From: الإدارة المالية الشاملة <noreply@moneymanager.com>
```

**3. Magic Link (رابط سحري)**
```
Subject: رابط تسجيل الدخول - الإدارة المالية الشاملة
From: الإدارة المالية الشاملة <noreply@moneymanager.com>
```

**4. Change Email (تغيير البريد)**
```
Subject: تأكيد تغيير البريد الإلكتروني
From: الإدارة المالية الشاملة <noreply@moneymanager.com>
```

**5. Reset Password (إعادة تعيين كلمة المرور)**
```
Subject: إعادة تعيين كلمة المرور - الإدارة المالية الشاملة
From: الإدارة المالية الشاملة <noreply@moneymanager.com>
```

---

### الخطوة 3: إعدادات SMTP

#### 3.1 التحقق من إعدادات SMTP

1. اذهب إلى: **Authentication** → **Providers** → **Email**
2. تحقق من:
   - ✅ SMTP Host: `smtp.resend.com` (أو خادم SMTP آخر)
   - ✅ SMTP Port: `587` أو `465`
   - ✅ SMTP User: بريدك الإلكتروني
   - ✅ SMTP Password: كلمة المرور

#### 3.2 تحسين سرعة الإرسال

**الخيار 1: استخدام Resend API (الأسرع)**
```
1. اذهب إلى: https://resend.com/
2. أنشئ حساب مجاني
3. احصل على API Key
4. في Supabase:
   - اختر: Resend
   - أدخل: API Key
```

**الخيار 2: استخدام SendGrid**
```
1. اذهب إلى: https://sendgrid.com/
2. أنشئ حساب
3. احصل على API Key
4. في Supabase:
   - اختر: SendGrid
   - أدخل: API Key
```

**الخيار 3: استخدام Mailgun**
```
1. اذهب إلى: https://www.mailgun.com/
2. أنشئ حساب
3. احصل على API Key
4. في Supabase:
   - اختر: Mailgun
   - أدخل: API Key
```

---

### الخطوة 4: إعدادات المصادقة

#### 4.1 تفعيل Email Confirmations

1. اذهب إلى: **Authentication** → **Providers** → **Email**
2. فعّل: **Confirm email**
3. اختر: **Require email confirmation to sign up**

#### 4.2 تعيين Redirect URLs

1. اذهب إلى: **Authentication** → **URL Configuration**
2. أضف:
   - **Site URL:** `https://moneymanager-henna.vercel.app`
   - **Redirect URLs:**
     - `https://moneymanager-henna.vercel.app/auth/callback`
     - `https://moneymanager-henna.vercel.app/verify-otp`
     - `http://localhost:3000/auth/callback` (للتطوير)
     - `http://localhost:3000/verify-otp` (للتطوير)

---

### الخطوة 5: إعدادات OTP

#### 5.1 إنشاء جدول OTP

```sql
-- تم إنشاء الجدول في:
supabase/migrations/create_otp_table.sql

-- لتطبيق الهجرة:
1. اذهب إلى: SQL Editor
2. انسخ محتوى الملف
3. اضغط: Run
```

#### 5.2 تفعيل Row Level Security

```sql
-- تم تفعيل RLS في الملف
-- تحقق من:
1. اذهب إلى: Table Editor
2. اختر: otp_codes
3. تحقق من: RLS is enabled
```

---

## 🧪 الاختبار

### اختبار إرسال البريد

```bash
# 1. شغّل التطبيق محلياً
npm run dev

# 2. اذهب إلى صفحة التسجيل
http://localhost:3000/login

# 3. اختر: إنشاء حساب جديد

# 4. أدخل:
- البريد الإلكتروني: test@example.com
- كلمة المرور: Test123456

# 5. تحقق من:
- ✅ هل تم إرسال البريد؟
- ✅ هل اسم المرسل صحيح؟
- ✅ هل التصميم صحيح؟
```

### اختبار OTP

```bash
# 1. بعد إرسال البريد

# 2. انسخ رمز OTP من البريد

# 3. اذهب إلى صفحة التفعيل
http://localhost:3000/verify-otp?email=test@example.com

# 4. أدخل الرمز

# 5. تحقق من:
- ✅ هل تم التحقق من الرمز؟
- ✅ هل تم إعادة التوجيه إلى الصفحة الرئيسية؟
```

---

## 📊 المراقبة

### مراقبة رسائل البريد

1. اذهب إلى: **Authentication** → **Logs**
2. ابحث عن: `email_sent`
3. تحقق من:
   - ✅ عدد الرسائل المرسلة
   - ✅ الأخطاء (إن وجدت)

### مراقبة OTP

```sql
-- عرض جميع رموز OTP
SELECT * FROM otp_codes ORDER BY created_at DESC;

-- عرض الرموز المنتهية الصلاحية
SELECT * FROM otp_codes WHERE expires_at < NOW();

-- عرض الرموز المتحققة
SELECT * FROM otp_codes WHERE verified = true;
```

---

## 🚀 الخطوات التالية

1. ✅ تطبيق الهجرة (create_otp_table.sql)
2. ✅ تخصيص Email Templates
3. ✅ إعداد SMTP
4. ✅ اختبار النظام
5. ✅ نشر على Vercel

---

**تم إنشاء هذا الدليل لتسهيل إعداد نظام البريد الإلكتروني**

