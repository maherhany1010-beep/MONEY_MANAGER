'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface PrepaidCard {
  id: string
  cardName: string
  provider: string
  cardNumber: string
  balance: number
  isDefault?: boolean
  holderName: string
  holderNationalId: string
  holderPhone: string
  holderEmail?: string
  dailyLimit: number
  monthlyLimit: number
  transactionLimit: number
  dailyUsed: number
  monthlyUsed: number
  cardType: 'physical' | 'virtual'
  status: 'active' | 'suspended' | 'blocked' | 'expired'
  expiryDate: string
  issueDate: string
  totalDeposits: number
  totalWithdrawals: number
  totalPurchases: number
  transactionCount: number
  depositFee: number
  withdrawalFee: number
  purchaseFee: number
  createdDate: string
  lastTransactionDate?: string
  notes?: string
}

export type TransactionType = 'deposit' | 'withdrawal' | 'purchase' | 'transfer_in' | 'transfer_out' | 'fee'

export interface PrepaidTransaction {
  id: string
  cardId: string
  type: TransactionType
  amount: number
  fee: number
  totalAmount: number
  description: string
  date: string
  // For deposits/withdrawals
  sourceType?: 'bank' | 'vault'
  sourceId?: string
  sourceName?: string
  // For purchases
  merchantName?: string
  category?: string
  // For transfers
  targetCardId?: string
  targetCardName?: string
  // Additional info
  balanceBefore: number
  balanceAfter: number
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
}

interface PrepaidCardsContextType {
  cards: PrepaidCard[]
  transactions: PrepaidTransaction[]
  updateCards: (cards: PrepaidCard[]) => void
  addCard: (card: PrepaidCard) => void
  getCardById: (id: string) => PrepaidCard | undefined
  updateCardBalance: (id: string, newBalance: number, transactionAmount?: number) => void
  // Transaction methods
  addDeposit: (cardId: string, amount: number, sourceType: 'bank' | 'vault', sourceId: string, sourceName: string, description?: string) => void
  addWithdrawal: (cardId: string, amount: number, sourceType: 'bank' | 'vault', sourceId: string, sourceName: string, description?: string) => void
  addPurchase: (cardId: string, amount: number, merchantName: string, category: string, description?: string) => void
  addTransfer: (fromCardId: string, toCardId: string, amount: number, description?: string) => void
  getCardTransactions: (cardId: string) => PrepaidTransaction[]
  getAllTransactions: () => PrepaidTransaction[]
}

const PrepaidCardsContext = createContext<PrepaidCardsContextType | undefined>(undefined)

