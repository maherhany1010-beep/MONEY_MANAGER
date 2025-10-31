'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Database Schema Interface
// ===================================
export interface Merchant {
  // Database fields (snake_case)
  id: string
  user_id?: string
  merchant_name: string
  category: string | null
  total_spent: number
  created_at?: string
  updated_at?: string
  
  // Legacy fields for backward compatibility (camelCase)
  name?: string
  merchantName?: string
  merchantCategory?: string
  totalSpent?: number
  lastTransactionDate?: string
  transactionCount?: number
  averageTransactionAmount?: number
  phone?: string
  email?: string
  address?: string
  website?: string
  notes?: string
  isFavorite?: boolean
  rating?: number
  tags?: string[]
}

interface MerchantsContextType {
  merchants: Merchant[]
  loading: boolean
  error: string | null
  addMerchant: (merchant: Omit<Merchant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Merchant | null>
  updateMerchant: (id: string, updates: Partial<Merchant>) => Promise<void>
  deleteMerchant: (id: string) => Promise<void>
  getMerchantById: (id: string) => Merchant | undefined
  searchMerchants: (query: string) => Merchant[]
  getMerchantsByCategory: (category: string) => Merchant[]
  getTotalSpent: () => number
}

const MerchantsContext = createContext<MerchantsContextType | undefined>(undefined)

// ===================================
// 🎯 Provider Component
// ===================================
export function MerchantsProvider({ children }: { children: ReactNode }) {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // ===================================
  // 📥 Load merchants from Supabase
  // ===================================
  const loadMerchants = async () => {
    if (!user) {
      setMerchants([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading merchants:', fetchError)
        setError(fetchError.message)
      } else {
        setMerchants(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading merchants:', err)
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
      setMerchants([])
      setLoading(false)
      return
    }

    loadMerchants()

    const channel: RealtimeChannel = supabase
      .channel('merchants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'merchants',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMerchants((prev) => [payload.new as Merchant, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setMerchants((prev) =>
              prev.map((merchant) =>
                merchant.id === (payload.new as Merchant).id
                  ? (payload.new as Merchant)
                  : merchant
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setMerchants((prev) =>
              prev.filter((merchant) => merchant.id !== (payload.old as Merchant).id)
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
  // ➕ Add merchant
  // ===================================
  const addMerchant = async (
    merchant: Omit<Merchant, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Merchant | null> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('merchants')
        .insert([
          {
            user_id: user.id,
            merchant_name: merchant.merchant_name,
            category: merchant.category,
            total_spent: merchant.total_spent || 0,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error('Error adding merchant:', insertError)
        setError(insertError.message)
        return null
      }

      return data
    } catch (err) {
      console.error('Unexpected error adding merchant:', err)
      setError('حدث خطأ غير متوقع')
      return null
    }
  }

  // ===================================
  // 🔄 Update merchant
  // ===================================
  const updateMerchant = async (id: string, updates: Partial<Merchant>): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('merchants')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating merchant:', updateError)
        setError(updateError.message)
      }
    } catch (err) {
      console.error('Unexpected error updating merchant:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🗑️ Delete merchant
  // ===================================
  const deleteMerchant = async (id: string): Promise<void> => {
    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('merchants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Error deleting merchant:', deleteError)
        setError(deleteError.message)
      }
    } catch (err) {
      console.error('Unexpected error deleting merchant:', err)
      setError('حدث خطأ غير متوقع')
    }
  }

  // ===================================
  // 🔍 Get merchant by ID
  // ===================================
  const getMerchantById = (id: string): Merchant | undefined => {
    return merchants.find((m) => m.id === id)
  }

  // ===================================
  // 🔎 Search merchants
  // ===================================
  const searchMerchants = (query: string): Merchant[] => {
    const lowerQuery = query.toLowerCase()
    return merchants.filter(
      (m) =>
        m.merchant_name.toLowerCase().includes(lowerQuery) ||
        m.category?.toLowerCase().includes(lowerQuery)
    )
  }

  // ===================================
  // 📂 Get merchants by category
  // ===================================
  const getMerchantsByCategory = (category: string): Merchant[] => {
    return merchants.filter((m) => m.category === category)
  }

  // ===================================
  // 💰 Get total spent
  // ===================================
  const getTotalSpent = (): number => {
    return merchants.reduce((sum, m) => sum + (m.total_spent || 0), 0)
  }

  return (
    <MerchantsContext.Provider
      value={{
        merchants,
        loading,
        error,
        addMerchant,
        updateMerchant,
        deleteMerchant,
        getMerchantById,
        searchMerchants,
        getMerchantsByCategory,
        getTotalSpent,
      }}
    >
      {children}
    </MerchantsContext.Provider>
  )
}

export function useMerchants() {
  const context = useContext(MerchantsContext)
  if (!context) {
    throw new Error('useMerchants must be used within a MerchantsProvider')
  }
  return context
}

