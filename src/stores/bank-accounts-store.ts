import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export interface BankAccount {
  // Database fields (snake_case)
  id: string
  user_id?: string
  account_name: string
  bank_name: string
  account_number: string
  balance: number
  currency: string
  account_type: string
  status: string
  created_at?: string
  updated_at?: string
  
  // Legacy fields (camelCase)
  accountName?: string
  bankName?: string
  accountNumber?: string
  accountBalance?: number
  accountCurrency?: string
  accountType?: 'checking' | 'savings' | 'business'
  accountStatus?: 'active' | 'inactive' | 'frozen'
  isActive?: boolean
  isDefault?: boolean
  iban?: string
  swift_code?: string
  swiftCode?: string
  dailyLimit?: number
  monthlyLimit?: number
  monthlySpending?: number
  totalDeposits?: number
  totalWithdrawals?: number
}

interface BankAccountsState {
  // State
  accounts: BankAccount[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  // Actions
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addAccount: (account: Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<BankAccount | null>
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  updateBalance: (id: string, newBalance: number) => Promise<void>
  
  // Helpers
  getAccountById: (id: string) => BankAccount | undefined
  getTotalBalance: () => number
  getActiveAccounts: () => BankAccount[]
}

// ===================================
// 🏪 Zustand Store
// ===================================
export const useBankAccountsStore = create<BankAccountsState>((set, get) => ({
  // Initial state
  accounts: [],
  loading: false,
  error: null,
  initialized: false,
  channel: null,

  // ===================================
  // 🚀 Initialize (load data + setup real-time)
  // ===================================
  initialize: async (userId: string) => {
    const state = get()
    
    // Prevent double initialization
    if (state.initialized) return
    
    const supabase = createClientComponentClient()
    
    try {
      set({ loading: true, error: null })

      // Load accounts
      const { data, error: fetchError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading bank accounts:', fetchError)
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ accounts: data || [], loading: false, initialized: true })

      // Setup real-time subscription
      const channel: RealtimeChannel = supabase
        .channel('bank_accounts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bank_accounts',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const currentAccounts = get().accounts
            
            if (payload.eventType === 'INSERT') {
              set({ accounts: [payload.new as BankAccount, ...currentAccounts] })
            } else if (payload.eventType === 'UPDATE') {
              set({
                accounts: currentAccounts.map((acc) =>
                  acc.id === (payload.new as BankAccount).id
                    ? (payload.new as BankAccount)
                    : acc
                ),
              })
            } else if (payload.eventType === 'DELETE') {
              set({
                accounts: currentAccounts.filter(
                  (acc) => acc.id !== (payload.old as BankAccount).id
                ),
              })
            }
          }
        )
        .subscribe()

      set({ channel })
    } catch (err) {
      console.error('Unexpected error initializing bank accounts:', err)
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  // ===================================
  // 🧹 Cleanup (unsubscribe)
  // ===================================
  cleanup: () => {
    const { channel } = get()
    if (channel) {
      channel.unsubscribe()
    }
    set({ initialized: false, channel: null, accounts: [] })
  },

  // ===================================
  // ➕ Add account
  // ===================================
  addAccount: async (account) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return null
      }

      const { data, error: insertError } = await supabase
        .from('bank_accounts')
        .insert([
          {
            user_id: user.id,
            account_name: account.account_name,
            bank_name: account.bank_name,
            account_number: account.account_number,
            balance: account.balance,
            currency: account.currency || 'EGP',
            account_type: account.account_type || 'checking',
            status: account.status || 'active',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding bank account:', insertError)
        set({ error: insertError.message })
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding bank account:', err)
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  // ===================================
  // 🔄 Update account
  // ===================================
  updateAccount: async (id, updates) => {
    const supabase = createClientComponentClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: updateError } = await supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating bank account:', updateError)
        set({ error: updateError.message })
        return
      }

      // تحديث الـ state المحلي فوراً بعد نجاح التحديث في قاعدة البيانات
      set(state => ({
        accounts: state.accounts.map(acc =>
          acc.id === id ? { ...acc, ...updates } : acc
        )
      }))
    } catch (err) {
      console.error('Unexpected error updating bank account:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  // ===================================
  // 🗑️ Delete account
  // ===================================
  deleteAccount: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting bank account:', deleteError)
        set({ error: deleteError.message })
      }
    } catch (err) {
      console.error('Unexpected error deleting bank account:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  // ===================================
  // 💰 Update balance
  // ===================================
  updateBalance: async (id, newBalance) => {
    await get().updateAccount(id, { balance: newBalance })
  },

  // ===================================
  // 🔍 Get account by ID
  // ===================================
  getAccountById: (id) => {
    return get().accounts.find((acc) => acc.id === id)
  },

  // ===================================
  // 💵 Get total balance
  // ===================================
  getTotalBalance: () => {
    return get().accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
  },

  // ===================================
  // ✅ Get active accounts
  // ===================================
  getActiveAccounts: () => {
    return get().accounts.filter((acc) => acc.status === 'active')
  },
}))

