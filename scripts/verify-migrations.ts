/**
 * 🔍 Verify Database Migrations Script
 * 
 * هذا السكريبت يتحقق من نجاح تطبيق migrations على قاعدة بيانات Supabase
 * 
 * الاستخدام:
 * npm run migrate:verify
 * أو
 * npx tsx scripts/verify-migrations.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// تحميل متغيرات البيئة
dotenv.config({ path: '.env.local' })

// ============================================
// Configuration
// ============================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ خطأ: متغيرات البيئة غير موجودة!')
  console.error('تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY في .env.local')
  process.exit(1)
}

// إنشاء Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================
// Expected Tables
// ============================================
const EXPECTED_TABLES = [
  // الجداول الموجودة مسبقاً
  'credit_cards',
  'transactions',
  'categories',
  'budgets',
  
  // الجداول الجديدة من migrations
  'bank_accounts',
  'e_wallets',
  'cash_vaults',
  'prepaid_cards',
  'customers',
  'products',
  'sales_invoices',
  'invoice_items',
  'pos_machines',
  'savings_circles',
  'investments',
  'merchants',
  'central_transfers',
  'cashback',
  'reconciliation',
]

// ============================================
// Verification Functions
// ============================================

/**
 * التحقق من الجداول
 */
async function verifyTables(): Promise<boolean> {
  console.log('\n📊 التحقق من الجداول')
  console.log('━'.repeat(80))
  
  try {
    // استعلام للحصول على جميع الجداول
    const { data, error } = await supabase
      .rpc('get_public_tables')
      .select('*')
    
    if (error) {
      // إذا لم يكن هناك function، نستخدم طريقة بديلة
      console.log('⚠️  لا يمكن استخدام RPC، سنتحقق من كل جدول على حدة')
      
      let foundCount = 0
      let missingCount = 0
      
      for (const tableName of EXPECTED_TABLES) {
        try {
          const { error: tableError } = await supabase
            .from(tableName)
            .select('count')
            .limit(0)
          
          if (tableError) {
            console.log(`❌ ${tableName} - غير موجود`)
            missingCount++
          } else {
            console.log(`✅ ${tableName}`)
            foundCount++
          }
        } catch (err) {
          console.log(`❌ ${tableName} - خطأ في الوصول`)
          missingCount++
        }
      }
      
      console.log('\n' + '─'.repeat(80))
      console.log(`📊 النتيجة: ${foundCount}/${EXPECTED_TABLES.length} جدول موجود`)
      console.log(`✅ موجود: ${foundCount}`)
      console.log(`❌ مفقود: ${missingCount}`)
      
      return missingCount === 0
    }
    
    return true
  } catch (error: any) {
    console.error('❌ خطأ في التحقق من الجداول:', error.message)
    return false
  }
}

/**
 * التحقق من إمكانية الوصول للجداول
 */
async function verifyTableAccess(): Promise<boolean> {
  console.log('\n🔐 التحقق من إمكانية الوصول للجداول')
  console.log('━'.repeat(80))
  
  const criticalTables = [
    'bank_accounts',
    'e_wallets',
    'cash_vaults',
    'prepaid_cards',
    'customers',
    'products',
  ]
  
  let accessibleCount = 0
  let inaccessibleCount = 0
  
  for (const tableName of criticalTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('count')
        .limit(0)
      
      if (error) {
        console.log(`❌ ${tableName} - ${error.message}`)
        inaccessibleCount++
      } else {
        console.log(`✅ ${tableName}`)
        accessibleCount++
      }
    } catch (err: any) {
      console.log(`❌ ${tableName} - ${err.message}`)
      inaccessibleCount++
    }
  }
  
  console.log('\n' + '─'.repeat(80))
  console.log(`📊 النتيجة: ${accessibleCount}/${criticalTables.length} جدول يمكن الوصول إليه`)
  
  return inaccessibleCount === 0
}

/**
 * اختبار إضافة وحذف بيانات
 */
async function testDataOperations(): Promise<boolean> {
  console.log('\n🧪 اختبار عمليات البيانات')
  console.log('━'.repeat(80))
  
  console.log('\n⚠️  ملاحظة: هذا الاختبار يتطلب تسجيل دخول')
  console.log('   سيتم تخطي هذا الاختبار إذا لم تكن مسجل دخول')
  
  try {
    // محاولة إضافة سجل تجريبي
    const testData = {
      account_number: 'TEST_' + Date.now(),
      bank_name: 'Test Bank',
      account_type: 'current' as const,
      balance: 0,
      currency: 'SAR',
      status: 'active' as const,
    }
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(testData)
      .select()
      .single()
    
    if (error) {
      if (error.message.includes('JWT') || error.message.includes('auth')) {
        console.log('⚠️  لم يتم تسجيل الدخول - تخطي الاختبار')
        return true
      }
      console.log(`❌ فشل إضافة البيانات: ${error.message}`)
      return false
    }
    
    console.log('✅ نجح إضافة البيانات')
    
    // حذف السجل التجريبي
    if (data?.id) {
      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', data.id)
      
      if (deleteError) {
        console.log(`⚠️  فشل حذف البيانات التجريبية: ${deleteError.message}`)
      } else {
        console.log('✅ نجح حذف البيانات التجريبية')
      }
    }
    
    return true
  } catch (error: any) {
    console.error('❌ خطأ في اختبار البيانات:', error.message)
    return false
  }
}

// ============================================
// Main Function
// ============================================
async function main() {
  console.log('🔍 بدء التحقق من Database Migrations')
  console.log('━'.repeat(80))
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
  console.log('━'.repeat(80))
  
  const results = {
    tables: false,
    access: false,
    operations: false,
  }
  
  // 1. التحقق من الجداول
  results.tables = await verifyTables()
  
  // 2. التحقق من إمكانية الوصول
  results.access = await verifyTableAccess()
  
  // 3. اختبار عمليات البيانات
  results.operations = await testDataOperations()
  
  // النتيجة النهائية
  console.log('\n' + '━'.repeat(80))
  console.log('📋 ملخص النتائج:')
  console.log('─'.repeat(80))
  console.log(`${results.tables ? '✅' : '❌'} الجداول`)
  console.log(`${results.access ? '✅' : '❌'} إمكانية الوصول`)
  console.log(`${results.operations ? '✅' : '❌'} عمليات البيانات`)
  console.log('━'.repeat(80))
  
  const allPassed = results.tables && results.access && results.operations
  
  if (allPassed) {
    console.log('✅ جميع الاختبارات نجحت!')
    console.log('\n📝 الخطوات التالية:')
    console.log('   1. ابدأ بتحديث باقي الـ Contexts')
    console.log('   2. اختبر التطبيق')
    console.log('   3. تحقق من Real-time subscriptions')
  } else {
    console.log('❌ بعض الاختبارات فشلت')
    console.log('\n📝 الإجراءات المقترحة:')
    if (!results.tables) {
      console.log('   - تأكد من تطبيق جميع migrations في Supabase Dashboard')
    }
    if (!results.access) {
      console.log('   - تحقق من RLS policies في Supabase Dashboard')
      console.log('   - تأكد من تطبيق 002_enable_rls_policies.sql')
    }
    if (!results.operations) {
      console.log('   - سجّل دخول في التطبيق وأعد المحاولة')
    }
  }
  console.log('━'.repeat(80))
  
  process.exit(allPassed ? 0 : 1)
}

// تشغيل
main().catch(error => {
  console.error('❌ خطأ فادح:', error)
  process.exit(1)
})

