import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface EWallet {
  id: string
  user_id?: string
  wallet_name: string
  provider: string
  phone_number: string
  balance: number
  currency: string
  status: string
  created_at?: string
  updated_at?: string
}

interface EWalletsState {
  wallets: EWallet[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addWallet: (wallet: Omit<EWallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<EWallet | null>
  updateWallet: (id: string, updates: Partial<EWallet>) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  updateBalance: (id: string, newBalance: number) => Promise<void>
  getWalletById: (id: string) => EWallet | undefined
  getTotalBalance: () => number
  getActiveWallets: () => EWallet[]
}

export const useEWalletsStore = create<EWalletsState>((set, get) => ({
  wallets: [],
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
        .from('e_wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ wallets: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('e_wallets_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'e_wallets',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().wallets
          if (payload.eventType === 'INSERT') {
            set({ wallets: [payload.new as EWallet, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ wallets: current.map((w) => w.id === (payload.new as EWallet).id ? (payload.new as EWallet) : w) })
          } else if (payload.eventType === 'DELETE') {
            set({ wallets: current.filter((w) => w.id !== (payload.old as EWallet).id) })
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
    set({ initialized: false, channel: null, wallets: [] })
  },

  addWallet: async (wallet) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('e_wallets')
        .insert([{ user_id: user.id, ...wallet }])
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

  updateWallet: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('e_wallets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteWallet: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('e_wallets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  updateBalance: async (id, newBalance) => {
    await get().updateWallet(id, { balance: newBalance })
  },

  getWalletById: (id) => get().wallets.find((w) => w.id === id),
  getTotalBalance: () => get().wallets.reduce((sum, w) => sum + (w.balance || 0), 0),
  getActiveWallets: () => get().wallets.filter((w) => w.status === 'active'),
}))

