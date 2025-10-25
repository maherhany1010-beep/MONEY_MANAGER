# سياسة الأمان

## الإبلاغ عن الثغرات الأمنية

إذا اكتشفت ثغرة أمنية، **يرجى عدم** فتح Issue عام. بدلاً من ذلك:

1. أرسل بريد إلكتروني إلى: `security@example.com`
2. وصف الثغرة بالتفصيل
3. أرفق خطوات إعادة الإنتاج
4. انتظر الرد خلال 48 ساعة

---

## معايير الأمان

### 1. البيانات الحساسة
- ✅ جميع البيانات الحساسة محمية بـ environment variables
- ✅ لا توجد مفاتيح API مكشوفة في الكود
- ✅ جميع كلمات المرور مشفرة

### 2. المصادقة والتفويض
- ✅ استخدام Supabase Auth
- ✅ Row Level Security (RLS) مفعل
- ✅ جميع الطلبات تتطلب مصادقة

### 3. الاتصالات
- ✅ HTTPS فقط
- ✅ CORS محدد بشكل صارم
- ✅ Headers أمنية موجودة

### 4. المدخلات والمخرجات
- ✅ Zod validation لجميع المدخلات
- ✅ تنظيف البيانات قبل العرض
- ✅ حماية من XSS

### 5. قاعدة البيانات
- ✅ Row Level Security (RLS) مفعل
- ✅ Backups منتظمة
- ✅ Encryption at rest

---

## أفضل الممارسات الأمنية

### عند التطوير
```typescript
// ✅ صحيح
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY // لا تشاركه

// ❌ خطأ
const apiKey = "pk_live_123456789"
const secretKey = "sk_live_987654321"
```

### عند التعامل مع البيانات
```typescript
// ✅ صحيح - استخدام Zod validation
const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
})

// ❌ خطأ - بدون validation
const data = req.body
```

### عند الاتصال بـ API
```typescript
// ✅ صحيح - استخدام HTTPS فقط
const response = await fetch('https://api.example.com/data')

// ❌ خطأ - استخدام HTTP
const response = await fetch('http://api.example.com/data')
```

---

## الفحوصات الأمنية المنتظمة

- ✅ فحص الـ dependencies بحثاً عن الثغرات: `npm audit`
- ✅ فحص الكود بحثاً عن المشاكل الأمنية
- ✅ اختبار الاختراق الدوري
- ✅ مراجعة الأمان قبل كل إصدار

---

## الإجراءات عند اكتشاف ثغرة

1. **التأكيد**: التحقق من الثغرة وتأثيرها
2. **الإصلاح**: إنشاء إصلاح آمن
3. **الاختبار**: اختبار الإصلاح بشكل شامل
4. **الإصدار**: إصدار تحديث أمني
5. **الإعلان**: إعلام المستخدمين بالثغرة والإصلاح

---

## الامتثال

هذا المشروع يلتزم بـ:
- OWASP Top 10
- CWE/SANS Top 25
- معايير الأمان الدولية

---

شكراً لمساعدتك في الحفاظ على أمان المشروع! 🔒

