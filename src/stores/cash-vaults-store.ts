import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface CashVault {
  // Database fields (snake_case)
  id: string
  user_id?: string
  vault_name: string
  location: string | null
  balance: number
  currency: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  vaultName?: string
  isDefault?: boolean
  isActive?: boolean
  maxCapacity?: number
  minBalance?: number
  dailyWithdrawalLimit?: number
  managerName?: string
  managerPhone?: string
  managerEmail?: string
  vaultType?: 'main' | 'branch' | 'personal' | 'emergency'
  accessLevel?: 'public' | 'restricted' | 'private'
  requiresApproval?: boolean
  createdDate?: string
  lastAccessDate?: string
  totalDeposits?: number
  totalWithdrawals?: number
  monthlyDeposits?: number
  monthlyWithdrawals?: number
  transactionCount?: number
  notes?: string
  description?: string
}

interface CashVaultsState {
  cashvaults: CashVault[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addCashVault: (item: Omit<CashVault, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CashVault | null>
  updateCashVault: (id: string, updates: Partial<CashVault>) => Promise<void>
  deleteCashVault: (id: string) => Promise<void>
  getCashVaultById: (id: string) => CashVault | undefined
}

export const useCashVaultsStore = create<CashVaultsState>((set, get) => ({
  cashvaults: [],
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
        .from('cash_vaults')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ cashvaults: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('cash_vaults_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'cash_vaults',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().cashvaults
          if (payload.eventType === 'INSERT') {
            set({ cashvaults: [payload.new as CashVault, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ cashvaults: current.map((item) => item.id === (payload.new as CashVault).id ? (payload.new as CashVault) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ cashvaults: current.filter((item) => item.id !== (payload.old as CashVault).id) })
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
    set({ initialized: false, channel: null, cashvaults: [] })
  },

  addCashVault: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('cash_vaults')
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

  updateCashVault: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('cash_vaults')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteCashVault: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('cash_vaults')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getCashVaultById: (id) => get().cashvaults.find((item) => item.id === id),
}))
