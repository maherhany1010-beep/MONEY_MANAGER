'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export type AccountType = 'bank' | 'wallet' | 'cash' | 'card' | 'prepaid' | 'cash_vault' | 'bank_account' | 'e_wallet' | 'pos_machine' | 'prepaid_card'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Reconciliation {
  // Database fields (snake_case)
  id: string
  user_id?: string
  account_id: string
  account_type: string
  reconciliation_date: string
  expected_balance: number
  actual_balance: number
  difference: number
  status: string
  notes: string | null
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  accountId?: string
  accountType?: 'bank' | 'wallet' | 'cash' | 'card' | 'prepaid'
  accountName?: string
  reconciliationDate?: string
  expectedBalance?: number
  actualBalance?: number
  balanceDifference?: number
  reconciliationStatus?: 'pending' | 'completed' | 'discrepancy'
  reconciliationNotes?: string
  resolvedBy?: string
  resolvedDate?: string
  discrepancyReason?: string
  adjustmentAmount?: number
  isResolved?: boolean
  systemBalance?: number
}

interface ReconciliationContextType {
  reconciliations: Reconciliation[]
  loading: boolean
  error: string | null
  addReconciliation: (reconciliation: Omit<Reconciliation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Reconciliation | null>
  updateReconciliation: (id: string, updates: Partial<Reconciliation>) => Promise<void>
  deleteReconciliation: (id: string) => Promise<void>
  getReconciliationById: (id: string) => Reconciliation | undefined
  getReconciliationsByAccount: (accountId: string) => Reconciliation[]
  getPendingReconciliations: () => Reconciliation[]
  getDiscrepancies: () => Reconciliation[]
}

const ReconciliationContext = createContext<ReconciliationContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function ReconciliationProvider({ children }: { children: ReactNode }) {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load reconciliations from Supabase
  // ===================================
  const loadReconciliations = async () => {
    if (!user) {
      setReconciliations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('reconciliation')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading reconciliations:', fetchError)
        setError(fetchError.message)
      } else {
        setReconciliations(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading reconciliations:', err)
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
      setReconciliations([])
      setLoading(false)
      return
    }

    loadReconciliations()

    const channel: RealtimeChannel = supabase
      .channel('reconciliation_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reconciliation',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReconciliations((prev) => [payload.new as Reconciliation, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setReconciliations((prev) =>
              prev.map((reconciliation) =>
                reconciliation.id === (payload.new as Reconciliation).id
                  ? (payload.new as Reconciliation)
                  : reconciliation
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setReconciliations((prev) =>
              prev.filter((reconciliation) => reconciliation.id !== (payload.old as Reconciliation).id)
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
  // ➕ Add reconciliation
  // ===================================
  const addReconciliation = async (
    reconciliation: Omit<Reconciliation, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Reconciliation | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('reconciliation')
        .insert([
          {
            user_id: user.id,
            account_id: reconciliation.account_id,
            account_type: reconciliation.account_type,
            reconciliation_date: reconciliation.reconciliation_date || new Date().toISOString().split('T')[0],
            expected_balance: reconciliation.expected_balance,
            actual_balance: reconciliation.actual_balance,
            difference: reconciliation.difference,
            status: reconciliation.status || 'pending',
            notes: reconciliation.notes,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding reconciliation:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding reconciliation:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update reconciliation
  // ===================================
  const updateReconciliation = async (id: string, updates: Partial<Reconciliation>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('reconciliation')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating reconciliation:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating reconciliation:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete reconciliation
  // ===================================
  const deleteReconciliation = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('reconciliation')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting reconciliation:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting reconciliation:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get reconciliation by ID
  // ===================================
  const getReconciliationById = (id: string): Reconciliation | undefined => {
    return reconciliations.find((r) => r.id === id)
  }

  // ===================================
  // 📂 Get reconciliations by account
  // ===================================
  const getReconciliationsByAccount = (accountId: string): Reconciliation[] => {
    return reconciliations.filter((r) => r.account_id === accountId)
  }

  // ===================================
  // ⏳ Get pending reconciliations
  // ===================================
  const getPendingReconciliations = (): Reconciliation[] => {
    return reconciliations.filter((r) => r.status === 'pending')
  }

  // ===================================
  // ⚠️ Get discrepancies
  // ===================================
  const getDiscrepancies = (): Reconciliation[] => {
    return reconciliations.filter((r) => r.difference !== 0)
  }

  return (
    <ReconciliationContext.Provider
      value={{
        reconciliations,
        loading,
        error,
        addReconciliation,
        updateReconciliation,
        deleteReconciliation,
        getReconciliationById,
        getReconciliationsByAccount,
        getPendingReconciliations,
        getDiscrepancies,
      }}
    >
      {children}
    </ReconciliationContext.Provider>
  )
}

export function useReconciliation() {
  const context = useContext(ReconciliationContext)
  if (!context) {
    throw new Error('useReconciliation must be used within a ReconciliationProvider')
  }
  return context
}

