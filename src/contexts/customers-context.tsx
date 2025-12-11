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
  current_debt?: number
  total_payments?: number

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
  getCustomerInvoices: (customerId: string) => Promise<any[]>
  getCustomerPayments: (customerId: string) => Promise<any[]>
  getCustomerTransactions: (customerId: string) => Promise<any[]>
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
        // تحويل أسماء الأعمدة من snake_case إلى camelCase
        const transformedData = (data || []).map(transformCustomerFromDB)
        setCustomers(transformedData)
      }
    } catch (err) {
      console.error('Unexpected error loading customers:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  // تحويل بيانات العميل من snake_case إلى camelCase
  const transformCustomerFromDB = (dbCustomer: any): Customer => {
    return {
      ...dbCustomer,
      // تحويل الأعمدة المالية
      currentDebt: dbCustomer.current_debt ?? dbCustomer.currentDebt ?? 0,
      openingBalance: dbCustomer.opening_balance ?? dbCustomer.openingBalance ?? 0,
      totalPayments: dbCustomer.total_payments ?? dbCustomer.totalPayments ?? 0,
      totalPurchases: dbCustomer.total_purchases ?? dbCustomer.totalPurchases ?? 0,
      creditLimit: dbCustomer.credit_limit ?? dbCustomer.creditLimit ?? 0,
      // تحويل الأعمدة الأخرى
      fullName: dbCustomer.full_name ?? dbCustomer.fullName ?? dbCustomer.name,
      createdAt: dbCustomer.created_at ?? dbCustomer.createdAt,
      updatedAt: dbCustomer.updated_at ?? dbCustomer.updatedAt,
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
            const newCustomer = transformCustomerFromDB(payload.new)
            setCustomers((prev) => [newCustomer, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedCustomer = transformCustomerFromDB(payload.new)
            setCustomers((prev) =>
              prev.map((customer) =>
                customer.id === updatedCustomer.id
                  ? updatedCustomer
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
      // بناء كائن البيانات مع الأعمدة الموجودة فقط
      const insertData: Record<string, any> = {
        user_id: user.id,
        name: customer.name,
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null,
      }

      // إضافة notes فقط إذا كان موجوداً
      if (customer.notes !== undefined) {
        insertData.notes = customer.notes
      }

      // إضافة المديونية المبدئية
      if (customer.openingBalance !== undefined && customer.openingBalance > 0) {
        insertData.opening_balance = customer.openingBalance
        insertData.current_debt = customer.currentDebt || customer.openingBalance
      }

      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([insertData])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding customer:', insertError)
        setError(insertError.message)
        return null
      }

      // تحويل البيانات المُرجَعة
      const transformedCustomer = transformCustomerFromDB(data)

      // تحديث القائمة المحلية مباشرة كاحتياط في حالة عدم عمل Real-time
      if (transformedCustomer) {
        setCustomers((prev) => [transformedCustomer, ...prev])
      }

      return transformedCustomer
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
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    try {
      // تحويل الحقول من camelCase إلى snake_case لقاعدة البيانات
      // نرسل فقط الحقول التي نعرف أنها موجودة في قاعدة البيانات
      const dbUpdates: Record<string, any> = {}

      // الحقول الأساسية
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.address !== undefined) dbUpdates.address = updates.address
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes

      // الحقول المالية (قد تكون موجودة أو لا)
      if (updates.currentDebt !== undefined) dbUpdates.current_debt = updates.currentDebt
      if (updates.totalPayments !== undefined) dbUpdates.total_payments = updates.totalPayments
      if (updates.creditLimit !== undefined) dbUpdates.credit_limit = updates.creditLimit
      if (updates.openingBalance !== undefined) dbUpdates.opening_balance = updates.openingBalance

      console.log('Updating customer:', id, 'with data:', dbUpdates)

      const { data, error: updateError } = await supabase
        .from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (updateError) {
        console.error('Error updating customer:', updateError.message, updateError.details, updateError.hint)
        setError(updateError.message)
        throw new Error(updateError.message)
      }

      console.log('Customer updated successfully:', data)

      // تحويل البيانات المُرجَعة وتحديث الحالة المحلية
      if (data?.[0]) {
        const transformedCustomer = transformCustomerFromDB(data[0])
        setCustomers(prev => prev.map(c =>
          c.id === id ? transformedCustomer : c
        ))
      } else {
        // تحديث محلي فقط إذا لم تُرجع البيانات
        setCustomers(prev => prev.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ))
      }
    } catch (err: any) {
      console.error('Unexpected error updating customer:', err?.message || err)
      setError(err?.message || 'حدث خطأ غير متوقع')
      throw err
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
  // 📄 Add invoice (real implementation)
  // ===================================
  const addInvoice = async (customerId: string, invoice: any): Promise<void> => {
    try {
      // التحقق من البيانات
      if (!invoice.invoiceNumber || !invoice.invoiceDate || !invoice.amount) {
        throw new Error('بيانات الفاتورة غير كاملة')
      }

      // حفظ الفاتورة في قاعدة البيانات
      const { data: savedInvoice, error: invoiceError } = await supabase
        .from('sales_invoices')
        .insert({
          customer_id: customerId,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.invoiceDate,
          due_date: invoice.dueDate || null,
          total_amount: invoice.saleDetails?.chargedAmount || invoice.amount,
          paid_amount: 0,
          status: 'pending',
          notes: invoice.notes || null,
          user_id: user?.id,
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // تحديث المديونية للعميل
      const chargedAmount = invoice.saleDetails?.chargedAmount || invoice.amount
      const { error: debtError } = await supabase
        .from('customers')
        .update({
          current_debt: supabase.rpc('increment_debt', { customer_id: customerId, amount: chargedAmount }),
        })
        .eq('id', customerId)

      if (debtError) throw debtError

      // تحديث رصيد الحساب المصدر (خصم المبلغ المدفوع فعلياً)
      if (invoice.saleDetails?.sourceAccountId) {
        const actualPaid = invoice.saleDetails.actualPaidAmount
        const accountType = invoice.saleDetails.sourceAccountType

        try {
          // استدعاء دالة تحديث الرصيد من الـ store
          const { useCustomersStore } = await import('@/stores/customers-store')
          const store = useCustomersStore.getState()
          await store.updateAccountBalance(accountType, invoice.saleDetails.sourceAccountId, -actualPaid)
        } catch (err) {
          console.error('خطأ في تحديث رصيد الحساب المصدر:', err)
        }
      }

      // إرسال إشعار
      sendNotification(
        'customer_invoice_created',
        'فاتورة جديدة',
        `تم إنشاء فاتورة جديدة للعميل ${getCustomer(customerId)?.name}`
      )

      // تحديث الحالة المحلية
      setCustomers(prev => prev.map(c =>
        c.id === customerId
          ? { ...c, currentDebt: (c.currentDebt || 0) + chargedAmount }
          : c
      ))

    } catch (err) {
      console.error('خطأ في حفظ الفاتورة:', err)
      throw err
    }
  }

  // ===================================
  // 💰 Add payment (real implementation)
  // ===================================
  const addPayment = async (customerId: string, payment: any): Promise<void> => {
    try {
      // التحقق من البيانات
      if (!payment.amount || payment.amount <= 0) {
        throw new Error('مبلغ الدفعة غير صحيح')
      }

      console.log('Adding payment for customer:', customerId, 'amount:', payment.amount)

      // محاولة حفظ الدفعة في قاعدة البيانات (إذا كان الجدول موجوداً)
      const { error: paymentError } = await supabase
        .from('customer_payments')
        .insert({
          customer_id: customerId,
          payment_date: payment.paymentDate || payment.date || new Date().toISOString().split('T')[0],
          amount: payment.amount,
          payment_method: payment.paymentMethod || payment.method || 'cash',
          reference_number: payment.referenceNumber || null,
          notes: payment.notes || null,
          receiving_account_type: payment.receivingAccount?.accountType,
          receiving_account_id: payment.receivingAccount?.accountId,
          user_id: user?.id,
        })
        .select()
        .single()

      // إذا فشل بسبب عدم وجود الجدول، نستمر على أي حال
      if (paymentError) {
        console.warn('خطأ في حفظ الدفعة (قد يكون الجدول غير موجود):', paymentError.message)
      }

      // تحديث المديونية للعميل (تقليل) - هذا هو الأهم
      const customer = getCustomer(customerId)
      const currentDebt = customer?.currentDebt ?? customer?.current_debt ?? 0
      const currentPayments = customer?.totalPayments ?? customer?.total_payments ?? 0
      const newDebt = Math.max(0, currentDebt - payment.amount)
      const newTotalPayments = currentPayments + payment.amount

      console.log('Current debt:', currentDebt, 'New debt:', newDebt, 'Payment amount:', payment.amount)

      const { data, error: debtError } = await supabase
        .from('customers')
        .update({
          current_debt: newDebt,
          total_payments: newTotalPayments,
        })
        .eq('id', customerId)
        .select()

      if (debtError) {
        console.error('Error updating customer debt:', debtError.message, debtError.details, debtError.hint)
        throw new Error(debtError.message)
      }

      console.log('Customer debt updated successfully:', data)

      // تحديث رصيد حساب التحصيل (إضافة المبلغ)
      if (payment.receivingAccount?.accountId) {
        const accountType = payment.receivingAccount.accountType

        try {
          // استدعاء دالة تحديث الرصيد من الـ store
          const { useCustomersStore } = await import('@/stores/customers-store')
          const store = useCustomersStore.getState()
          await store.updateAccountBalance(accountType, payment.receivingAccount.accountId, payment.amount)
        } catch (err) {
          console.error('خطأ في تحديث رصيد حساب التحصيل:', err)
        }
      }

      // إرسال إشعار
      sendNotification(
        'customer_payment_received',
        'دفعة مستقبلة',
        `تم استقبال دفعة من العميل ${getCustomer(customerId)?.name} بمبلغ ${payment.amount}`
      )

      // تحويل البيانات المُرجَعة وتحديث الحالة المحلية
      if (data?.[0]) {
        const transformedCustomer = transformCustomerFromDB(data[0])
        setCustomers(prev => prev.map(c =>
          c.id === customerId ? transformedCustomer : c
        ))
      } else {
        // تحديث محلي فقط إذا لم تُرجع البيانات
        setCustomers(prev => prev.map(c =>
          c.id === customerId
            ? {
                ...c,
                currentDebt: newDebt,
                totalPayments: newTotalPayments,
              }
            : c
        ))
      }

    } catch (err) {
      console.error('خطأ في حفظ الدفعة:', err)
      throw err
    }
  }

  // ===================================
  // 📋 Get customer invoices (real implementation)
  // ===================================
  const getCustomerInvoices = async (customerId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('sales_invoices')
        .select('*')
        .eq('customer_id', customerId)
        .order('invoice_date', { ascending: false })

      if (error) {
        // التعامل مع حالة عدم وجود الجدول بهدوء
        if (error.message?.includes('schema cache') || error.code === '42P01') {
          return []
        }
        console.error('خطأ في جلب الفواتير من Supabase:', error.message)
        return []
      }
      return data || []
    } catch (err: any) {
      // تجاهل أخطاء الجدول المفقود
      if (err?.message?.includes('schema cache')) {
        return []
      }
      console.error('خطأ في جلب الفواتير:', err?.message || err)
      return []
    }
  }

  // ===================================
  // 💰 Get customer payments (real implementation)
  // ===================================
  const getCustomerPayments = async (customerId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('customer_payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false })

      if (error) {
        // التعامل مع حالة عدم وجود الجدول بهدوء
        if (error.message?.includes('schema cache') || error.code === '42P01') {
          // الجدول غير موجود - نعود بمصفوفة فارغة بدون إظهار خطأ
          return []
        }
        console.error('خطأ في جلب الدفعات من Supabase:', error.message)
        return []
      }
      return data || []
    } catch (err: any) {
      // تجاهل أخطاء الجدول المفقود
      if (err?.message?.includes('schema cache')) {
        return []
      }
      console.error('خطأ في جلب الدفعات:', err?.message || err)
      return []
    }
  }

  // ===================================
  // 📊 Get customer transactions (real implementation)
  // ===================================
  const getCustomerTransactions = async (customerId: string): Promise<any[]> => {
    try {
      // جلب الفواتير والدفعات معاً
      const [invoices, payments] = await Promise.all([
        getCustomerInvoices(customerId),
        getCustomerPayments(customerId),
      ])

      // دمج المعاملات وترتيبها حسب التاريخ
      const transactions = [
        ...invoices.map(inv => ({ ...inv, type: 'invoice', date: inv.invoice_date })),
        ...payments.map(pay => ({ ...pay, type: 'payment', date: pay.payment_date })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return transactions
    } catch (err) {
      console.error('خطأ في جلب المعاملات:', err)
      return []
    }
  }

  const exportCustomers = (): string => {
    // تصدير العملاء كـ CSV
    const headers = ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'العنوان', 'المديونية الحالية', 'الحالة']
    const rows = customers.map(c => [
      c.name || c.fullName || '',
      c.phone || '',
      c.email || '',
      c.address || '',
      (c.currentDebt || 0).toString(),
      c.status || 'active'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // ===================================
  // 🔔 Notification Helper
  // ===================================
  const sendNotification = (
    _type: string,
    _title: string,
    _message: string,
    _priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ) => {
    // Placeholder for notification system
    // Will be implemented when notification context is properly integrated
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

