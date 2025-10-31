-- ============================================
-- CHECK CREDIT_CARDS AND PAYMENTS COLUMNS
-- ============================================

-- 1. Check credit_cards columns
SELECT 
    'credit_cards' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'credit_cards'
ORDER BY ordinal_position;

-- 2. Check payments columns
SELECT 
    'payments' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

