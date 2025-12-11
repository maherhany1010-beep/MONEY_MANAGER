/**
 * @fileoverview Prepaid Cards Helper Functions
 *
 * دوال مساعدة للبطاقات المدفوعة مسبقاً.
 * تتضمن دوال تحويل البيانات، حساب الإحصائيات، والتحقق من الصلاحية.
 *
 * Helper functions for prepaid cards including data transformation,
 * statistics calculation, and validation.
 *
 * @module contexts/prepaid-cards/helpers
 * @author Money Manager Team
 * @version 1.0.0
 */

import type { PrepaidCard, PrepaidTransaction, PrepaidCardStats } from './types'

// ===================================
// 🔄 Data Transformers
// ===================================

/**
 * تحويل بيانات البطاقة من قاعدة البيانات إلى صيغة الواجهة
 * Transform prepaid card from database format to frontend format
 *
 * يحافظ على التوافق مع الكود القديم عبر إضافة aliases بـ camelCase.
 *
 * @param dbData - بيانات البطاقة من Supabase
 * @returns كائن PrepaidCard بكلتا الصيغتين (snake_case و camelCase)
 *
 * @example
 * ```typescript
 * const { data } = await supabase.from('prepaid_cards').select('*')
 * const cards = data.map(transformPrepaidCardFromDB)
 * console.log(cards[0].card_name) // 'بطاقة فودافون كاش'
 * console.log(cards[0].cardName)  // 'بطاقة فودافون كاش' (alias)
 * ```
 */
export function transformPrepaidCardFromDB(dbData: Record<string, unknown>): PrepaidCard {
  return {
    // Database fields
    id: dbData.id as string,
    user_id: dbData.user_id as string | undefined,
    card_name: dbData.card_name as string,
    card_number: dbData.card_number as string | null,
    balance: dbData.balance as number,
    currency: (dbData.currency as string) || 'EGP',
    expiry_date: dbData.expiry_date as string | null,
    status: (dbData.status as string) || 'active',
    created_at: dbData.created_at as string | undefined,
    updated_at: dbData.updated_at as string | undefined,
    
    // Extended fields
    provider: dbData.provider as string | undefined,
    card_type: dbData.card_type as string | undefined,
    is_reloadable: dbData.is_reloadable as boolean | undefined,
    max_balance: dbData.max_balance as number | undefined,
    daily_limit: dbData.daily_limit as number | undefined,
    monthly_limit: dbData.monthly_limit as number | undefined,
    transaction_limit: dbData.transaction_limit as number | undefined,
    daily_used: dbData.daily_used as number | undefined,
    monthly_used: dbData.monthly_used as number | undefined,
    holder_name: dbData.holder_name as string | undefined,
    holder_phone: dbData.holder_phone as string | undefined,
    is_default: dbData.is_default as boolean | undefined,
    
    // Backward compatibility (camelCase aliases)
    cardName: dbData.card_name as string,
    cardNumber: dbData.card_number as string | undefined,
    cardBalance: dbData.balance as number,
    expiryDate: dbData.expiry_date as string | undefined,
    cardType: dbData.card_type as string | undefined,
    isReloadable: dbData.is_reloadable as boolean | undefined,
    maxBalance: dbData.max_balance as number | undefined,
    dailyLimit: dbData.daily_limit as number | undefined,
    monthlyLimit: dbData.monthly_limit as number | undefined,
    transactionLimit: dbData.transaction_limit as number | undefined,
    dailyUsed: dbData.daily_used as number | undefined,
    monthlyUsed: dbData.monthly_used as number | undefined,
    holderName: dbData.holder_name as string | undefined,
    holderPhone: dbData.holder_phone as string | undefined,
    isDefault: dbData.is_default as boolean | undefined,
  }
}

/**
 * تحويل بيانات البطاقة من صيغة الواجهة إلى صيغة قاعدة البيانات
 * Transform prepaid card from frontend format to database format
 *
 * يقبل كلتا الصيغتين (snake_case و camelCase) ويحولها لـ snake_case.
 *
 * @param card - بيانات البطاقة من الواجهة
 * @returns كائن بصيغة snake_case للحفظ في Supabase
 *
 * @example
 * ```typescript
 * const cardData = { cardName: 'بطاقتي', balance: 500 }
 * const dbData = transformPrepaidCardToDB(cardData)
 * await supabase.from('prepaid_cards').insert(dbData)
 * ```
 */
