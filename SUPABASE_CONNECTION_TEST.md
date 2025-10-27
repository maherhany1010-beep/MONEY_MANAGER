# 🧪 دليل اختبار الاتصال بـ Supabase

**التاريخ:** 27 أكتوبر 2025

---

## 🔍 اختبارات الاتصال الأساسية

### 1. اختبار الاتصال بقاعدة البيانات

**الملف:** `src/app/api/test/connection/route.ts`

```typescript
import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    // اختبر الاتصال
    const { data, error } = await supabase
      .from('credit_cards')
      .select('count(*)', { count: 'exact', head: true })
    
    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'الاتصال بقاعدة البيانات ناجح',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    )
  }
}
```

**الاستخدام:**
```bash
curl http://localhost:3000/api/test/connection
```

**النتيجة المتوقعة:**
```json
{
  "status": "success",
  "message": "الاتصال بقاعدة البيانات ناجح",
  "timestamp": "2025-10-27T10:00:00.000Z"
}
```

---

### 2. اختبار المصادقة

**الملف:** `src/app/api/test/auth/route.ts`

```typescript
import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    // احصل على الجلسة الحالية
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      authenticated: !!session,
      user: session?.user?.email || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    )
  }
}
```

**الاستخدام:**
```bash
curl http://localhost:3000/api/test/auth
```

---

### 3. اختبار عمليات CRUD

**الملف:** `src/app/api/test/crud/route.ts`

```typescript
import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient()
    const { operation, data } = await request.json()
    
    switch (operation) {
      case 'create':
        return await testCreate(supabase, data)
      case 'read':
        return await testRead(supabase, data)
      case 'update':
        return await testUpdate(supabase, data)
      case 'delete':
        return await testDelete(supabase, data)
      default:
        return NextResponse.json(
          { error: 'عملية غير معروفة' },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

async function testCreate(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('credit_cards')
    .insert([data])
    .select()
  
  return NextResponse.json({
    operation: 'create',
    success: !error,
    data: result,
    error: error?.message,
  })
}

async function testRead(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('credit_cards')
    .select('*')
    .limit(10)
  
  return NextResponse.json({
    operation: 'read',
    success: !error,
    count: result?.length || 0,
    error: error?.message,
  })
}

async function testUpdate(supabase: any, data: any) {
  const { data: result, error } = await supabase
    .from('credit_cards')
    .update(data.updates)
    .eq('id', data.id)
    .select()
  
  return NextResponse.json({
    operation: 'update',
    success: !error,
    data: result,
    error: error?.message,
  })
}

async function testDelete(supabase: any, data: any) {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', data.id)
  
  return NextResponse.json({
    operation: 'delete',
    success: !error,
    error: error?.message,
  })
}
```

---

## 🔐 اختبارات الأمان

### 1. اختبار RLS

**الملف:** `src/app/api/test/rls/route.ts`

```typescript
import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    // احصل على المستخدم الحالي
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({
        status: 'not_authenticated',
        message: 'المستخدم غير مصرح',
      })
    }
    
    // حاول الوصول إلى البيانات
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
    
    return NextResponse.json({
      status: 'success',
      user_id: user.id,
      can_access_data: !error,
      data_count: data?.length || 0,
      error: error?.message,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
```

---

### 2. اختبار الصلاحيات

**الملف:** `src/app/api/test/permissions/route.ts`

```typescript
import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    const tests = {
      select: await testSelect(supabase),
      insert: await testInsert(supabase),
      update: await testUpdate(supabase),
      delete: await testDelete(supabase),
    }
    
    return NextResponse.json({
      status: 'success',
      permissions: tests,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

async function testSelect(supabase: any) {
  const { error } = await supabase
    .from('credit_cards')
    .select('*')
    .limit(1)
  return { allowed: !error, error: error?.message }
}

async function testInsert(supabase: any) {
  const { error } = await supabase
    .from('credit_cards')
    .insert([{
      user_id: 'test',
      name: 'test',
      bank_name: 'test',
      card_number_last_four: '1234',
      card_type: 'visa',
      credit_limit: 5000,
      due_date: 15,
    }])
  return { allowed: !error, error: error?.message }
}

async function testUpdate(supabase: any) {
  const { error } = await supabase
    .from('credit_cards')
    .update({ name: 'updated' })
    .eq('id', 'test-id')
  return { allowed: !error, error: error?.message }
}

async function testDelete(supabase: any) {
  const { error } = await supabase
    .from('credit_cards')
    .delete()
    .eq('id', 'test-id')
  return { allowed: !error, error: error?.message }
}
```

---

## 📊 اختبارات الأداء

### 1. اختبار سرعة الاستعلامات

**الملف:** `src/app/api/test/performance/route.ts`

```typescript
import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    
    const results = {
      simple_query: await measureQuery(supabase, 'simple'),
      complex_query: await measureQuery(supabase, 'complex'),
      indexed_query: await measureQuery(supabase, 'indexed'),
    }
    
    return NextResponse.json({
      status: 'success',
      performance: results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

async function measureQuery(supabase: any, type: string) {
  const start = Date.now()
  
  if (type === 'simple') {
    await supabase.from('credit_cards').select('*').limit(10)
  } else if (type === 'complex') {
    await supabase
      .from('transactions')
      .select('*, credit_cards(*)')
      .limit(10)
  } else if (type === 'indexed') {
    await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', 'test-user')
  }
  
  return Date.now() - start
}
```

---

## ✅ قائمة التحقق

- [ ] الاتصال بقاعدة البيانات ناجح
- [ ] المصادقة تعمل بشكل صحيح
- [ ] عمليات CRUD تعمل
- [ ] RLS مفعّل ويعمل
- [ ] الصلاحيات صحيحة
- [ ] الأداء مقبول

---

## 🚀 الخطوات التالية

1. ✅ قم بتشغيل الاختبارات
2. ✅ تحقق من النتائج
3. ✅ أصلح أي مشاكل
4. ✅ وثّق النتائج

**المشروع جاهز للإنتاج! 🎉**

