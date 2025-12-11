'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { handleError } from '@/lib/error-handler'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { CreditCard, Purchase, Payment, CardsContextType } from './types'
import { transformCardFromDB, calculateBalanceAfterPurchase, calculateBalanceAfterPayment } from './helpers'

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

  // 📥 Load cards from Supabase
  const loadCards = async () => {
    if (!user) { setCards([]); setLoading(false); return }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setCards((data || []).map(card => transformCardFromDB(card)))
    } catch (err) {
      handleError('Cards.loadCards', err)
      setError('حدث خطأ في تحميل البطاقات')
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Real-time subscription
  useEffect(() => {
    if (!user) { setCards([]); setLoading(false); return }

    loadCards()

    const channel: RealtimeChannel = supabase
      .channel('credit_cards_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credit_cards', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCards((prev) => [transformCardFromDB(payload.new as Record<string, unknown>), ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const transformed = transformCardFromDB(payload.new as Record<string, unknown>)
            setCards((prev) => prev.map((card) => card.id === transformed.id ? transformed : card))
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((card) => card.id !== (payload.old as { id: string }).id))
          }
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [user, supabase])

  // ➕ Add card
  const addCard = async (
    card: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<CreditCard | null> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return null }

    try {
      const { data, error: insertError } = await supabase
        .from('credit_cards')
        .insert([{
          user_id: user.id,
          name: card.card_name,
          bank_name: card.bank_name,
          card_number_last_four: card.card_number_last_four,
          card_type: card.card_type,
          credit_limit: card.credit_limit,
          current_balance: card.current_balance || 0,
          cashback_rate: 0,
          due_date: card.due_date,
        }])
        .select()
        .single()

      if (insertError) throw insertError
      if (data) {
        const transformed = transformCardFromDB(data)
        setCards(prev => [...prev, transformed])
        return transformed
      }
      return null
    } catch (err) {
      handleError('Cards.addCard', err)
      setError('حدث خطأ في إضافة البطاقة')
      return null
    }
  }

  // 🔄 Update card
  const updateCard = async (id: string, updates: Partial<CreditCard>): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    try {
      const dbUpdates: Record<string, unknown> = { ...updates }
      if (dbUpdates.card_name) { dbUpdates.name = dbUpdates.card_name; delete dbUpdates.card_name }
      if (dbUpdates.currentBalance !== undefined) { dbUpdates.current_balance = dbUpdates.currentBalance; delete dbUpdates.currentBalance }
      delete dbUpdates.available_credit; delete dbUpdates.minimum_payment
      delete dbUpdates.interest_rate; delete dbUpdates.isActive

      const { error: updateError } = await supabase
        .from('credit_cards')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      setCards(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card))
    } catch (err) {
      handleError('Cards.updateCard', err)
      setError('حدث خطأ في تحديث البطاقة')
    }
  }

  // 🗑️ Delete card
  const deleteCard = async (id: string): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    try {
      const { error: deleteError } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
    } catch (err) {
      handleError('Cards.deleteCard', err)
      setError('حدث خطأ في حذف البطاقة')
    }
  }

  // 🛒 Add purchase
  const addPurchase = async (purchase: Omit<Purchase, 'id'>): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    const card = cards.find(c => c.id === purchase.cardId)
    if (!card) { setError('البطاقة غير موجودة'); return }

    const { newBalance, newAvailableCredit } = calculateBalanceAfterPurchase(card, purchase.amount)

    try {
      const { error: updateError } = await supabase
        .from('credit_cards')
        .update({ current_balance: newBalance, available_credit: newAvailableCredit })
        .eq('id', purchase.cardId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setCards(prev => prev.map(c =>
        c.id === purchase.cardId ? { ...c, current_balance: newBalance, available_credit: newAvailableCredit } : c
      ))
      setPurchases((prev) => [{ ...purchase, id: Date.now().toString() }, ...prev])
    } catch (err) {
      handleError('Cards.addPurchase', err)
      setError('حدث خطأ في عملية الشراء')
    }
  }

  // 💳 Add payment
  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<void> => {
    if (!user) { setError('يجب تسجيل الدخول أولاً'); return }

    const card = cards.find(c => c.id === payment.cardId)
    if (!card) { setError('البطاقة غير موجودة'); return }

    const { newBalance, newAvailableCredit } = calculateBalanceAfterPayment(card, payment.amount)

    try {
      const { error: updateError } = await supabase
        .from('credit_cards')
        .update({ current_balance: newBalance, available_credit: newAvailableCredit })
        .eq('id', payment.cardId)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setCards(prev => prev.map(c =>
        c.id === payment.cardId ? { ...c, current_balance: newBalance, available_credit: newAvailableCredit } : c
      ))
      setPayments((prev) => [{ ...payment, id: Date.now().toString() }, ...prev])
    } catch (err) {
      handleError('Cards.addPayment', err)
      setError('حدث خطأ في عملية السداد')
    }
  }

  // 📊 Helper functions
  const getTotalCreditLimit = () => cards.reduce((sum, card) => sum + (card.credit_limit || 0), 0)
  const getTotalBalance = () => cards.reduce((sum, card) => sum + (card.current_balance || 0), 0)
  const getTotalAvailableCredit = () => cards.reduce((sum, card) => sum + (card.available_credit || 0), 0)
  const getCardById = (id: string) => cards.find((card) => card.id === id)
  const getCardPurchases = (cardId: string) => purchases.filter((p) => p.cardId === cardId)
  const getTotalCashback = () => purchases.reduce((sum, p) => sum + (p.cashbackEarned || 0), 0)

  return (
    <CardsContext.Provider
      value={{
        cards, purchases, payments, loading, error,
        addCard, updateCard, deleteCard, addPurchase, addPayment,
        getTotalCreditLimit, getTotalBalance, getTotalAvailableCredit,
        getCardById, getCardPurchases, getTotalCashback,
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

