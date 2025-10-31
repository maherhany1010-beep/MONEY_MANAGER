import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
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

interface CashbacksState {
  cashbacks: Cashback[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addCashback: (item: Omit<Cashback, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Cashback | null>
  updateCashback: (id: string, updates: Partial<Cashback>) => Promise<void>
  deleteCashback: (id: string) => Promise<void>
  getCashbackById: (id: string) => Cashback | undefined
}

export const useCashbacksStore = create<CashbacksState>((set, get) => ({
  cashbacks: [],
  loading: false,
  error: null,
  initialized: false,
  channel: null,

  initialize: async (userId: string) => {
    const state = get()
    if (state.initialized) return
    
    const supabase = createClientComponentClient()
    
    try {
      set({ loading: true, error: null })

      const { data, error: fetchError } = await supabase
        .from('cashback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ cashbacks: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('cashback_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'cashback',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().cashbacks
          if (payload.eventType === 'INSERT') {
            set({ cashbacks: [payload.new as Cashback, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ cashbacks: current.map((item) => item.id === (payload.new as Cashback).id ? (payload.new as Cashback) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ cashbacks: current.filter((item) => item.id !== (payload.old as Cashback).id) })
          }
        })
        .subscribe()

      set({ channel })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  cleanup: () => {
    const { channel } = get()
    if (channel) channel.unsubscribe()
    set({ initialized: false, channel: null, cashbacks: [] })
  },

  addCashback: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('cashback')
        .insert([{ user_id: user.id, ...item }])
        .select()
        .single()

      if (error) {
        set({ error: error.message })
        return null
      }
      return data
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  updateCashback: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('cashback')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteCashback: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('cashback')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getCashbackById: (id) => get().cashbacks.find((item) => item.id === id),
}))
