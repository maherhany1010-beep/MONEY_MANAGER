# 🔄 دليل الترحيل من localStorage إلى Supabase

## 📋 نظرة عامة

هذا الدليل يشرح كيفية ترحيل البيانات من localStorage إلى Supabase بعد تحديث الـ Contexts.

---

## ✅ ما تم إنجازه

### 1. إنشاء جداول قاعدة البيانات ✅

تم إنشاء 15 جدول في Supabase:
- ✅ `bank_accounts` - الحسابات البنكية
- ✅ `e_wallets` - المحافظ الإلكترونية
- ✅ `cash_vaults` - الخزائن النقدية
- ✅ `prepaid_cards` - البطاقات المدفوعة مسبقاً
- ✅ `customers` - العملاء
- ✅ `products` - المنتجات
- ✅ `sales_invoices` - فواتير المبيعات
- ✅ `invoice_items` - عناصر الفاتورة
- ✅ `pos_machines` - أجهزة نقاط البيع
- ✅ `savings_circles` - دوائر الادخار
- ✅ `investments` - الاستثمارات
- ✅ `merchants` - التجار
- ✅ `central_transfers` - التحويلات المركزية
- ✅ `cashback` - الاسترداد النقدي
- ✅ `reconciliation` - التسوية

**الملفات:**
- `supabase/migrations/001_create_missing_tables.sql`
- `supabase/migrations/002_enable_rls_policies.sql`
- `supabase/migrations/003_create_triggers.sql`

### 2. تحديث Bank Accounts Context ✅

تم تحديث `src/contexts/bank-accounts-context.tsx` ليستخدم Supabase:

**التغييرات الرئيسية:**
- ✅ استبدال localStorage بـ Supabase
- ✅ إضافة Real-time subscriptions
- ✅ إضافة error handling
- ✅ إضافة loading states
- ✅ تحديث Types لتتوافق مع Database Schema
- ✅ الحفاظ على التوافق مع الكود القديم (Legacy fields)

---

## 🚀 خطوات الترحيل

### الخطوة 1: تطبيق Database Migrations

```bash
# افتح Supabase Dashboard
# اذهب إلى SQL Editor
# نفّذ الملفات بالترتيب:

1. supabase/migrations/001_create_missing_tables.sql
2. supabase/migrations/002_enable_rls_policies.sql
3. supabase/migrations/003_create_triggers.sql
```

**التحقق:**
```sql
-- تحقق من الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- تحقق من RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

---

### الخطوة 2: نقل البيانات من localStorage (اختياري)

إذا كان لديك بيانات في localStorage تريد نقلها:

**Option A: يدوياً عبر الواجهة**
1. افتح التطبيق
2. سجّل دخول
3. أضف الحسابات يدوياً من جديد

**Option B: باستخدام Migration Script**

أنشئ ملف `src/lib/migrate-localstorage.ts`:

```typescript
import { createClientComponentClient } from '@/lib/supabase'

export async function migrateLocalStorageToSupabase(userId: string) {
  const supabase = createClientComponentClient()
  
  // 1. Bank Accounts
  const bankAccounts = localStorage.getItem('bankAccounts')
  if (bankAccounts) {
    const accounts = JSON.parse(bankAccounts)
    for (const account of accounts) {
      await supabase.from('bank_accounts').insert({
        user_id: userId,
        account_number: account.accountNumber || account.account_number,
        bank_name: account.bankName || account.bank_name,
        account_type: account.accountType === 'checking' ? 'current' : account.accountType,
        balance: account.balance || 0,
        currency: account.currency || 'SAR',
        iban: account.iban,
        swift_code: account.swiftCode || account.swift_code,
        status: account.isActive ? 'active' : 'blocked',
      })
    }
    console.log('✅ Bank accounts migrated')
  }
  
  // 2. E-Wallets
  const eWallets = localStorage.getItem('eWallets')
  if (eWallets) {
    const wallets = JSON.parse(eWallets)
    for (const wallet of wallets) {
      await supabase.from('e_wallets').insert({
        user_id: userId,
        wallet_name: wallet.walletName || wallet.wallet_name,
        wallet_type: wallet.walletType || wallet.wallet_type || 'other',
        phone_number: wallet.phoneNumber || wallet.phone_number,
        balance: wallet.balance || 0,
        currency: wallet.currency || 'SAR',
        status: 'active',
      })
    }
    console.log('✅ E-wallets migrated')
  }
  
  // ... كرر لباقي الجداول
  
  console.log('✅ Migration completed!')
}
```

**استخدام:**
```typescript
// في component
import { migrateLocalStorageToSupabase } from '@/lib/migrate-localstorage'
import { useAuth } from '@/components/auth/auth-provider'

