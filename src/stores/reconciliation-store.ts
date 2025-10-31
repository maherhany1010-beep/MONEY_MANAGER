import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Reconciliation {
  // Database fields (snake_case)
  id: string
  user_id?: string
  account_id: string
  account_type: string
  reconciliation_date: string
  expected_balance: number
  actual_balance: number
  difference: number
  status: string
  notes: string | null
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  accountId?: string
  accountType?: 'bank' | 'wallet' | 'cash' | 'card' | 'prepaid'
  accountName?: string
  reconciliationDate?: string
  expectedBalance?: number
  actualBalance?: number
  balanceDifference?: number
  reconciliationStatus?: 'pending' | 'completed' | 'discrepancy'
  reconciliationNotes?: string
  resolvedBy?: string
  resolvedDate?: string
  discrepancyReason?: string
  adjustmentAmount?: number
  isResolved?: boolean
}

interface ReconciliationsState {
  reconciliations: Reconciliation[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addReconciliation: (item: Omit<Reconciliation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Reconciliation | null>
  updateReconciliation: (id: string, updates: Partial<Reconciliation>) => Promise<void>
  deleteReconciliation: (id: string) => Promise<void>
  getReconciliationById: (id: string) => Reconciliation | undefined
}

export const useReconciliationsStore = create<ReconciliationsState>((set, get) => ({
  reconciliations: [],
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
        .from('reconciliation')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ reconciliations: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('reconciliation_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'reconciliation',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().reconciliations
          if (payload.eventType === 'INSERT') {
            set({ reconciliations: [payload.new as Reconciliation, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ reconciliations: current.map((item) => item.id === (payload.new as Reconciliation).id ? (payload.new as Reconciliation) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ reconciliations: current.filter((item) => item.id !== (payload.old as Reconciliation).id) })
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
    set({ initialized: false, channel: null, reconciliations: [] })
  },

  addReconciliation: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('reconciliation')
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

  updateReconciliation: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('reconciliation')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteReconciliation: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('reconciliation')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getReconciliationById: (id) => get().reconciliations.find((item) => item.id === id),
}))
