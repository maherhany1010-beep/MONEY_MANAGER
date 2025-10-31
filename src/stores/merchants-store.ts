import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Merchant {
  // Database fields (snake_case)
  id: string
  user_id?: string
  merchant_name: string
  category: string | null
  total_spent: number
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  merchantName?: string
  merchantCategory?: string
  totalSpent?: number
  lastTransactionDate?: string
  transactionCount?: number
  averageTransactionAmount?: number
  phone?: string
  email?: string
  address?: string
  website?: string
  notes?: string
  isFavorite?: boolean
  rating?: number
  tags?: string[]
}

interface MerchantsState {
  merchants: Merchant[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addMerchant: (item: Omit<Merchant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Merchant | null>
  updateMerchant: (id: string, updates: Partial<Merchant>) => Promise<void>
  deleteMerchant: (id: string) => Promise<void>
  getMerchantById: (id: string) => Merchant | undefined
}

export const useMerchantsStore = create<MerchantsState>((set, get) => ({
  merchants: [],
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
        .from('merchants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ merchants: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('merchants_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'merchants',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().merchants
          if (payload.eventType === 'INSERT') {
            set({ merchants: [payload.new as Merchant, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ merchants: current.map((item) => item.id === (payload.new as Merchant).id ? (payload.new as Merchant) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ merchants: current.filter((item) => item.id !== (payload.old as Merchant).id) })
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
    set({ initialized: false, channel: null, merchants: [] })
  },

  addMerchant: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('merchants')
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

  updateMerchant: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('merchants')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteMerchant: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('merchants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getMerchantById: (id) => get().merchants.find((item) => item.id === id),
}))
