# Changelog

All notable changes to the Money Manager project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🎯 Planned Features
- Subscription Plans implementation
- Beta Users management system
- Advanced reporting features
- Multi-currency support enhancements

---

## [1.0.0] - 2025-10-31

### 🔒 Security Fixes

#### ✅ Fixed: Function Search Path Vulnerability
- **Issue:** `update_updated_at_column()` function was vulnerable to search_path-based attacks
- **Fix:** Added `SET search_path = ''` to secure the function
- **Impact:** Prevents potential SQL injection through search_path manipulation
- **Status:** ✅ **RESOLVED**

#### ⚠️ Remaining: Leaked Password Protection
- **Issue:** Leaked password protection not enabled
- **Action Required:** Manual activation in Supabase Dashboard
- **Location:** Authentication → Providers → Email → Enable "Leaked Password Protection"
- **Note:** Available on Pro Plan and above
- **Status:** ⚠️ **PENDING MANUAL ACTIVATION**

---

### ⚡ Performance Improvements

#### ✅ Optimized: RLS Policies (72 policies across 18 tables)
- **Issue:** RLS policies were calling `auth.uid()` multiple times per query
- **Fix:** Wrapped `auth.uid()` in subqueries: `(SELECT auth.uid())`
- **Impact:** Significant performance improvement for all authenticated queries
- **Tables Affected:**
  1. bank_accounts (4 policies)
  2. cards (4 policies)
  3. cash_vaults (4 policies)
  4. cashback (4 policies)
  5. central_transfers (4 policies)
  6. credit_cards (4 policies)
  7. customers (4 policies)
  8. e_wallets (4 policies)
  9. installment_plans (4 policies)
  10. investments (4 policies)
  11. merchants (4 policies)
  12. notifications (4 policies)
  13. payments (4 policies)
  14. pos_machines (4 policies)
  15. prepaid_cards (4 policies)
  16. products (4 policies)
  17. sales (4 policies)
  18. savings_circles (4 policies)
- **Status:** ✅ **RESOLVED**

---

### 📊 Summary

| Category | Total Issues | Fixed | Remaining | Success Rate |
|----------|--------------|-------|-----------|--------------|
| **Security** | 2 | 1 | 1 | 50% |
| **Performance** | 72 | 72 | 0 | 100% |
| **TOTAL** | 74 | 73 | 1 | **98.6%** |

---

### 🗂️ Database Migrations

#### Applied Migrations:
1. `001_create_missing_tables.sql` - Initial database schema
2. `002_enable_rls_policies.sql` - Row Level Security policies
3. `003_create_triggers.sql` - Database triggers
4. `fix_all_security_performance_issues.sql` - Security and performance fixes
5. `final_comprehensive_improvements.sql` - Final optimizations

#### Migration Files Cleaned Up:
- Removed 10 temporary/duplicate migration files
- Removed 3 verification scripts (verify_all_in_one.sql, verify_fixes.sql, verify_fixes_simple.sql)
- Kept only essential migration files

---

### 🧹 Project Cleanup

#### Files Removed (79 files total):
- **SQL Files:** 5 temporary SQL files
- **Migrations:** 10 duplicate/temporary migration files
- **Documentation:** 61 duplicate/outdated documentation files
- **Reports:** 2 CSV report files
- **Scripts:** 1 cleanup batch script

#### Files Retained:
- **Documentation:** README.md, CONTRIBUTING.md, LICENSE.md, SECURITY.md, CHANGELOG.md
- **Migrations:** 5 essential migration files + README.md
- **Configuration:** All config files (package.json, tsconfig.json, etc.)
- **Source Code:** All files in `src/` directory (unchanged)

---

### 🔧 Configuration Updates

#### Updated `.gitignore`:
- Added temporary files exclusion (*.tmp, *.temp, *.bak, *.old)
- Added CSV reports exclusion (*.csv)
- Added Supabase local development exclusion
- Added documentation backups exclusion

---

### 📈 Improvements

- **Code Quality:** Removed commented-out code and unnecessary files
- **Security:** Fixed critical search_path vulnerability
- **Performance:** Optimized all RLS policies for better query performance
- **Maintainability:** Cleaned up project structure (79 files removed)
- **Documentation:** Consolidated documentation into essential files only

---

### 🎯 Next Steps

1. **Manual Action Required:**
   - Enable "Leaked Password Protection" in Supabase Dashboard
   - Location: Authentication → Providers → Email
   - Requires: Pro Plan or above

2. **Planned Features:**
   - Implement subscription plans
   - Add beta users management
   - Deploy to production
   - Set up CI/CD pipeline

---

### 🙏 Acknowledgments

- Supabase team for the excellent platform
- All contributors to the Money Manager project

---

## Version History

- **v1.0.0** (2025-10-31) - Initial release with security and performance fixes
- **v0.1.0** (2025-10-01) - Project initialization

---

**For detailed information about contributing, please see [CONTRIBUTING.md](CONTRIBUTING.md)**

**For security concerns, please see [SECURITY.md](SECURITY.md)**

