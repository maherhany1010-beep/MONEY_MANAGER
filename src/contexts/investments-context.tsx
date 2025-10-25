'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type InvestmentType = 'precious_metals' | 'cryptocurrency' | 'certificate' | 'stock'
export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium'
export type CertificateType = 'investment' | 'fixed_deposit' | 'savings'
export type InterestPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
export type Currency = 'EGP' | 'USD' | 'EUR'

// Base Investment Interface
export interface BaseInvestment {
  id: string
  type: InvestmentType
  name: string
  purchaseDate: string
  notes?: string
  currency: Currency // العملة الأساسية
  exchangeRateAtPurchase?: number // سعر الصرف وقت الشراء (إذا كانت العملة ليست EGP)
  currentExchangeRate?: number // سعر الصرف الحالي
  createdAt: string
  updatedAt: string
}

// Precious Metals Investment
export interface PreciousMetalInvestment extends BaseInvestment {
  type: 'precious_metals'
  metalType: MetalType
  quantity: number // in grams or ounces
  unit: 'gram' | 'ounce'
  purchasePrice: number // per unit
  currentPrice: number // per unit
  storageLocation?: string
  purchaseFee?: number // رسوم الشراء
}

// Cryptocurrency Investment
export interface CryptocurrencyInvestment extends BaseInvestment {
  type: 'cryptocurrency'
  cryptoName: string
  cryptoSymbol: string // BTC, ETH, etc.
  quantity: number
  purchasePrice: number // per unit
  currentPrice: number // per unit
  wallet?: string // wallet/platform name
  cryptoPurchaseFee?: number // رسوم الشراء للعملات الرقمية
}

// Certificate/Deposit Investment
export interface CertificateInvestment extends BaseInvestment {
  type: 'certificate'
  certificateType: CertificateType
  bank: string
  amount: number
  interestRate: number // percentage
  startDate: string
  maturityDate: string
  interestPeriod: InterestPeriod
  certificateNumber?: string
}

// Stock Investment
export interface StockInvestment extends BaseInvestment {
  type: 'stock'
  companyName: string
  tickerSymbol: string
  market: string // NYSE, NASDAQ, EGX, etc.
  shares: number
  purchasePrice: number // per share
  currentPrice: number // per share
  commission?: number
}

export type Investment = 
  | PreciousMetalInvestment 
  | CryptocurrencyInvestment 
  | CertificateInvestment 
  | StockInvestment

// Price History
export interface PriceHistory {
  id: string
  investmentId: string
  price: number
  date: string
}

// Sale Record
export interface SaleRecord {
  id: string
  investmentId: string
  investmentName: string
  investmentType: InvestmentType
  quantity: number
  sellPrice: number
  commission: number
  commissionType: 'percentage' | 'fixed'
  grossProceeds: number // قيمة البيع الإجمالية
  netProceeds: number // صافي البيع
  profitLoss: number // الربح/الخسارة
  currency: Currency // العملة
  exchangeRateAtSale?: number // سعر الصرف وقت البيع
  date: string
}

// Price Change
export interface PriceChange {
  amount: number
  percentage: number
  direction: 'up' | 'down' | 'neutral'
}

interface InvestmentsContextType {
  investments: Investment[]
  priceHistory: PriceHistory[]
  salesHistory: SaleRecord[]
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInvestment: (id: string, investment: Partial<Investment>) => void
  deleteInvestment: (id: string) => void
  updatePrice: (id: string, newPrice: number, newExchangeRate?: number) => void
  addQuantity: (id: string, quantity: number, purchasePrice: number) => void
  sellInvestment: (id: string, quantity: number, sellPrice: number, commission: number, commissionType: 'percentage' | 'fixed', exchangeRateAtSale?: number) => void
  getInvestmentById: (id: string) => Investment | undefined
  getInvestmentsByType: (type: InvestmentType) => Investment[]
  getPriceHistory: (investmentId: string) => PriceHistory[]
  getPriceChange: (investmentId: string) => PriceChange | null
  getSalesHistory: () => SaleRecord[]
  getTotalPortfolioValue: () => number
  getTotalCost: () => number
  getTotalProfitLoss: () => number
  getReturnPercentage: () => number
  getPortfolioDistribution: () => { type: string; value: number; percentage: number }[]
}

const InvestmentsContext = createContext<InvestmentsContextType | undefined>(undefined)

