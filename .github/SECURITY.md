# 🔒 سياسة الأمان (Security Policy)

## 📋 الإصدارات المدعومة (Supported Versions)

نحن ندعم الإصدارات التالية بتحديثات الأمان:

| الإصدار | مدعوم | ملاحظات |
| ------- | ------ | ------- |
| 1.0.x   | ✅ نعم | الإصدار الحالي |
| < 1.0   | ❌ لا  | إصدارات تجريبية |

## 🐛 الإبلاغ عن ثغرة أمنية (Reporting a Vulnerability)

### ⚠️ مهم جداً

إذا اكتشفت ثغرة أمنية في هذا المشروع، **يرجى عدم فتح Issue عام**.

### 📧 كيفية الإبلاغ

1. **أرسل بريد إلكتروني إلى:** security@yourdomain.com (أو استخدم GitHub Security Advisories)
2. **استخدم GitHub Security Advisory:**
   - اذهب إلى: https://github.com/maherhany1010-beep/MONEY_MANAGER/security/advisories
   - انقر على "Report a vulnerability"
   - املأ النموذج بالتفاصيل

### 📝 ما يجب تضمينه في التقرير

- **وصف الثغرة:** وصف واضح ومفصل للمشكلة
- **خطوات إعادة الإنتاج:** كيفية إعادة إنتاج الثغرة
- **التأثير المحتمل:** ما هي المخاطر المحتملة؟
- **الإصدار المتأثر:** أي إصدار من المشروع متأثر؟
- **الحل المقترح:** إذا كان لديك اقتراح للإصلاح (اختياري)

### ⏱️ وقت الاستجابة

- **الرد الأولي:** خلال 48 ساعة
- **تقييم الثغرة:** خلال 7 أيام
- **الإصلاح:** حسب خطورة الثغرة (1-30 يوم)

### 🎁 مكافآت الأمان (Bug Bounty)

حالياً لا يوجد برنامج مكافآت رسمي، لكننا نقدر جهودك ونذكر المساهمين في:
- ملف SECURITY.md
- ملاحظات الإصدار (Release Notes)
- صفحة الشكر والتقدير

## 🛡️ الإجراءات الأمنية المطبقة

### 1. قاعدة البيانات (Database Security)

- ✅ **Row Level Security (RLS)** مفعّل على جميع الجداول
- ✅ **Policies محكمة** لكل عملية (SELECT, INSERT, UPDATE, DELETE)
- ✅ **Foreign Keys** مع CASCADE للحفاظ على سلامة البيانات
- ✅ **Constraints** للتحقق من صحة البيانات

### 2. المصادقة والترخيص (Authentication & Authorization)

- ✅ **Supabase Auth** للمصادقة
- ✅ **OTP System** لتسجيل الدخول الآمن
- ✅ **Session Management** مع تحديث تلقائي
- ✅ **User-specific data** عبر RLS

### 3. حماية التطبيق (Application Security)

- ✅ **Security Headers:**
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy
  - Permissions-Policy

- ✅ **Input Validation:**
  - Zod schemas للتحقق من المدخلات
  - Server-side validation
  - Client-side validation

- ✅ **HTTPS Only** في الإنتاج
- ✅ **Environment Variables** محمية

### 4. حماية API (API Security)

- ✅ **Rate Limiting** على endpoints حساسة
- ✅ **CORS Configuration** محكمة
- ✅ **API Keys** محمية في environment variables
- ⚠️ **يحتاج تحسين:** Rate limiting أكثر قوة (Upstash Redis)

### 5. حماية الكود (Code Security)

- ✅ **TypeScript** للتحقق من الأنواع
- ✅ **ESLint** لاكتشاف المشاكل
- ⚠️ **يحتاج إضافة:** Unit tests
- ⚠️ **يحتاج إضافة:** Security scanning (Snyk, npm audit)

## 🔐 أفضل الممارسات للمطورين

### للمساهمين في المشروع:

1. **لا ترفع أبداً:**
   - ملفات `.env` أو `.env.local`
   - API Keys أو Secrets
   - بيانات المستخدمين الحقيقية
   - كلمات المرور أو Tokens

2. **استخدم دائماً:**
   - Environment variables للمفاتيح السرية
   - Input validation على جميع المدخلات
   - Prepared statements لقواعد البيانات
   - HTTPS في الإنتاج

3. **تجنب:**
   - تخزين بيانات حساسة في localStorage
   - استخدام `eval()` أو `dangerouslySetInnerHTML`
   - تعطيل TypeScript أو ESLint errors
   - Hardcoding credentials

## 📚 موارد إضافية

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

## 📞 جهات الاتصال

- **GitHub Issues:** https://github.com/maherhany1010-beep/MONEY_MANAGER/issues
- **Security Email:** security@yourdomain.com
- **GitHub Security:** https://github.com/maherhany1010-beep/MONEY_MANAGER/security

## 🙏 شكر وتقدير

نشكر جميع الباحثين الأمنيين والمساهمين الذين ساعدوا في تحسين أمان هذا المشروع.

### قائمة الشرف (Hall of Fame)

<!-- سيتم إضافة أسماء المساهمين هنا -->

---

**آخر تحديث:** 30 أكتوبر 2025  
**الإصدار:** 1.0

