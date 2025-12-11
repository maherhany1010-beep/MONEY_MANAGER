'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Budget {
  // Database fields (snake_case)
  id: string
  user_id?: string
  category: string
  amount: number
  period_start: string
  period_end: string
  spent_amount: number
  remaining_amount?: number
  status: 'active' | 'completed' | 'exceeded'
  alert_threshold: number
  created_at?: string
  updated_at?: string
}

interface BudgetsContextType {
  budgets: Budget[]
  loading: boolean
  error: string | null
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Budget | null>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  getBudgetByCategory: (category: string) => Budget | undefined
  refreshBudgets: () => Promise<void>
}

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined)

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load budgets from Supabase
  // ===================================
  const loadBudgets = async () => {
    if (!user) {
      setBudgets([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading budgets:', fetchError)
        setError(fetchError.message)
      } else {
        setBudgets(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading budgets:', err)
      setError('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  // ===================================
  // ➕ Add new budget
  // ===================================
  const addBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Budget | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user.id }])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding budget:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding budget:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // ✏️ Update budget
  // ===================================
  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { error: updateError } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)

      if (updateError) {
        console.error('Error updating budget:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating budget:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete budget
  // ===================================
  const deleteBudget = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (deleteError) {
        console.error('Error deleting budget:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting budget:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get budget by category
  // ===================================
  const getBudgetByCategory = (category: string): Budget | undefined => {
    return budgets.find(b => b.category === category && b.status === 'active')
  }

  // ===================================
  // 🔄 Refresh budgets
  // ===================================
  const refreshBudgets = async () => {
    await loadBudgets()
  }

  // ===================================
  // 🎧 Real-time subscription
  // ===================================
  useEffect(() => {
    if (!user) return

    loadBudgets()

    // Setup real-time subscription
    const budgetsChannel = supabase
      .channel('budgets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Budget change received:', payload)
          loadBudgets()
        }
      )
      .subscribe()

    setChannel(budgetsChannel)

    return () => {
      budgetsChannel.unsubscribe()
    }
  }, [user])

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        loading,
        error,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetByCategory,
        refreshBudgets,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  )
}

export function useBudgets() {
  const context = useContext(BudgetsContext)
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetsProvider')
  }
  return context
}