export function transformPrepaidCardToDB(
  card: Partial<PrepaidCard>
): Record<string, unknown> {
  return {
    card_name: card.card_name ?? card.cardName,
    card_number: card.card_number ?? card.cardNumber,
    balance: card.balance ?? card.cardBalance ?? 0,
    currency: card.currency ?? 'EGP',
    expiry_date: card.expiry_date ?? card.expiryDate,
    status: card.status ?? 'active',
    provider: card.provider,
    card_type: card.card_type ?? card.cardType,
    is_reloadable: card.is_reloadable ?? card.isReloadable,
    max_balance: card.max_balance ?? card.maxBalance,
    daily_limit: card.daily_limit ?? card.dailyLimit,
    monthly_limit: card.monthly_limit ?? card.monthlyLimit,
    transaction_limit: card.transaction_limit ?? card.transactionLimit,
    holder_name: card.holder_name ?? card.holderName,
    holder_phone: card.holder_phone ?? card.holderPhone,
    is_default: card.is_default ?? card.isDefault,
  }
}

// ===================================
// 📊 Statistics Helpers
// ===================================

/**
 * حساب إحصائيات البطاقات المدفوعة مسبقاً
 * Calculate prepaid cards statistics
 *
 * يحسب إجمالي الأرصدة، عدد البطاقات النشطة/المنتهية/المحظورة،
 * وإجمالي المصروفات والإيداعات.
 *
 * @param cards - قائمة البطاقات
 * @param transactions - قائمة المعاملات
 * @returns كائن PrepaidCardStats بالإحصائيات
 *
 * @example
 * ```typescript
 * const stats = calculatePrepaidCardStats(cards, transactions)
 * console.log(`إجمالي الرصيد: ${stats.totalBalance} ج.م`)
 * console.log(`البطاقات النشطة: ${stats.activeCards}`)
 * ```
 */
export function calculatePrepaidCardStats(
  cards: PrepaidCard[],
  transactions: PrepaidTransaction[]
): PrepaidCardStats {
  const activeCards = cards.filter(c => c.status === 'active').length
  const expiredCards = cards.filter(c => c.status === 'expired').length
  const blockedCards = cards.filter(c => c.status === 'blocked').length
  
  const totalBalance = cards.reduce((sum, card) => sum + (card.balance || 0), 0)
  
  const totalSpent = transactions
    .filter(t => ['purchase', 'withdrawal', 'transfer_out'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalDeposited = transactions
    .filter(t => ['deposit', 'reload', 'transfer_in'].includes(t.type))
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalCards: cards.length,
    totalBalance,
    activeCards,
    expiredCards,
    blockedCards,
    totalTransactions: transactions.length,
    totalSpent,
    totalDeposited,
  }
}

// ===================================
// ✅ Validation Helpers
// ===================================

/**
 * التحقق من صلاحية البطاقة لإجراء عملية مالية
 * Validate if a prepaid card can perform a transaction
 *
 * يتحقق من:
 * - حالة البطاقة (يجب أن تكون نشطة)
 * - كفاية الرصيد
 * - الحدود اليومية والشهرية
 * - حد العملية الواحدة
 *
 * @param card - البطاقة المراد التحقق منها
 * @param amount - مبلغ العملية
 * @param type - نوع العملية (شراء، سحب، تحويل)
 * @returns كائن بنتيجة التحقق ورسالة الخطأ إن وجدت
 *
 * @example
 * ```typescript
 * const validation = validateCardForTransaction(card, 500, 'purchase')
 * if (!validation.valid) {
 *   showErrorToast(validation.error!)
 *   return
 * }
 * // إجراء العملية...
 * ```
 */
export function validateCardForTransaction(
  card: PrepaidCard,
  amount: number,
  type: 'purchase' | 'withdrawal' | 'transfer'
): { valid: boolean; error?: string } {
  if (card.status !== 'active') {
    return { valid: false, error: 'البطاقة غير نشطة' }
  }

  if (amount <= 0) {
    return { valid: false, error: 'المبلغ يجب أن يكون أكبر من صفر' }
  }

  if (amount > card.balance) {
    return { valid: false, error: 'الرصيد غير كافٍ' }
  }

  const dailyLimit = card.daily_limit ?? card.dailyLimit
  const dailyUsed = card.daily_used ?? card.dailyUsed ?? 0
  
  if (dailyLimit && (dailyUsed + amount) > dailyLimit) {
    return { valid: false, error: 'تم تجاوز الحد اليومي' }
  }

  const transactionLimit = card.transaction_limit ?? card.transactionLimit
  
  if (transactionLimit && amount > transactionLimit) {
    return { valid: false, error: 'تم تجاوز حد العملية الواحدة' }
  }

  return { valid: true }
}

