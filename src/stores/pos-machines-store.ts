import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface POSMachine {
  // Database fields (snake_case)
  id: string
  user_id?: string
  machine_name: string
  machine_number: string | null
  provider: string | null
  commission_rate: number | null
  status: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  machineName?: string
  machineNumber?: string
  machineProvider?: string
  commissionRate?: number
  machineStatus?: 'active' | 'inactive' | 'maintenance'
  location?: string
  serialNumber?: string
  installationDate?: string
  lastMaintenanceDate?: string
  monthlyTransactions?: number
  monthlyRevenue?: number
  totalTransactions?: number
  totalRevenue?: number
  notes?: string
}

interface POSMachinesState {
  posmachines: POSMachine[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addPOSMachine: (item: Omit<POSMachine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<POSMachine | null>
  updatePOSMachine: (id: string, updates: Partial<POSMachine>) => Promise<void>
  deletePOSMachine: (id: string) => Promise<void>
  getPOSMachineById: (id: string) => POSMachine | undefined
}

export const usePOSMachinesStore = create<POSMachinesState>((set, get) => ({
  posmachines: [],
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
        .from('pos_machines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ posmachines: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('pos_machines_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'pos_machines',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().posmachines
          if (payload.eventType === 'INSERT') {
            set({ posmachines: [payload.new as POSMachine, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ posmachines: current.map((item) => item.id === (payload.new as POSMachine).id ? (payload.new as POSMachine) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ posmachines: current.filter((item) => item.id !== (payload.old as POSMachine).id) })
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
    set({ initialized: false, channel: null, posmachines: [] })
  },

  addPOSMachine: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('pos_machines')
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

  updatePOSMachine: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('pos_machines')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deletePOSMachine: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('pos_machines')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getPOSMachineById: (id) => get().posmachines.find((item) => item.id === id),
}))
