'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export type CardTier = 'classic' | 'gold' | 'platinum' | 'titanium' | 'black'

export interface CardHolderInfo {
  fullName: string
  phoneNumber: string
  email: string
  nationalId: string
  address: string
}

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface CreditCard {
  // Database fields (snake_case)
  id: string
  user_id?: string
  card_name: string
  bank_name: string
  card_number_last_four: string
  card_type: 'visa' | 'mastercard' | 'amex' | 'other'
  credit_limit: number
  current_balance: number
  available_credit: number
  due_date: number
  minimum_payment: number
  interest_rate: number
  status: 'active' | 'blocked' | 'cancelled'
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  name?: string
  bankName?: string
  cardNumberLastFour?: string
  cardType?: 'visa' | 'mastercard' | 'amex' | 'other'
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

export interface Merchant {
  id: string
  name: string
  category?: string
  logo?: string
  installmentPlans?: any[]
}

interface CardsContextType {
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

const CardsContext = createContext<CardsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function CardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load cards from Supabase
  // ===================================
  const loadCards = async () => {
    if (!user) {
      setCards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading credit cards:', fetchError)
        setError(fetchError.message)
      } else {
        // تحويل البيانات من قاعدة البيانات إلى الصيغة المتوقعة
        const transformedCards = (data || []).map(card => {
          const creditLimit = Number(card.credit_limit) || 0
          const currentBalance = Number(card.current_balance) || 0

          return {
            ...card,
            // Map database fields to expected fields
            card_name: card.name || card.card_name,
            name: card.name,
            credit_limit: creditLimit,
            current_balance: currentBalance,
            available_credit: creditLimit - currentBalance,
            minimum_payment: 0,
            interest_rate: 0,
            status: card.status || 'active' as const,
            // Legacy compatibility
            creditLimit: creditLimit,
            currentBalance: currentBalance,
            isActive: (card.status || 'active') === 'active',
          }
        })
        setCards(transformedCards)
      }
    } catch (err) {
      console.error('Unexpected error loading credit cards:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  // ===================================
  // 🔄 Real-time subscription
  // ===================================
  useEffect(() => {
    if (!user) {
      setCards([])
      setLoading(false)
      return
    }

    loadCards()

    const channel: RealtimeChannel = supabase
      .channel('credit_cards_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_cards',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCard = payload.new as any
            const creditLimit = Number(newCard.credit_limit) || 0
            const currentBalance = Number(newCard.current_balance) || 0

            const transformedCard = {
              ...newCard,
              card_name: newCard.name || newCard.card_name,
              name: newCard.name,
              credit_limit: creditLimit,
              current_balance: currentBalance,
              available_credit: creditLimit - currentBalance,
              minimum_payment: 0,
              interest_rate: 0,
              status: newCard.status || 'active' as const,
              creditLimit: creditLimit,
              currentBalance: currentBalance,
              isActive: (newCard.status || 'active') === 'active',
            }
            setCards((prev) => [transformedCard, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedCard = payload.new as any
            const creditLimit = Number(updatedCard.credit_limit) || 0
            const currentBalance = Number(updatedCard.current_balance) || 0

            const transformedCard = {
              ...updatedCard,
              card_name: updatedCard.name || updatedCard.card_name,
              name: updatedCard.name,
              credit_limit: creditLimit,
              current_balance: currentBalance,
              available_credit: creditLimit - currentBalance,
              minimum_payment: 0,
              interest_rate: 0,
              status: updatedCard.status || 'active' as const,
              creditLimit: creditLimit,
              currentBalance: currentBalance,
              isActive: (updatedCard.status || 'active') === 'active',
            }
            setCards((prev) =>
              prev.map((card) =>
                card.id === transformedCard.id ? transformedCard : card
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) =>
              prev.filter((card) => card.id !== (payload.old as any).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase])

  // ===================================
  // ➕ Add card
  // ===================================
  const addCard = async (
    card: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<CreditCard | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('credit_cards')
        .insert([
          {
            user_id: user.id,
            name: card.card_name,
            bank_name: card.bank_name,
            card_number_last_four: card.card_number_last_four,
            card_type: card.card_type,
            credit_limit: card.credit_limit,
            current_balance: card.current_balance || 0,
            cashback_rate: 0,
            due_date: card.due_date,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding card:', insertError)
        setError(insertError.message)
        return null
      }

      if (data) {
        // تحويل البيانات من قاعدة البيانات إلى الصيغة المتوقعة
        const transformedCard = {
          ...data,
          card_name: data.name,
          available_credit: data.credit_limit - data.current_balance,
          minimum_payment: 0,
          interest_rate: 0,
          status: 'active' as const,
        }

        // تحديث قائمة البطاقات
        setCards(prevCards => [...prevCards, transformedCard])

        return transformedCard
      }

      return null
    } catch (err) {
      console.error('Unexpected error adding card:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update card
  // ===================================
  const updateCard = async (id: string, updates: Partial<CreditCard>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      // تحويل الحقول من card_name إلى name
      const dbUpdates: any = { ...updates }
      if (dbUpdates.card_name) {
        dbUpdates.name = dbUpdates.card_name
        delete dbUpdates.card_name
      }
      // تحويل currentBalance إلى current_balance
      if (dbUpdates.currentBalance !== undefined) {
        dbUpdates.current_balance = dbUpdates.currentBalance
        delete dbUpdates.currentBalance
      }
      // إزالة الحقول المحسوبة والحقول غير الموجودة في قاعدة البيانات
      delete dbUpdates.available_credit
      delete dbUpdates.minimum_payment
      delete dbUpdates.interest_rate
      delete dbUpdates.isActive

      const { error: updateError } = await supabase
        .from('credit_cards')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating card:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً بعد نجاح التحديث في قاعدة البيانات
      setCards(prev => prev.map(card =>
        card.id === id ? { ...card, ...updates } : card
      ))
    } catch (err) {
      console.error('Unexpected error updating card:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete card
  // ===================================
  const deleteCard = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting card:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting card:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🛒 Add purchase - updates card balance in DB
  // ===================================
  const addPurchase = async (purchase: Omit<Purchase, 'id'>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    const card = cards.find(c => c.id === purchase.cardId)
    if (!card) {
      setError('البطاقة غير موجودة')
      return
    }

    // حساب الرصيد الجديد (زيادة المديونية)
    const newBalance = (card.current_balance || 0) + purchase.amount
    const newAvailableCredit = (card.credit_limit || 0) - newBalance

    try {
      const { error: updateError } = await supabase
        .from('credit_cards')
        .update({
          current_balance: newBalance,
          available_credit: newAvailableCredit
        })
        .eq('id', purchase.cardId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating card balance for purchase:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً
      setCards(prev => prev.map(c =>
        c.id === purchase.cardId
          ? { ...c, current_balance: newBalance, available_credit: newAvailableCredit }
          : c
      ))

      // إضافة العملية للسجل المحلي
      const newPurchase = { ...purchase, id: Date.now().toString() }
      setPurchases((prev) => [newPurchase, ...prev])
    } catch (err) {
      console.error('Unexpected error during purchase:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 💳 Add payment - reduces card balance in DB
  // ===================================
  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    const card = cards.find(c => c.id === payment.cardId)
    if (!card) {
      setError('البطاقة غير موجودة')
      return
    }

    // حساب الرصيد الجديد (تقليل المديونية)
    const newBalance = Math.max(0, (card.current_balance || 0) - payment.amount)
    const newAvailableCredit = (card.credit_limit || 0) - newBalance

    try {
      const { error: updateError } = await supabase
        .from('credit_cards')
        .update({
          current_balance: newBalance,
          available_credit: newAvailableCredit
        })
        .eq('id', payment.cardId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating card balance for payment:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً
      setCards(prev => prev.map(c =>
        c.id === payment.cardId
          ? { ...c, current_balance: newBalance, available_credit: newAvailableCredit }
          : c
      ))

      // إضافة العملية للسجل المحلي
      const newPayment = { ...payment, id: Date.now().toString() }
      setPayments((prev) => [newPayment, ...prev])
    } catch (err) {
      console.error('Unexpected error during payment:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 📊 Helper functions
  // ===================================
  const getTotalCreditLimit = (): number => {
    return cards.reduce((sum, card) => sum + (card.credit_limit || 0), 0)
  }

  const getTotalBalance = (): number => {
    return cards.reduce((sum, card) => sum + (card.current_balance || 0), 0)
  }

  const getTotalAvailableCredit = (): number => {
    return cards.reduce((sum, card) => sum + (card.available_credit || 0), 0)
  }

  const getCardById = (id: string): CreditCard | undefined => {
    return cards.find((card) => card.id === id)
  }

  const getCardPurchases = (cardId: string): Purchase[] => {
    return purchases.filter((p) => p.cardId === cardId)
  }

  const getTotalCashback = (): number => {
    return purchases.reduce((sum, p) => sum + (p.cashbackEarned || 0), 0)
  }

  return (
    <CardsContext.Provider
      value={{
        cards,
        purchases,
        payments,
        loading,
        error,
        addCard,
        updateCard,
        deleteCard,
        addPurchase,
        addPayment,
        getTotalCreditLimit,
        getTotalBalance,
        getTotalAvailableCredit,
        getCardById,
        getCardPurchases,
        getTotalCashback,
      }}
    >
      {children}
    </CardsContext.Provider>
  )
}

export function useCards() {
  const context = useContext(CardsContext)
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider')
  }
  return context
}

