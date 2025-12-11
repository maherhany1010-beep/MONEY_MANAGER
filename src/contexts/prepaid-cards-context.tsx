'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
  
  // Legacy fields for backward compatibility (camelCase)
  cardName?: string
  cardNumber?: string
  cardBalance?: number
  expiryDate?: string
  cardStatus?: 'active' | 'expired' | 'blocked'
  cardType?: string
  provider?: string
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

export interface PrepaidTransaction {
  id: string
  card_id: string
  cardId?: string
  type: 'purchase' | 'withdrawal' | 'transfer' | 'reload' | 'deposit' | 'transfer_in' | 'transfer_out'
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

export type TransactionType = 'all' | 'purchase' | 'withdrawal' | 'transfer' | 'reload' | 'deposit' | 'transfer_in' | 'transfer_out' | 'fee'

interface PrepaidCardsContextType {
  cards: PrepaidCard[]
  loading: boolean
  error: string | null
  addCard: (card: Omit<PrepaidCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<PrepaidCard | null>
  updateCard: (id: string, updates: Partial<PrepaidCard>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  updateBalance: (id: string, newBalance: number) => Promise<void>
  getCardById: (id: string) => PrepaidCard | undefined
  getTotalBalance: () => number
  updateCards: (cards: PrepaidCard[]) => void
  getAllTransactions: () => any[]
  addPurchase: (cardId: string, amount: number, merchant: string, category?: string) => Promise<void>
  addPrepaidPurchase: (cardId: string, amount: number, merchant: string, category?: string, notes?: string) => Promise<void>
  addWithdrawal: (cardId: string, amount: number, location: string) => Promise<void>
  updateCardBalance: (cardId: string, newBalance: number) => void
  addTransfer: (fromCardId: string, amount: number, toCardId: string) => Promise<void>
  transactions: any[]
  getCardTransactions: (cardId: string) => any[]
  addDeposit: (cardId: string, amount: number, source: string, notes?: string) => void
}

const PrepaidCardsContext = createContext<PrepaidCardsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function PrepaidCardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<PrepaidCard[]>([])
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
        .from('prepaid_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading prepaid cards:', fetchError)
        setError(fetchError.message)
      } else {
        setCards(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading prepaid cards:', err)
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
      .channel('prepaid_cards_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prepaid_cards',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCards((prev) => [payload.new as PrepaidCard, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((card) =>
                card.id === (payload.new as PrepaidCard).id
                  ? (payload.new as PrepaidCard)
                  : card
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) =>
              prev.filter((card) => card.id !== (payload.old as PrepaidCard).id)
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
    card: Omit<PrepaidCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<PrepaidCard | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('prepaid_cards')
        .insert([
          {
            user_id: user.id,
            card_name: card.card_name,
            card_number: card.card_number,
            balance: card.balance,
            currency: card.currency || 'EGP', // العملة الافتراضية: الجنيه المصري
            expiry_date: card.expiry_date,
            status: card.status || 'active',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding prepaid card:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding prepaid card:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update card
  // ===================================
  const updateCard = async (id: string, updates: Partial<PrepaidCard>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating prepaid card:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating prepaid card:', err)
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
        .from('prepaid_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting prepaid card:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting prepaid card:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 💰 Update balance
  // ===================================
  const updateBalance = async (id: string, newBalance: number): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating balance:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً بعد نجاح التحديث في قاعدة البيانات
      setCards(prev => prev.map(card =>
        card.id === id ? { ...card, balance: newBalance } : card
      ))
    } catch (err) {
      console.error('Unexpected error updating balance:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get card by ID
  // ===================================
  const getCardById = (id: string): PrepaidCard | undefined => {
    return cards.find((c) => c.id === id)
  }

  // ===================================
  // 💵 Get total balance
  // ===================================
  const getTotalBalance = (): number => {
    return cards.reduce((sum, card) => sum + (card.balance || 0), 0)
  }

  // ===================================
  // 🔄 Update cards
  // ===================================
  const updateCards = (newCards: PrepaidCard[]): void => {
    setCards(newCards)
  }

  // ===================================
  // 📋 Get all transactions (placeholder)
  // ===================================
  const getAllTransactions = (): any[] => {
    // This is a placeholder - in real implementation, this would fetch from database
    return []
  }

  // ===================================
  // 🛒 Add purchase
  // ===================================
  const addPurchase = async (cardId: string, amount: number, merchant: string, category?: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    const card = cards.find(c => c.id === cardId)
    if (!card) {
      setError('البطاقة غير موجودة')
      return
    }

    const newBalance = card.balance - amount

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating card balance for purchase:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            balance: newBalance,
            dailyUsed: (c.dailyUsed ?? 0) + amount,
            monthlyUsed: (c.monthlyUsed ?? 0) + amount,
          }
        }
        return c
      }))
    } catch (err) {
      console.error('Unexpected error during purchase:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 💰 Add withdrawal
  // ===================================
  const addWithdrawal = async (cardId: string, amount: number, location: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    const card = cards.find(c => c.id === cardId)
    if (!card) {
      setError('البطاقة غير موجودة')
      return
    }

    const newBalance = card.balance - amount

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating card balance for withdrawal:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً
      setCards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            balance: newBalance,
            dailyUsed: (c.dailyUsed ?? 0) + amount,
            monthlyUsed: (c.monthlyUsed ?? 0) + amount,
          }
        }
        return c
      }))
    } catch (err) {
      console.error('Unexpected error during withdrawal:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 💳 Update card balance (alias)
  // ===================================
  const updateCardBalance = (cardId: string, newBalance: number): void => {
    updateBalance(cardId, newBalance)
  }

  // ===================================
  // 🔄 Add transfer between prepaid cards
  // ===================================
  const addTransfer = async (fromCardId: string, amount: number, toCardId: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    const fromCard = cards.find(c => c.id === fromCardId)
    const toCard = cards.find(c => c.id === toCardId)

    if (!fromCard || !toCard) {
      setError('البطاقة غير موجودة')
      return
    }

    if (fromCard.balance < amount) {
      setError('الرصيد غير كافٍ')
      return
    }

    try {
      // خصم من البطاقة المصدر
      const newFromBalance = fromCard.balance - amount
      const { error: fromError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newFromBalance })
        .eq('id', fromCardId)
        .eq('user_id', user.id)

      if (fromError) {
        console.error('Error updating source card:', fromError)
        setError(fromError.message)
        return
      }

      // إضافة للبطاقة المستلمة
      const newToBalance = toCard.balance + amount
      const { error: toError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newToBalance })
        .eq('id', toCardId)
        .eq('user_id', user.id)

      if (toError) {
        console.error('Error updating destination card:', toError)
        setError(toError.message)
        // محاولة استرجاع الرصيد الأصلي
        await supabase
          .from('prepaid_cards')
          .update({ balance: fromCard.balance })
          .eq('id', fromCardId)
          .eq('user_id', user.id)
        return
      }

      // تحديث الـ state المحلي فوراً
      setCards(prev => prev.map(card => {
        if (card.id === fromCardId) {
          return { ...card, balance: newFromBalance }
        }
        if (card.id === toCardId) {
          return { ...card, balance: newToBalance }
        }
        return card
      }))
    } catch (err) {
      console.error('Unexpected error during transfer:', err)
      setError('حدث خطأ غير متوقع أثناء التحويل')
    }
  }

  // ===================================
  // 🛒 Add prepaid purchase (alias for addPurchase with notes)
  // ===================================
  const addPrepaidPurchase = async (cardId: string, amount: number, merchant: string, category?: string, notes?: string): Promise<void> => {
    await addPurchase(cardId, amount, merchant, category)
  }

  // ===================================
  // 📊 Get card transactions
  // ===================================
  const getCardTransactions = (cardId: string): any[] => {
    return []
  }

  // ===================================
  // 💰 Add deposit to card
  // ===================================
  const addDeposit = async (cardId: string, amount: number, source: string, notes?: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    const card = cards.find(c => c.id === cardId)
    if (!card) {
      setError('البطاقة غير موجودة')
      return
    }

    const newBalance = card.balance + amount

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating card balance for deposit:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً
      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, balance: newBalance } : c
      ))
    } catch (err) {
      console.error('Unexpected error during deposit:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  return (
    <PrepaidCardsContext.Provider
      value={{
        cards,
        loading,
        error,
        addCard,
        updateCard,
        deleteCard,
        updateBalance,
        getCardById,
        getTotalBalance,
        updateCards,
        getAllTransactions,
        addPurchase,
        addPrepaidPurchase,
        addWithdrawal,
        updateCardBalance,
        addTransfer,
        transactions: [],
        getCardTransactions,
        addDeposit,
      }}
    >
      {children}
    </PrepaidCardsContext.Provider>
  )
}

export function usePrepaidCards() {
  const context = useContext(PrepaidCardsContext)
  if (!context) {
    throw new Error('usePrepaidCards must be used within a PrepaidCardsProvider')
  }
  return context
}

