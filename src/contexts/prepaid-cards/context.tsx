'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { handleError, showSuccessToast } from '@/lib/error-handler'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { PrepaidCard, PrepaidCardsContextType, PrepaidTransaction } from './types'

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

  // 📥 Load cards from Supabase
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

      if (fetchError) throw fetchError
      setCards(data || [])
    } catch (err) {
      handleError('PrepaidCards.loadCards', err)
      setError('حدث خطأ في تحميل البطاقات')
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Real-time subscription
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
        { event: '*', schema: 'public', table: 'prepaid_cards', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCards((prev) => [payload.new as PrepaidCard, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((card) =>
                card.id === (payload.new as PrepaidCard).id ? (payload.new as PrepaidCard) : card
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((card) => card.id !== (payload.old as PrepaidCard).id))
          }
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [user, supabase])

  // ➕ Add card
  const addCard = async (
    card: Omit<PrepaidCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<PrepaidCard | null> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return null }

    try {
      const { data, error: insertError } = await supabase
        .from('prepaid_cards')
        .insert([{
          user_id: user.id,
          card_name: card.card_name,
          card_number: card.card_number,
          balance: card.balance,
          currency: card.currency || 'EGP',
          expiry_date: card.expiry_date,
          status: card.status || 'active',
        }])
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      handleError('PrepaidCards.addCard', err)
      setError('حدث خطأ في إضافة البطاقة')
      return null
    }
  }

  // 🔄 Update card
  const updateCard = async (id: string, updates: Partial<PrepaidCard>): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError
    } catch (err) {
      handleError('PrepaidCards.updateCard', err)
      setError('حدث خطأ في تحديث البطاقة')
    }
  }

  // 🗑️ Delete card
  const deleteCard = async (id: string): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    try {
      const { error: deleteError } = await supabase
        .from('prepaid_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
    } catch (err) {
      handleError('PrepaidCards.deleteCard', err)
      setError('حدث خطأ في حذف البطاقة')
    }
  }

  // 💰 Update balance
  const updateBalance = async (id: string, newBalance: number): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      setCards(prev => prev.map(card => card.id === id ? { ...card, balance: newBalance } : card))
    } catch (err) {
      handleError('PrepaidCards.updateBalance', err)
      setError('حدث خطأ في تحديث الرصيد')
    }
  }

  // 🔍 Helper functions
  const getCardById = (id: string) => cards.find((c) => c.id === id)
  const getTotalBalance = () => cards.reduce((sum, card) => sum + (card.balance || 0), 0)
  const updateCards = (newCards: PrepaidCard[]) => setCards(newCards)
  const getAllTransactions = (): PrepaidTransaction[] => []
  const getCardTransactions = (): PrepaidTransaction[] => []
  const updateCardBalance = (cardId: string, newBalance: number) => updateBalance(cardId, newBalance)

  // 🛒 Add purchase
  const addPurchase = async (cardId: string, amount: number, merchant: string, category?: string): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    const card = cards.find(c => c.id === cardId)
    if (!card) { setError('البطاقة غير موجودة'); return }

    const newBalance = card.balance - amount

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setCards(prev => prev.map(c => c.id === cardId ? {
        ...c,
        balance: newBalance,
        dailyUsed: (c.dailyUsed ?? 0) + amount,
        monthlyUsed: (c.monthlyUsed ?? 0) + amount,
      } : c))
    } catch (err) {
      handleError('PrepaidCards.addPurchase', err)
      setError('حدث خطأ في عملية الشراء')
    }
  }

  const addPrepaidPurchase = async (cardId: string, amount: number, merchant: string, category?: string, notes?: string) => {
    await addPurchase(cardId, amount, merchant, category)
  }

  // 💰 Add withdrawal
  const addWithdrawal = async (cardId: string, amount: number, location: string): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    const card = cards.find(c => c.id === cardId)
    if (!card) { setError('البطاقة غير موجودة'); return }

    const newBalance = card.balance - amount

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setCards(prev => prev.map(c => c.id === cardId ? {
        ...c,
        balance: newBalance,
        dailyUsed: (c.dailyUsed ?? 0) + amount,
        monthlyUsed: (c.monthlyUsed ?? 0) + amount,
      } : c))
    } catch (err) {
      handleError('PrepaidCards.addWithdrawal', err)
      setError('حدث خطأ في عملية السحب')
    }
  }

  // 🔄 Add transfer
  const addTransfer = async (fromCardId: string, amount: number, toCardId: string): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    const fromCard = cards.find(c => c.id === fromCardId)
    const toCard = cards.find(c => c.id === toCardId)

    if (!fromCard || !toCard) { setError('البطاقة غير موجودة'); return }
    if (fromCard.balance < amount) { setError('الرصيد غير كافٍ'); return }

    try {
      const newFromBalance = fromCard.balance - amount
      const { error: fromError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newFromBalance })
        .eq('id', fromCardId)
        .eq('user_id', user.id)

      if (fromError) throw fromError

      const newToBalance = toCard.balance + amount
      const { error: toError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newToBalance })
        .eq('id', toCardId)
        .eq('user_id', user.id)

      if (toError) {
        // Rollback
        await supabase.from('prepaid_cards').update({ balance: fromCard.balance }).eq('id', fromCardId)
        throw toError
      }

      setCards(prev => prev.map(card => {
        if (card.id === fromCardId) return { ...card, balance: newFromBalance }
        if (card.id === toCardId) return { ...card, balance: newToBalance }
        return card
      }))
    } catch (err) {
      handleError('PrepaidCards.addTransfer', err)
      setError('حدث خطأ أثناء التحويل')
    }
  }

  // 💰 Add deposit
  const addDeposit = async (cardId: string, amount: number, source: string, notes?: string): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    const card = cards.find(c => c.id === cardId)
    if (!card) { setError('البطاقة غير موجودة'); return }

    const newBalance = card.balance + amount

    try {
      const { error: updateError } = await supabase
        .from('prepaid_cards')
        .update({ balance: newBalance })
        .eq('id', cardId)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, balance: newBalance } : c))
    } catch (err) {
      handleError('PrepaidCards.addDeposit', err)
      setError('حدث خطأ في عملية الإيداع')
    }
  }

  return (
    <PrepaidCardsContext.Provider
      value={{
        cards, loading, error, transactions: [],
        addCard, updateCard, deleteCard, updateBalance, updateCardBalance,
        getCardById, getTotalBalance, updateCards,
        getAllTransactions, getCardTransactions,
        addPurchase, addPrepaidPurchase, addWithdrawal, addTransfer, addDeposit,
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

