# إعداد Supabase

## المتطلبات

- حساب Supabase (https://supabase.com)
- مشروع Supabase جديد

---

## خطوات الإعداد

### 1. إنشاء مشروع Supabase

1. اذهب إلى https://app.supabase.com
2. اضغط **New Project**
3. اختر اسماً للمشروع
4. اختر كلمة مرور قوية
5. اختر المنطقة الجغرافية
6. اضغط **Create new project**

### 2. الحصول على المفاتيح

1. اذهب إلى **Project Settings** > **API**
2. انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. إنشاء الجداول

قم بتشغيل SQL queries من ملف `supabase/schema.sql`:

```bash
# في Supabase SQL Editor
# انسخ محتوى supabase/schema.sql والصقه
```

### 4. تفعيل Row Level Security (RLS)

```sql
-- تفعيل RLS على جميع الجداول
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ... وهكذا لجميع الجداول
```

### 5. إنشاء Policies

```sql
-- مثال: السماح للمستخدم برؤية بطاقاته فقط
CREATE POLICY "Users can view their own cards"
ON credit_cards
FOR SELECT
USING (auth.uid() = user_id);

-- مثال: السماح للمستخدم بإدراج بطاقاته فقط
CREATE POLICY "Users can insert their own cards"
ON credit_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 6. تفعيل المصادقة

1. اذهب إلى **Authentication** > **Providers**
2. فعّل **Email**
3. اختر **Email/Password**

### 7. إضافة المتغيرات البيئية

أضف إلى `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## الاختبار

### اختبار الاتصال

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// اختبر الاتصال
const { data, error } = await supabase.from('credit_cards').select('*')
console.log(data, error)
```

### اختبار المصادقة

```typescript
// تسجيل دخول
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// تسجيل خروج
await supabase.auth.signOut()
```

---

## أفضل الممارسات

### الأمان

✅ **استخدم RLS دائماً**
- لا تثق بـ client-side validation وحده
- استخدم RLS policies لحماية البيانات

✅ **استخدم Service Role Key بحذر**
- لا تشاركه مع أحد
- استخدمه فقط على الخادم

✅ **تحقق من الأذونات**
- تأكد من أن المستخدم لديه الأذونات المطلوبة
- استخدم `auth.uid()` في الـ policies

### الأداء

✅ **استخدم الفهارس**
```sql
CREATE INDEX idx_user_id ON credit_cards(user_id);
CREATE INDEX idx_card_id ON transactions(card_id);
```

✅ **استخدم الـ Pagination**
```typescript
const { data } = await supabase
  .from('transactions')
  .select('*')
  .range(0, 9) // الأول 10 صفوف
```

✅ **استخدم الـ Caching**
```typescript
const { data } = await supabase
  .from('cards')
  .select('*')
  .cache('1 hour')
```

---

## استكشاف الأخطاء

### خطأ: "Unauthorized"
- تحقق من RLS policies
- تأكد من أن المستخدم مصرح

### خطأ: "Connection refused"
- تحقق من `NEXT_PUBLIC_SUPABASE_URL`
- تأكد من الاتصال بالإنترنت

### خطأ: "Invalid API key"
- تحقق من `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- تأكد من نسخ المفتاح بشكل صحيح

---

## الموارد

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL](https://supabase.com/docs/guides/database)

---

للمزيد من المساعدة، تواصل مع فريق Supabase: https://supabase.com/support

