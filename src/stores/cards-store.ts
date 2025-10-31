import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export type CardTier = 'classic' | 'gold' | 'platinum' | 'titanium' | 'black'

export interface CardHolderInfo {
  fullName: string
  phoneNumber: string
  email: string
  nationalId: string
  address: string
}

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface CreditCard {
  // Database fields (snake_case)
  id: string
  user_id?: string
  card_name: string
  bank_name: string
  card_number_last_four: string
  card_type: 'visa' | 'mastercard' | 'amex' | 'other'
  credit_limit: number
  current_balance: number
  available_credit: number
  due_date: number
  minimum_payment: number
  interest_rate: number
  status: 'active' | 'blocked' | 'cancelled'
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  name?: string
  bankName?: string
  cardNumberLastFour?: string
  cardType?: 'visa' | 'mastercard' | 'amex' | 'other'
  cardTier?: CardTier
  creditLimit?: number
  currentBalance?: number
  cashbackRate?: number
  rewardsPoints?: number
  annualFee?: number
  isDefault?: boolean
  isActive?: boolean
  expiryDate?: string
  cvv?: string
  holderInfo?: CardHolderInfo
  billingCycle?: number
  lastPaymentDate?: string
  lastPaymentAmount?: number
  totalSpent?: number
  monthlySpending?: number
  availableCredit?: number
  utilizationRate?: number
  notes?: string
}

interface CreditCardsState {
  creditcards: CreditCard[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addCreditCard: (item: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CreditCard | null>
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>
  deleteCreditCard: (id: string) => Promise<void>
  getCreditCardById: (id: string) => CreditCard | undefined
}

export const useCreditCardsStore = create<CreditCardsState>((set, get) => ({
  creditcards: [],
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
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ creditcards: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('credit_cards_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'credit_cards',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const current = get().creditcards
          if (payload.eventType === 'INSERT') {
            set({ creditcards: [payload.new as CreditCard, ...current] })
          } else if (payload.eventType === 'UPDATE') {
            set({ creditcards: current.map((item) => item.id === (payload.new as CreditCard).id ? (payload.new as CreditCard) : item) })
          } else if (payload.eventType === 'DELETE') {
            set({ creditcards: current.filter((item) => item.id !== (payload.old as CreditCard).id) })
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
    set({ initialized: false, channel: null, creditcards: [] })
  },

  addCreditCard: async (item) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('credit_cards')
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

  updateCreditCard: async (id, updates) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('credit_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteCreditCard: async (id) => {
    const supabase = createClientComponentClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) set({ error: error.message })
    } catch (err) {
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getCreditCardById: (id) => get().creditcards.find((item) => item.id === id),
}))
