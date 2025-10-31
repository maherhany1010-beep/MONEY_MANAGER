-- ============================================
-- COMPREHENSIVE SUPABASE AUDIT SCRIPT
-- ============================================
-- هذا السكريبت يفحص جميع جوانب قاعدة البيانات
-- ويعطي تقرير شامل عن الحالة الحالية
-- ============================================

-- ============================================
-- 1. فحص الجداول الموجودة
-- ============================================

SELECT 
    '=== الجداول الموجودة ===' AS section,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 2. فحص العلاقات (Foreign Keys)
-- ============================================

SELECT 
    '=== العلاقات (Foreign Keys) ===' AS section,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 3. فحص الفهارس (Indexes)
-- ============================================

SELECT 
    '=== الفهارس (Indexes) ===' AS section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 4. فحص الدوال (Functions)
-- ============================================

SELECT 
    '=== الدوال (Functions) ===' AS section,
    routine_name,
    routine_type,
    data_type AS return_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ============================================
-- 5. فحص المحفزات (Triggers)
-- ============================================

SELECT 
    '=== المحفزات (Triggers) ===' AS section,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 6. فحص RLS (Row Level Security)
-- ============================================

SELECT 
    '=== RLS Status ===' AS section,
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 7. فحص RLS Policies
-- ============================================

SELECT 
    '=== RLS Policies ===' AS section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- 8. فحص الأنواع المخصصة (Custom Types)
-- ============================================

SELECT 
    '=== الأنواع المخصصة (Custom Types) ===' AS section,
    t.typname AS type_name,
    e.enumlabel AS enum_value,
    e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- ============================================
-- 9. فحص الأعمدة لكل جدول
-- ============================================

SELECT 
    '=== أعمدة الجداول ===' AS section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 10. فحص القيود (Constraints)
-- ============================================

SELECT 
    '=== القيود (Constraints) ===' AS section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- ============================================
-- 11. فحص حجم الجداول
-- ============================================

SELECT 
    '=== حجم الجداول ===' AS section,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 12. فحص عدد الصفوف في كل جدول
-- ============================================

SELECT 
    '=== عدد الصفوف ===' AS section,
    schemaname,
    tablename,
    n_live_tup AS row_count,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ============================================
-- 13. فحص الفهارس غير المستخدمة
-- ============================================

SELECT 
    '=== الفهارس غير المستخدمة ===' AS section,
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
    AND idx_scan = 0
ORDER BY tablename, indexname;

-- ============================================
-- 14. فحص الاستعلامات البطيئة (إن وجدت)
-- ============================================

SELECT 
    '=== إحصائيات الاستعلامات ===' AS section,
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- ============================================
-- 15. فحص Extensions المفعلة
-- ============================================

SELECT 
    '=== Extensions المفعلة ===' AS section,
    extname AS extension_name,
    extversion AS version
FROM pg_extension
ORDER BY extname;

-- ============================================
-- END OF AUDIT SCRIPT
-- ============================================

