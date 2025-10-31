import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at?: string
  updated_at?: string
}

export interface SaleInvoice {
  id: string
  user_id?: string
  customer_id: string | null
  invoice_number: string
  invoice_date: string
  total_amount: number
  payment_method: string
  status: string
  notes: string | null
  created_at?: string
  updated_at?: string
  
  // Relations
  items?: InvoiceItem[]
  
  // Legacy fields
  customerId?: string
  invoiceNumber?: string
  invoiceDate?: string
  totalAmount?: number
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'installment'
  invoiceStatus?: 'paid' | 'pending' | 'cancelled'
  invoiceNotes?: string
}

interface SalesState {
  sales: SaleInvoice[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null
  
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  addSale: (sale: Omit<SaleInvoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[]) => Promise<SaleInvoice | null>
  updateSale: (id: string, updates: Partial<SaleInvoice>) => Promise<void>
  deleteSale: (id: string) => Promise<void>
  
  getSaleById: (id: string) => SaleInvoice | undefined
  getSalesByCustomer: (customerId: string) => SaleInvoice[]
  getSalesByDateRange: (startDate: string, endDate: string) => SaleInvoice[]
  getTodaySales: () => SaleInvoice[]
  getTotalSales: () => number
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
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
        .from('sales_invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading sales:', fetchError)
        set({ error: fetchError.message, loading: false })
        return
      }

      set({ sales: data || [], loading: false, initialized: true })

      const channel: RealtimeChannel = supabase
        .channel('sales_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sales_invoices',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            const currentSales = get().sales
            
            if (payload.eventType === 'INSERT') {
              // Fetch items for new sale
              const { data: items } = await supabase
                .from('invoice_items')
                .select('*')
                .eq('invoice_id', (payload.new as SaleInvoice).id)
              
              const newSale = { ...payload.new as SaleInvoice, items: items || [] }
              set({ sales: [newSale, ...currentSales] })
            } else if (payload.eventType === 'UPDATE') {
              set({
                sales: currentSales.map((sale) =>
                  sale.id === (payload.new as SaleInvoice).id
                    ? { ...payload.new as SaleInvoice, items: sale.items }
                    : sale
                ),
              })
            } else if (payload.eventType === 'DELETE') {
              set({
                sales: currentSales.filter(
                  (sale) => sale.id !== (payload.old as SaleInvoice).id
                ),
              })
            }
          }
        )
        .subscribe()

      set({ channel })
    } catch (err) {
      console.error('Unexpected error initializing sales:', err)
      set({ error: 'حدث خطأ غير متوقع', loading: false })
    }
  },

  cleanup: () => {
    const { channel } = get()
    if (channel) {
      channel.unsubscribe()
    }
    set({ initialized: false, channel: null, sales: [] })
  },

  addSale: async (sale, items) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return null
      }

      // Insert invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('sales_invoices')
        .insert([
          {
            user_id: user.id,
            customer_id: sale.customer_id,
            invoice_number: sale.invoice_number,
            invoice_date: sale.invoice_date || new Date().toISOString().split('T')[0],
            total_amount: sale.total_amount,
            payment_method: sale.payment_method || 'cash',
            status: sale.status || 'paid',
            notes: sale.notes,
          },
        ])
        .select()
        .single()

      if (invoiceError) {
        console.error('Error adding sale invoice:', invoiceError)
        set({ error: invoiceError.message })
        return null
      }

      // Insert items
      const itemsToInsert = items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Error adding invoice items:', itemsError)
        // Rollback: delete the invoice
        await supabase.from('sales_invoices').delete().eq('id', invoice.id)
        set({ error: itemsError.message })
        return null
      }

      return { ...invoice, items: itemsToInsert as InvoiceItem[] }
    } catch (err) {
      console.error('Unexpected error adding sale:', err)
      set({ error: 'حدث خطأ غير متوقع' })
      return null
    }
  },

  updateSale: async (id, updates) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      const { error: updateError } = await supabase
        .from('sales_invoices')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating sale:', updateError)
        set({ error: updateError.message })
      }
    } catch (err) {
      console.error('Unexpected error updating sale:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  deleteSale: async (id) => {
    const supabase = createClientComponentClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        set({ error: 'يجب تسجيل الدخول أولاً' })
        return
      }

      // Delete items first (cascade should handle this, but being explicit)
      await supabase.from('invoice_items').delete().eq('invoice_id', id)

      // Delete invoice
      const { error: deleteError } = await supabase
        .from('sales_invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting sale:', deleteError)
        set({ error: deleteError.message })
      }
    } catch (err) {
      console.error('Unexpected error deleting sale:', err)
      set({ error: 'حدث خطأ غير متوقع' })
    }
  },

  getSaleById: (id) => {
    return get().sales.find((s) => s.id === id)
  },

  getSalesByCustomer: (customerId) => {
    return get().sales.filter((s) => s.customer_id === customerId)
  },

  getSalesByDateRange: (startDate, endDate) => {
    return get().sales.filter((s) => {
      const saleDate = s.invoice_date
      return saleDate >= startDate && saleDate <= endDate
    })
  },

  getTodaySales: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().sales.filter((s) => s.invoice_date === today)
  },

  getTotalSales: () => {
    return get().sales.reduce((sum, s) => sum + (s.total_amount || 0), 0)
  },
}))

