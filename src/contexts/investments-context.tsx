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
  cryptoName?: string
  bank?: string
  bankName?: string
  interestRate?: number
  interestPeriod?: string
  tickerSymbol?: string
  stockSymbol?: string
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
  wallet?: string
  certificateNumber?: string
  certificateType?: string
  companyName?: string
  storageLocation?: string
  exchangeRateAtPurchase?: number
  currentExchangeRate?: number
  exchangeRate?: number
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
  renewCertificate: (id: string, newInterestRate: number) => Promise<void>
  withdrawCertificate: (id: string, penaltyAmount?: number) => Promise<void>
  updateCertificate: (id: string, amount: number, interestRate: number) => Promise<void>
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
  // 🔄 Helper: Parse investment data from DB
  // ===================================
  const parseInvestmentFromDB = (dbData: Record<string, unknown>): Investment => {
    let details: Record<string, unknown> = {}

    // محاولة استخراج التفاصيل من investment_type (مخزنة كـ JSON)
    try {
      if (dbData.investment_type && typeof dbData.investment_type === 'string') {
        const parsed = JSON.parse(dbData.investment_type)
        if (typeof parsed === 'object' && parsed !== null) {
          details = parsed
        }
      }
    } catch {
      // investment_type ليس JSON، استخدمه كنوع فقط
    }

    return {
      ...dbData,
      ...details,
      name: dbData.investment_name as string,
      type: (details.type as InvestmentType) || (dbData.investment_type as InvestmentType),
      notes: details.userNotes as string | undefined,
    } as Investment
  }

  // ===================================
  // 📥 Load investments from Supabase
  // ===================================
  const loadInvestments = async () => {
    if (!user) {
      console.log('No user found, skipping investments load')
      setInvestments([])
      setLoading(false)
      return
    }

    console.log('Loading investments for user:', user.id)

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading investments:', JSON.stringify(fetchError, null, 2))
        console.error('Error code:', fetchError.code)
        console.error('Error message:', fetchError.message)
        console.error('Error details:', fetchError.details)
        console.error('Error hint:', fetchError.hint)
        setError(fetchError.message || 'فشل في تحميل الاستثمارات')
      } else {
        // تحويل البيانات لتتضمن التفاصيل المحفوظة
        const enrichedData = (data || []).map(parseInvestmentFromDB)
        setInvestments(enrichedData)
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
            const newInvestment = parseInvestmentFromDB(payload.new as Record<string, unknown>)
            setInvestments((prev) => {
              // تجنب الإضافة المكررة (قد تكون أُضيفت محلياً بالفعل)
              const exists = prev.some(inv => inv.id === newInvestment.id)
              if (exists) return prev
              return [newInvestment, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedInvestment = parseInvestmentFromDB(payload.new as Record<string, unknown>)
            setInvestments((prev) =>
              prev.map((investment) =>
                investment.id === updatedInvestment.id
                  ? updatedInvestment
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
      // حساب القيم بناءً على نوع الاستثمار
      let initialAmount = 0
      let currentValue = 0
      const investmentName = investment.name || investment.investment_name || ''

      switch (investment.type) {
        case 'precious_metals':
          initialAmount = ((investment.quantity ?? 0) * (investment.purchasePrice ?? 0)) + (investment.purchaseFee ?? 0)
          currentValue = (investment.quantity ?? 0) * (investment.currentPrice ?? 0)
          break
        case 'cryptocurrency':
          initialAmount = ((investment.quantity ?? 0) * (investment.purchasePrice ?? 0)) + (investment.cryptoPurchaseFee ?? 0)
          currentValue = (investment.quantity ?? 0) * (investment.currentPrice ?? 0)
          break
        case 'certificate':
          initialAmount = investment.amount ?? 0
          currentValue = investment.amount ?? 0
          break
        case 'stock':
          initialAmount = ((investment.shares ?? 0) * (investment.purchasePrice ?? 0)) + (investment.commission ?? 0)
          currentValue = (investment.shares ?? 0) * (investment.currentPrice ?? 0)
          break
        default:
          initialAmount = investment.initial_amount ?? 0
          currentValue = investment.current_value ?? 0
      }

      // تخزين التفاصيل الإضافية كـ JSON في حقل investment_type
      // لأن الجدول لا يحتوي على أعمدة إضافية
      const details = {
        type: investment.type,
        quantity: investment.quantity,
        purchasePrice: investment.purchasePrice,
        currentPrice: investment.currentPrice,
        metalType: investment.metalType,
        unit: investment.unit,
        purchaseFee: investment.purchaseFee,
        cryptoSymbol: investment.cryptoSymbol,
        cryptoName: investment.cryptoName,
        cryptoPurchaseFee: investment.cryptoPurchaseFee,
        wallet: investment.wallet,
        bank: investment.bank,
        amount: investment.amount,
        interestRate: investment.interestRate,
        interestPeriod: investment.interestPeriod,
        certificateNumber: investment.certificateNumber,
        certificateType: investment.certificateType,
        tickerSymbol: investment.tickerSymbol,
        market: investment.market,
        companyName: investment.companyName,
        shares: investment.shares,
        commission: investment.commission,
        storageLocation: investment.storageLocation,
        currency: investment.currency,
        exchangeRateAtPurchase: investment.exchangeRateAtPurchase,
        currentExchangeRate: investment.currentExchangeRate,
        maturityDate: investment.maturityDate,
        userNotes: investment.notes,
      }

      // البيانات التي سيتم حفظها في قاعدة البيانات
      // نستخدم فقط الأعمدة الموجودة في الجدول
      const dbData = {
        user_id: user.id,
        investment_name: investmentName,
        investment_type: JSON.stringify(details), // تخزين التفاصيل كـ JSON
        initial_amount: initialAmount,
        current_value: currentValue,
        start_date: investment.purchaseDate || investment.startDate || investment.start_date || new Date().toISOString().split('T')[0],
        status: investment.status || 'active',
      }

      console.log('Sending to DB:', dbData) // للتصحيح

      const { data, error: insertError } = await supabase
        .from('investments')
        .insert([dbData])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding investment:', insertError)
        console.error('Error details:', JSON.stringify(insertError, null, 2))
        setError(insertError.message || 'حدث خطأ أثناء إضافة الاستثمار')
        return null
      }

      // تحويل البيانات المرجعة لتتضمن التفاصيل الإضافية
      if (data) {
        let parsedDetails: Record<string, unknown> = {}
        try {
          if (data.investment_type && typeof data.investment_type === 'string') {
            parsedDetails = JSON.parse(data.investment_type)
          }
        } catch {
          // investment_type ليس JSON
        }

        const enrichedData: Investment = {
          ...data,
          ...parsedDetails,
          name: data.investment_name,
          type: parsedDetails.type as InvestmentType,
        } as Investment

        // تحديث الـ state محلياً فوراً
        setInvestments((prev) => [enrichedData, ...prev])

        return enrichedData
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
      // الحصول على الاستثمار الحالي
      const currentInvestment = getInvestmentById(id)
      if (!currentInvestment) {
        setError('الاستثمار غير موجود')
        return
      }

      // دمج التحديثات مع البيانات الحالية
      const mergedData = { ...currentInvestment, ...updates }

      // تجهيز التفاصيل لحفظها في investment_type كـ JSON
      const details = {
        type: mergedData.type,
        metalType: mergedData.metalType,
        cryptoSymbol: mergedData.cryptoSymbol,
        certificateType: mergedData.certificateType,
        bankName: mergedData.bankName,
        stockSymbol: mergedData.stockSymbol,
        quantity: mergedData.quantity,
        purchasePrice: mergedData.purchasePrice,
        currentPrice: mergedData.currentPrice,
        unit: mergedData.unit,
        currency: mergedData.currency,
        interestRate: mergedData.interestRate,
        exchangeRate: mergedData.exchangeRate,
        currentExchangeRate: mergedData.currentExchangeRate,
        maturityDate: mergedData.maturityDate,
        userNotes: mergedData.notes,
      }

      // البيانات التي سيتم إرسالها لقاعدة البيانات
      const dbData: Record<string, unknown> = {
        investment_type: JSON.stringify(details),
        current_value: updates.current_value ?? mergedData.current_value,
      }

      // إضافة الحقول الأخرى إذا تم تحديثها
      if (updates.initial_amount !== undefined) {
        dbData.initial_amount = updates.initial_amount
      }
      if (updates.status !== undefined) {
        dbData.status = updates.status
      }
      if (updates.investment_name !== undefined) {
        dbData.investment_name = updates.investment_name
      }

      console.log('Updating investment with:', dbData)

      const { error: updateError } = await supabase
        .from('investments')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating investment:', JSON.stringify(updateError, null, 2))
        setError(updateError.message || 'فشل في تحديث الاستثمار')
      } else {
        // تحديث الحالة المحلية
        setInvestments(prev => prev.map(inv =>
          inv.id === id ? { ...inv, ...updates, ...details } : inv
        ))
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
      console.log('Deleting investment:', id, 'for user:', user.id)

      const { data, error: deleteError } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      console.log('Delete result - data:', data, 'error:', deleteError)

      if (deleteError) {
        console.error('Error deleting investment:', JSON.stringify(deleteError, null, 2))
        setError(deleteError.message || 'فشل في حذف الاستثمار')
      } else {
        // تحديث الحالة المحلية بعد الحذف الناجح
        console.log('Investment deleted successfully, updating local state')
        setInvestments(prev => prev.filter(inv => inv.id !== id))
      }
    } catch (err) {
      console.error('Unexpected error deleting investment:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 💱 تحويل القيمة للجنيه المصري
  // ===================================
  const convertToEGP = (value: number, currency: string, exchangeRate?: number): number => {
    if (currency === 'EGP' || !currency) return value
    // استخدام سعر الصرف المحدد أو السعر الافتراضي
    const rate = exchangeRate || 50 // سعر صرف افتراضي
    return value * rate
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
  // 💰 Get total investment value (بالجنيه المصري)
  // ===================================
  const getTotalInvestmentValue = (): number => {
    return investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => {
        const currentValue = i.current_value || 0
        const currency = i.currency || 'EGP'
        const exchangeRate = i.currentExchangeRate || i.exchangeRateAtPurchase || 50
        return sum + convertToEGP(currentValue, currency, exchangeRate)
      }, 0)
  }

  // ===================================
  // 📈 Get total profit (بالجنيه المصري)
  // ===================================
  const getTotalProfit = (): number => {
    return investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => {
        const currentValue = i.current_value || 0
        const initialAmount = i.initial_amount || 0
        const currency = i.currency || 'EGP'
        const currentExchangeRate = i.currentExchangeRate || i.exchangeRateAtPurchase || 50
        const purchaseExchangeRate = i.exchangeRateAtPurchase || 50

        // تحويل القيمة الحالية بسعر الصرف الحالي
        const currentValueEGP = convertToEGP(currentValue, currency, currentExchangeRate)
        // تحويل التكلفة بسعر الصرف وقت الشراء
        const initialAmountEGP = convertToEGP(initialAmount, currency, purchaseExchangeRate)

        return sum + (currentValueEGP - initialAmountEGP)
      }, 0)
  }

  // ===================================
  // 💼 Get total portfolio value (بالجنيه المصري)
  // ===================================
  const getTotalPortfolioValue = (): number => {
    return getTotalInvestmentValue()
  }

  // ===================================
  // 💵 Get total cost (بالجنيه المصري)
  // ===================================
  const getTotalCost = (): number => {
    return investments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => {
        const initialAmount = i.initial_amount || 0
        const currency = i.currency || 'EGP'
        const exchangeRate = i.exchangeRateAtPurchase || 50
        // التكلفة تحسب بسعر الصرف وقت الشراء
        return sum + convertToEGP(initialAmount, currency, exchangeRate)
      }, 0)
  }

  // ===================================
  // 📊 Get total profit/loss (بالجنيه المصري)
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
  // 📉 Get price change (بالجنيه المصري)
  // ===================================
  const getPriceChange = (id: string): { direction: string; value: number; percentage: number } => {
    const investment = getInvestmentById(id)
    if (!investment) return { direction: 'neutral', value: 0, percentage: 0 }

    const currentValue = investment.current_value || 0
    const initialAmount = investment.initial_amount || 0
    const currency = investment.currency || 'EGP'
    const currentExchangeRate = investment.currentExchangeRate || investment.exchangeRateAtPurchase || 50
    const purchaseExchangeRate = investment.exchangeRateAtPurchase || 50

    // تحويل القيم للجنيه المصري
    const currentValueEGP = convertToEGP(currentValue, currency, currentExchangeRate)
    const initialAmountEGP = convertToEGP(initialAmount, currency, purchaseExchangeRate)

    if (initialAmountEGP === 0) return { direction: 'neutral', value: 0, percentage: 0 }

    const value = currentValueEGP - initialAmountEGP
    const percentage = (value / initialAmountEGP) * 100
    const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral'

    return { direction, value, percentage }
  }

  // ===================================
  // ➕ Add quantity to investment
  // ===================================
  const addQuantity = async (id: string, quantityToAdd: number, price: number, fee: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment) return

    const newQuantity = (investment.quantity ?? 0) + quantityToAdd
    const totalCost = (investment.initial_amount ?? 0) + (price * quantityToAdd) + fee
    const newCurrentValue = newQuantity * (investment.currentPrice ?? price)

    await updateInvestment(id, {
      quantity: newQuantity,
      initial_amount: totalCost,
      current_value: newCurrentValue,
    })
  }

  // ===================================
  // 💰 Sell investment
  // ===================================
  const sellInvestment = async (id: string, quantityToSell: number, price: number, fee: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment) return

    const currentQuantity = investment.quantity ?? 0
    const newQuantity = currentQuantity - quantityToSell

    if (newQuantity <= 0) {
      // Sell all - delete investment
      await deleteInvestment(id)
    } else {
      // Partial sale - update quantity
      const newCurrentValue = newQuantity * (investment.currentPrice ?? price)
      const costPerUnit = (investment.initial_amount ?? 0) / currentQuantity
      const newInitialAmount = costPerUnit * newQuantity

      await updateInvestment(id, {
        quantity: newQuantity,
        initial_amount: newInitialAmount,
        current_value: newCurrentValue,
      })
    }
  }

  // ===================================
  // 📈 Update Price
  // ===================================
  const updatePrice = async (id: string, newPrice: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment) return

    const quantity = investment.quantity ?? 0
    const newCurrentValue = newPrice * quantity

    await updateInvestment(id, {
      currentPrice: newPrice,
      current_value: newCurrentValue,
    })
  }

  // ===================================
  // 🔄 Renew Certificate - تجديد الشهادة
  // ===================================
  const renewCertificate = async (id: string, newInterestRate: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment || investment.type !== 'certificate') return

    // حساب الأرباح المستحقة
    const principal = investment.amount ?? 0
    const oldInterestRate = investment.interestRate ?? 0
    const startDate = new Date(investment.startDate ?? investment.purchaseDate ?? new Date())
    const maturityDate = investment.maturityDate ? new Date(investment.maturityDate) : new Date()

    const totalDays = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalInterest = principal * (oldInterestRate / 100)

    // المبلغ الجديد = الأصل + الأرباح المستحقة
    const newAmount = principal + totalInterest

    // تاريخ البداية الجديد = اليوم
    const newStartDate = new Date().toISOString().split('T')[0]

    // تاريخ الاستحقاق الجديد = بعد نفس المدة
    const newMaturityDate = new Date()
    newMaturityDate.setDate(newMaturityDate.getDate() + totalDays)

    await updateInvestment(id, {
      amount: newAmount,
      initial_amount: newAmount,
      current_value: newAmount,
      interestRate: newInterestRate,
      startDate: newStartDate,
      start_date: newStartDate,
      maturityDate: newMaturityDate.toISOString().split('T')[0],
    })
  }

  // ===================================
  // 💰 Withdraw Certificate - سحب الشهادة
  // ===================================
  const withdrawCertificate = async (id: string, penaltyAmount: number = 0): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment || investment.type !== 'certificate') return

    // تحديث حالة الشهادة إلى "مسحوبة" مع تسجيل الغرامة
    await updateInvestment(id, {
      status: 'withdrawn',
      // يمكن تخزين الغرامة في notes أو حقل مخصص
      notes: penaltyAmount > 0 ? `غرامة السحب المبكر: ${penaltyAmount} ج.م` : investment.notes,
    })

    // حذف الشهادة بعد السحب
    await deleteInvestment(id)
  }

  // ===================================
  // ✏️ Update Certificate - تعديل الشهادة
  // ===================================
  const updateCertificate = async (id: string, amount: number, interestRate: number): Promise<void> => {
    const investment = getInvestmentById(id)
    if (!investment || investment.type !== 'certificate') return

    await updateInvestment(id, {
      amount: amount,
      initial_amount: amount,
      current_value: amount,
      interestRate: interestRate,
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
        renewCertificate,
        withdrawCertificate,
        updateCertificate,
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

