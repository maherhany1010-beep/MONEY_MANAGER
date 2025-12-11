/**
 * Prepaid Cards Context
 *
 * هذا الملف يُصدّر الـ types و context من الملفات المقسّمة
 * للحفاظ على التوافق مع الكود القديم
 *
 * @see src/contexts/prepaid-cards/ للملفات المقسّمة
 */

// Re-export everything from the new modular structure
export type {
  PrepaidCard,
  PrepaidTransaction,
  PrepaidTransactionType,
  PrepaidCardsContextType,
  PrepaidCardStats,
} from './prepaid-cards/types'

export {
  transformPrepaidCardFromDB,
  transformPrepaidCardToDB,
  calculatePrepaidCardStats,
  validateCardForTransaction,
} from './prepaid-cards/helpers'

export {
  PrepaidCardsProvider,
  usePrepaidCards,
} from './prepaid-cards/context'

// Legacy type alias for backward compatibility
export type TransactionType = 'all' | 'purchase' | 'withdrawal' | 'transfer' | 'reload' | 'deposit' | 'transfer_in' | 'transfer_out' | 'fee'
