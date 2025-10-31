-- ============================================
-- CHECK CREDIT_CARDS COLUMNS ONLY
-- ============================================

SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'credit_cards'
ORDER BY ordinal_position;

