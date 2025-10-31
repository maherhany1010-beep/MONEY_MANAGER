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
}))

