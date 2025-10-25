import { PrepaidCard } from '@/contexts/prepaid-cards-context'

export interface ValidationResult {
  isValid: boolean
  message?: string
  severity?: 'error' | 'warning' | 'info'
}

/**
 * التحقق من الرصيد الكافي
 */
export function validateBalance(card: PrepaidCard, amount: number): ValidationResult {
  if (amount <= 0) {
    return {
      isValid: false,
      message: 'المبلغ يجب أن يكون أكبر من صفر',
      severity: 'error',
    }
  }

  if (card.balance < amount) {
    return {
      isValid: false,
      message: `الرصيد غير كافٍ. الرصيد الحالي: ${card.balance.toFixed(2)} ج.م`,
      severity: 'error',
    }
  }

  // تحذير إذا كان المبلغ سيترك رصيد منخفض جداً
  const remainingBalance = card.balance - amount
  if (remainingBalance < 100 && remainingBalance > 0) {
    return {
      isValid: true,
      message: `تحذير: الرصيد المتبقي سيكون ${remainingBalance.toFixed(2)} ج.م فقط`,
      severity: 'warning',
    }
  }

  return { isValid: true }
}

/**
 * التحقق من الحد اليومي
 */
export function validateDailyLimit(card: PrepaidCard, amount: number): ValidationResult {
  if (card.dailyLimit === 0) {
    return { isValid: true } // لا يوجد حد يومي
  }

  const newDailyUsed = card.dailyUsed + amount

  if (newDailyUsed > card.dailyLimit) {
    return {
      isValid: false,
      message: `تجاوز الحد اليومي. الحد: ${card.dailyLimit.toFixed(2)} ج.م، المستخدم: ${card.dailyUsed.toFixed(2)} ج.م`,
      severity: 'error',
    }
  }

  // تحذير إذا كان قريب من الحد (80% أو أكثر)
  const usagePercentage = (newDailyUsed / card.dailyLimit) * 100
  if (usagePercentage >= 80) {
    return {
      isValid: true,
      message: `تحذير: ستصل إلى ${usagePercentage.toFixed(0)}% من الحد اليومي`,
      severity: 'warning',
    }
  }

  return { isValid: true }
}

/**
 * التحقق من الحد الشهري
 */
export function validateMonthlyLimit(card: PrepaidCard, amount: number): ValidationResult {
  if (card.monthlyLimit === 0) {
    return { isValid: true } // لا يوجد حد شهري
  }

  const newMonthlyUsed = card.monthlyUsed + amount

  if (newMonthlyUsed > card.monthlyLimit) {
    return {
      isValid: false,
      message: `تجاوز الحد الشهري. الحد: ${card.monthlyLimit.toFixed(2)} ج.م، المستخدم: ${card.monthlyUsed.toFixed(2)} ج.م`,
      severity: 'error',
    }
  }

  // تحذير إذا كان قريب من الحد (80% أو أكثر)
  const usagePercentage = (newMonthlyUsed / card.monthlyLimit) * 100
  if (usagePercentage >= 80) {
    return {
      isValid: true,
      message: `تحذير: ستصل إلى ${usagePercentage.toFixed(0)}% من الحد الشهري`,
      severity: 'warning',
    }
  }

  return { isValid: true }
}

/**
 * التحقق من حد المعاملة الواحدة
 */
export function validateTransactionLimit(card: PrepaidCard, amount: number): ValidationResult {
  if (card.transactionLimit === 0) {
    return { isValid: true } // لا يوجد حد للمعاملة
  }

  if (amount > card.transactionLimit) {
    return {
      isValid: false,
      message: `تجاوز حد المعاملة الواحدة. الحد الأقصى: ${card.transactionLimit.toFixed(2)} ج.م`,
      severity: 'error',
    }
  }

  // تحذير إذا كان المبلغ كبير (80% أو أكثر من الحد)
  const percentage = (amount / card.transactionLimit) * 100
  if (percentage >= 80) {
    return {
      isValid: true,
      message: `معاملة كبيرة: ${percentage.toFixed(0)}% من حد المعاملة الواحدة`,
      severity: 'info',
    }
  }

  return { isValid: true }
}

