#!/bin/bash

# 🔄 Run Database Migrations Script
# 
# هذا السكريبت يطبق جميع migrations على قاعدة بيانات Supabase
# 
# الاستخدام:
# bash scripts/run-migrations.sh

echo "🚀 بدء تطبيق Database Migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تحميل متغيرات البيئة
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ خطأ: ملف .env.local غير موجود"
    exit 1
fi

# التحقق من المتغيرات
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ خطأ: NEXT_PUBLIC_SUPABASE_URL غير موجود"
    exit 1
fi

echo "📍 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# قائمة migrations
migrations=(
    "001_create_missing_tables.sql"
    "002_enable_rls_policies.sql"
    "003_create_triggers.sql"
)

# تطبيق كل migration
for migration in "${migrations[@]}"; do
    echo ""
    echo "📝 تطبيق: $migration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    migration_file="supabase/migrations/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo "❌ خطأ: الملف غير موجود: $migration_file"
        continue
    fi
    
    echo "✅ تم العثور على الملف"
    echo "📊 حجم الملف: $(wc -l < "$migration_file") سطر"
    echo ""
    echo "⚠️  يرجى تطبيق هذا الملف يدوياً في Supabase Dashboard:"
    echo "   1. افتح: https://app.supabase.com/project/YOUR_PROJECT/sql"
    echo "   2. انسخ محتوى: $migration_file"
    echo "   3. الصق في SQL Editor"
    echo "   4. اضغط Run"
    echo ""
    read -p "هل تم تطبيق $migration بنجاح؟ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ تم إلغاء العملية"
        exit 1
    fi
    echo "✅ $migration تم تطبيقه"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ تم تطبيق جميع Migrations بنجاح!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

