/**
 * 🔄 Apply Database Migrations Script
 *
 * هذا السكريبت يطبق جميع migrations على قاعدة بيانات Supabase تلقائياً
 *
 * الاستخدام:
 * npm run migrate
 * أو
 * npx tsx scripts/apply-migrations.ts
 *
 * ملاحظة: هذا السكريبت يعرض محتوى SQL ويطلب منك تطبيقه يدوياً
 * في Supabase Dashboard لأن Supabase لا يدعم تنفيذ SQL مباشرة عبر API
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as readline from 'readline'

// تحميل متغيرات البيئة
dotenv.config({ path: '.env.local' })

// ============================================
// Configuration
// ============================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!SUPABASE_URL) {
  console.error('❌ خطأ: NEXT_PUBLIC_SUPABASE_URL غير موجود في .env.local')
  process.exit(1)
}

// استخراج project ref
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ خطأ: لا يمكن استخراج project ref من URL')
  process.exit(1)
}

// إنشاء readline interface للتفاعل مع المستخدم
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// ============================================
// Migration Files (بالترتيب)
// ============================================
const MIGRATIONS = [
  '001_create_missing_tables.sql',
  '002_enable_rls_policies.sql',
  '003_create_triggers.sql',
]

// ============================================
// Helper Functions
// ============================================

/**
 * قراءة ملف SQL
 */
function readSQLFile(filename: string): string {
  const filePath = path.join(process.cwd(), 'supabase', 'migrations', filename)
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ الملف غير موجود: ${filePath}`)
  }
  
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * سؤال المستخدم
 */
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

/**
 * عرض migration وطلب تطبيقه
 */
async function displayMigration(filename: string, sql: string): Promise<boolean> {
  console.log(`\n📝 Migration: ${filename}`)
  console.log('━'.repeat(80))
  console.log(`📊 عدد الأسطر: ${sql.split('\n').length}`)
  console.log(`📏 الحجم: ${(sql.length / 1024).toFixed(2)} KB`)
  console.log('━'.repeat(80))

  console.log('\n📋 محتوى SQL (أول 20 سطر):')
  console.log('─'.repeat(80))
  const lines = sql.split('\n')
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')} | ${line}`)
  })
  if (lines.length > 20) {
    console.log(`... (${lines.length - 20} سطر إضافي)`)
  }
  console.log('─'.repeat(80))

  console.log('\n📍 لتطبيق هذا Migration:')
  console.log(`   1. افتح: https://app.supabase.com/project/${projectRef}/sql`)
  console.log(`   2. انسخ محتوى: supabase/migrations/${filename}`)
  console.log(`   3. الصق في SQL Editor`)
  console.log(`   4. اضغط "Run" أو Ctrl+Enter`)
  console.log('')

  const answer = await askQuestion('هل تم تطبيق Migration بنجاح؟ (y/n): ')

  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
}

/**
 * عرض تعليمات التحقق
 */
function displayVerificationInstructions(): void {
  console.log('\n🔍 التحقق من نجاح Migrations')
  console.log('━'.repeat(80))
  console.log('\n📋 للتحقق من نجاح Migrations، نفّذ الاستعلامات التالية في SQL Editor:')
  console.log('')
  console.log('1️⃣ التحقق من الجداول:')
  console.log('─'.repeat(80))
  console.log(`SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;`)
  console.log('─'.repeat(80))
  console.log('   يجب أن ترى 19 جدول على الأقل (4 موجودة + 15 جديدة)')
  console.log('')

  console.log('2️⃣ التحقق من RLS:')
  console.log('─'.repeat(80))
  console.log(`SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';`)
  console.log('─'.repeat(80))
  console.log('   يجب أن يكون rowsecurity = true لجميع الجداول')
  console.log('')

  console.log('3️⃣ التحقق من Policies:')
  console.log('─'.repeat(80))
  console.log(`SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;`)
  console.log('─'.repeat(80))
  console.log('   يجب أن ترى 4 policies لكل جدول (SELECT, INSERT, UPDATE, DELETE)')
  console.log('')

  console.log('4️⃣ التحقق من Triggers:')
  console.log('─'.repeat(80))
  console.log(`SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';`)
  console.log('─'.repeat(80))
  console.log('   يجب أن ترى trigger لتحديث updated_at على الجداول المناسبة')
  console.log('')
}

// ============================================
// Main Function
// ============================================
async function main() {
  console.log('🚀 بدء تطبيق Database Migrations')
  console.log('━'.repeat(80))
  console.log(`📍 Supabase Project: ${projectRef}`)
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`)
  console.log(`📁 عدد Migrations: ${MIGRATIONS.length}`)
  console.log('━'.repeat(80))

  console.log('\n⚠️  ملاحظة مهمة:')
  console.log('   Supabase لا يدعم تنفيذ SQL مباشرة عبر API')
  console.log('   يجب تطبيق Migrations يدوياً في Supabase Dashboard')
  console.log('   هذا السكريبت سيعرض لك المحتوى ويرشدك خطوة بخطوة')
  console.log('')

  const answer = await askQuestion('هل تريد المتابعة؟ (y/n): ')

  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('❌ تم إلغاء العملية')
    rl.close()
    process.exit(0)
  }

  let allSuccess = true

  // تطبيق كل migration بالترتيب
  for (let i = 0; i < MIGRATIONS.length; i++) {
    const migrationFile = MIGRATIONS[i]

    try {
      const sql = readSQLFile(migrationFile)
      const success = await displayMigration(migrationFile, sql)

      if (!success) {
        allSuccess = false
        console.log(`\n❌ ${migrationFile} لم يتم تطبيقه`)

        const continueAnswer = await askQuestion('هل تريد المتابعة للـ migration التالي؟ (y/n): ')
        if (continueAnswer.toLowerCase() !== 'y' && continueAnswer.toLowerCase() !== 'yes') {
          console.log('❌ تم إيقاف العملية')
          break
        }
      } else {
        console.log(`\n✅ ${migrationFile} تم تطبيقه بنجاح`)
      }
    } catch (error: any) {
      console.error(`\n❌ خطأ في ${migrationFile}:`, error.message)
      allSuccess = false
      break
    }
  }

  // عرض تعليمات التحقق
  displayVerificationInstructions()

  // النتيجة النهائية
  console.log('\n' + '━'.repeat(80))
  if (allSuccess) {
    console.log('✅ تم تطبيق جميع Migrations بنجاح!')
    console.log('\n📝 الخطوات التالية:')
    console.log('   1. نفّذ استعلامات التحقق أعلاه')
    console.log('   2. تأكد من وجود جميع الجداول والـ RLS policies')
    console.log('   3. ابدأ باختبار التطبيق')
  } else {
    console.log('⚠️  لم يتم تطبيق جميع Migrations')
    console.log('   يرجى مراجعة الأخطاء أعلاه وإعادة المحاولة')
  }
  console.log('━'.repeat(80))

  rl.close()
}

// تشغيل
main().catch(error => {
  console.error('❌ خطأ فادح:', error)
  rl.close()
  process.exit(1)
})

