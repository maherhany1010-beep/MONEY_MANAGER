import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Investment {
  // Database fields (snake_case)
  id: string
  user_id?: string
  investment_name: string
  investment_type: string
  initial_amount: number
  current_value: number
  expected_return: number | null
  start_date: string
  maturity_date: string | null
  status: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  investmentName?: string
  investmentType?: 'stocks' | 'bonds' | 'real_estate' | 'mutual_funds' | 'crypto' | 'other'
  initialAmount?: number
  currentValue?: number
  expectedReturn?: number
  returnRate?: number
  startDate?: string
  maturityDate?: string
  investmentStatus?: 'active' | 'matured' | 'sold' | 'cancelled'
  provider?: string
  accountNumber?: string
  riskLevel?: 'low' | 'medium' | 'high'
  currency?: string
  notes?: string
  profit?: number
  loss?: number
}

interface InvestmentsState {
  investments: Investment[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addInvestment: (item: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Investment | null>
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>
  deleteInvestment: (id: string) => Promise<void>
  getInvestmentById: (id: string) => Investment | undefined
}

export const useInvestmentsStore = create<InvestmentsState>((set, get) => ({
  investments: [],
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
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ investments: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('investments_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().investments
          if (payload.eventType === 'INSERT') {
            set({ investments: [payload.new as Investment, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ investments: current.map((item) => item.id === (payload.new as Investment).id ? (payload.new as Investment) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ investments: current.filter((item) => item.id !== (payload.old as Investment).id) })
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
    set({ initialized: false, channel: null, investments: [] })
  },

  addInvestment: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('investments')
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

  updateInvestment: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteInvestment: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getInvestmentById: (id) => get().investments.find((item) => item.id === id),
}))
