'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CardTier = 'classic' | 'gold' | 'platinum' | 'titanium' | 'black'

export interface CardHolderInfo {
  fullName: string
  phoneNumber: string
  email: string
  nationalId: string
  address: string
}

export interface CreditCard {
  id: string
  name: string
  bankName: string
  cardNumberLastFour: string
  cardType: 'visa' | 'mastercard' | 'amex' | 'other'
  cardTier: CardTier
  creditLimit: number
  currentBalance: number
  cashbackRate: number
  dueDate: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  // Card Holder Info
  holderInfo?: CardHolderInfo
  // Fees & Charges
  annualFee?: number
  cashWithdrawalFee?: number
  latePaymentFee?: number
  overLimitFee?: number
  annualInterestRate?: number
  foreignTransactionFee?: number
  cardReplacementFee?: number
}

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

export interface Payment {
  id: string
  cardId: string
  amount: number
  date: string
  type: 'minimum' | 'full' | 'custom'
  description?: string
}

interface CardsContextType {
  cards: CreditCard[]
  purchases: Purchase[]
  payments: Payment[]
  addCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCard: (id: string, updates: Partial<CreditCard>) => void
  deleteCard: (id: string) => void
  deleteCards: (ids: string[]) => void
  toggleCardActive: (id: string) => void
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void
  addPayment: (payment: Omit<Payment, 'id'>) => void
  getCardById: (id: string) => CreditCard | undefined
  getCardPurchases: (cardId: string) => Purchase[]
  getCardPayments: (cardId: string) => Payment[]
  getTotalCreditLimit: () => number
  getTotalBalance: () => number
  getTotalCashback: () => number
  importCards: (cards: CreditCard[]) => void
  clearAllData: () => void
}

const CardsContext = createContext<CardsContextType | undefined>(undefined)

const STORAGE_KEY = 'credit-cards-data'

// Mock initial data
const initialCards: CreditCard[] = [
  {
    id: '1',
    name: 'بطاقة البنك الأهلي المصري الذهبية',
    bankName: 'البنك الأهلي المصري',
    cardNumberLastFour: '1234',
    cardType: 'visa',
    cardTier: 'gold',
    creditLimit: 80000,
    currentBalance: 18500,
    cashbackRate: 2.5,
    dueDate: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    holderInfo: {
      fullName: 'أحمد محمد علي',
      phoneNumber: '+20 100 123 4567',
      email: 'ahmed.mohamed@example.com',
      nationalId: '29012011234567',
      address: 'القاهرة، مصر الجديدة، شارع النزهة',
    },
  },
  {
    id: '2',
    name: 'بطاقة بنك مصر البلاتينية',
    bankName: 'بنك مصر',
    cardNumberLastFour: '5678',
    cardType: 'mastercard',
    cardTier: 'platinum',
    creditLimit: 100000,
    currentBalance: 15750,
    cashbackRate: 3.0,
    dueDate: 25,
    isActive: true,
    createdAt: new Date().toISOString(),
    holderInfo: {
      fullName: 'فاطمة حسن محمود',
      phoneNumber: '+20 101 234 5678',
      email: 'fatma.hassan@example.com',
      nationalId: '29105011234568',
      address: 'الجيزة، المهندسين، شارع جامعة الدول العربية',
    },
  },
  {
    id: '3',
    name: 'بطاقة البنك التجاري الدولي الكلاسيكية',
    bankName: 'البنك التجاري الدولي',
    cardNumberLastFour: '9012',
    cardType: 'visa',
    cardTier: 'classic',
    creditLimit: 60000,
    currentBalance: 11000,
    cashbackRate: 1.8,
    dueDate: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    holderInfo: {
      fullName: 'محمد أحمد السيد',
      phoneNumber: '+20 102 345 6789',
      email: 'mohamed.ahmed@example.com',
      nationalId: '29203011234569',
      address: 'الإسكندرية، سموحة، شارع فوزي معاذ',
    },
  },
]

export function CardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setCards(data.cards || initialCards)
        setPurchases(data.purchases || [])
        setPayments(data.payments || [])
      } catch (error) {
        console.error('Error loading cards data:', error)
        setCards(initialCards)
      }
    } else {
      setCards(initialCards)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cards, purchases, payments })
      )
    }
  }, [cards, purchases, payments])

  const addCard = (cardData: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: CreditCard = {
      ...cardData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCards(prev => [...prev, newCard])
  }

  const updateCard = (id: string, updates: Partial<CreditCard>) => {
    setCards(prev =>
      prev.map(card =>
        card.id === id
          ? { ...card, ...updates, updatedAt: new Date().toISOString() }
          : card
      )
    )
  }

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id))
    setPurchases(prev => prev.filter(p => p.cardId !== id))
    setPayments(prev => prev.filter(p => p.cardId !== id))
  }

  const deleteCards = (ids: string[]) => {
    setCards(prev => prev.filter(card => !ids.includes(card.id)))
    setPurchases(prev => prev.filter(p => !ids.includes(p.cardId)))
    setPayments(prev => prev.filter(p => !ids.includes(p.cardId)))
  }

  const toggleCardActive = (id: string) => {
    setCards(prev =>
      prev.map(card =>
        card.id === id
          ? { ...card, isActive: !card.isActive, updatedAt: new Date().toISOString() }
          : card
      )
    )
  }

  const addPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: Date.now().toString(),
    }
    setPurchases(prev => [...prev, newPurchase])
    
    // Update card balance
    updateCard(purchaseData.cardId, {
      currentBalance: (getCardById(purchaseData.cardId)?.currentBalance || 0) + purchaseData.amount,
    })
  }

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
    }
    setPayments(prev => [...prev, newPayment])
    
    // Update card balance
    updateCard(paymentData.cardId, {
      currentBalance: (getCardById(paymentData.cardId)?.currentBalance || 0) - paymentData.amount,
    })
  }

  const getCardById = (id: string) => {
    return cards.find(card => card.id === id)
  }

  const getCardPurchases = (cardId: string) => {
    return purchases.filter(p => p.cardId === cardId)
  }

  const getCardPayments = (cardId: string) => {
    return payments.filter(p => p.cardId === cardId)
  }

  const getTotalCreditLimit = () => {
    return cards.reduce((sum, card) => sum + card.creditLimit, 0)
  }

  const getTotalBalance = () => {
    return cards.reduce((sum, card) => sum + card.currentBalance, 0)
  }

  const getTotalCashback = () => {
    return purchases.reduce((sum, purchase) => sum + purchase.cashbackEarned, 0)
  }

  const importCards = (importedCards: CreditCard[]) => {
    setCards(importedCards)
  }

  const clearAllData = () => {
    setCards([])
    setPurchases([])
    setPayments([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <CardsContext.Provider
      value={{
        cards,
        purchases,
        payments,
        addCard,
        updateCard,
        deleteCard,
        deleteCards,
        toggleCardActive,
        addPurchase,
        addPayment,
        getCardById,
        getCardPurchases,
        getCardPayments,
        getTotalCreditLimit,
        getTotalBalance,
        getTotalCashback,
        importCards,
        clearAllData,
      }}
    >
      {children}
    </CardsContext.Provider>
  )
}

export function useCards() {
  const context = useContext(CardsContext)
  if (context === undefined) {
    throw new Error('useCards must be used within a CardsProvider')
  }
  return context
}

