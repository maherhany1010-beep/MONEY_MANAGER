'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface CashVault {
  // Database fields (snake_case)
  id: string
  user_id?: string
  vault_name: string
  location: string | null
  balance: number
  currency: string
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  vaultName?: string
  isDefault?: boolean
  isActive?: boolean
  maxCapacity?: number
  minBalance?: number
  dailyWithdrawalLimit?: number
  managerName?: string
  managerPhone?: string
  managerEmail?: string
  vaultType?: 'main' | 'branch' | 'personal' | 'emergency'
  accessLevel?: 'public' | 'restricted' | 'private'
  requiresApproval?: boolean
  createdDate?: string
  lastAccessDate?: string
  totalDeposits?: number
  totalWithdrawals?: number
  monthlyDeposits?: number
  monthlyWithdrawals?: number
  transactionCount?: number
  notes?: string
  description?: string
}

interface CashVaultsContextType {
  vaults: CashVault[]
  loading: boolean
  error: string | null
  updateVaults: (vaults: CashVault[]) => Promise<void>
  addVault: (vault: Omit<CashVault, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CashVault | null>
  removeVault: (id: string) => Promise<void>
  getDefaultVault: () => CashVault | undefined
  updateVaultBalance: (id: string, newBalance: number) => Promise<void>
  getVaultById: (id: string) => CashVault | undefined
}

const CashVaultsContext = createContext<CashVaultsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function CashVaultsProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<CashVault[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load vaults from Supabase
  // ===================================
  const loadVaults = async () => {
    if (!user) {
      setVaults([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('cash_vaults')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading cash vaults:', fetchError)
        setError(fetchError.message)
      } else {
        setVaults(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading cash vaults:', err)
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
      setVaults([])
      setLoading(false)
      return
    }

    loadVaults()

    const channel: RealtimeChannel = supabase
      .channel('cash_vaults_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cash_vaults',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVaults((prev) => [payload.new as CashVault, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setVaults((prev) =>
              prev.map((vault) =>
                vault.id === (payload.new as CashVault).id
                  ? (payload.new as CashVault)
                  : vault
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setVaults((prev) =>
              prev.filter((vault) => vault.id !== (payload.old as CashVault).id)
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
  // ➕ Add vault
  // ===================================
  const addVault = async (
    vault: Omit<CashVault, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<CashVault | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('cash_vaults')
        .insert([
          {
            user_id: user.id,
            vault_name: vault.vault_name,
            location: vault.location,
            balance: vault.balance,
            currency: vault.currency || 'EGP',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding vault:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding vault:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🗑️ Remove vault
  // ===================================
  const removeVault = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('cash_vaults')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error removing vault:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error removing vault:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔄 Update vaults (bulk update)
  // ===================================
  const updateVaults = async (newVaults: CashVault[]): Promise<void> => {
    console.warn('updateVaults: Bulk updates not implemented, use individual operations')
  }

  // ===================================
  // 💰 Update vault balance
  // ===================================
  const updateVaultBalance = async (id: string, newBalance: number): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('cash_vaults')
        .update({ balance: newBalance })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating vault balance:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً بعد نجاح التحديث في قاعدة البيانات
      setVaults(prev => prev.map(vault =>
        vault.id === id ? { ...vault, balance: newBalance } : vault
      ))
    } catch (err) {
      console.error('Unexpected error updating vault balance:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get vault by ID
  // ===================================
  const getVaultById = (id: string): CashVault | undefined => {
    return vaults.find((v) => v.id === id)
  }

  // ===================================
  // 🎯 Get default vault
  // ===================================
  const getDefaultVault = (): CashVault | undefined => {
    return vaults.find((v) => v.isDefault) || vaults[0]
  }

  // ===================================
  // 🎁 Provider Value
  // ===================================
  return (
    <CashVaultsContext.Provider
      value={{
        vaults,
        loading,
        error,
        updateVaults,
        addVault,
        removeVault,
        getDefaultVault,
        updateVaultBalance,
        getVaultById,
      }}
    >
      {children}
    </CashVaultsContext.Provider>
  )
}

// ===================================
// 🪝 Custom Hook
// ===================================
export function useCashVaults() {
  const context = useContext(CashVaultsContext)
  if (context === undefined) {
    throw new Error('useCashVaults must be used within a CashVaultsProvider')
  }
  return context
}

