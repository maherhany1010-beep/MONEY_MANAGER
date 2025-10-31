'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export type InvestmentType = 'precious_metals' | 'cryptocurrency' | 'certificate' | 'stock'

export interface Investment {
  // Database fields (snake_case)
  id: string
  user_id?: string
  investment_name: string
  investment_type: string
  initial_amount: number
  current_value: number
  expected_return: number | null
  start_date: string
  maturity_date: string | null
  status: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  investmentName?: string
  investmentType?: 'stocks' | 'bonds' | 'real_estate' | 'mutual_funds' | 'crypto' | 'other'
  initialAmount?: number
  currentValue?: number
  expectedReturn?: number
  returnRate?: number
  startDate?: string
  maturityDate?: string
  investmentStatus?: 'active' | 'matured' | 'sold' | 'cancelled'
  provider?: string
  accountNumber?: string
  riskLevel?: 'low' | 'medium' | 'high'
  currency?: string
  notes?: string
  profit?: number
  loss?: number

  // Additional fields for different investment types
  type?: InvestmentType
  quantity?: number
  currentPrice?: number
  purchasePrice?: number
  metalType?: string
  cryptoSymbol?: string
  bank?: string
  interestRate?: number
  tickerSymbol?: string
  market?: string
  purchaseFee?: number
  cryptoPurchaseFee?: number
  amount?: number
  shares?: number
  commission?: number
  name?: string
  symbol?: string
  purchaseDate?: string
  lastUpdated?: string
  unit?: string
}

interface InvestmentsContextType {
  investments: Investment[]
  loading: boolean
  error: string | null
  addInvestment: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Investment | null>
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>
  deleteInvestment: (id: string) => Promise<void>
  getInvestmentById: (id: string) => Investment | undefined
  getActiveInvestments: () => Investment[]
  getTotalInvestmentValue: () => number
  getTotalProfit: () => number
  getTotalPortfolioValue: () => number
  getTotalCost: () => number
  getTotalProfitLoss: () => number
  getReturnPercentage: () => number
  getPriceChange: (id: string) => { direction: string; value: number; percentage: number }
  addQuantity: (id: string, quantity: number, price: number, fee: number) => Promise<void>
  updatePrice: (id: string, newPrice: number) => Promise<void>
  sellInvestment: (id: string, quantity: number, price: number, fee: number) => Promise<void>
}

const InvestmentsContext = createContext<InvestmentsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load investments from Supabase
  // ===================================
  const loadInvestments = async () => {
    if (!user) {
      setInvestments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading investments:', fetchError)
        setError(fetchError.message)
      } else {
        setInvestments(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading investments:', err)
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
      setInvestments([])
      setLoading(false)
      return
    }

    loadInvestments()

    const channel: RealtimeChannel = supabase
      .channel('investments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setInvestments((prev) => [payload.new as Investment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setInvestments((prev) =>
              prev.map((investment) =>
                investment.id === (payload.new as Investment).id
                  ? (payload.new as Investment)
                  : investment
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setInvestments((prev) =>
              prev.filter((investment) => investment.id !== (payload.old as Investment).id)
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
  // ➕ Add investment
  // ===================================
  const addInvestment = async (
    investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Investment | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('investments')
        .insert([
          {
            user_id: user.id,
            investment_name: investment.investment_name,
            investment_type: investment.investment_type,
            initial_amount: investment.initial_amount,
            current_value: investment.current_value,
            expected_return: investment.expected_return,
            start_date: investment.start_date,
            maturity_date: investment.maturity_date,
            status: investment.status || 'active',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding investment:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding investment:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update investment
  // ===================================
  const updateInvestment = async (id: string, updates: Partial<Investment>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating investment:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating investment:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete investment
  // ===================================
  const deleteInvestment = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting investment:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting investment:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get investment by ID
  // ===================================
  const getInvestmentById = (id: string): Investment | undefined => {
    return investments.find((i) => i.id === id)
  }

  // ===================================
  // ✅ Get active investments
  // ===================================
  const getActiveInvestments = (): Investment[] => {
    return investments.filter((i) => i.status === 'active')
  }

  // ===================================
  // 💰 Get total investment value
  // ===================================
  const getTotalInvestmentValue = (): number => {
    return investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + (i.current_value || 0), 0)
  }

  // ===================================
  // 📈 Get total profit
  // ===================================
  const getTotalProfit = (): number => {
    return investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + ((i.current_value || 0) - (i.initial_amount || 0)), 0)
  }

  // ===================================
  // 💼 Get total portfolio value
  // ===================================
  const getTotalPortfolioValue = (): number => {
    return getTotalInvestmentValue()
  }

  // ===================================
  // 💵 Get total cost
  // ===================================
  const getTotalCost = (): number => {
    return investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + (i.initial_amount || 0), 0)
  }

  // ===================================
  // 📊 Get total profit/loss
  // ===================================
  const getTotalProfitLoss = (): number => {
    return getTotalProfit()
  }

  // ===================================
  // 📈 Get return percentage
  // ===================================
  const getReturnPercentage = (): number => {
    const totalCost = getTotalCost()
    if (totalCost === 0) return 0
    return (getTotalProfitLoss() / totalCost) * 100
  }

  // ===================================
  // 📉 Get price change
  // ===================================
  const getPriceChange = (id: string): { direction: string; value: number; percentage: number } => {
    const investment = getInvestmentById(id)
    if (!investment) return { direction: 'neutral', value: 0, percentage: 0 }

    const currentValue = investment.current_value || 0
    const initialAmount = investment.initial_amount || 0

    if (initialAmount === 0) return { direction: 'neutral', value: 0, percentage: 0 }

    const value = currentValue - initialAmount
    const percentage = (value / initialAmount) * 100
    const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'

    return { direction, value, percentage }
  }

  // ===================================
  // ➕ Add quantity to investment
  // ===================================
  const addQuantity = async (id: string, quantity: number, price: number, fee: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment) return

    const newQuantity = (investment.quantity ?? 0) + quantity
    const totalCost = (investment.initial_amount ?? 0) + (price * quantity) + fee

    await updateInvestment(id, {
      quantity: newQuantity,
      initial_amount: totalCost,
    })
  }

  // ===================================
  // 💰 Sell investment
  // ===================================
  const sellInvestment = async (id: string, quantity: number, price: number, fee: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment) return

    const newQuantity = (investment.quantity ?? 0) - quantity
    const saleValue = (price * quantity) - fee

    if (newQuantity <= 0) {
      // Sell all - delete investment
      await deleteInvestment(id)
    } else {
      // Partial sale - update quantity
      await updateInvestment(id, {
        quantity: newQuantity,
        current_value: (investment.current_value ?? 0) - saleValue,
      })
    }
  }

  // ===================================
  // 📈 Update Price
  // ===================================
  const updatePrice = async (id: string, newPrice: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment) return

    await updateInvestment(id, {
      currentPrice: newPrice,
      current_value: newPrice * (investment.quantity ?? 0),
    })
  }

  return (
    <InvestmentsContext.Provider
      value={{
        investments,
        loading,
        error,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        getInvestmentById,
        getActiveInvestments,
        getTotalInvestmentValue,
        getTotalProfit,
        getTotalPortfolioValue,
        getTotalCost,
        getTotalProfitLoss,
        getReturnPercentage,
        getPriceChange,
        addQuantity,
        sellInvestment,
        updatePrice,
      }}
    >
      {children}
    </InvestmentsContext.Provider>
  )
}

export function useInvestments() {
  const context = useContext(InvestmentsContext)
  if (!context) {
    throw new Error('useInvestments must be used within an InvestmentsProvider')
  }
  return context
}