function MigrationButton() {
  const { user } = useAuth()
  
  const handleMigrate = async () => {
    if (user) {
      await migrateLocalStorageToSupabase(user.id)
      alert('تم نقل البيانات بنجاح!')
    }
  }
  
  return <button onClick={handleMigrate}>نقل البيانات</button>
}
```

---

### الخطوة 3: تحديث باقي الـ Contexts

الآن بعد نجاح `bank-accounts-context.tsx`، طبّق نفس النمط على:

**الأولوية العالية:**
1. ✅ `bank-accounts-context.tsx` (مكتمل)
2. ⏳ `e-wallets-context.tsx`
3. ⏳ `cash-vaults-context.tsx`
4. ⏳ `prepaid-cards-context.tsx`
5. ⏳ `cards-context.tsx` (credit_cards - موجود مسبقاً)

**الأولوية المتوسطة:**
6. ⏳ `customers-context.tsx`
7. ⏳ `products-context.tsx`
8. ⏳ `sales-context.tsx`
9. ⏳ `pos-machines-context.tsx`

**الأولوية المنخفضة:**
10. ⏳ `savings-circles-context.tsx`
11. ⏳ `investments-context.tsx`
12. ⏳ `merchants-context.tsx`
13. ⏳ `central-transfers-context.tsx`
14. ⏳ `cashback-context.tsx`
15. ⏳ `reconciliation-context.tsx`

**Contexts لا تحتاج تحديث (لا تخزن بيانات):**
- `theme-context.tsx` (يستخدم localStorage للإعدادات فقط)
- `settings-context.tsx` (يستخدم localStorage للإعدادات فقط)
- `notifications-context.tsx` (بيانات مؤقتة)

---

### الخطوة 4: اختبار كل Context

بعد تحديث كل context:

```typescript
// 1. تحقق من التحميل
console.log('Accounts:', accounts)
console.log('Loading:', loading)
console.log('Error:', error)

// 2. اختبر الإضافة
await addAccount({
  account_number: 'TEST123',
  bank_name: 'Test Bank',
  account_type: 'current',
  balance: 1000,
  currency: 'SAR',
  status: 'active',
})

// 3. اختبر التحديث
await updateAccountBalance(accountId, 2000)

// 4. اختبر الحذف
await removeAccount(accountId)

// 5. اختبر Real-time
// افتح التطبيق في نافذتين
// أضف حساب في نافذة واحدة
// يجب أن يظهر تلقائياً في النافذة الأخرى
```

---

## 🔍 استكشاف الأخطاء

### خطأ: "relation does not exist"

**السبب:** الجدول غير موجود في قاعدة البيانات

**الحل:**
```sql
-- تحقق من وجود الجدول
SELECT * FROM bank_accounts LIMIT 1;

-- إذا لم يكن موجوداً، نفّذ migration
-- supabase/migrations/001_create_missing_tables.sql
```

---

### خطأ: "new row violates row-level security policy"

**السبب:** RLS Policy غير صحيحة أو user_id خاطئ

**الحل:**
```sql
-- تحقق من الـ policies
SELECT * FROM pg_policies WHERE tablename = 'bank_accounts';

-- تحقق من user_id
SELECT auth.uid(); -- يجب أن يطابق user_id في البيانات
```

---

### خطأ: "Failed to load accounts"

**السبب:** مشكلة في الاتصال أو الصلاحيات

**الحل:**
1. تحقق من `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. تحقق من الاتصال:
```typescript
const { data, error } = await supabase.from('bank_accounts').select('count')
console.log('Connection test:', { data, error })
```

---

### Real-time لا يعمل

**السبب:** Subscription غير مفعّل أو Channel غير صحيح

**الحل:**
1. تحقق من Supabase Dashboard → Database → Replication
2. تأكد أن `bank_accounts` مفعّل للـ Realtime
3. تحقق من Console:
```typescript
channel.on('system', {}, (payload) => {
  console.log('Channel status:', payload)
})
```

---

## 📊 مقارنة: قبل وبعد

### قبل (localStorage)

```typescript
// ❌ البيانات تُفقد عند مسح الـ cache
// ❌ لا مزامنة بين الأجهزة
// ❌ لا نسخ احتياطي
// ❌ محدودة بـ 5-10 MB
// ❌ لا real-time updates

const [accounts, setAccounts] = useState([])

useEffect(() => {
  const saved = localStorage.getItem('bankAccounts')
  if (saved) setAccounts(JSON.parse(saved))
}, [])

const addAccount = (account) => {
  const newAccounts = [...accounts, account]
  setAccounts(newAccounts)
  localStorage.setItem('bankAccounts', JSON.stringify(newAccounts))
}
```

### بعد (Supabase)

```typescript
// ✅ البيانات محفوظة في قاعدة بيانات
// ✅ مزامنة تلقائية بين الأجهزة
// ✅ نسخ احتياطي تلقائي
// ✅ غير محدودة
// ✅ Real-time updates

const [accounts, setAccounts] = useState([])
const [loading, setLoading] = useState(true)
const { user } = useAuth()
const supabase = createClientComponentClient()

useEffect(() => {
  if (!user) return
  
  // Load from database
  const loadAccounts = async () => {
    const { data } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
    setAccounts(data || [])
    setLoading(false)
  }
  
  loadAccounts()
  
  // Real-time subscription
  const channel = supabase
    .channel('bank_accounts_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bank_accounts',
      filter: `user_id=eq.${user.id}`,
    }, (payload) => {
      // Auto-update on changes
    })
    .subscribe()
  
  return () => channel.unsubscribe()
}, [user])

const addAccount = async (account) => {
  const { data } = await supabase
    .from('bank_accounts')
    .insert({ ...account, user_id: user.id })
    .select()
    .single()
  
  // Real-time will update automatically
}
```

---

## 🎯 الخطوات التالية

1. ✅ تطبيق Database Migrations
2. ✅ تحديث Bank Accounts Context
3. ⏳ تحديث باقي الـ Contexts (17 context)
4. ⏳ اختبار شامل
5. ⏳ نشر التحديثات

---

**آخر تحديث:** 30 أكتوبر 2025  
**الحالة:** Bank Accounts Context مكتمل ✅

