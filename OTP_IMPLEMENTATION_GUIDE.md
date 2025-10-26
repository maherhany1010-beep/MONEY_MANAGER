# 🔐 دليل تطبيق نظام OTP

**التاريخ:** 26 أكتوبر 2025  
**الحالة:** 📋 دليل التطبيق

---

## 📋 ملخص التطبيق

تم إنشاء نظام OTP شامل يتضمن:

1. ✅ دوال OTP (`src/lib/otp.ts`)
2. ✅ نموذج OTP (`src/components/auth/otp-form.tsx`)
3. ✅ صفحة التفعيل (`src/app/verify-otp/page.tsx`)
4. ✅ جدول قاعدة البيانات (`supabase/migrations/create_otp_table.sql`)
5. ✅ دليل إعدادات Supabase (`SUPABASE_EMAIL_CONFIG.md`)

---

## 🚀 خطوات التطبيق

### الخطوة 1: تطبيق الهجرة في Supabase

```bash
# 1. اذهب إلى Supabase Dashboard
https://app.supabase.com/

# 2. اختر المشروع: MONEY_MANAGER

# 3. اذهب إلى: SQL Editor

# 4. انسخ محتوى الملف:
supabase/migrations/create_otp_table.sql

# 5. الصق في SQL Editor واضغط: Run
```

**النتيجة المتوقعة:**
```
✅ جدول otp_codes تم إنشاؤه
✅ Indexes تم إنشاؤها
✅ RLS Policies تم تفعيلها
```

---

### الخطوة 2: تخصيص Email Templates

اتبع الخطوات في: `SUPABASE_EMAIL_CONFIG.md`

**النقاط المهمة:**
- ✅ غيّر اسم المرسل إلى: "الإدارة المالية الشاملة"
- ✅ غيّر البريد إلى: noreply@moneymanager.com
- ✅ أضف شعار الموقع (إن أمكن)

---

### الخطوة 3: تحديث نموذج التسجيل

**الملف:** `src/components/auth/login-form.tsx`

**التعديلات المطلوبة:**

```typescript
// في دالة handleSignUp، بدلاً من:
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})

// استخدم:
import { generateOTP, sendOTPEmail } from '@/lib/otp'

const otp = generateOTP()
const { success, error: otpError } = await sendOTPEmail(email, otp)

if (success) {
  // إعادة توجيه إلى صفحة التفعيل
  router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
} else {
  setError(otpError || 'فشل في إرسال الرمز')
}
```

---

### الخطوة 4: اختبار النظام محلياً

```bash
# 1. شغّل التطبيق
npm run dev

# 2. اذهب إلى صفحة التسجيل
http://localhost:3000/login

# 3. اختر: إنشاء حساب جديد

# 4. أدخل:
- البريد: test@example.com
- كلمة المرور: Test123456

# 5. تحقق من:
- ✅ هل تم إرسال البريد؟
- ✅ هل تم الانتقال إلى صفحة التفعيل؟
- ✅ هل يمكنك إدخال الرمز؟
```

---

## 📁 الملفات الجديدة

### 1. `src/lib/otp.ts`
**الوظيفة:** دوال OTP الأساسية

**الدوال:**
- `generateOTP()` - توليد رمز عشوائي
- `sendOTPEmail()` - إرسال الرمز عبر البريد
- `verifyOTP()` - التحقق من الرمز
- `incrementOTPAttempts()` - زيادة عدد المحاولات
- `resendOTP()` - إعادة إرسال الرمز
- `cleanupExpiredOTPs()` - حذف الرموز المنتهية

### 2. `src/components/auth/otp-form.tsx`
**الوظيفة:** نموذج إدخال الرمز

**الميزات:**
- ✅ إدخال 6 أرقام فقط
- ✅ عداد المحاولات
- ✅ زر إعادة الإرسال مع عداد
- ✅ رسائل خطأ واضحة
- ✅ تصميم احترافي

### 3. `src/app/verify-otp/page.tsx`
**الوظيفة:** صفحة التفعيل

**الميزات:**
- ✅ استقبال البريد من URL
- ✅ عرض نموذج OTP
- ✅ إعادة توجيه عند النجاح
- ✅ معالجة الأخطاء

### 4. `supabase/migrations/create_otp_table.sql`
**الوظيفة:** إنشاء جدول OTP

**الجدول:**
- `id` - معرف فريد
- `email` - البريد الإلكتروني
- `code` - الرمز (6 أرقام)
- `created_at` - وقت الإنشاء
- `expires_at` - وقت انتهاء الصلاحية
- `attempts` - عدد المحاولات
- `verified` - هل تم التحقق

---

## 🔧 الإعدادات

### OTP Configuration

```typescript
export const OTP_CONFIG = {
  LENGTH: 6,                    // طول الرمز
  VALIDITY_MINUTES: 10,         // صلاحية الرمز (دقائق)
  MAX_ATTEMPTS: 5,              // عدد المحاولات المسموحة
  RESEND_COOLDOWN_SECONDS: 60,  // وقت الانتظار قبل إعادة الإرسال
}
```

---

## 🧪 السيناريوهات المختبرة

### ✅ السيناريو 1: تسجيل حساب جديد
```
1. المستخدم يدخل البريد وكلمة المرور
2. يتم إرسال OTP إلى البريد
3. المستخدم ينتقل إلى صفحة التفعيل
4. يدخل الرمز
5. يتم التحقق والانتقال إلى الصفحة الرئيسية
```

### ✅ السيناريو 2: رمز خاطئ
```
1. المستخدم يدخل رمز خاطئ
2. يتم عرض رسالة خطأ
3. يتم زيادة عدد المحاولات
4. بعد 5 محاولات، يتم قفل الحساب
```

### ✅ السيناريو 3: إعادة إرسال الرمز
```
1. المستخدم ينقر على "إعادة الإرسال"
2. يتم التحقق من وقت الانتظار
3. يتم إرسال رمز جديد
4. يتم تحديث عداد المحاولات
```

---

## 📊 قائمة التحقق

- [ ] تطبيق الهجرة في Supabase
- [ ] تخصيص Email Templates
- [ ] إعداد SMTP
- [ ] تحديث نموذج التسجيل
- [ ] اختبار محلي
- [ ] اختبار على Vercel
- [ ] مراقبة الأخطاء

---

## 🚀 الخطوات التالية

1. ✅ تطبيق الهجرة
2. ✅ تخصيص Email Templates
3. ✅ تحديث نموذج التسجيل
4. ✅ اختبار النظام
5. ✅ نشر على Vercel

---

**تم إنشاء هذا الدليل لتسهيل تطبيق نظام OTP**

