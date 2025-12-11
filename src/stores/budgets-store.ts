import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Budget {
  id: string
  user_id?: string
  category: string
  amount: number
  period_start: string
  period_end: string
  spent_amount: number
  remaining_amount?: number
  status: 'active' | 'completed' | 'exceeded'
  alert_threshold: number
  created_at?: string
  updated_at?: string
}

interface BudgetsState {
  budgets: Budget[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  // Actions
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Budget | null>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  getBudgetByCategory: (category: string) => Budget | undefined
}

export const useBudgetsStore = create<BudgetsState>((set, get) => ({
  budgets: [],
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
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading budgets:', fetchError)
        set({ error: fetchError.message, loading: false })
        return
      }

      // Setup real-time subscription
      const channel = supabase
        .channel('budgets_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'budgets',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            console.log('Budget change received:', payload)
            
            // Reload data
            const { data: newData } = await supabase
              .from('budgets')
              .select('*')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
            
            if (newData) {
              set({ budgets: newData })
            }
          }
        )
        .subscribe()

      set({ 
        budgets: data || [], 
        loading: false, 
        initialized: true,
        channel 
      })
    } catch (err) {
      console.error('Unexpected error initializing budgets:', err)
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  cleanup: () => {
    const state = get()
    if (state.channel) {
      state.channel.unsubscribe()
    }
    set({ 
      budgets: [], 
      loading: false, 
      error: null, 
      initialized: false,
      channel: null 
    })
  },

  addBudget: async (budget) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return null
      }

      const { data, error: insertError } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user.id }])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding budget:', insertError)
        set({ error: insertError.message })
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding budget:', err)
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  updateBudget: async (id, updates) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: updateError } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating budget:', updateError)
        set({ error: updateError.message })
      }
    } catch (err) {
      console.error('Unexpected error updating budget:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteBudget: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting budget:', deleteError)
        set({ error: deleteError.message })
      }
    } catch (err) {
      console.error('Unexpected error deleting budget:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getBudgetByCategory: (category) => {
    const state = get()
    return state.budgets.find(b => b.category === category && b.status === 'active')
  },
}))

