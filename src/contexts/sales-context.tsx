'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export interface SaleItem {
  id?: string
  invoice_id?: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
  
  // Legacy fields
  productId?: string
  productName?: string
  unitPrice?: number
  subtotal?: number
}

export interface Sale {
  // Database fields (snake_case) - sales_invoices table
  id: string
  user_id?: string
  customer_id: string | null
  invoice_number: string
  invoice_date: string
  total_amount: number
  paid_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  notes: string | null
  created_at?: string
  updated_at?: string
  
  // Related data
  items?: SaleItem[]
  
  // Legacy fields for backward compatibility
  invoiceNumber?: string
  customerId?: string
  customerName?: string
  subtotal?: number
  discount?: number
  discountType?: 'percentage' | 'fixed'
  tax?: number
  taxRate?: number
  total?: number
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer' | 'e_wallet' | 'deferred'
  amountPaid?: number
  change?: number
  date?: string
  createdAt?: string
}

interface SalesContextType {
  sales: Sale[]
  loading: boolean
  error: string | null
  addSale: (sale: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at'>, items: Omit<SaleItem, 'id' | 'invoice_id' | 'created_at'>[]) => Promise<Sale | null>
  updateSale: (id: string, updates: Partial<Sale>) => Promise<void>
  cancelSale: (id: string) => Promise<void>
  getSaleById: (id: string) => Sale | undefined
  getSalesByCustomer: (customerId: string) => Sale[]
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[]
  getTodaySales: () => Sale[]
  getTotalSales: (startDate?: string, endDate?: string) => number
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load sales from Supabase
  // ===================================
  const loadSales = async () => {
    if (!user) {
      setSales([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load sales with items
      const { data: salesData, error: fetchError } = await supabase
        .from('sales_invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading sales:', fetchError)
        setError(fetchError.message)
      } else {
        setSales(salesData || [])
      }
    } catch (err) {
      console.error('Unexpected error loading sales:', err)
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
      setSales([])
      setLoading(false)
      return
    }

    loadSales()

    const channel: RealtimeChannel = supabase
      .channel('sales_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_invoices',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            loadSales() // Reload to get items
          } else if (payload.eventType === 'UPDATE') {
            setSales((prev) =>
              prev.map((sale) =>
                sale.id === (payload.new as Sale).id
                  ? { ...sale, ...(payload.new as Sale) }
                  : sale
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setSales((prev) =>
              prev.filter((sale) => sale.id !== (payload.old as Sale).id)
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
  // 🔢 Generate invoice number
  // ===================================
  const generateInvoiceNumber = (): string => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}${month}${day}-${random}`
  }

  // ===================================
  // ➕ Add sale with items
  // ===================================
  const addSale = async (
    sale: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    items: Omit<SaleItem, 'id' | 'invoice_id' | 'created_at'>[]
  ): Promise<Sale | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      // 1. Insert invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('sales_invoices')
        .insert([
          {
            user_id: user.id,
            customer_id: sale.customer_id,
            invoice_number: sale.invoice_number || generateInvoiceNumber(),
            invoice_date: sale.invoice_date || new Date().toISOString().split('T')[0],
            total_amount: sale.total_amount,
            paid_amount: sale.paid_amount,
            status: sale.status || 'pending',
            notes: sale.notes,
          },
        ])
        .select()
        .single()

      if (invoiceError) {
        console.error('Error adding sale:', invoiceError)
        setError(invoiceError.message)
        return null
      }

      // 2. Insert items
      if (items.length > 0) {
        const itemsToInsert = items.map((item) => ({
          invoice_id: invoiceData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert)

        if (itemsError) {
          console.error('Error adding sale items:', itemsError)
          // Rollback: delete the invoice
          await supabase.from('sales_invoices').delete().eq('id', invoiceData.id)
          setError(itemsError.message)
          return null
        }
      }

      // Reload to get complete data
      await loadSales()

      return invoiceData
    } catch (err) {
      console.error('Unexpected error adding sale:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update sale
  // ===================================
  const updateSale = async (id: string, updates: Partial<Sale>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('sales_invoices')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating sale:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating sale:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // ❌ Cancel sale
  // ===================================
  const cancelSale = async (id: string): Promise<void> => {
    await updateSale(id, { status: 'cancelled' })
  }

  // ===================================
  // 🔍 Helper functions
  // ===================================
  const getSaleById = (id: string): Sale | undefined => {
    return sales.find((s) => s.id === id)
  }

  const getSalesByCustomer = (customerId: string): Sale[] => {
    return sales.filter((s) => s.customer_id === customerId)
  }

  const getSalesByDateRange = (startDate: string, endDate: string): Sale[] => {
    return sales.filter((s) => {
      const saleDate = s.invoice_date || s.date || ''
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  const getTodaySales = (): Sale[] => {
    const today = new Date().toISOString().split('T')[0]
    return sales.filter((s) => (s.invoice_date || s.date || '').startsWith(today))
  }

  const getTotalSales = (startDate?: string, endDate?: string): number => {
    let filteredSales = sales.filter((s) => s.status !== 'cancelled')
    
    if (startDate && endDate) {
      filteredSales = filteredSales.filter((s) => {
        const saleDate = s.invoice_date || s.date || ''
        return saleDate >= startDate && saleDate <= endDate
      })
    }
    
    return filteredSales.reduce((sum, s) => sum + (s.total_amount || s.total || 0), 0)
  }

  return (
    <SalesContext.Provider
      value={{
        sales,
        loading,
        error,
        addSale,
        updateSale,
        cancelSale,
        getSaleById,
        getSalesByCustomer,
        getSalesByDateRange,
        getTodaySales,
        getTotalSales,
      }}
    >
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const context = useContext(SalesContext)
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider')
  }
  return context
}

