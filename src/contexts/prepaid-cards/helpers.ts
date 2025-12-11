/**
 * Prepaid Cards Helpers
 * 
 * دوال مساعدة للبطاقات المدفوعة مسبقاً
 * 
 * @module contexts/prepaid-cards/helpers
 */

import type { PrepaidCard, PrepaidTransaction, PrepaidCardStats } from './types'

// ===================================
// 🔄 Data Transformers
// ===================================

/**
 * تحويل بيانات البطاقة من قاعدة البيانات للواجهة
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
 * تحويل بيانات البطاقة للحفظ في قاعدة البيانات
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
 * حساب إحصائيات البطاقات
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
 * التحقق من صلاحية البطاقة للعمليات
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

