import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Customer {
  id: string
  user_id?: string
  customer_name: string
  phone: string | null
  email: string | null
  address: string | null
  created_at?: string
  updated_at?: string
  
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  totalPurchases?: number
  lastPurchaseDate?: string
}

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null

  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Customer | null>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  getCustomerById: (id: string) => Customer | undefined
  searchCustomers: (query: string) => Customer[]

  // Notification methods
  checkDebtThreshold: (customerId: string, currentDebt: number, threshold: number) => boolean
  checkOverdueInvoices: (customerId: string) => boolean

  // Invoice and Payment methods
  updateCustomerDebt: (customerId: string, amount: number, operation: 'increase' | 'decrease') => Promise<void>
  addInvoiceToStore: (customerId: string, invoice: any) => void
  addPaymentToStore: (customerId: string, payment: any) => void
  updateAccountBalance: (accountType: string, accountId: string, amount: number) => Promise<void>
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
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
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading customers:', fetchError)
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ customers: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('customers_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const currentCustomers = get().customers
            
            if (payload.eventType === 'INSERT') {
              set({ customers: [payload.new as Customer, ...currentCustomers] })
            } else if (payload.eventType === 'UPDATE') {
              set({
                customers: currentCustomers.map((c) =>
                  c.id === (payload.new as Customer).id ? (payload.new as Customer) : c
                ),
              })
            } else if (payload.eventType === 'DELETE') {
              set({
                customers: currentCustomers.filter((c) => c.id !== (payload.old as Customer).id),
              })
            }
          }
        )
        .subscribe()

      set({ channel })
    } catch (err) {
      console.error('Unexpected error initializing customers:', err)
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  cleanup: () => {
    const { channel } = get()
    if (channel) {
      channel.unsubscribe()
    }
    set({ initialized: false, channel: null, customers: [] })
  },

  addCustomer: async (customer) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return null
      }

      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            user_id: user.id,
            customer_name: customer.customer_name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding customer:', insertError)
        set({ error: insertError.message })
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding customer:', err)
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  updateCustomer: async (id, updates) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating customer:', updateError)
        set({ error: updateError.message })
      }
    } catch (err) {
      console.error('Unexpected error updating customer:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteCustomer: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting customer:', deleteError)
        set({ error: deleteError.message })
      }
    } catch (err) {
      console.error('Unexpected error deleting customer:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getCustomerById: (id) => {
    return get().customers.find((c) => c.id === id)
  },

  searchCustomers: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().customers.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(lowerQuery) ||
        c.phone?.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery)
    )
  },

  // Check if customer debt exceeds threshold
  checkDebtThreshold: (customerId: string, currentDebt: number, threshold: number) => {
    return currentDebt > threshold
  },

  // Check if customer has overdue invoices
  checkOverdueInvoices: (customerId: string) => {
    // This will be implemented in the context layer
    // where we have access to invoices data
    return false
  },

  // Update customer debt
  updateCustomerDebt: async (customerId: string, amount: number, operation: 'increase' | 'decrease') => {
    try {
      const supabase = createClientComponentClient()
      const customer = get().getCustomerById(customerId)

      if (!customer) {
        throw new Error('العميل غير موجود')
      }

      const currentDebt = (customer as any).currentDebt || 0
      const newDebt = operation === 'increase'
        ? currentDebt + amount
        : Math.max(0, currentDebt - amount)

      const { error } = await supabase
        .from('customers')
        .update({ current_debt: newDebt })
        .eq('id', customerId)

      if (error) throw error

      // Update local state
      set(state => ({
        customers: state.customers.map(c =>
          c.id === customerId
            ? { ...c, currentDebt: newDebt }
            : c
        ),
      }))
    } catch (err) {
      console.error('خطأ في تحديث المديونية:', err)
      throw err
    }
  },

  // Add invoice to local store
  addInvoiceToStore: (customerId: string, invoice: any) => {
    // This is handled by the context layer
    // The store just maintains customer data
    console.log('Invoice added for customer:', customerId, invoice)
  },

  // Add payment to local store
  addPaymentToStore: (customerId: string, payment: any) => {
    // This is handled by the context layer
    // The store just maintains customer data
    console.log('Payment added for customer:', customerId, payment)
  },

  // Update account balance (generic method for all account types)
  updateAccountBalance: async (accountType: string, accountId: string, amount: number) => {
    try {
      const supabase = createClientComponentClient()

      // Map account type to table name
      const tableMap: { [key: string]: string } = {
        'bank': 'bank_accounts',
        'e-wallet': 'e_wallets',
        'pos': 'pos_machines',
        'cash-vault': 'cash_vaults',
        'prepaid-card': 'prepaid_cards',
      }

      const tableName = tableMap[accountType]
      if (!tableName) {
        throw new Error(`نوع حساب غير معروف: ${accountType}`)
      }

      // Get current balance
      const { data: account, error: fetchError } = await supabase
        .from(tableName)
        .select('balance')
        .eq('id', accountId)
        .single()

      if (fetchError) throw fetchError

      const currentBalance = account?.balance || 0
      const newBalance = currentBalance + amount

      // Update balance
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ balance: newBalance })
        .eq('id', accountId)

      if (updateError) throw updateError

      console.log(`تم تحديث رصيد ${accountType} بمبلغ ${amount}`)
    } catch (err) {
      console.error('خطأ في تحديث رصيد الحساب:', err)
      throw err
    }
  },
}))

