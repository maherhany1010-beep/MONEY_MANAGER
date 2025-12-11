/**
 * Prepaid Cards Types
 * 
 * أنواع البيانات الخاصة بالبطاقات المدفوعة مسبقاً
 * 
 * @module contexts/prepaid-cards/types
 */

// ===================================
// 📦 Database Schema Interface
// ===================================

export interface PrepaidCard {
  // Database fields (snake_case)
  id: string
  user_id?: string
  card_name: string
  card_number: string | null
  balance: number
  currency: string
  expiry_date: string | null
  status: string
  created_at?: string
  updated_at?: string
  
  // Extended DB fields
  provider?: string
  card_type?: string
  is_reloadable?: boolean
  max_balance?: number
  daily_limit?: number
  monthly_limit?: number
  transaction_limit?: number
  daily_used?: number
  monthly_used?: number
  holder_name?: string
  holder_phone?: string
  holder_national_id?: string
  is_default?: boolean
  
  // Legacy fields for backward compatibility (camelCase)
  // TODO: Remove after full migration to snake_case
  cardName?: string
  cardNumber?: string
  cardBalance?: number
  expiryDate?: string
  cardStatus?: 'active' | 'expired' | 'blocked'
  cardType?: string
  isReloadable?: boolean
  maxBalance?: number
  dailyLimit?: number
  monthlyLimit?: number
  transactionLimit?: number
  fees?: number
  notes?: string
  dailyUsed?: number
  monthlyUsed?: number
  issueDate?: string
  purchaseFee?: number
  withdrawalFee?: number
  isDefault?: boolean
  holderName?: string
  holderPhone?: string
  holderNationalId?: string
  transactionCount?: number
  totalDeposits?: number
  totalWithdrawals?: number
  totalPurchases?: number
}

// ===================================
// 📋 Transaction Types
// ===================================

export type PrepaidTransactionType = 
  | 'purchase' 
  | 'withdrawal' 
  | 'transfer' 
  | 'reload' 
  | 'deposit' 
  | 'transfer_in' 
  | 'transfer_out'
  | 'fee'

export interface PrepaidTransaction {
  id: string
  card_id: string
  cardId?: string // Legacy
  type: PrepaidTransactionType
  amount: number
  date: string
  merchant?: string
  merchantName?: string
  category?: string
  location?: string
  destination?: string
  sourceName?: string
  description?: string
  notes?: string
  fee?: number
  totalAmount?: number
  balanceAfter?: number
  created_at?: string
}

// ===================================
// 🎯 Context Types
// ===================================

export interface PrepaidCardsContextType {
  cards: PrepaidCard[]
  loading: boolean
  error: string | null
  transactions: PrepaidTransaction[]
  
  // Card CRUD
  addCard: (card: Omit<PrepaidCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<PrepaidCard | null>
  updateCard: (id: string, updates: Partial<PrepaidCard>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  
  // Balance operations
  updateBalance: (id: string, newBalance: number) => Promise<void>
  updateCardBalance: (cardId: string, newBalance: number) => void
  
  // Query helpers
  getCardById: (id: string) => PrepaidCard | undefined
  getTotalBalance: () => number
  updateCards: (cards: PrepaidCard[]) => void
  
  // Transactions
  getAllTransactions: () => PrepaidTransaction[]
  getCardTransactions: (cardId: string) => PrepaidTransaction[]
  addPurchase: (cardId: string, amount: number, merchant: string, category?: string) => Promise<void>
  addPrepaidPurchase: (cardId: string, amount: number, merchant: string, category?: string, notes?: string) => Promise<void>
  addWithdrawal: (cardId: string, amount: number, location: string) => Promise<void>
  addTransfer: (fromCardId: string, amount: number, toCardId: string) => Promise<void>
  addDeposit: (cardId: string, amount: number, source: string, notes?: string) => void
}

// ===================================
// 📊 Statistics Types
// ===================================

export interface PrepaidCardStats {
  totalCards: number
  totalBalance: number
  activeCards: number
  expiredCards: number
  blockedCards: number
  totalTransactions: number
  totalSpent: number
  totalDeposited: number
}