/**
 * التحقق الشامل من جميع الحدود
 */
export function validateAllLimits(
  card: PrepaidCard,
  amount: number,
  type: 'withdrawal' | 'purchase'
): ValidationResult[] {
  const results: ValidationResult[] = []

  // التحقق من الرصيد
  results.push(validateBalance(card, amount))

  // التحقق من الحد اليومي
  results.push(validateDailyLimit(card, amount))

  // التحقق من الحد الشهري
  results.push(validateMonthlyLimit(card, amount))

  // التحقق من حد المعاملة
  results.push(validateTransactionLimit(card, amount))

  return results.filter(r => r.message) // إرجاع النتائج التي تحتوي على رسائل فقط
}

/**
 * التحقق من حالة البطاقة
 */
export function validateCardStatus(card: PrepaidCard): ValidationResult {
  if (card.status !== 'active') {
    return {
      isValid: false,
      message: `البطاقة ${
        card.status === 'suspended' ? 'معلقة' :
        card.status === 'blocked' ? 'محظورة' :
        'منتهية'
      }. لا يمكن إجراء معاملات عليها.`,
      severity: 'error',
    }
  }

  // التحقق من تاريخ الانتهاء
  const expiryDate = new Date(card.expiryDate)
  const now = new Date()

  if (expiryDate < now) {
    return {
      isValid: false,
      message: 'البطاقة منتهية الصلاحية',
      severity: 'error',
    }
  }

  // تحذير إذا كانت قريبة من الانتهاء (30 يوم أو أقل)
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry <= 30) {
    return {
      isValid: true,
      message: `تحذير: البطاقة ستنتهي خلال ${daysUntilExpiry} يوم`,
      severity: 'warning',
    }
  }

  return { isValid: true }
}

/**
 * التحقق من المبلغ الكبير (يتطلب تأكيد)
 */
export function isLargeTransaction(amount: number, threshold: number = 1000): boolean {
  return amount >= threshold
}

/**
 * التحقق من صحة رقم البطاقة
 */
export function validateCardNumber(cardNumber: string): ValidationResult {
  // إزالة المسافات
  const cleaned = cardNumber.replace(/\s/g, '')

  // التحقق من الطول (16 رقم عادة)
  if (cleaned.length !== 16) {
    return {
      isValid: false,
      message: 'رقم البطاقة يجب أن يكون 16 رقم',
      severity: 'error',
    }
  }

  // التحقق من أنها أرقام فقط
  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      message: 'رقم البطاقة يجب أن يحتوي على أرقام فقط',
      severity: 'error',
    }
  }

  return { isValid: true }
}

/**
 * التحقق من صحة CVV
 */
export function validateCVV(cvv: string): ValidationResult {
  if (cvv.length !== 3) {
    return {
      isValid: false,
      message: 'CVV يجب أن يكون 3 أرقام',
      severity: 'error',
    }
  }

  if (!/^\d+$/.test(cvv)) {
    return {
      isValid: false,
      message: 'CVV يجب أن يحتوي على أرقام فقط',
      severity: 'error',
    }
  }

  return { isValid: true }
}

/**
 * التحقق من صحة تاريخ الانتهاء
 */
export function validateExpiryDate(expiryDate: string): ValidationResult {
  const date = new Date(expiryDate)
  const now = new Date()

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: 'تاريخ الانتهاء غير صحيح',
      severity: 'error',
    }
  }

  if (date < now) {
    return {
      isValid: false,
      message: 'تاريخ الانتهاء يجب أن يكون في المستقبل',
      severity: 'error',
    }
  }

  return { isValid: true }
}

