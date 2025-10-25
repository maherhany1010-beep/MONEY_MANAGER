'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  Customer,
  CustomerInvoice,
  CustomerPayment,
  CustomerReturn,
  CustomerTransaction,
  CustomerNote,
  CustomerAttachment,
  CustomerActivityLog,
  CustomerStats,
  CustomerFilter,
  CustomerSortOptions,
  InvoiceStatus,
} from '@/types/customer'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'

interface CustomersContextType {
  // العملاء
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalPurchases' | 'totalPayments' | 'currentDebt'> & { openingBalance?: number }) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  getCustomer: (id: string) => Customer | undefined
  
  // الفواتير
  invoices: CustomerInvoice[]
  addInvoice: (invoice: Omit<CustomerInvoice, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paidAmount' | 'remainingAmount'>) => void
  updateInvoice: (id: string, updates: Partial<CustomerInvoice>) => void
  deleteInvoice: (id: string) => void
  getCustomerInvoices: (customerId: string) => CustomerInvoice[]
  
  // الدفعات
  payments: CustomerPayment[]
  addPayment: (payment: Omit<CustomerPayment, 'id' | 'createdAt'>) => void
  deletePayment: (id: string) => void
  getCustomerPayments: (customerId: string) => CustomerPayment[]
  
  // المرتجعات
  returns: CustomerReturn[]
  addReturn: (returnItem: Omit<CustomerReturn, 'id' | 'createdAt'>) => void
  deleteReturn: (id: string) => void
  getCustomerReturns: (customerId: string) => CustomerReturn[]
  
  // المعاملات
  transactions: CustomerTransaction[]
  getCustomerTransactions: (customerId: string) => CustomerTransaction[]
  
  // الملاحظات
  notes: CustomerNote[]
  addNote: (note: Omit<CustomerNote, 'id' | 'createdAt'>) => void
  deleteNote: (id: string) => void
  getCustomerNotes: (customerId: string) => CustomerNote[]
  
  // المرفقات
  attachments: CustomerAttachment[]
  addAttachment: (attachment: Omit<CustomerAttachment, 'id' | 'uploadedAt'>) => void
  deleteAttachment: (id: string) => void
  getCustomerAttachments: (customerId: string) => CustomerAttachment[]
  
  // سجل النشاطات
  activityLogs: CustomerActivityLog[]
  getCustomerActivityLogs: (customerId: string) => CustomerActivityLog[]
  
  // الإحصائيات
  getCustomerStats: (customerId: string) => CustomerStats
  
  // البحث والتصفية
  searchCustomers: (filter: CustomerFilter, sort?: CustomerSortOptions) => Customer[]
  
  // التصدير
  exportCustomers: () => string // CSV format
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  // استيراد contexts الحسابات
  const bankAccountsContext = useBankAccounts()
  const eWalletsContext = useEWallets()
  const cashVaultsContext = useCashVaults()
  const prepaidCardsContext = usePrepaidCards()
  const posMachinesContext = usePOSMachines()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [payments, setPayments] = useState<CustomerPayment[]>([])
  const [returns, setReturns] = useState<CustomerReturn[]>([])
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([])
  const [notes, setNotes] = useState<CustomerNote[]>([])
  const [attachments, setAttachments] = useState<CustomerAttachment[]>([])
  const [activityLogs, setActivityLogs] = useState<CustomerActivityLog[]>([])

  // تحميل البيانات من localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedCustomers = localStorage.getItem('customers')
        const savedInvoices = localStorage.getItem('customer-invoices')
        const savedPayments = localStorage.getItem('customer-payments')
        const savedReturns = localStorage.getItem('customer-returns')
        const savedTransactions = localStorage.getItem('customer-transactions')
        const savedNotes = localStorage.getItem('customer-notes')
        const savedAttachments = localStorage.getItem('customer-attachments')
        const savedActivityLogs = localStorage.getItem('customer-activity-logs')

        if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices))
        if (savedPayments) setPayments(JSON.parse(savedPayments))
        if (savedReturns) setReturns(JSON.parse(savedReturns))
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
        if (savedNotes) setNotes(JSON.parse(savedNotes))
        if (savedAttachments) setAttachments(JSON.parse(savedAttachments))
        if (savedActivityLogs) setActivityLogs(JSON.parse(savedActivityLogs))
      } catch (error) {
        console.error('Error loading customers data:', error)
      }
    }

    loadData()
  }, [])

  // حفظ البيانات في localStorage
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers))
  }, [customers])

  useEffect(() => {
    localStorage.setItem('customer-invoices', JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem('customer-payments', JSON.stringify(payments))
  }, [payments])

  useEffect(() => {
    localStorage.setItem('customer-returns', JSON.stringify(returns))
  }, [returns])

  useEffect(() => {
    localStorage.setItem('customer-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('customer-notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem('customer-attachments', JSON.stringify(attachments))
  }, [attachments])

  useEffect(() => {
    localStorage.setItem('customer-activity-logs', JSON.stringify(activityLogs))
  }, [activityLogs])

  /**
   * إضافة سجل نشاط
   */
  const addActivityLog = useCallback((log: Omit<CustomerActivityLog, 'id' | 'timestamp'>) => {
    const newLog: CustomerActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    setActivityLogs(prev => [newLog, ...prev])
  }, [])

  /**
   * حساب إحصائيات العميل
   */
  const calculateCustomerStats = useCallback((customerId: string): {
    totalPurchases: number
    totalPayments: number
    currentDebt: number
  } => {
    const customer = customers.find(c => c.id === customerId)
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId)
    const customerPayments = payments.filter(pay => pay.customerId === customerId)
    const customerReturns = returns.filter(ret => ret.customerId === customerId)

    const totalPurchases = customerInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPayments = customerPayments.reduce((sum, pay) => sum + pay.amount, 0)
    const totalReturns = customerReturns.reduce((sum, ret) => sum + ret.amount, 0)

    // المديونية = مديونية بداية المدة + المشتريات - المدفوعات - المرتجعات
    const openingBalance = customer?.openingBalance || 0
    const currentDebt = openingBalance + totalPurchases - totalPayments - totalReturns

    return { totalPurchases, totalPayments, currentDebt }
  }, [customers, invoices, payments, returns])

  /**
   * تحديث إحصائيات العميل
   */
  const updateCustomerStats = useCallback((customerId: string) => {
    const stats = calculateCustomerStats(customerId)
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId
        ? { ...customer, ...stats, updatedAt: new Date().toISOString() }
        : customer
    ))
  }, [calculateCustomerStats])

  /**
   * إضافة عميل جديد
   */
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalPurchases' | 'totalPayments' | 'currentDebt'> & { openingBalance?: number }) => {
    const openingBalance = customerData.openingBalance || 0

    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      totalPurchases: 0,
      totalPayments: 0,
      currentDebt: openingBalance, // المديونية الحالية = مديونية بداية المدة
      openingBalance: openingBalance, // مديونية بداية المدة
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCustomers(prev => [...prev, newCustomer])

    addActivityLog({
      customerId: newCustomer.id,
      action: 'created',
      description: `تم إضافة العميل ${newCustomer.fullName}`,
    })
  }, [addActivityLog])

  /**
   * تحديث بيانات عميل
   */
  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    const oldCustomer = customers.find(c => c.id === id)
    
    setCustomers(prev => prev.map(customer =>
      customer.id === id
        ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
        : customer
    ))

    if (oldCustomer) {
      addActivityLog({
        customerId: id,
        action: 'updated',
        description: `تم تحديث بيانات العميل ${oldCustomer.fullName}`,
        changes: Object.keys(updates).reduce((acc, key) => {
          acc[key] = {
            old: (oldCustomer as any)[key],
            new: (updates as any)[key],
          }
          return acc
        }, {} as Record<string, { old: any; new: any }>),
      })
    }
  }, [customers, addActivityLog])

  /**
   * حذف عميل
   */
  const deleteCustomer = useCallback((id: string) => {
    const customer = customers.find(c => c.id === id)
    setCustomers(prev => prev.filter(c => c.id !== id))
    
    if (customer) {
      addActivityLog({
        customerId: id,
        action: 'deleted',
        description: `تم حذف العميل ${customer.fullName}`,
      })
    }
  }, [customers, addActivityLog])

  /**
   * الحصول على عميل
   */
  const getCustomer = useCallback((id: string) => {
    return customers.find(c => c.id === id)
  }, [customers])

  /**
   * حساب حالة الفاتورة
   */
  const calculateInvoiceStatus = useCallback((invoice: CustomerInvoice): InvoiceStatus => {
    if (invoice.paidAmount >= invoice.amount) return 'paid'
    if (invoice.paidAmount > 0) return 'partial'
    if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) return 'overdue'
    return 'unpaid'
  }, [])

  /**
   * معالجة التحويل وتحديث الحسابات
   */
  const processTransfer = useCallback((transferDetails: NonNullable<CustomerInvoice['transferDetails']>, invoiceNumber: string) => {
    const { debitAccountType, debitAccountId, debitAmount, fees, feesBearer, collectionAmount, collectionType, creditAccountType, creditAccountId } = transferDetails

    // حساب المبلغ الفعلي المخصوم
    let actualDebitAmount = debitAmount
    if (feesBearer === 'sender') {
      actualDebitAmount += fees
    }

    // خصم من الحساب المصدر
    switch (debitAccountType) {
      case 'customer':
        // العميل هو المصدر (دفعة من العميل)
        // لا نحتاج لخصم من رصيد العميل، فقط تسجيل الدفعة
        // سيتم تقليل المديونية تلقائياً عند تحديث حالة الفاتورة
        break
      case 'bank':
        if (bankAccountsContext) {
          const account = bankAccountsContext.getAccountById(debitAccountId)
          if (account) {
            bankAccountsContext.updateAccountBalance(debitAccountId, account.balance - actualDebitAmount, -actualDebitAmount)
          }
        }
        break
      case 'e-wallet':
        if (eWalletsContext) {
          const wallet = eWalletsContext.getWalletById(debitAccountId)
          if (wallet) {
            eWalletsContext.updateWalletBalance(debitAccountId, wallet.balance - actualDebitAmount, -actualDebitAmount)
          }
        }
        break
      case 'cash-vault':
        if (cashVaultsContext) {
          const vault = cashVaultsContext.getVaultById(debitAccountId)
          if (vault) {
            cashVaultsContext.updateVaultBalance(debitAccountId, vault.balance - actualDebitAmount)
          }
        }
        break
      case 'prepaid-card':
        if (prepaidCardsContext) {
          const card = prepaidCardsContext.getCardById(debitAccountId)
          if (card) {
            prepaidCardsContext.updateCardBalance(debitAccountId, card.balance - actualDebitAmount, -actualDebitAmount)
          }
        }
        break
      case 'pos':
        // ماكينات POS لها هيكل مختلف - سنتعامل معها لاحقاً
        break
    }

    // إذا كان التحصيل فوري، إضافة للحساب المستهدف
    if (collectionType === 'immediate' && creditAccountType && creditAccountId) {
      let actualCreditAmount = collectionAmount
      if (feesBearer === 'receiver') {
        actualCreditAmount -= fees
      }

      switch (creditAccountType) {
        case 'customer':
          // العميل هو الوجهة (تحويل للعميل)
          // لا نحتاج لإضافة لرصيد العميل، فقط تسجيل التحويل
          // سيتم زيادة المديونية تلقائياً عند إنشاء الفاتورة
          break
        case 'bank':
          if (bankAccountsContext) {
            const account = bankAccountsContext.getAccountById(creditAccountId)
            if (account) {
              bankAccountsContext.updateAccountBalance(creditAccountId, account.balance + actualCreditAmount, actualCreditAmount)
            }
          }
          break
        case 'e-wallet':
          if (eWalletsContext) {
            const wallet = eWalletsContext.getWalletById(creditAccountId)
            if (wallet) {
              eWalletsContext.updateWalletBalance(creditAccountId, wallet.balance + actualCreditAmount, actualCreditAmount)
            }
          }
          break
        case 'cash-vault':
          if (cashVaultsContext) {
            const vault = cashVaultsContext.getVaultById(creditAccountId)
            if (vault) {
              cashVaultsContext.updateVaultBalance(creditAccountId, vault.balance + actualCreditAmount)
            }
          }
          break
        case 'prepaid-card':
          if (prepaidCardsContext) {
            const card = prepaidCardsContext.getCardById(creditAccountId)
            if (card) {
              prepaidCardsContext.updateCardBalance(creditAccountId, card.balance + actualCreditAmount, actualCreditAmount)
            }
          }
          break
        case 'pos':
          // ماكينات POS لها هيكل مختلف - سنتعامل معها لاحقاً
          break
      }
    }
  }, [bankAccountsContext, eWalletsContext, cashVaultsContext, prepaidCardsContext, posMachinesContext])

  /**
   * إضافة فاتورة جديدة
   */
  const addInvoice = useCallback((invoiceData: Omit<CustomerInvoice, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paidAmount' | 'remainingAmount'>) => {
    const newInvoice: CustomerInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      paidAmount: 0,
      remainingAmount: invoiceData.amount,
      status: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // إذا كانت فاتورة تحويل، معالجة التحويل
    if (invoiceData.invoiceType === 'transfer' && invoiceData.transferDetails) {
      processTransfer(invoiceData.transferDetails, invoiceData.invoiceNumber)

      // إذا كان التحصيل فوري، تحديث حالة الفاتورة
      if (invoiceData.transferDetails.collectionType === 'immediate') {
        newInvoice.paidAmount = invoiceData.transferDetails.collectionAmount
        newInvoice.remainingAmount = invoiceData.amount - invoiceData.transferDetails.collectionAmount
        newInvoice.status = newInvoice.remainingAmount === 0 ? 'paid' : 'partial'
      }
    }

    setInvoices(prev => [...prev, newInvoice])

    // إضافة معاملة
    const newTransaction: CustomerTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      customerId: invoiceData.customerId,
      type: 'invoice',
      date: invoiceData.invoiceDate,
      amount: invoiceData.amount,
      description: invoiceData.invoiceType === 'transfer'
        ? `فاتورة تحويل رقم ${invoiceData.invoiceNumber}`
        : `فاتورة رقم ${invoiceData.invoiceNumber}`,
      balanceAfter: 0, // سيتم حسابه
      referenceId: newInvoice.id,
      referenceType: 'invoice',
      createdAt: new Date().toISOString(),
    }
    setTransactions(prev => [...prev, newTransaction])

    // تحديث إحصائيات العميل
    updateCustomerStats(invoiceData.customerId)

    addActivityLog({
      customerId: invoiceData.customerId,
      action: 'invoice_added',
      description: invoiceData.invoiceType === 'transfer'
        ? `تم إضافة فاتورة تحويل رقم ${invoiceData.invoiceNumber} بمبلغ ${invoiceData.amount} جنيه`
        : `تم إضافة فاتورة رقم ${invoiceData.invoiceNumber} بمبلغ ${invoiceData.amount} جنيه`,
    })
  }, [updateCustomerStats, addActivityLog, processTransfer])

  /**
   * تحديث فاتورة
   */
  const updateInvoice = useCallback((id: string, updates: Partial<CustomerInvoice>) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === id) {
        const updated = { ...invoice, ...updates, updatedAt: new Date().toISOString() }
        updated.remainingAmount = updated.amount - updated.paidAmount
        updated.status = calculateInvoiceStatus(updated)
        return updated
      }
      return invoice
    }))

    const invoice = invoices.find(inv => inv.id === id)
    if (invoice) {
      updateCustomerStats(invoice.customerId)
    }
  }, [invoices, calculateInvoiceStatus, updateCustomerStats])

  /**
   * حذف فاتورة
   */
  const deleteInvoice = useCallback((id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    setInvoices(prev => prev.filter(inv => inv.id !== id))
    setTransactions(prev => prev.filter(trans => trans.referenceId !== id))

    if (invoice) {
      updateCustomerStats(invoice.customerId)
    }
  }, [invoices, updateCustomerStats])

  /**
   * الحصول على فواتير العميل
   */
  const getCustomerInvoices = useCallback((customerId: string) => {
    return invoices.filter(inv => inv.customerId === customerId)
  }, [invoices])

  /**
   * إضافة دفعة
   */
  const addPayment = useCallback((paymentData: Omit<CustomerPayment, 'id' | 'createdAt'>) => {
    const newPayment: CustomerPayment = {
      ...paymentData,
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    setPayments(prev => [...prev, newPayment])

    // تحديث الفاتورة إذا كانت الدفعة مرتبطة بفاتورة
    if (paymentData.invoiceId) {
      setInvoices(prev => prev.map(invoice => {
        if (invoice.id === paymentData.invoiceId) {
          const paidAmount = invoice.paidAmount + paymentData.amount
          const remainingAmount = invoice.amount - paidAmount
          const status = calculateInvoiceStatus({ ...invoice, paidAmount })
          return { ...invoice, paidAmount, remainingAmount, status, updatedAt: new Date().toISOString() }
        }
        return invoice
      }))
    }

    // تحديث إحصائيات العميل مباشرة
    setCustomers(prev => prev.map(customer => {
      if (customer.id === paymentData.customerId) {
        const totalPayments = customer.totalPayments + paymentData.amount

        // حساب المديونية الحالية: openingBalance + totalPurchases - totalPayments - totalReturns
        const customerReturns = returns.filter(ret => ret.customerId === paymentData.customerId)
        const totalReturns = customerReturns.reduce((sum, ret) => sum + ret.amount, 0)
        const currentDebt = customer.openingBalance + customer.totalPurchases - totalPayments - totalReturns

        return {
          ...customer,
          totalPayments,
          currentDebt,
          updatedAt: new Date().toISOString(),
        }
      }
      return customer
    }))

    // إضافة معاملة
    const newTransaction: CustomerTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerId: paymentData.customerId,
      type: 'payment',
      date: paymentData.paymentDate,
      amount: -paymentData.amount, // سالب لأنها دفعة
      description: `دفعة بمبلغ ${paymentData.amount} جنيه`,
      balanceAfter: 0,
      referenceId: newPayment.id,
      referenceType: 'payment',
      createdAt: new Date().toISOString(),
    }
    setTransactions(prev => [...prev, newTransaction])

    addActivityLog({
      customerId: paymentData.customerId,
      action: 'payment_received',
      description: `تم استلام دفعة بمبلغ ${paymentData.amount} جنيه`,
    })
  }, [calculateInvoiceStatus, addActivityLog, returns])

  /**
   * حذف دفعة
   */
  const deletePayment = useCallback((id: string) => {
    const payment = payments.find(pay => pay.id === id)
    setPayments(prev => prev.filter(pay => pay.id !== id))
    setTransactions(prev => prev.filter(trans => trans.referenceId !== id))

    if (payment) {
      // تحديث الفاتورة إذا كانت الدفعة مرتبطة بفاتورة
      if (payment.invoiceId) {
        setInvoices(prev => prev.map(invoice => {
          if (invoice.id === payment.invoiceId) {
            const paidAmount = invoice.paidAmount - payment.amount
            const remainingAmount = invoice.amount - paidAmount
            const status = calculateInvoiceStatus({ ...invoice, paidAmount })
            return { ...invoice, paidAmount, remainingAmount, status, updatedAt: new Date().toISOString() }
          }
          return invoice
        }))
      }

      updateCustomerStats(payment.customerId)
    }
  }, [payments, calculateInvoiceStatus, updateCustomerStats])

  /**
   * الحصول على دفعات العميل
   */
  const getCustomerPayments = useCallback((customerId: string) => {
    return payments.filter(pay => pay.customerId === customerId)
  }, [payments])

  /**
   * إضافة مرتجع
   */
  const addReturn = useCallback((returnData: Omit<CustomerReturn, 'id' | 'createdAt'>) => {
    const newReturn: CustomerReturn = {
      ...returnData,
      id: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    }

    setReturns(prev => [...prev, newReturn])

    // إضافة معاملة
    const newTransaction: CustomerTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      customerId: returnData.customerId,
      type: 'return',
      date: returnData.returnDate,
      amount: -returnData.amount,
      description: `مرتجع بمبلغ ${returnData.amount} جنيه`,
      balanceAfter: 0,
      referenceId: newReturn.id,
      referenceType: 'return',
      createdAt: new Date().toISOString(),
    }
    setTransactions(prev => [...prev, newTransaction])

    updateCustomerStats(returnData.customerId)
  }, [updateCustomerStats])

  /**
   * حذف مرتجع
   */
  const deleteReturn = useCallback((id: string) => {
    const returnItem = returns.find(ret => ret.id === id)
    setReturns(prev => prev.filter(ret => ret.id !== id))
    setTransactions(prev => prev.filter(trans => trans.referenceId !== id))

    if (returnItem) {
      updateCustomerStats(returnItem.customerId)
    }
  }, [returns, updateCustomerStats])

  /**
   * الحصول على مرتجعات العميل
   */
  const getCustomerReturns = useCallback((customerId: string) => {
    return returns.filter(ret => ret.customerId === customerId)
  }, [returns])

  /**
   * الحصول على معاملات العميل
   */
  const getCustomerTransactions = useCallback((customerId: string) => {
    return transactions
      .filter(trans => trans.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions])

  /**
   * إضافة ملاحظة
   */
  const addNote = useCallback((noteData: Omit<CustomerNote, 'id' | 'createdAt'>) => {
    const newNote: CustomerNote = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    }
    setNotes(prev => [newNote, ...prev])
  }, [])

  /**
   * حذف ملاحظة
   */
  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }, [])

  /**
   * الحصول على ملاحظات العميل
   */
  const getCustomerNotes = useCallback((customerId: string) => {
    return notes.filter(note => note.customerId === customerId)
  }, [notes])

  /**
   * إضافة مرفق
   */
  const addAttachment = useCallback((attachmentData: Omit<CustomerAttachment, 'id' | 'uploadedAt'>) => {
    const newAttachment: CustomerAttachment = {
      ...attachmentData,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      uploadedAt: new Date().toISOString(),
    }
    setAttachments(prev => [...prev, newAttachment])
  }, [])

  /**
   * حذف مرفق
   */
  const deleteAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }, [])

  /**
   * الحصول على مرفقات العميل
   */
  const getCustomerAttachments = useCallback((customerId: string) => {
    return attachments.filter(att => att.customerId === customerId)
  }, [attachments])

  /**
   * الحصول على سجل نشاطات العميل
   */
  const getCustomerActivityLogs = useCallback((customerId: string) => {
    return activityLogs.filter(log => log.customerId === customerId)
  }, [activityLogs])

  /**
   * الحصول على إحصائيات العميل
   */
  const getCustomerStats = useCallback((customerId: string): CustomerStats => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customerId)
    const customerPayments = payments.filter(pay => pay.customerId === customerId)
    const customerReturns = returns.filter(ret => ret.customerId === customerId)

    const totalInvoices = customerInvoices.length
    const totalPurchases = customerInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalPayments = customerPayments.reduce((sum, pay) => sum + pay.amount, 0)
    const totalReturns = customerReturns.reduce((sum, ret) => sum + ret.amount, 0)
    const currentDebt = totalPurchases - totalPayments - totalReturns
    const averageInvoiceValue = totalInvoices > 0 ? totalPurchases / totalInvoices : 0

    const sortedInvoices = [...customerInvoices].sort((a, b) =>
      new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    )
    const sortedPayments = [...customerPayments].sort((a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )

    const lastInvoiceDate = sortedInvoices[0]?.invoiceDate
    const lastPaymentDate = sortedPayments[0]?.paymentDate
    const daysSinceLastPurchase = lastInvoiceDate
      ? Math.floor((Date.now() - new Date(lastInvoiceDate).getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    const overdueInvoices = customerInvoices.filter(inv => inv.status === 'overdue')
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0)

    return {
      customerId,
      totalInvoices,
      totalPurchases,
      totalPayments,
      totalReturns,
      currentDebt,
      averageInvoiceValue,
      lastInvoiceDate,
      lastPaymentDate,
      daysSinceLastPurchase,
      overdueAmount,
      overdueInvoices: overdueInvoices.length,
    }
  }, [invoices, payments, returns])

  /**
   * البحث والتصفية
   */
  const searchCustomers = useCallback((filter: CustomerFilter, sort?: CustomerSortOptions): Customer[] => {
    let filtered = [...customers]

    // البحث بالنص
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      filtered = filtered.filter(customer =>
        customer.fullName.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.company?.toLowerCase().includes(query)
      )
    }

    // التصفية حسب الحالة
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(customer => filter.status!.includes(customer.status))
    }

    // التصفية حسب التصنيف
    if (filter.category && filter.category.length > 0) {
      filtered = filtered.filter(customer => filter.category!.includes(customer.category))
    }

    // التصفية حسب المديونية
    if (filter.minDebt !== undefined) {
      filtered = filtered.filter(customer => customer.currentDebt >= filter.minDebt!)
    }
    if (filter.maxDebt !== undefined) {
      filtered = filtered.filter(customer => customer.currentDebt <= filter.maxDebt!)
    }

    // التصفية حسب تاريخ التسجيل
    if (filter.registrationDateFrom) {
      filtered = filtered.filter(customer =>
        new Date(customer.registrationDate) >= new Date(filter.registrationDateFrom!)
      )
    }
    if (filter.registrationDateTo) {
      filtered = filtered.filter(customer =>
        new Date(customer.registrationDate) <= new Date(filter.registrationDateTo!)
      )
    }

    // الفرز
    if (sort) {
      filtered.sort((a, b) => {
        let aValue: any = a[sort.field]
        let bValue: any = b[sort.field]

        if (sort.field === 'registrationDate') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (typeof aValue === 'string') {
          return sort.direction === 'asc'
            ? aValue.localeCompare(bValue, 'ar')
            : bValue.localeCompare(aValue, 'ar')
        }

        return sort.direction === 'asc' ? aValue - bValue : bValue - aValue
      })
    }

    return filtered
  }, [customers])

  /**
   * تصدير العملاء إلى CSV
   */
  const exportCustomers = useCallback((): string => {
    const headers = [
      'الاسم الكامل',
      'رقم الهاتف',
      'البريد الإلكتروني',
      'العنوان',
      'الشركة',
      'المهنة',
      'الحالة',
      'التصنيف',
      'إجمالي المشتريات',
      'إجمالي المدفوعات',
      'المديونية الحالية',
      'تاريخ التسجيل',
    ]

    const rows = customers.map(customer => [
      customer.fullName,
      customer.phone,
      customer.email || '',
      customer.address || '',
      customer.company || '',
      customer.profession || '',
      customer.status === 'active' ? 'نشط' : customer.status === 'inactive' ? 'غير نشط' : 'محظور',
      customer.category === 'vip' ? 'VIP' : customer.category === 'regular' ? 'عادي' : 'جديد',
      customer.totalPurchases.toString(),
      customer.totalPayments.toString(),
      customer.currentDebt.toString(),
      customer.registrationDate,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }, [customers])

  const value: CustomersContextType = {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getCustomerInvoices,
    payments,
    addPayment,
    deletePayment,
    getCustomerPayments,
    returns,
    addReturn,
    deleteReturn,
    getCustomerReturns,
    transactions,
    getCustomerTransactions,
    notes,
    addNote,
    deleteNote,
    getCustomerNotes,
    attachments,
    addAttachment,
    deleteAttachment,
    getCustomerAttachments,
    activityLogs,
    getCustomerActivityLogs,
    getCustomerStats,
    searchCustomers,
    exportCustomers,
  }

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>
}

export function useCustomers() {
  const context = useContext(CustomersContext)
  if (!context) {
    throw new Error('useCustomers must be used within CustomersProvider')
  }
  return context
}

