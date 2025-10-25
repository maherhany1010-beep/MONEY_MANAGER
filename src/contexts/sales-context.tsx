'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  invoiceNumber: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  discountType: 'percentage' | 'fixed'
  tax: number
  taxRate: number
  total: number
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'e_wallet' | 'deferred'
  amountPaid: number
  change: number
  status: 'completed' | 'pending' | 'cancelled'
  date: string
  notes?: string
  createdAt: string
}

interface SalesContextType {
  sales: Sale[]
  addSale: (sale: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt'>) => string
  getSaleById: (id: string) => Sale | undefined
  getSalesByCustomer: (customerId: string) => Sale[]
  getSalesByDateRange: (startDate: string, endDate: string) => Sale[]
  getTodaySales: () => Sale[]
  getTotalSales: (startDate?: string, endDate?: string) => number
  cancelSale: (id: string) => void
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedSales = localStorage.getItem('sales')
    if (savedSales) {
      setSales(JSON.parse(savedSales))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales))
  }, [sales])

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}${month}${day}-${random}`
  }

  const addSale = (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
    }
    setSales([...sales, newSale])
    return newSale.id
  }

  const getSaleById = (id: string) => {
    return sales.find(sale => sale.id === id)
  }

  const getSalesByCustomer = (customerId: string) => {
    return sales
      .filter(sale => sale.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getSalesByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    return sales.filter(sale => {
      const saleDate = new Date(sale.date).getTime()
      return saleDate >= start && saleDate <= end
    })
  }

  const getTodaySales = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date)
      return saleDate >= today && saleDate < tomorrow
    })
  }

  const getTotalSales = (startDate?: string, endDate?: string) => {
    let filteredSales = sales.filter(sale => sale.status === 'completed')
    
    if (startDate && endDate) {
      filteredSales = getSalesByDateRange(startDate, endDate).filter(
        sale => sale.status === 'completed'
      )
    }
    
    return filteredSales.reduce((total, sale) => total + sale.total, 0)
  }

  const cancelSale = (id: string) => {
    setSales(sales.map(sale =>
      sale.id === id
        ? { ...sale, status: 'cancelled' as const }
        : sale
    ))
  }

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        getSaleById,
        getSalesByCustomer,
        getSalesByDateRange,
        getTodaySales,
        getTotalSales,
        cancelSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const context = useContext(SalesContext)
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider')
  }
  return context
}

