'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export interface POSAccount {
  id: string
  name: string
  balance: number
  isPrimary?: boolean
  type?: string
  accountName?: string
  accountNumber?: string
  totalDeposits?: number
  totalWithdrawals?: number
  currency?: string
}

export interface POSTransfer {
  id: string
  machineId: string
  fromAccount: string
  toAccount: string
  amount: number
  date: string
  notes?: string
  fromAccountId?: string
  toAccountId?: string
}

export interface InternalTransfer {
  id: string
  machineId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  notes?: string
}

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface POSMachine {
  // Database fields (snake_case)
  id: string
  user_id?: string
  machine_name: string
  machine_number: string | null
  provider: string | null
  commission_rate: number | null
  status: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  machineName?: string
  machineNumber?: string
  machineProvider?: string
  commissionRate?: number
  machineStatus?: 'active' | 'inactive' | 'maintenance'
  location?: string
  serialNumber?: string
  installationDate?: string
  lastMaintenanceDate?: string
  monthlyTransactions?: number
  monthlyRevenue?: number
  totalTransactions?: number
  totalRevenue?: number
  notes?: string
  machineId?: string
  accounts?: POSAccount[]
  model?: string
  monthlyTarget?: number
  penaltyThreshold?: number
  penaltyAmount?: number
  dailyRevenue?: number
  targetPercentage?: number
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  hasPenalty?: boolean
  targetAchieved?: number
}

interface POSMachinesContextType {
  machines: POSMachine[]
  loading: boolean
  error: string | null
  addMachine: (machine: Omit<POSMachine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<POSMachine | null>
  updateMachine: (id: string, updates: Partial<POSMachine>) => Promise<void>
  deleteMachine: (id: string) => Promise<void>
  getMachineById: (id: string) => POSMachine | undefined
  getActiveMachines: () => POSMachine[]
  setPrimaryAccount: (machineId: string, accountId: string) => void
  addAccountToMachine: (machineId: string, account: POSAccount) => void
  updateAccountBalance: (machineId: string, accountId: string, newBalance: number) => void
  addInternalTransfer: (transfer: POSTransfer) => void
  getTransfersByMachine: (machineId: string) => POSTransfer[]
}

const POSMachinesContext = createContext<POSMachinesContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function POSMachinesProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<POSMachine[]>([])
  const [transfers, setTransfers] = useState<POSTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load machines from Supabase
  // ===================================
  const loadMachines = async () => {
    if (!user) {
      setMachines([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('pos_machines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading POS machines:', fetchError)
        setError(fetchError.message)
      } else {
        setMachines(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading POS machines:', err)
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
      setMachines([])
      setLoading(false)
      return
    }

    loadMachines()

    const channel: RealtimeChannel = supabase
      .channel('pos_machines_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_machines',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMachines((prev) => [payload.new as POSMachine, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setMachines((prev) =>
              prev.map((machine) =>
                machine.id === (payload.new as POSMachine).id
                  ? (payload.new as POSMachine)
                  : machine
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setMachines((prev) =>
              prev.filter((machine) => machine.id !== (payload.old as POSMachine).id)
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
  // ➕ Add machine
  // ===================================
  const addMachine = async (
    machine: Omit<POSMachine, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<POSMachine | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('pos_machines')
        .insert([
          {
            user_id: user.id,
            machine_name: machine.machine_name,
            machine_number: machine.machine_number,
            provider: machine.provider,
            commission_rate: machine.commission_rate,
            status: machine.status || 'active',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding POS machine:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding POS machine:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update machine
  // ===================================
  const updateMachine = async (id: string, updates: Partial<POSMachine>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('pos_machines')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating POS machine:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating POS machine:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete machine
  // ===================================
  const deleteMachine = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('pos_machines')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting POS machine:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting POS machine:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get machine by ID
  // ===================================
  const getMachineById = (id: string): POSMachine | undefined => {
    return machines.find((m) => m.id === id)
  }

  // ===================================
  // ✅ Get active machines
  // ===================================
  const getActiveMachines = (): POSMachine[] => {
    return machines.filter((m) => m.status === 'active')
  }

  // ===================================
  // 🔧 Set primary account
  // ===================================
  const setPrimaryAccount = (machineId: string, accountId: string): void => {
    setMachines(prev => prev.map(m => {
      if (m.id === machineId && m.accounts) {
        return {
          ...m,
          accounts: m.accounts.map(acc => ({
            ...acc,
            isPrimary: acc.id === accountId
          }))
        }
      }
      return m
    }))
  }

  // ===================================
  // ➕ Add account to machine
  // ===================================
  const addAccountToMachine = (machineId: string, account: POSAccount): void => {
    setMachines(prev => prev.map(m => {
      if (m.id === machineId) {
        return {
          ...m,
          accounts: [...(m.accounts || []), account]
        }
      }
      return m
    }))
  }

  // ===================================
  // 💰 Update account balance
  // ===================================
  const updateAccountBalance = async (machineId: string, accountId: string, newBalance: number): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      // الحصول على الحسابات الحالية للماكينة
      const machine = machines.find(m => m.id === machineId)
      if (!machine || !machine.accounts) return

      // تحديث الحساب المحدد
      const updatedAccounts = machine.accounts.map(acc =>
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      )

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from('pos_machines')
        .update({ accounts: updatedAccounts })
        .eq('id', machineId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating POS account balance:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً
      setMachines(prev => prev.map(m => {
        if (m.id === machineId && m.accounts) {
          return {
            ...m,
            accounts: m.accounts.map(acc =>
              acc.id === accountId ? { ...acc, balance: newBalance } : acc
            )
          }
        }
        return m
      }))
    } catch (err) {
      console.error('Unexpected error updating POS account balance:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔄 Add internal transfer
  // ===================================
  const addInternalTransfer = (transfer: POSTransfer): void => {
    setTransfers(prev => [transfer, ...prev])
  }

  // ===================================
  // 📋 Get transfers by machine
  // ===================================
  const getTransfersByMachine = (machineId: string): POSTransfer[] => {
    return transfers.filter(t => t.machineId === machineId)
  }

  return (
    <POSMachinesContext.Provider
      value={{
        machines,
        loading,
        error,
        addMachine,
        updateMachine,
        deleteMachine,
        getMachineById,
        getActiveMachines,
        setPrimaryAccount,
        addAccountToMachine,
        updateAccountBalance,
        addInternalTransfer,
        getTransfersByMachine,
      }}
    >
      {children}
    </POSMachinesContext.Provider>
  )
}

export function usePOSMachines() {
  const context = useContext(POSMachinesContext)
  if (!context) {
    throw new Error('usePOSMachines must be used within a POSMachinesProvider')
  }
  return context
}

