'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface SavingsCircle {
  // Database fields (snake_case)
  id: string
  user_id?: string
  circle_name: string
  total_amount: number
  monthly_payment: number
  start_date: string
  end_date: string | null
  status: string
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  circleName?: string
  totalAmount?: number
  monthlyPayment?: number
  startDate?: string
  endDate?: string
  circleStatus?: 'active' | 'completed' | 'cancelled'
  numberOfMembers?: number
  currentRound?: number
  totalRounds?: number
  paymentDay?: number
  description?: string
  notes?: string
  amountPaid?: number
  remainingAmount?: number
  name?: string
  type?: 'personal' | 'app-based'
  role?: 'manager' | 'member'
  monthlyAmount?: number
  nextPaymentDate?: string
  members?: any[]
  payments?: any[]
  totalMembers?: number
  duration?: number
  hasFees?: boolean
  managementFee?: number
  feeType?: 'monthly' | 'one-time' | 'percentage'
  paymentMethod?: string
  totalCollected?: number
  totalDistributed?: number
  feePercentage?: number
  feeAmount?: number
  nextRecipient?: string
  lastPaymentDate?: string
  totalFees?: number
  currentBalance?: number
  myTurnNumber?: number
  my_turn_number?: number
  appName?: string
  appAccountId?: string
  createdAt?: string
  updatedAt?: string
  current_round?: number
  hasWithdrawn?: boolean
  withdrawnAmount?: number
  totalWithdrawn?: number
  totalPaid?: number
}