export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([])

  // Load from localStorage
  useEffect(() => {
    const savedInvestments = localStorage.getItem('investments')
    const savedHistory = localStorage.getItem('priceHistory')
    const savedSales = localStorage.getItem('salesHistory')

    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments))
    }
    if (savedHistory) {
      setPriceHistory(JSON.parse(savedHistory))
    }
    if (savedSales) {
      setSalesHistory(JSON.parse(savedSales))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments))
  }, [investments])

  useEffect(() => {
    localStorage.setItem('priceHistory', JSON.stringify(priceHistory))
  }, [priceHistory])

  useEffect(() => {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory))
  }, [salesHistory])

  const addInvestment = (investmentData: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvestment: Investment = {
      ...investmentData,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Investment

    setInvestments([...investments, newInvestment])

    // Add initial price to history
    if (newInvestment.type !== 'certificate') {
      const price = newInvestment.type === 'precious_metals' 
        ? newInvestment.currentPrice
        : newInvestment.type === 'cryptocurrency'
        ? newInvestment.currentPrice
        : newInvestment.currentPrice

      addPriceHistory(newInvestment.id, price)
    }
  }

  const updateInvestment = (id: string, investmentData: Partial<Investment>) => {
    setInvestments(investments.map(inv =>
      inv.id === id
        ? { ...inv, ...investmentData, updatedAt: new Date().toISOString() }
        : inv
    ) as any)
  }

  const deleteInvestment = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id))
    setPriceHistory(priceHistory.filter(ph => ph.investmentId !== id))
  }

  const updatePrice = (id: string, newPrice: number, newExchangeRate?: number) => {
    const investment = investments.find(inv => inv.id === id)
    if (!investment || investment.type === 'certificate') return

    const updateData: Partial<Investment> = { currentPrice: newPrice }
    if (newExchangeRate !== undefined) {
      updateData.currentExchangeRate = newExchangeRate
    }

    updateInvestment(id, updateData as Partial<Investment>)
    addPriceHistory(id, newPrice)
  }

  const addPriceHistory = (investmentId: string, price: number) => {
    const newHistory: PriceHistory = {
      id: `ph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      investmentId,
      price,
      date: new Date().toISOString(),
    }
    setPriceHistory([...priceHistory, newHistory])
  }

  const getInvestmentById = (id: string) => {
    return investments.find(inv => inv.id === id)
  }

  const getInvestmentsByType = (type: InvestmentType) => {
    return investments.filter(inv => inv.type === type)
  }

  const getPriceHistory = (investmentId: string) => {
    return priceHistory
      .filter(ph => ph.investmentId === investmentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const calculateInvestmentValue = (investment: Investment): number => {
    // Get exchange rate from localStorage
    const savedExchangeRate = localStorage.getItem('currentExchangeRate')
    const exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : 1

    let valueInOriginalCurrency = 0
    let needsConversion = false

    switch (investment.type) {
      case 'precious_metals':
        valueInOriginalCurrency = investment.quantity * investment.currentPrice
        needsConversion = investment.currency === 'USD'
        break
      case 'cryptocurrency':
        valueInOriginalCurrency = investment.quantity * investment.currentPrice
        needsConversion = true // Always USD
        break
      case 'certificate':
        valueInOriginalCurrency = investment.amount
        needsConversion = false // Always EGP
        break
      case 'stock':
        valueInOriginalCurrency = investment.shares * investment.currentPrice
        needsConversion = true // Always USD
        break
      default:
        return 0
    }

    // Convert to EGP if needed
    return needsConversion ? valueInOriginalCurrency * exchangeRate : valueInOriginalCurrency
  }

  const calculateInvestmentCost = (investment: Investment): number => {
    // Get exchange rate from localStorage
    const savedExchangeRate = localStorage.getItem('currentExchangeRate')
    const exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : 1

    let costInOriginalCurrency = 0
    let needsConversion = false

    switch (investment.type) {
      case 'precious_metals':
        costInOriginalCurrency = (investment.quantity * investment.purchasePrice) + (investment.purchaseFee || 0)
        needsConversion = investment.currency === 'USD'
        break
      case 'cryptocurrency':
        costInOriginalCurrency = (investment.quantity * investment.purchasePrice) + (investment.cryptoPurchaseFee || 0)
        needsConversion = true // Always USD
        break
      case 'certificate':
        costInOriginalCurrency = investment.amount
        needsConversion = false // Always EGP
        break
      case 'stock':
        costInOriginalCurrency = (investment.shares * investment.purchasePrice) + (investment.commission || 0)
        needsConversion = true // Always USD
        break
      default:
        return 0
    }

    // Convert to EGP if needed
    return needsConversion ? costInOriginalCurrency * exchangeRate : costInOriginalCurrency
  }

  const getTotalPortfolioValue = () => {
    return investments.reduce((total, inv) => total + calculateInvestmentValue(inv), 0)
  }

  const getTotalCost = () => {
    return investments.reduce((total, inv) => total + calculateInvestmentCost(inv), 0)
  }

  const getTotalProfitLoss = () => {
    return getTotalPortfolioValue() - getTotalCost()
  }

  const getReturnPercentage = () => {
    const cost = getTotalCost()
    if (cost === 0) return 0
    return (getTotalProfitLoss() / cost) * 100
  }

  const getPortfolioDistribution = () => {
    const totalValue = getTotalPortfolioValue()
    const distribution: { [key: string]: number } = {}

    investments.forEach(inv => {
      const value = calculateInvestmentValue(inv)
      const typeLabel =
        inv.type === 'precious_metals' ? 'المعادن الثمينة' :
        inv.type === 'cryptocurrency' ? 'العملات الرقمية' :
        inv.type === 'certificate' ? 'الشهادات والودائع' :
        'الأسهم'

      distribution[typeLabel] = (distribution[typeLabel] || 0) + value
    })

    return Object.entries(distribution).map(([type, value]) => ({
      type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }))
  }

  const addQuantity = (id: string, quantity: number, purchasePrice: number) => {
    const investment = investments.find(inv => inv.id === id)
    if (!investment || investment.type === 'certificate') return

    if (investment.type === 'precious_metals') {
      const oldCost = investment.quantity * investment.purchasePrice
      const newCost = quantity * purchasePrice
      const totalQuantity = investment.quantity + quantity
      const avgPrice = (oldCost + newCost) / totalQuantity

      updateInvestment(id, {
        quantity: totalQuantity,
        purchasePrice: avgPrice,
      } as Partial<Investment>)
    } else if (investment.type === 'cryptocurrency') {
      const oldCost = investment.quantity * investment.purchasePrice
      const newCost = quantity * purchasePrice
      const totalQuantity = investment.quantity + quantity
      const avgPrice = (oldCost + newCost) / totalQuantity

      updateInvestment(id, {
        quantity: totalQuantity,
        purchasePrice: avgPrice,
      } as Partial<Investment>)
    } else if (investment.type === 'stock') {
      const oldCost = (investment.shares * investment.purchasePrice) + (investment.commission || 0)
      const newCost = quantity * purchasePrice
      const totalShares = investment.shares + quantity
      const avgPrice = (oldCost + newCost) / totalShares

      updateInvestment(id, {
        shares: totalShares,
        purchasePrice: avgPrice,
      } as Partial<Investment>)
    }
  }

  const sellInvestment = (
    id: string,
    quantity: number,
    sellPrice: number,
    commission: number,
    commissionType: 'percentage' | 'fixed',
    exchangeRateAtSale?: number
  ) => {
    const investment = investments.find(inv => inv.id === id)
    if (!investment || investment.type === 'certificate') return

    let currentQuantity = 0
    let avgPurchasePrice = 0

    if (investment.type === 'precious_metals') {
      currentQuantity = investment.quantity
      avgPurchasePrice = investment.purchasePrice
    } else if (investment.type === 'cryptocurrency') {
      currentQuantity = investment.quantity
      avgPurchasePrice = investment.purchasePrice
    } else if (investment.type === 'stock') {
      currentQuantity = investment.shares
      avgPurchasePrice = investment.purchasePrice
    }

    if (quantity > currentQuantity) return

    // Calculate sale details
    const grossProceeds = quantity * sellPrice
    const commissionAmount = commissionType === 'percentage'
      ? (grossProceeds * commission) / 100
      : commission
    const netProceeds = grossProceeds - commissionAmount
    const cost = quantity * avgPurchasePrice
    const profitLoss = netProceeds - cost

    // Create sale record
    const saleRecord: SaleRecord = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      investmentId: id,
      investmentName: investment.name,
      investmentType: investment.type,
      quantity,
      sellPrice,
      commission: commissionAmount,
      commissionType,
      grossProceeds,
      netProceeds,
      profitLoss,
      currency: investment.currency,
      exchangeRateAtSale,
      date: new Date().toISOString(),
    }

    setSalesHistory([...salesHistory, saleRecord])

    // Update or delete investment
    const remainingQuantity = currentQuantity - quantity

    if (remainingQuantity === 0) {
      deleteInvestment(id)
    } else {
      if (investment.type === 'precious_metals') {
        updateInvestment(id, { quantity: remainingQuantity } as Partial<Investment>)
      } else if (investment.type === 'cryptocurrency') {
        updateInvestment(id, { quantity: remainingQuantity } as Partial<Investment>)
      } else if (investment.type === 'stock') {
        updateInvestment(id, { shares: remainingQuantity } as Partial<Investment>)
      }
    }
  }

  const getPriceChange = (investmentId: string): PriceChange | null => {
    const history = getPriceHistory(investmentId)
    if (history.length < 2) return null

    const latestPrice = history[0].price
    const previousPrice = history[1].price

    const amount = latestPrice - previousPrice
    const percentage = previousPrice > 0 ? (amount / previousPrice) * 100 : 0
    const direction = amount > 0 ? 'up' : amount < 0 ? 'down' : 'neutral'

    return { amount, percentage, direction }
  }

  const getSalesHistory = () => {
    return salesHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return (
    <InvestmentsContext.Provider
      value={{
        investments,
        priceHistory,
        salesHistory,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        updatePrice,
        addQuantity,
        sellInvestment,
        getInvestmentById,
        getInvestmentsByType,
        getPriceHistory,
        getPriceChange,
        getSalesHistory,
        getTotalPortfolioValue,
        getTotalCost,
        getTotalProfitLoss,
        getReturnPercentage,
        getPortfolioDistribution,
      }}
    >
      {children}
    </InvestmentsContext.Provider>
  )
}

export function useInvestments() {
  const context = useContext(InvestmentsContext)
  if (context === undefined) {
    throw new Error('useInvestments must be used within an InvestmentsProvider')
  }
  return context
}

