import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
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
}

interface PrepaidCardsState {
  prepaidcards: PrepaidCard[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addPrepaidCard: (item: Omit<PrepaidCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<PrepaidCard | null>
  updatePrepaidCard: (id: string, updates: Partial<PrepaidCard>) => Promise<void>
  deletePrepaidCard: (id: string) => Promise<void>
  getPrepaidCardById: (id: string) => PrepaidCard | undefined
}

export const usePrepaidCardsStore = create<PrepaidCardsState>((set, get) => ({
  prepaidcards: [],
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
        .from('prepaid_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ prepaidcards: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('prepaid_cards_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'prepaid_cards',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().prepaidcards
          if (payload.eventType === 'INSERT') {
            set({ prepaidcards: [payload.new as PrepaidCard, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ prepaidcards: current.map((item) => item.id === (payload.new as PrepaidCard).id ? (payload.new as PrepaidCard) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ prepaidcards: current.filter((item) => item.id !== (payload.old as PrepaidCard).id) })
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
    set({ initialized: false, channel: null, prepaidcards: [] })
  },

  addPrepaidCard: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('prepaid_cards')
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

  updatePrepaidCard: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('prepaid_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deletePrepaidCard: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('prepaid_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getPrepaidCardById: (id) => get().prepaidcards.find((item) => item.id === id),
}))
