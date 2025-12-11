'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface EWallet {
  // Database fields (snake_case)
  id: string
  user_id?: string
  wallet_name: string
  wallet_type: 'stc_pay' | 'apple_pay' | 'mada_pay' | 'urpay' | 'other'
  phone_number: string | null
  balance: number
  currency: string
  status: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility (camelCase)
  walletName?: string
  provider?: string
  phoneNumber?: string
  isDefault?: boolean
  dailyLimit?: number
  monthlyLimit?: number
  transactionLimit?: number
  dailyUsed?: number
  monthlyUsed?: number
  holderName?: string
  holderNationalId?: string
  holderEmail?: string
  walletType?: 'personal' | 'business' | 'savings'
  isVerified?: boolean
  kycLevel?: 1 | 2 | 3
  createdDate?: string
  lastTransactionDate?: string
  verificationDate?: string
  totalDeposits?: number
  totalWithdrawals?: number
  totalTransfers?: number
  monthlyDeposits?: number
  monthlyWithdrawals?: number
  transactionCount?: number
  depositFee?: number
  withdrawalFee?: number
  transferFee?: number
  notes?: string
  description?: string
}

interface EWalletsContextType {
  wallets: EWallet[]
  loading: boolean
  error: string | null
  updateWallets: (wallets: EWallet[]) => Promise<void>
  addWallet: (wallet: Omit<EWallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<EWallet | null>
  removeWallet: (id: string) => Promise<void>
  getDefaultWallet: () => EWallet | undefined
  updateWalletBalance: (id: string, newBalance: number, transactionAmount?: number) => Promise<void>
  getWalletById: (id: string) => EWallet | undefined
  updateDailyUsage: (id: string, amount: number) => Promise<void>
  updateMonthlyUsage: (id: string, amount: number) => Promise<void>
}

const EWalletsContext = createContext<EWalletsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function EWalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<EWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load wallets from Supabase
  // ===================================
  const loadWallets = async () => {
    if (!user) {
      setWallets([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('e_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading e-wallets:', fetchError)
        setError(fetchError.message)
      } else {
        setWallets(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading e-wallets:', err)
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
      setWallets([])
      setLoading(false)
      return
    }

    loadWallets()

    const channel: RealtimeChannel = supabase
      .channel('e_wallets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'e_wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWallets((prev) => [payload.new as EWallet, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setWallets((prev) =>
              prev.map((wallet) =>
                wallet.id === (payload.new as EWallet).id
                  ? (payload.new as EWallet)
                  : wallet
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setWallets((prev) =>
              prev.filter((wallet) => wallet.id !== (payload.old as EWallet).id)
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
  // ➕ Add wallet
  // ===================================
  const addWallet = async (
    wallet: Omit<EWallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<EWallet | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('e_wallets')
        .insert([
          {
            user_id: user.id,
            wallet_name: wallet.wallet_name,
            wallet_type: wallet.wallet_type,
            phone_number: wallet.phone_number,
            balance: wallet.balance,
            currency: wallet.currency || 'EGP',
            status: wallet.status || 'active',
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding wallet:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding wallet:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🗑️ Remove wallet
  // ===================================
  const removeWallet = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('e_wallets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error removing wallet:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error removing wallet:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔄 Update wallets (bulk update)
  // ===================================
  const updateWallets = async (newWallets: EWallet[]): Promise<void> => {
    // This is kept for backward compatibility but not recommended
    // Better to use individual update operations
    console.warn('updateWallets: Bulk updates not implemented, use individual operations')
  }

  // ===================================
  // 💰 Update wallet balance
  // ===================================
  const updateWalletBalance = async (
    id: string,
    newBalance: number,
    transactionAmount?: number
  ): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('e_wallets')
        .update({ balance: newBalance })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating wallet balance:', updateError)
        setError(updateError.message)
        return
      }

      // تحديث الـ state المحلي فوراً بعد نجاح التحديث في قاعدة البيانات
      setWallets(prev => prev.map(wallet =>
        wallet.id === id ? { ...wallet, balance: newBalance } : wallet
      ))
    } catch (err) {
      console.error('Unexpected error updating wallet balance:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get wallet by ID
  // ===================================
  const getWalletById = (id: string): EWallet | undefined => {
    return wallets.find((w) => w.id === id)
  }

  // ===================================
  // 🎯 Get default wallet
  // ===================================
  const getDefaultWallet = (): EWallet | undefined => {
    return wallets.find((w) => w.isDefault) || wallets[0]
  }

  // ===================================
  // 📊 Update daily usage (legacy - kept for compatibility)
  // ===================================
  const updateDailyUsage = async (id: string, amount: number): Promise<void> => {
    // This is a legacy function - daily usage tracking should be done differently
    console.warn('updateDailyUsage: Legacy function, consider alternative tracking')
  }

  // ===================================
  // 📊 Update monthly usage (legacy - kept for compatibility)
  // ===================================
  const updateMonthlyUsage = async (id: string, amount: number): Promise<void> => {
    // This is a legacy function - monthly usage tracking should be done differently
    console.warn('updateMonthlyUsage: Legacy function, consider alternative tracking')
  }

  // ===================================
  // 🎁 Provider Value
  // ===================================
  return (
    <EWalletsContext.Provider
      value={{
        wallets,
        loading,
        error,
        updateWallets,
        addWallet,
        removeWallet,
        getDefaultWallet,
        updateWalletBalance,
        getWalletById,
        updateDailyUsage,
        updateMonthlyUsage,
      }}
    >
      {children}
    </EWalletsContext.Provider>
  )
}

// ===================================
// 🪝 Custom Hook
// ===================================
export function useEWallets() {
  const context = useContext(EWalletsContext)
  if (context === undefined) {
    throw new Error('useEWallets must be used within an EWalletsProvider')
  }
  return context
}

