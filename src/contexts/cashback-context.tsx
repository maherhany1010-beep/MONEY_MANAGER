'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Cashback {
  // Database fields (snake_case)
  id: string
  user_id?: string
  source: string
  amount: number
  cashback_date: string
  status: string
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  cashbackSource?: string
  cashbackAmount?: number
  cashbackDate?: string
  cashbackStatus?: 'pending' | 'received' | 'expired'
  merchant?: string
  cardId?: string
  cardName?: string
  transactionId?: string
  transactionAmount?: number
  cashbackRate?: number
  expiryDate?: string
  notes?: string
  category?: string
  isRedeemed?: boolean
}

interface CashbackContextType {
  cashbacks: Cashback[]
  loading: boolean
  error: string | null
  addCashback: (cashback: Omit<Cashback, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Cashback | null>
  updateCashback: (id: string, updates: Partial<Cashback>) => Promise<void>
  deleteCashback: (id: string) => Promise<void>
  getCashbackById: (id: string) => Cashback | undefined
  getCashbacksBySource: (source: string) => Cashback[]
  getTotalCashback: () => number
  getPendingCashback: () => number
  getReceivedCashback: () => number
  getCardCashbackRecords: (cardId: string) => any[]
  getCardRedemptions: (cardId: string) => any[]
  getCardStats: (cardId: string) => any
  processAutomaticRedemptions: (cardId: string) => void
  addCashbackRecord: (record: any) => Promise<void>
  getCardSettings: (cardId: string) => any
  updateCardSettings: (cardId: string, settings: any) => Promise<void>
  getCashbackRecord: (recordId: string) => any
  redeemCashback: (recordId: string, amount: number) => Promise<void>
}

const CashbackContext = createContext<CashbackContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function CashbackProvider({ children }: { children: ReactNode }) {
  const [cashbacks, setCashbacks] = useState<Cashback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load cashbacks from Supabase
  // ===================================
  const loadCashbacks = async () => {
    if (!user) {
      setCashbacks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('cashback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading cashback:', fetchError)
        setError(fetchError.message)
      } else {
        setCashbacks(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading cashback:', err)
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
      setCashbacks([])
      setLoading(false)
      return
    }

    loadCashbacks()

    const channel: RealtimeChannel = supabase
      .channel('cashback_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cashback',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCashbacks((prev) => [payload.new as Cashback, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCashbacks((prev) =>
              prev.map((cashback) =>
                cashback.id === (payload.new as Cashback).id
                  ? (payload.new as Cashback)
                  : cashback
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCashbacks((prev) =>
              prev.filter((cashback) => cashback.id !== (payload.old as Cashback).id)
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
  // ➕ Add cashback
  // ===================================
  const addCashback = async (
    cashback: Omit<Cashback, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Cashback | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('cashback')
        .insert([
          {
            user_id: user.id,
            source: cashback.source,
            amount: cashback.amount,
            cashback_date: cashback.cashback_date || new Date().toISOString().split('T')[0],
            status: cashback.status || 'pending',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding cashback:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding cashback:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update cashback
  // ===================================
  const updateCashback = async (id: string, updates: Partial<Cashback>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('cashback')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating cashback:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating cashback:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete cashback
  // ===================================
  const deleteCashback = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('cashback')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting cashback:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting cashback:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get cashback by ID
  // ===================================
  const getCashbackById = (id: string): Cashback | undefined => {
    return cashbacks.find((c) => c.id === id)
  }

  // ===================================
  // 📂 Get cashbacks by source
  // ===================================
  const getCashbacksBySource = (source: string): Cashback[] => {
    return cashbacks.filter((c) => c.source === source)
  }

  // ===================================
  // 💰 Get total cashback
  // ===================================
  const getTotalCashback = (): number => {
    return cashbacks.reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  // ===================================
  // ⏳ Get pending cashback
  // ===================================
  const getPendingCashback = (): number => {
    return cashbacks
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  // ===================================
  // ✅ Get received cashback
  // ===================================
  const getReceivedCashback = (): number => {
    return cashbacks
      .filter((c) => c.status === 'received')
      .reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  // ===================================
  // 💳 Get card cashback records
  // ===================================
  const getCardCashbackRecords = (cardId: string): any[] => {
    return cashbacks.filter((c) => c.source === cardId || c.cardId === cardId)
  }

  // ===================================
  // 🎁 Get card redemptions
  // ===================================
  const getCardRedemptions = (cardId: string): any[] => {
    return cashbacks.filter((c) => (c.source === cardId || c.cardId === cardId) && c.isRedeemed)
  }

  // ===================================
  // 📊 Get card stats
  // ===================================
  const getCardStats = (cardId: string): any => {
    const records = getCardCashbackRecords(cardId)
    return {
      totalEarned: records.reduce((sum, r) => sum + (r.amount || 0), 0),
      totalRedeemed: records.filter(r => r.isRedeemed).reduce((sum, r) => sum + (r.amount || 0), 0),
      available: records.filter(r => !r.isRedeemed).reduce((sum, r) => sum + (r.amount || 0), 0),
    }
  }

  // ===================================
  // 🔄 Process automatic redemptions
  // ===================================
  const processAutomaticRedemptions = (cardId: string): void => {
    // Placeholder for automatic redemption logic
    console.log('Processing automatic redemptions for card:', cardId)
  }

  // ===================================
  // ➕ Add cashback record
  // ===================================
  const addCashbackRecord = async (record: any): Promise<void> => {
    await addCashback(record)
  }

  // ===================================
  // ⚙️ Get card settings
  // ===================================
  const getCardSettings = (cardId: string): any => {
    return {
      autoRedeem: false,
      redeemThreshold: 100,
      notifyOnEarn: true,
    }
  }

  // ===================================
  // 🔧 Update card settings
  // ===================================
  const updateCardSettings = async (cardId: string, settings: any): Promise<void> => {
    console.log('Updating card settings:', cardId, settings)
  }

  // ===================================
  // 📄 Get cashback record
  // ===================================
  const getCashbackRecord = (recordId: string): any => {
    return getCashbackById(recordId)
  }

  // ===================================
  // 💰 Redeem cashback
  // ===================================
  const redeemCashback = async (recordId: string, amount: number): Promise<void> => {
    await updateCashback(recordId, { isRedeemed: true, status: 'received' })
  }

  return (
    <CashbackContext.Provider
      value={{
        cashbacks,
        loading,
        error,
        addCashback,
        updateCashback,
        deleteCashback,
        getCashbackById,
        getCashbacksBySource,
        getTotalCashback,
        getPendingCashback,
        getReceivedCashback,
        getCardCashbackRecords,
        getCardRedemptions,
        getCardStats,
        processAutomaticRedemptions,
        addCashbackRecord,
        getCardSettings,
        updateCardSettings,
        getCashbackRecord,
        redeemCashback,
      }}
    >
      {children}
    </CashbackContext.Provider>
  )
}

export function useCashback() {
  const context = useContext(CashbackContext)
  if (!context) {
    throw new Error('useCashback must be used within a CashbackProvider')
  }
  return context
}

