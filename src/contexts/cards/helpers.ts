/**
 * @fileoverview Credit Cards Helper Functions
 *
 * دوال مساعدة للبطاقات الائتمانية.
 * تتضمن دوال تحويل البيانات، حساب الإحصائيات، والتحقق من الصلاحية.
 *
 * Helper functions for credit cards including data transformation,
 * statistics calculation, balance computation, and validation.
 *
 * @module contexts/cards/helpers
 * @author Money Manager Team
 * @version 1.0.0
 */

import type { CreditCard, Purchase, CardStats } from './types'

// ===================================
// 🔄 Data Transformation
// ===================================

/**
 * تحويل بيانات البطاقة الائتمانية من قاعدة البيانات إلى صيغة الواجهة
 * Transform credit card from database format to frontend format
 *
 * يحسب تلقائياً الائتمان المتاح (available_credit) من الحد والرصيد الحالي.
 *
 * @param dbData - بيانات البطاقة من Supabase
 * @returns كائن CreditCard مع حسابات مُحدّثة
 *
 * @example
 * ```typescript
 * const { data } = await supabase.from('credit_cards').select('*')
 * const cards = data.map(transformCardFromDB)
 * console.log(cards[0].available_credit) // محسوب تلقائياً
 * ```
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
 * تحويل بيانات البطاقة الائتمانية من صيغة الواجهة إلى صيغة قاعدة البيانات
 * Transform credit card from frontend format to database format
 *
 * يتعامل مع الحقول القديمة (legacy) للتوافق العكسي.
 *
 * @param card - بيانات البطاقة من الواجهة
 * @returns كائن بصيغة snake_case للحفظ في Supabase
 *
 * @example
 * ```typescript
 * const cardData = { card_name: 'بطاقتي', credit_limit: 10000 }
 * const dbData = transformCardToDB(cardData)
 * await supabase.from('credit_cards').update(dbData).eq('id', cardId)
 * ```
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
 * حساب إحصائيات البطاقات الائتمانية
 * Calculate credit cards statistics
 *
 * يحسب إجمالي الحدود الائتمانية، الأرصدة، الائتمان المتاح،
 * إجمالي الكاش باك، ونسبة الاستخدام.
 *
 * @param cards - قائمة البطاقات
 * @param purchases - قائمة المشتريات (للكاش باك)
 * @returns كائن CardStats بالإحصائيات
 *
 * @example
 * ```typescript
 * const stats = calculateCardStats(cards, purchases)
 * console.log(`نسبة الاستخدام: ${stats.utilizationRate.toFixed(1)}%`)
 * console.log(`إجمالي الكاش باك: ${stats.totalCashback} ج.م`)
 * ```
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
 * Calculate new balance after a purchase
 *
 * عند الشراء يزيد الرصيد المستحق وينقص الائتمان المتاح.
 *
 * @param card - البطاقة الائتمانية
 * @param amount - مبلغ الشراء
 * @returns الرصيد الجديد والائتمان المتاح الجديد
 *
 * @example
 * ```typescript
 * const { newBalance, newAvailableCredit } = calculateBalanceAfterPurchase(card, 500)
 * // تحديث البطاقة في الـ state
 * ```
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
 * Calculate new balance after a payment
 *
 * عند السداد ينقص الرصيد المستحق ويزيد الائتمان المتاح.
 * الرصيد لا يمكن أن يكون سالباً.
 *
 * @param card - البطاقة الائتمانية
 * @param amount - مبلغ السداد
 * @returns الرصيد الجديد والائتمان المتاح الجديد
 *
 * @example
 * ```typescript
 * const { newBalance, newAvailableCredit } = calculateBalanceAfterPayment(card, 1000)
 * // تحديث البطاقة في الـ state
 * ```
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
 * Validate if a purchase can be made on a credit card
 *
 * يتحقق من:
 * - وجود البطاقة
 * - حالة البطاقة (نشطة)
 * - صحة المبلغ (> 0)
 * - كفاية الائتمان المتاح
 *
 * @param card - البطاقة الائتمانية
 * @param amount - مبلغ الشراء
 * @returns نتيجة التحقق ورسالة الخطأ إن وجدت
 *
 * @example
 * ```typescript
 * const validation = validatePurchase(card, 500)
 * if (!validation.valid) {
 *   throw new Error(validation.error)
 * }
 * ```
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
 * Validate if a payment can be made on a credit card
 *
 * يتحقق من:
 * - وجود البطاقة
 * - صحة المبلغ (> 0)
 *
 * @param card - البطاقة الائتمانية
 * @param amount - مبلغ السداد
 * @returns نتيجة التحقق ورسالة الخطأ إن وجدت
 *
 * @example
 * ```typescript
 * const validation = validatePayment(card, 1000)
 * if (!validation.valid) {
 *   throw new Error(validation.error)
 * }
 * ```
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

