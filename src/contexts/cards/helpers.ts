/**
 * Cards Context Helpers
 * 
 * دوال مساعدة لتحويل البيانات وحساب الإحصائيات
 * @module contexts/cards/helpers
 */

import type { CreditCard, Purchase, CardStats } from './types'

// ===================================
// 🔄 Data Transformation
// ===================================

/**
 * تحويل بيانات البطاقة من قاعدة البيانات
 */
export function transformCardFromDB(dbData: Record<string, unknown>): CreditCard {
  const creditLimit = Number(dbData.credit_limit) || 0
  const currentBalance = Number(dbData.current_balance) || 0

  return {
    id: dbData.id as string,
    user_id: dbData.user_id as string,
    card_name: (dbData.name || dbData.card_name) as string,
    bank_name: dbData.bank_name as string,
    card_number_last_four: dbData.card_number_last_four as string,
    card_type: (dbData.card_type || 'visa') as CreditCard['card_type'],
    credit_limit: creditLimit,
    current_balance: currentBalance,
    available_credit: creditLimit - currentBalance,
    due_date: Number(dbData.due_date) || 1,
    minimum_payment: Number(dbData.minimum_payment) || 0,
    interest_rate: Number(dbData.interest_rate) || 0,
    status: (dbData.status || 'active') as CreditCard['status'],
    created_at: dbData.created_at as string,
    updated_at: dbData.updated_at as string,
    // Legacy compatibility
    name: dbData.name as string,
    creditLimit: creditLimit,
    currentBalance: currentBalance,
    isActive: (dbData.status || 'active') === 'active',
  }
}

/**
 * تحويل بيانات البطاقة لقاعدة البيانات
 */
export function transformCardToDB(card: Partial<CreditCard>): Record<string, unknown> {
  const dbData: Record<string, unknown> = {}

  if (card.card_name !== undefined) dbData.name = card.card_name
  if (card.bank_name !== undefined) dbData.bank_name = card.bank_name
  if (card.card_number_last_four !== undefined) dbData.card_number_last_four = card.card_number_last_four
  if (card.card_type !== undefined) dbData.card_type = card.card_type
  if (card.credit_limit !== undefined) dbData.credit_limit = card.credit_limit
  if (card.current_balance !== undefined) dbData.current_balance = card.current_balance
  if (card.due_date !== undefined) dbData.due_date = card.due_date
  if (card.status !== undefined) dbData.status = card.status

  // Handle legacy fields
  if (card.currentBalance !== undefined) dbData.current_balance = card.currentBalance

  return dbData
}

// ===================================
// 📊 Statistics Calculation
// ===================================

/**
 * حساب إحصائيات البطاقات
 */
export function calculateCardStats(cards: CreditCard[], purchases: Purchase[]): CardStats {
  const totalCreditLimit = cards.reduce((sum, card) => sum + (card.credit_limit || 0), 0)
  const totalBalance = cards.reduce((sum, card) => sum + (card.current_balance || 0), 0)
  const totalAvailableCredit = cards.reduce((sum, card) => sum + (card.available_credit || 0), 0)
  const totalCashback = purchases.reduce((sum, p) => sum + (p.cashbackEarned || 0), 0)
  const activeCardsCount = cards.filter(c => c.status === 'active').length

  return {
    totalCreditLimit,
    totalBalance,
    totalAvailableCredit,
    totalCashback,
    utilizationRate: totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0,
    cardsCount: cards.length,
    activeCardsCount,
  }
}

/**
 * حساب الرصيد الجديد بعد عملية شراء
 */
export function calculateBalanceAfterPurchase(
  card: CreditCard,
  amount: number
): { newBalance: number; newAvailableCredit: number } {
  const newBalance = (card.current_balance || 0) + amount
  const newAvailableCredit = (card.credit_limit || 0) - newBalance
  return { newBalance, newAvailableCredit }
}

/**
 * حساب الرصيد الجديد بعد عملية سداد
 */
export function calculateBalanceAfterPayment(
  card: CreditCard,
  amount: number
): { newBalance: number; newAvailableCredit: number } {
  const newBalance = Math.max(0, (card.current_balance || 0) - amount)
  const newAvailableCredit = (card.credit_limit || 0) - newBalance
  return { newBalance, newAvailableCredit }
}

// ===================================
// ✅ Validation
// ===================================

/**
 * التحقق من صلاحية عملية الشراء
 */
export function validatePurchase(
  card: CreditCard,
  amount: number
): { valid: boolean; error?: string } {
  if (!card) {
    return { valid: false, error: 'البطاقة غير موجودة' }
  }

  if (card.status !== 'active') {
    return { valid: false, error: 'البطاقة غير نشطة' }
  }

  if (amount <= 0) {
    return { valid: false, error: 'المبلغ يجب أن يكون أكبر من صفر' }
  }

  if (amount > (card.available_credit || 0)) {
    return { valid: false, error: 'المبلغ يتجاوز الحد الائتماني المتاح' }
  }

  return { valid: true }
}

/**
 * التحقق من صلاحية عملية السداد
 */
export function validatePayment(
  card: CreditCard,
  amount: number
): { valid: boolean; error?: string } {
  if (!card) {
    return { valid: false, error: 'البطاقة غير موجودة' }
  }

  if (amount <= 0) {
    return { valid: false, error: 'المبلغ يجب أن يكون أكبر من صفر' }
  }

  return { valid: true }
}

