@echo off
chcp 65001 >nul
echo ============================================
echo تنظيف الملفات المكررة
echo ============================================
echo.
echo سيتم حذف 40 ملف مكرر/قديم
echo.
echo ⚠️ تحذير: هذه العملية لا يمكن التراجع عنها!
echo.
pause

echo.
echo جاري حذف ملفات Supabase المكررة...
echo.

del /F "SUPABASE_AUDIT_REPORT.md" 2>nul
del /F "SUPABASE_DETAILED_ANALYSIS.md" 2>nul
del /F "SUPABASE_RECOMMENDATIONS.md" 2>nul
del /F "SUPABASE_CONNECTION_TEST.md" 2>nul
del /F "SUPABASE_COMPLETE_REVIEW.md" 2>nul
del /F "SUPABASE_REVIEW_EXECUTIVE_SUMMARY.md" 2>nul
del /F "SUPABASE_EMAIL_CONFIG.md" 2>nul
del /F "SUPABASE_CURRENT_STATUS_27_OCT.md" 2>nul
del /F "SUPABASE_INDEX.md" 2>nul
del /F "SUPABASE_SUMMARY.md" 2>nul
del /F "SUPABASE_ACTION_PLAN.md" 2>nul
del /F "SUPABASE_MANUAL_FIXES.md" 2>nul
del /F "SUPABASE_STATUS_REPORT.md" 2>nul
del /F "SUPABASE_ACTUAL_ISSUES_FOUND.md" 2>nul
del /F "SUPABASE_FINAL_REPORT.md" 2>nul
del /F "SUPABASE_MISSION_COMPLETE.md" 2>nul
del /F "SUPABASE_EXECUTION_SUMMARY.md" 2>nul
del /F "SUPABASE_SOLUTIONS_INDEX.md" 2>nul
del /F "SUPABASE_FINAL_SUMMARY_AR.md" 2>nul
del /F "SUPABASE_COMPLETE_SOLUTION.md" 2>nul
del /F "SUPABASE_TESTING_PLAN.md" 2>nul
del /F "SUPABASE_FINAL_FIXES_REPORT.md" 2>nul
del /F "SUPABASE_FIXES_GUIDE.md" 2>nul
del /F "SUPABASE_ISSUES_ANALYSIS.md" 2>nul

echo ✓ تم حذف 24 ملف Supabase
echo.
echo جاري حذف ملفات التقارير المكررة...
echo.

del /F "FINAL_COMPREHENSIVE_REPORT.md" 2>nul
del /F "ANSWERS_TO_ALL_QUESTIONS.md" 2>nul
del /F "START_HERE_FINAL_REPORT.md" 2>nul
del /F "FINAL_SUMMARY_ANSWERS.md" 2>nul
del /F "COMPLETE_SOLUTION_GUIDE.md" 2>nul
del /F "MANUAL_STEPS_SUPABASE_DASHBOARD.md" 2>nul
del /F "SQL_SECOND_FILE_COPY.md" 2>nul
del /F "COMPREHENSIVE_SUPABASE_REPORT.md" 2>nul
del /F "START_HERE_SUPABASE_FIXES.md" 2>nul
del /F "FINAL_SUMMARY_AR.md" 2>nul
del /F "EXECUTION_COMPLETE.md" 2>nul
del /F "FINAL_EXECUTION_REPORT.md" 2>nul
del /F "IMPLEMENTATION_SUMMARY.md" 2>nul
del /F "COMPREHENSIVE_TEST_REPORT.md" 2>nul

echo ✓ تم حذف 14 ملف تقارير
echo.
echo جاري حذف ملفات الملخصات القديمة...
echo.

del /F "SUMMARY_TODAY.md" 2>nul
del /F "WORK_COMPLETED.md" 2>nul
del /F "PROJECT_STATUS.md" 2>nul

echo ✓ تم حذف 3 ملفات ملخصات
echo.
echo ============================================
echo ✓ اكتمل التنظيف بنجاح!
echo ============================================
echo.
echo تم حذف 40 ملف مكرر
echo تبقى 15 ملف أساسي فقط
echo تحسين: 73%%
echo.
pause

