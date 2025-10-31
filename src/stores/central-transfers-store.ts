import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface CentralTransfer {
  // Database fields (snake_case)
  id: string
  user_id?: string
  from_account: string
  to_account: string
  amount: number
  transfer_date: string
  notes: string | null
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  fromAccount?: string
  toAccount?: string
  transferAmount?: number
  transferDate?: string
  transferNotes?: string
  fromAccountType?: 'bank' | 'wallet' | 'cash' | 'card' | 'prepaid'
  toAccountType?: 'bank' | 'wallet' | 'cash' | 'card' | 'prepaid'
  status?: 'completed' | 'pending' | 'failed'
  reference?: string
  fees?: number
  exchangeRate?: number
  fromCurrency?: string
  toCurrency?: string
}

interface CentralTransfersState {
  centraltransfers: CentralTransfer[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addCentralTransfer: (item: Omit<CentralTransfer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CentralTransfer | null>
  updateCentralTransfer: (id: string, updates: Partial<CentralTransfer>) => Promise<void>
  deleteCentralTransfer: (id: string) => Promise<void>
  getCentralTransferById: (id: string) => CentralTransfer | undefined
}

export const useCentralTransfersStore = create<CentralTransfersState>((set, get) => ({
  centraltransfers: [],
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
        .from('central_transfers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ centraltransfers: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('central_transfers_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'central_transfers',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().centraltransfers
          if (payload.eventType === 'INSERT') {
            set({ centraltransfers: [payload.new as CentralTransfer, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ centraltransfers: current.map((item) => item.id === (payload.new as CentralTransfer).id ? (payload.new as CentralTransfer) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ centraltransfers: current.filter((item) => item.id !== (payload.old as CentralTransfer).id) })
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
    set({ initialized: false, channel: null, centraltransfers: [] })
  },

  addCentralTransfer: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('central_transfers')
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

  updateCentralTransfer: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('central_transfers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteCentralTransfer: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('central_transfers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getCentralTransferById: (id) => get().centraltransfers.find((item) => item.id === id),
}))
