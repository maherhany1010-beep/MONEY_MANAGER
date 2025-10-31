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
  type?: string
  role?: 'manager' | 'member'
  monthlyAmount?: number
  nextPaymentDate?: string
  members?: any[]
  payments?: any[]
  totalMembers?: number
  duration?: number
  hasFees?: boolean
  paymentMethod?: string
  totalCollected?: number
  totalDistributed?: number
  feePercentage?: number
  feeAmount?: number
  nextRecipient?: string
  lastPaymentDate?: string
  totalFees?: number
  currentBalance?: number
  createdAt?: string
  updatedAt?: string
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
        setCircles(data || [])
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
      const { data, error: insertError } = await supabase
        .from('savings_circles')
        .insert([
          {
            user_id: user.id,
            circle_name: circle.circle_name,
            total_amount: circle.total_amount,
            monthly_payment: circle.monthly_payment,
            start_date: circle.start_date,
            end_date: circle.end_date,
            status: circle.status || 'active',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding savings circle:', insertError)
        setError(insertError.message)
        return null
      }

      return data
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