interface SavingsCirclesContextType {
  circles: SavingsCircle[]
  loading: boolean
  error: string | null
  addCircle: (circle: Omit<SavingsCircle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<SavingsCircle | null>
  updateCircle: (id: string, updates: Partial<SavingsCircle>) => Promise<void>
  deleteCircle: (id: string) => Promise<void>
  getCircleById: (id: string) => SavingsCircle | undefined
  getActiveCircles: () => SavingsCircle[]
  getTotalSavings: () => number
  stats?: {
    totalCircles: number
    activeCircles: number
    totalSavings: number
    monthlyContribution: number
    totalMonthlyCommitment?: number
    totalInCircles?: number
    totalFeesEarned?: number
    totalPayments?: number
    totalWithdrawals?: number
    balance?: number
  }
  filter?: string
  setFilter?: (filter: string) => void
}

const SavingsCirclesContext = createContext<SavingsCirclesContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function SavingsCirclesProvider({ children }: { children: ReactNode }) {
  const [circles, setCircles] = useState<SavingsCircle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load circles from Supabase
  // ===================================
  const loadCircles = async () => {
    if (!user) {
      setCircles([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('savings_circles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading savings circles:', fetchError)
        setError(fetchError.message)
      } else {
        // قراءة البيانات الإضافية من localStorage
        let savedExtras: Record<string, any> = {}
        try {
          savedExtras = JSON.parse(localStorage.getItem('circles_extra_data') || '{}')
        } catch (e) {
          // تجاهل الخطأ
        }

        // معالجة الجمعيات ودمج البيانات الإضافية من localStorage
        const processedCircles = (data || []).map(circle => {
          // البيانات الإضافية من localStorage (باستخدام ID الجمعية)
          const extraData = savedExtras[circle.id] || {}

          // دمج البيانات الأساسية مع الإضافية
          const enrichedCircle = {
            ...circle,
            role: extraData.role || 'manager',
            type: extraData.type,
            myTurnNumber: extraData.myTurnNumber,
            duration: extraData.duration || 12,
            totalMembers: extraData.totalMembers,
            hasFees: extraData.hasFees,
            managementFee: extraData.managementFee,
            feeType: extraData.feeType,
            paymentMethod: extraData.paymentMethod,
            appName: extraData.appName,
            appAccountId: extraData.appAccountId,
            description: extraData.description,
            currentRound: extraData.currentRound || 1,
            totalPaid: extraData.totalPaid || 0,
            totalWithdrawn: extraData.totalWithdrawn || 0,
            monthlyAmount: circle.monthly_payment,
            name: circle.circle_name,
          }

          const startDate = enrichedCircle.start_date
          const duration = enrichedCircle.duration

          if (startDate && enrichedCircle.status === 'active') {
            const start = new Date(startDate)
            const endDate = new Date(start)
            endDate.setMonth(endDate.getMonth() + duration)

            // حساب عدد الدورات التي يجب أن تكون مسددة
            const now = new Date()
            const monthsDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
            const expectedRound = Math.min(Math.max(monthsDiff + 1, 1), duration)

            // تحديث الحالة إذا انتهت الجمعية
            if (now > endDate) {
              return { ...enrichedCircle, status: 'completed', currentRound: duration, current_round: duration }
            }

            // تحديث الدورة الحالية إذا كانت أقل من المتوقع
            const currentRound = enrichedCircle.currentRound || enrichedCircle.current_round || 1
            if (currentRound < expectedRound) {
              return { ...enrichedCircle, currentRound: expectedRound, current_round: expectedRound }
            }
          }

          return enrichedCircle
        })

        setCircles(processedCircles)
      }
    } catch (err) {
      console.error('Unexpected error loading savings circles:', err)
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
      setCircles([])
      setLoading(false)
      return
    }

    loadCircles()

    const channel: RealtimeChannel = supabase
      .channel('savings_circles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_circles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCircles((prev) => [payload.new as SavingsCircle, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCircles((prev) =>
              prev.map((circle) =>
                circle.id === (payload.new as SavingsCircle).id
                  ? (payload.new as SavingsCircle)
                  : circle
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setCircles((prev) =>
              prev.filter((circle) => circle.id !== (payload.old as SavingsCircle).id)
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
  // ➕ Add circle
  // ===================================
  const addCircle = async (
    circle: Omit<SavingsCircle, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<SavingsCircle | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      // حساب تاريخ الانتهاء بناءً على المدة
      const startDate = new Date(circle.start_date)
      const duration = circle.duration || circle.totalMembers || 12
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + Number(duration))

      // البيانات الأساسية للإدخال (الحقول الموجودة في قاعدة البيانات فقط)
      const insertData = {
        user_id: user.id,
        circle_name: circle.circle_name || circle.name || 'جمعية جديدة',
        total_amount: Number(circle.total_amount) || 0,
        monthly_payment: Number(circle.monthly_payment || circle.monthlyAmount) || 0,
        start_date: circle.start_date,
        end_date: endDate.toISOString().split('T')[0],
        status: circle.status || 'active',
      }

      console.log('Inserting circle with data:', insertData)

      const { data, error: insertError } = await supabase
        .from('savings_circles')
        .insert([insertData])
        .select()
        .single()

      console.log('Insert result - data:', data, 'error:', insertError)

      if (insertError) {
        console.error('Error adding savings circle:', insertError.message)
        setError(insertError.message || 'حدث خطأ أثناء إضافة الجمعية')
        return null
      }

      if (!data) {
        console.error('No data returned from insert')
        setError('لم يتم إرجاع بيانات من قاعدة البيانات')
        return null
      }

      // إنشاء كائن الجمعية الكامل مع البيانات الإضافية (محلياً)
      const fullCircle: SavingsCircle = {
        ...data,
        // البيانات الإضافية من النموذج (محفوظة محلياً فقط)
        name: circle.name || circle.circle_name,
        description: circle.description,
        type: circle.type,
        role: circle.role || 'manager',
        monthlyAmount: circle.monthlyAmount || circle.monthly_payment,
        totalMembers: circle.totalMembers,
        duration: duration,
        hasFees: circle.hasFees,
        managementFee: circle.managementFee,
        feeType: circle.feeType,
        paymentMethod: circle.paymentMethod,
        myTurnNumber: circle.myTurnNumber,
        appName: circle.appName,
        appAccountId: circle.appAccountId,
        currentRound: 1,
        current_round: 1,
        totalFees: circle.totalFees || 0,
        currentBalance: 0,
        totalPaid: 0,
        totalWithdrawn: 0,
      }

      // تحديث الـ state محلياً بالبيانات الكاملة
      setCircles(prev => [fullCircle, ...prev])

      // حفظ البيانات الإضافية في localStorage للاستمرارية
      try {
        const savedExtras = JSON.parse(localStorage.getItem('circles_extra_data') || '{}')
        savedExtras[data.id] = {
          role: circle.role || 'manager',
          type: circle.type,
          myTurnNumber: circle.myTurnNumber,
          duration: duration,
          totalMembers: circle.totalMembers,
          hasFees: circle.hasFees,
          managementFee: circle.managementFee,
          feeType: circle.feeType,
          paymentMethod: circle.paymentMethod,
          appName: circle.appName,
          appAccountId: circle.appAccountId,
          description: circle.description,
          currentRound: 1,
          totalPaid: 0,
          totalWithdrawn: 0,
        }
        localStorage.setItem('circles_extra_data', JSON.stringify(savedExtras))
      } catch (e) {
        console.warn('Could not save extra data to localStorage:', e)
      }

      return fullCircle
    } catch (err) {
      console.error('Unexpected error adding savings circle:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update circle
  // ===================================
  const updateCircle = async (id: string, updates: Partial<SavingsCircle>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('savings_circles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating savings circle:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating savings circle:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete circle
  // ===================================
  const deleteCircle = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('savings_circles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting savings circle:', deleteError)
        setError(deleteError.message)
      } else {
        // حذف من الـ state المحلي أيضاً
        setCircles(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Unexpected error deleting savings circle:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get circle by ID
  // ===================================
  const getCircleById = (id: string): SavingsCircle | undefined => {
    return circles.find((c) => c.id === id)
  }

  // ===================================
  // ✅ Get active circles
  // ===================================
  const getActiveCircles = (): SavingsCircle[] => {
    return circles.filter((c) => c.status === 'active')
  }

  // ===================================
  // 💰 Get total savings
  // ===================================
  const getTotalSavings = (): number => {
    return circles
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + (c.total_amount || 0), 0)
  }

  // ===================================
  // 📊 Calculate stats
  // ===================================

  // حساب إجمالي المدفوعات (المبلغ الشهري × عدد الدورات المدفوعة)
  // نحسب فقط إذا كان هناك totalPaid مسجل (أي تم سداد فعلي)
  const totalPayments = circles.length === 0 ? 0 : circles
    .reduce((sum, c) => {
      // استخدام totalPaid فقط إذا كان موجوداً ومسجل
      if (c.totalPaid && c.totalPaid > 0) {
        return sum + c.totalPaid
      }
      // لا نحسب من currentRound لأنه يبدأ من 1 افتراضياً
      return sum
    }, 0)

  // حساب إجمالي المسحوبات (المبلغ الكلي إذا استلمت دورك)
  const totalWithdrawals = circles.length === 0 ? 0 : circles
    .reduce((sum, c) => {
      // إذا تم تسجيل السحب
      if (c.hasWithdrawn) {
        const totalAmount = c.withdrawnAmount || c.total_amount ||
          ((c.monthly_payment || c.monthlyAmount || 0) * (c.totalMembers || c.duration || 1))
        return sum + totalAmount
      }
      return sum
    }, 0)

  // الرصيد = المدفوعات - المسحوبات
  // موجب (+) = عليّ مبلغ (دفعت أكثر مما استلمت)
  // سالب (-) = لي مبلغ (استلمت أكثر مما دفعت)
  const balance = totalPayments - totalWithdrawals

  const stats = {
    totalCircles: circles.length,
    activeCircles: circles.filter(c => c.status === 'active').length,
    totalSavings: getTotalSavings(),
    monthlyContribution: circles
      .filter(c => c.status === 'active' && c.role === 'member')
      .reduce((sum, c) => sum + (c.monthly_payment || c.monthlyAmount || 0), 0),
    totalMonthlyCommitment: circles
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.monthly_payment || c.monthlyAmount || 0), 0),
    totalInCircles: circles
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.total_amount || 0), 0),
    totalPayments,
    totalWithdrawals,
    balance,
  }

  return (
    <SavingsCirclesContext.Provider
      value={{
        circles,
        loading,
        error,
        addCircle,
        updateCircle,
        deleteCircle,
        getCircleById,
        getActiveCircles,
        getTotalSavings,
        stats,
      }}
    >
      {children}
    </SavingsCirclesContext.Provider>
  )
}

export function useSavingsCircles() {
  const context = useContext(SavingsCirclesContext)
  if (!context) {
    throw new Error('useSavingsCircles must be used within a SavingsCirclesProvider')
  }
  return context
}