export function PrepaidCardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<PrepaidCard[]>([])
  const [transactions, setTransactions] = useState<PrepaidTransaction[]>([])

  useEffect(() => {
    const savedCards = localStorage.getItem('prepaidCards')
    const savedTransactions = localStorage.getItem('prepaidTransactions')

    if (savedCards) {
      setCards(JSON.parse(savedCards))
    } else {
      const defaultCards: PrepaidCard[] = [
        {
          id: '1',
          cardName: 'بطاقة فوري الرئيسية',
          provider: 'فوري',
          cardNumber: '6221234567890123',
          balance: 5000,
          holderName: 'أحمد محمد علي',
          holderNationalId: '29012011234567',
          holderPhone: '01012345678',
          holderEmail: 'ahmed@example.com',
          dailyLimit: 5000,
          monthlyLimit: 50000,
          transactionLimit: 2000,
          dailyUsed: 1200,
          monthlyUsed: 15000,
          cardType: 'physical',
          status: 'active',
          expiryDate: '2026-12-31',
          issueDate: '2024-01-15',
          totalDeposits: 25000,
          totalWithdrawals: 8000,
          totalPurchases: 12000,
          transactionCount: 45,
          depositFee: 0,
          withdrawalFee: 1.5,
          purchaseFee: 0,
          createdDate: '2024-01-15',
          lastTransactionDate: '2025-10-08',
          isDefault: true,
        },
        {
          id: '2',
          cardName: 'بطاقة أمان الافتراضية',
          provider: 'أمان',
          cardNumber: '6221876543210987',
          balance: 3500,
          holderName: 'أحمد محمد علي',
          holderNationalId: '29012011234567',
          holderPhone: '01012345678',
          holderEmail: 'ahmed@example.com',
          dailyLimit: 3000,
          monthlyLimit: 30000,
          transactionLimit: 1500,
          dailyUsed: 800,
          monthlyUsed: 8500,
          cardType: 'virtual',
          status: 'active',
          expiryDate: '2025-06-30',
          issueDate: '2024-03-20',
          totalDeposits: 15000,
          totalWithdrawals: 5000,
          totalPurchases: 6500,
          transactionCount: 28,
          depositFee: 0.5,
          withdrawalFee: 2,
          purchaseFee: 0.5,
          createdDate: '2024-03-20',
          lastTransactionDate: '2025-10-07',
        },
        {
          id: '3',
          cardName: 'بطاقة ممكن',
          provider: 'ممكن',
          cardNumber: '6221555566667777',
          balance: 2800,
          holderName: 'أحمد محمد علي',
          holderNationalId: '29012011234567',
          holderPhone: '01012345678',
          dailyLimit: 4000,
          monthlyLimit: 40000,
          transactionLimit: 2500,
          dailyUsed: 500,
          monthlyUsed: 6200,
          cardType: 'physical',
          status: 'active',
          expiryDate: '2027-03-31',
          issueDate: '2024-05-10',
          totalDeposits: 12000,
          totalWithdrawals: 4000,
          totalPurchases: 5200,
          transactionCount: 32,
          depositFee: 0,
          withdrawalFee: 1,
          purchaseFee: 0,
          createdDate: '2024-05-10',
          lastTransactionDate: '2025-10-06',
        },
      ]
      setCards(defaultCards)
      localStorage.setItem('prepaidCards', JSON.stringify(defaultCards))
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  const updateCards = (newCards: PrepaidCard[]) => {
    setCards(newCards)
    localStorage.setItem('prepaidCards', JSON.stringify(newCards))
  }

  const addCard = (card: PrepaidCard) => {
    const newCards = [...cards, card]
    updateCards(newCards)
  }

  const getCardById = (id: string) => {
    return cards.find(card => card.id === id)
  }

  const updateCardBalance = (id: string, newBalance: number, transactionAmount?: number) => {
    const updatedCards = cards.map(card => {
      if (card.id === id) {
        const updates: Partial<PrepaidCard> = { balance: newBalance }

        // تحديث الحدود المستخدمة إذا كان هناك مبلغ معاملة
        if (transactionAmount) {
          const amount = Math.abs(transactionAmount)
          // تحديث الحدود لكل من السحب والإيداع
          updates.dailyUsed = (card.dailyUsed || 0) + amount
          updates.monthlyUsed = (card.monthlyUsed || 0) + amount
        }

        return { ...card, ...updates }
      }
      return card
    })
    updateCards(updatedCards)
  }

  // Helper function to save transactions
  const saveTransactions = (newTransactions: PrepaidTransaction[]) => {
    setTransactions(newTransactions)
    localStorage.setItem('prepaidTransactions', JSON.stringify(newTransactions))
  }

  // Add Deposit
  const addDeposit = (
    cardId: string,
    amount: number,
    sourceType: 'bank' | 'vault',
    sourceId: string,
    sourceName: string,
    description?: string
  ) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return

    const fee = amount * (card.depositFee / 100)
    const netAmount = amount - fee
    const newBalance = card.balance + netAmount

    // Create transaction
    const transaction: PrepaidTransaction = {
      id: Date.now().toString(),
      cardId,
      type: 'deposit',
      amount,
      fee,
      totalAmount: netAmount,
      description: description || `شحن من ${sourceName}`,
      date: new Date().toISOString(),
      sourceType,
      sourceId,
      sourceName,
      balanceBefore: card.balance,
      balanceAfter: newBalance,
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    // Update card
    const updatedCards = cards.map(c =>
      c.id === cardId
        ? {
            ...c,
            balance: newBalance,
            totalDeposits: c.totalDeposits + amount,
            transactionCount: c.transactionCount + 1,
            lastTransactionDate: new Date().toISOString(),
          }
        : c
    )

    updateCards(updatedCards)
    saveTransactions([...transactions, transaction])
  }

  // Add Withdrawal
  const addWithdrawal = (
    cardId: string,
    amount: number,
    sourceType: 'bank' | 'vault',
    sourceId: string,
    sourceName: string,
    description?: string
  ) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return

    const fee = amount * (card.withdrawalFee / 100)
    const totalAmount = amount + fee
    const newBalance = card.balance - totalAmount

    // Create transaction
    const transaction: PrepaidTransaction = {
      id: Date.now().toString(),
      cardId,
      type: 'withdrawal',
      amount,
      fee,
      totalAmount,
      description: description || `سحب إلى ${sourceName}`,
      date: new Date().toISOString(),
      sourceType,
      sourceId,
      sourceName,
      balanceBefore: card.balance,
      balanceAfter: newBalance,
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    // Update card
    const updatedCards = cards.map(c =>
      c.id === cardId
        ? {
            ...c,
            balance: newBalance,
            totalWithdrawals: c.totalWithdrawals + amount,
            dailyUsed: c.dailyUsed + totalAmount,
            monthlyUsed: c.monthlyUsed + totalAmount,
            transactionCount: c.transactionCount + 1,
            lastTransactionDate: new Date().toISOString(),
          }
        : c
    )

    updateCards(updatedCards)
    saveTransactions([...transactions, transaction])
  }

  // Add Purchase
  const addPurchase = (
    cardId: string,
    amount: number,
    merchantName: string,
    category: string,
    description?: string
  ) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return

    const fee = amount * (card.purchaseFee / 100)
    const totalAmount = amount + fee
    const newBalance = card.balance - totalAmount

    // Create transaction
    const transaction: PrepaidTransaction = {
      id: Date.now().toString(),
      cardId,
      type: 'purchase',
      amount,
      fee,
      totalAmount,
      description: description || `شراء من ${merchantName}`,
      date: new Date().toISOString(),
      merchantName,
      category,
      balanceBefore: card.balance,
      balanceAfter: newBalance,
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    // Update card
    const updatedCards = cards.map(c =>
      c.id === cardId
        ? {
            ...c,
            balance: newBalance,
            totalPurchases: c.totalPurchases + amount,
            dailyUsed: c.dailyUsed + totalAmount,
            monthlyUsed: c.monthlyUsed + totalAmount,
            transactionCount: c.transactionCount + 1,
            lastTransactionDate: new Date().toISOString(),
          }
        : c
    )

    updateCards(updatedCards)
    saveTransactions([...transactions, transaction])
  }

  // Add Transfer
  const addTransfer = (fromCardId: string, toCardId: string, amount: number, description?: string) => {
    const fromCard = cards.find(c => c.id === fromCardId)
    const toCard = cards.find(c => c.id === toCardId)
    if (!fromCard || !toCard) return

    // Transfer fee (using withdrawal fee from source card)
    const fee = amount * (fromCard.withdrawalFee / 100)
    const totalAmount = amount + fee
    const netAmount = amount // Amount received by target card

    // Create outgoing transaction
    const outTransaction: PrepaidTransaction = {
      id: Date.now().toString(),
      cardId: fromCardId,
      type: 'transfer_out',
      amount,
      fee,
      totalAmount,
      description: description || `تحويل إلى ${toCard.cardName}`,
      date: new Date().toISOString(),
      targetCardId: toCardId,
      targetCardName: toCard.cardName,
      balanceBefore: fromCard.balance,
      balanceAfter: fromCard.balance - totalAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    // Create incoming transaction
    const inTransaction: PrepaidTransaction = {
      id: (Date.now() + 1).toString(),
      cardId: toCardId,
      type: 'transfer_in',
      amount: netAmount,
      fee: 0,
      totalAmount: netAmount,
      description: description || `تحويل من ${fromCard.cardName}`,
      date: new Date().toISOString(),
      targetCardId: fromCardId,
      targetCardName: fromCard.cardName,
      balanceBefore: toCard.balance,
      balanceAfter: toCard.balance + netAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    // Update cards
    const updatedCards = cards.map(c => {
      if (c.id === fromCardId) {
        return {
          ...c,
          balance: c.balance - totalAmount,
          dailyUsed: c.dailyUsed + totalAmount,
          monthlyUsed: c.monthlyUsed + totalAmount,
          transactionCount: c.transactionCount + 1,
          lastTransactionDate: new Date().toISOString(),
        }
      }
      if (c.id === toCardId) {
        return {
          ...c,
          balance: c.balance + netAmount,
          transactionCount: c.transactionCount + 1,
          lastTransactionDate: new Date().toISOString(),
        }
      }
      return c
    })

    updateCards(updatedCards)
    saveTransactions([...transactions, outTransaction, inTransaction])
  }

  // Get card transactions
  const getCardTransactions = (cardId: string) => {
    return transactions.filter(t => t.cardId === cardId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  // Get all transactions
  const getAllTransactions = () => {
    return transactions.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  return (
    <PrepaidCardsContext.Provider
      value={{
        cards,
        transactions,
        updateCards,
        addCard,
        getCardById,
        updateCardBalance,
        addDeposit,
        addWithdrawal,
        addPurchase,
        addTransfer,
        getCardTransactions,
        getAllTransactions,
      }}
    >
      {children}
    </PrepaidCardsContext.Provider>
  )
}

export function usePrepaidCards() {
  const context = useContext(PrepaidCardsContext)
  if (context === undefined) {
    throw new Error('usePrepaidCards must be used within a PrepaidCardsProvider')
  }
  return context
}
