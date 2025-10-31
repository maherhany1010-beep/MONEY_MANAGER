import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface SavingsCircle {
  // Database fields (snake_case)
  id: string
  user_id?: string
  circle_name: string
  total_amount: number
  monthly_payment: number
  start_date: string
  end_date: string | null
  status: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  circleName?: string
  totalAmount?: number
  monthlyPayment?: number
  startDate?: string
  endDate?: string
  circleStatus?: 'active' | 'completed' | 'cancelled'
  numberOfMembers?: number
  currentRound?: number
  totalRounds?: number
  paymentDay?: number
  description?: string
  notes?: string
  amountPaid?: number
  remainingAmount?: number
}

interface SavingsCirclesState {
  savingscircles: SavingsCircle[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addSavingsCircle: (item: Omit<SavingsCircle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<SavingsCircle | null>
  updateSavingsCircle: (id: string, updates: Partial<SavingsCircle>) => Promise<void>
  deleteSavingsCircle: (id: string) => Promise<void>
  getSavingsCircleById: (id: string) => SavingsCircle | undefined
}

export const useSavingsCirclesStore = create<SavingsCirclesState>((set, get) => ({
  savingscircles: [],
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
        .from('savings_circles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ savingscircles: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('savings_circles_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'savings_circles',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().savingscircles
          if (payload.eventType === 'INSERT') {
            set({ savingscircles: [payload.new as SavingsCircle, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ savingscircles: current.map((item) => item.id === (payload.new as SavingsCircle).id ? (payload.new as SavingsCircle) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ savingscircles: current.filter((item) => item.id !== (payload.old as SavingsCircle).id) })
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
    set({ initialized: false, channel: null, savingscircles: [] })
  },

  addSavingsCircle: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('savings_circles')
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

  updateSavingsCircle: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('savings_circles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteSavingsCircle: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('savings_circles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getSavingsCircleById: (id) => get().savingscircles.find((item) => item.id === id),
}))
