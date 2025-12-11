/**
 * Cards Context Types
 * 
 * جميع الأنواع والـ interfaces الخاصة بالبطاقات الائتمانية
 * @module contexts/cards/types
 */

// ===================================
// 📦 Card Types
// ===================================
export type CardTier = 'classic' | 'gold' | 'platinum' | 'titanium' | 'black'
export type CardType = 'visa' | 'mastercard' | 'amex' | 'other'
export type CardStatus = 'active' | 'blocked' | 'cancelled'
export type PaymentType = 'minimum' | 'full' | 'custom'

// ===================================
// 📦 Card Holder Info
// ===================================
export interface CardHolderInfo {
  fullName: string
  phoneNumber: string
  email: string
  nationalId: string
  address: string
}

// ===================================
// 📦 Credit Card Interface
// ===================================
export interface CreditCard {
  // Database fields (snake_case)
  id: string
  user_id?: string
  card_name: string
  bank_name: string
  card_number_last_four: string
  card_type: CardType
  credit_limit: number
  current_balance: number
  available_credit: number
  due_date: number
  minimum_payment: number
  interest_rate: number
  status: CardStatus
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  name?: string
  bankName?: string
  cardNumberLastFour?: string
  cardType?: CardType
  cardTier?: CardTier
  creditLimit?: number
  currentBalance?: number
  cashbackRate?: number
  dueDate?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  holderInfo?: CardHolderInfo
  annualFee?: number
  cashWithdrawalFee?: number
  latePaymentFee?: number
  overLimitFee?: number
  annualInterestRate?: number
  foreignTransactionFee?: number
  cardReplacementFee?: number
}

// ===================================
// 📦 Purchase Interface
// ===================================
export interface Purchase {
  id: string
  cardId: string
  merchantName: string
  category: string
  amount: number
  date: string
  description?: string
  cashbackEarned: number
}

// ===================================
// 📦 Payment Interface
// ===================================
export interface Payment {
  id: string
  cardId: string
  amount: number
  date: string
  type: PaymentType
  description?: string
}

// ===================================
// 📦 Merchant Interface
// ===================================
export interface Merchant {
  id: string
  name: string
  category?: string
  logo?: string
  installmentPlans?: unknown[]
}

// ===================================
// 📦 Card Statistics
// ===================================
export interface CardStats {
  totalCreditLimit: number
  totalBalance: number
  totalAvailableCredit: number
  totalCashback: number
  utilizationRate: number
  cardsCount: number
  activeCardsCount: number
}

// ===================================
// 📦 Context Type
// ===================================
export interface CardsContextType {
  cards: CreditCard[]
  purchases: Purchase[]
  payments: Payment[]
  loading: boolean
  error: string | null
  addCard: (card: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CreditCard | null>
  updateCard: (id: string, updates: Partial<CreditCard>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<void>
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>
  getTotalCreditLimit: () => number
  getTotalBalance: () => number
  getTotalAvailableCredit: () => number
  getCardById: (id: string) => CreditCard | undefined
  getCardPurchases: (cardId: string) => Purchase[]
  getTotalCashback: () => number
}

