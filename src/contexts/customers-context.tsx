'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Customer {
  // Database fields (snake_case)
  id: string
  user_id?: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  customerName?: string
  phoneNumber?: string
  emailAddress?: string
  customerAddress?: string
  customerNotes?: string
  totalPurchases?: number
  lastPurchaseDate?: string
  customerType?: 'regular' | 'vip' | 'wholesale'
  creditLimit?: number
  currentBalance?: number
  isActive?: boolean
  fullName?: string
  company?: string
  status?: string
  category?: string
  profession?: string
  currentDebt?: number
  totalPayments?: number
  registrationDate?: string
  openingBalance?: number
  createdAt?: string
  updatedAt?: string
  commercialRegister?: string
  debtAlertThreshold?: number
}

interface CustomersContextType {
  customers: Customer[]
  loading: boolean
  error: string | null
  addCustomer: (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Customer | null>
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  getCustomerById: (id: string) => Customer | undefined
  searchCustomers: (query: string | object) => Customer[]
  getCustomer: (id: string) => Customer | undefined
  addInvoice: (customerId: string, invoice: any) => void
  addPayment: (customerId: string, payment: any) => void
  getCustomerInvoices: (customerId: string) => any[]
  getCustomerPayments: (customerId: string) => any[]
  getCustomerTransactions: (customerId: string) => any[]
  exportCustomers: () => void
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load customers from Supabase
  // ===================================
  const loadCustomers = async () => {
    if (!user) {
      setCustomers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading customers:', fetchError)
        setError(fetchError.message)
      } else {
        setCustomers(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading customers:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  // ===================================
  // 🔄 Real-time subscription
  // ===================================
  useEffect(() => {
    if (!user) {
      setCustomers([])
      setLoading(false)
      return
    }

    loadCustomers()

    const channel: RealtimeChannel = supabase
      .channel('customers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCustomers((prev) => [payload.new as Customer, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCustomers((prev) =>
              prev.map((customer) =>
                customer.id === (payload.new as Customer).id
                  ? (payload.new as Customer)
                  : customer
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCustomers((prev) =>
              prev.filter((customer) => customer.id !== (payload.old as Customer).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase])

  // ===================================
  // ➕ Add customer
  // ===================================
  const addCustomer = async (
    customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Customer | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            user_id: user.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            notes: customer.notes,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding customer:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding customer:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update customer
  // ===================================
  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating customer:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating customer:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete customer
  // ===================================
  const deleteCustomer = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting customer:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting customer:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get customer by ID
  // ===================================
  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find((c) => c.id === id)
  }

  // ===================================
  // 🔎 Search customers
  // ===================================
  const searchCustomers = (query: string | object): Customer[] => {
    if (typeof query === 'string') {
      const lowerQuery = query.toLowerCase()
      return customers.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.phone?.toLowerCase().includes(lowerQuery) ||
          c.email?.toLowerCase().includes(lowerQuery)
      )
    }
    // If query is an object (filters), return all customers for now
    // The filtering will be done in the component
    return customers
  }

  // ===================================
  // 🔍 Get customer (alias)
  // ===================================
  const getCustomer = (id: string): Customer | undefined => {
    return getCustomerById(id)
  }

  // ===================================
  // 📄 Add invoice (placeholder)
  // ===================================
  const addInvoice = (customerId: string, invoice: any): void => {
    // Placeholder - in real implementation, this would save to database
    console.log('Add invoice for customer:', customerId, invoice)
  }

  // ===================================
  // 💰 Add payment (placeholder)
  // ===================================
  const addPayment = (customerId: string, payment: any): void => {
    // Placeholder - in real implementation, this would save to database
    console.log('Add payment for customer:', customerId, payment)
  }

  // ===================================
  // 📋 Get customer invoices (placeholder)
  // ===================================
  const getCustomerInvoices = (customerId: string): any[] => {
    // Placeholder - in real implementation, this would fetch from database
    return []
  }

  // ===================================
  // 💰 Get customer payments (placeholder)
  // ===================================
  const getCustomerPayments = (customerId: string): any[] => {
    // Placeholder - in real implementation, this would fetch from database
    return []
  }

  // ===================================
  // 📊 Get customer transactions (placeholder)
  // ===================================
  const getCustomerTransactions = (customerId: string): any[] => {
    // Placeholder - in real implementation, this would fetch from database
    return []
  }

  const exportCustomers = () => {
    // Placeholder - implement export functionality
    console.log('Exporting customers...')
  }

  return (
    <CustomersContext.Provider
      value={{
        customers,
        loading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        searchCustomers,
        getCustomer,
        addInvoice,
        addPayment,
        getCustomerInvoices,
        getCustomerPayments,
        getCustomerTransactions,
        exportCustomers,
      }}
    >
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const context = useContext(CustomersContext)
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider')
  }
  return context
}

