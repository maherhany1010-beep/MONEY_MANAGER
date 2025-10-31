'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export type AccountType = 'bank' | 'wallet' | 'cash' | 'card' | 'prepaid' | 'bank-account' | 'cash-vault' | 'e-wallet' | 'prepaid-card' | 'pos-machine' | 'credit-card'
export type TransferAccount = string | AccountInfo
export type FeeBearer = 'sender' | 'receiver' | 'split' | 'none'

export interface AccountInfo {
  id: string
  name: string
  type: AccountType
  balance?: number
  accountNumber?: string
  dailyLimit?: number
  monthlyLimit?: number
  dailyUsed?: number
  monthlyUsed?: number
}

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface CentralTransfer {
  // Database fields (snake_case)
  id: string
  user_id?: string
  from_account: string
  to_account: string
  amount: number
  transfer_date: string
  notes: string | null
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  fromAccount?: string | AccountInfo
  toAccount?: string | AccountInfo
  transferAmount?: number
  transferDate?: string
  transferNotes?: string
  fromAccountType?: AccountType
  toAccountType?: AccountType
  status?: 'completed' | 'pending' | 'failed'
  reference?: string
  fees?: number
  exchangeRate?: number
  fromCurrency?: string
  toCurrency?: string
  date?: string
  time?: string
  fee?: number
  feeBearer?: string
  finalAmountFrom?: number
  finalAmountTo?: number
}

interface CentralTransfersContextType {
  transfers: CentralTransfer[]
  loading: boolean
  error: string | null
  addTransfer: (transfer: Omit<CentralTransfer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CentralTransfer | null>
  updateTransfer: (id: string, updates: Partial<CentralTransfer>) => Promise<void>
  deleteTransfer: (id: string) => Promise<void>
  getTransferById: (id: string) => CentralTransfer | undefined
  getTransfersByAccount: (accountId: string) => CentralTransfer[]
  getTransfersByDateRange: (startDate: string, endDate: string) => CentralTransfer[]
  getTotalTransferred: (accountId: string, period: 'day' | 'month') => number
  getTodayTransfers: () => CentralTransfer[]
  getMonthTransfers: () => CentralTransfer[]
}

const CentralTransfersContext = createContext<CentralTransfersContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function CentralTransfersProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<CentralTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load transfers from Supabase
  // ===================================
  const loadTransfers = async () => {
    if (!user) {
      setTransfers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('central_transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading central transfers:', fetchError)
        setError(fetchError.message)
      } else {
        setTransfers(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading central transfers:', err)
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
      setTransfers([])
      setLoading(false)
      return
    }

    loadTransfers()

    const channel: RealtimeChannel = supabase
      .channel('central_transfers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'central_transfers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransfers((prev) => [payload.new as CentralTransfer, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTransfers((prev) =>
              prev.map((transfer) =>
                transfer.id === (payload.new as CentralTransfer).id
                  ? (payload.new as CentralTransfer)
                  : transfer
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setTransfers((prev) =>
              prev.filter((transfer) => transfer.id !== (payload.old as CentralTransfer).id)
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
  // ➕ Add transfer
  // ===================================
  const addTransfer = async (
    transfer: Omit<CentralTransfer, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<CentralTransfer | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('central_transfers')
        .insert([
          {
            user_id: user.id,
            from_account: transfer.from_account,
            to_account: transfer.to_account,
            amount: transfer.amount,
            transfer_date: transfer.transfer_date || new Date().toISOString().split('T')[0],
            notes: transfer.notes,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding central transfer:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding central transfer:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update transfer
  // ===================================
  const updateTransfer = async (id: string, updates: Partial<CentralTransfer>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('central_transfers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating central transfer:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating central transfer:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete transfer
  // ===================================
  const deleteTransfer = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('central_transfers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting central transfer:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting central transfer:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get transfer by ID
  // ===================================
  const getTransferById = (id: string): CentralTransfer | undefined => {
    return transfers.find((t) => t.id === id)
  }

  // ===================================
  // 📂 Get transfers by account
  // ===================================
  const getTransfersByAccount = (accountId: string): CentralTransfer[] => {
    return transfers.filter(
      (t) => t.from_account === accountId || t.to_account === accountId
    )
  }

  // ===================================
  // 📅 Get transfers by date range
  // ===================================
  const getTransfersByDateRange = (startDate: string, endDate: string): CentralTransfer[] => {
    return transfers.filter((t) => {
      const transferDate = t.transfer_date
      return transferDate >= startDate && transferDate <= endDate
    })
  }

  // ===================================
  // 💰 Get total transferred
  // ===================================
  const getTotalTransferred = (accountId: string, period: 'day' | 'month'): number => {
    const now = new Date()
    let filteredTransfers = transfers.filter(
      (t) => t.from_account === accountId || t.to_account === accountId
    )

    if (period === 'day') {
      const today = now.toISOString().split('T')[0]
      filteredTransfers = filteredTransfers.filter((t) => t.transfer_date?.startsWith(today))
    } else if (period === 'month') {
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const monthPrefix = `${year}-${month}`
      filteredTransfers = filteredTransfers.filter((t) => t.transfer_date?.startsWith(monthPrefix))
    }

    return filteredTransfers.reduce((sum, t) => sum + (t.amount || 0), 0)
  }

  // ===================================
  // 📅 Get today's transfers
  // ===================================
  const getTodayTransfers = (): CentralTransfer[] => {
    const today = new Date().toISOString().split('T')[0]
    return transfers.filter((t) => t.transfer_date?.startsWith(today))
  }

  // ===================================
  // 📅 Get this month's transfers
  // ===================================
  const getMonthTransfers = (): CentralTransfer[] => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const monthPrefix = `${year}-${month}`
    return transfers.filter((t) => t.transfer_date?.startsWith(monthPrefix))
  }

  return (
    <CentralTransfersContext.Provider
      value={{
        transfers,
        loading,
        error,
        addTransfer,
        updateTransfer,
        deleteTransfer,
        getTransferById,
        getTransfersByAccount,
        getTransfersByDateRange,
        getTotalTransferred,
        getTodayTransfers,
        getMonthTransfers,
      }}
    >
      {children}
    </CentralTransfersContext.Provider>
  )
}

export function useCentralTransfers() {
  const context = useContext(CentralTransfersContext)
  if (!context) {
    throw new Error('useCentralTransfers must be used within a CentralTransfersProvider')
  }
  return context
}

