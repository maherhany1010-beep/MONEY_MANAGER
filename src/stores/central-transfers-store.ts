import { create } from 'zustand'
import { createClientComponentClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ===================================
// 📦 Types
// ===================================
export type TransferType = 'instant' | 'deferred'
export type TransferStatus = 'successful' | 'pending' | 'failed'
export type FeeBearer = 'sender' | 'receiver'
export type FeeType = 'fixed' | 'percentage'

export interface TransferFormData {
  fromAccountId: string
  toAccountId: string
  baseAmount: number
  fees: number
  feeType: FeeType
  feeBearer: FeeBearer
  transferType: TransferType
  actualPaidAmount?: number
  receivingAccountForPayment?: string
  notes?: string
}

export interface CentralTransfer {
  // Database fields (snake_case)
  id: string
  user_id?: string
  from_account_id: string
  to_account_id: string
  base_amount: number
  fees: number
  fee_type: FeeType
  fee_bearer: FeeBearer
  transfer_type: TransferType
  status: TransferStatus
  actual_paid_amount?: number
  receiving_account_for_payment?: string
  net_profit?: number
  pending_balance?: number
  notes?: string
  created_at?: string
  updated_at?: string

  // Legacy fields for backward compatibility
  from_account?: string
  to_account?: string
  amount?: number
  transfer_date?: string
}

interface CentralTransfersState {
  // State
  transfers: CentralTransfer[]
  loading: boolean
  error: string | null
  initialized: boolean
  channel: RealtimeChannel | null

  // Actions
  initialize: (userId: string) => Promise<void>
  cleanup: () => void
  createTransfer: (data: TransferFormData, executionStatus: TransferStatus) => Promise<CentralTransfer | null>
  updateTransferStatus: (id: string, status: TransferStatus) => Promise<void>
  markPendingAsSuccessful: (id: string) => Promise<void>
  markPendingAsFailed: (id: string) => Promise<void>
  deleteTransfer: (id: string) => Promise<void>

  // Helpers
  getTransferById: (id: string) => CentralTransfer | undefined
  getTransfersByAccount: (accountId: string) => CentralTransfer[]
  getTotalTransferred: (accountId: string) => number
  getPendingTransfersCount: () => number
}

export const useCentralTransfersStore = create<CentralTransfersState>((set, get) => ({
  transfers: [],
  loading: false,
  error: null,
  initialized: false,
  channel: null,

  // ===================================
  // 🚀 Initialize store
  // ===================================
  initialize: async (userId: string) => {
    if (get().initialized) return

    const supabase = createClientComponentClient()
    set({ loading: true })

    try {
      const { data, error: fetchError } = await supabase
        .from('central_transfers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      set({
        transfers: data || [],
        initialized: true,
        loading: false,
      })

      const channel = supabase
        .channel(`central_transfers_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'central_transfers',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              set((state) => ({
                transfers: [payload.new as CentralTransfer, ...state.transfers],
              }))
            } else if (payload.eventType === 'UPDATE') {
              set((state) => ({
                transfers: state.transfers.map((t) =>
                  t.id === (payload.new as CentralTransfer).id
                    ? (payload.new as CentralTransfer)
                    : t
                ),
              }))
            } else if (payload.eventType === 'DELETE') {
              set((state) => ({
                transfers: state.transfers.filter(
                  (t) => t.id !== (payload.old as CentralTransfer).id
                ),
              }))
            }
          }
        )
        .subscribe()

      set({ channel })
    } catch (err) {
      console.error('Error initializing central transfers store:', err)
      set({ error: 'فشل تحميل البيانات', loading: false })
    }
  },

  // ===================================
  // 🧹 Cleanup
  // ===================================
  cleanup: () => {
    const channel = get().channel
    if (channel) {
      channel.unsubscribe()
    }
    set({
      transfers: [],
      initialized: false,
      channel: null,
    })
  },

  // ===================================
  // ➕ Create transfer
  // ===================================
  createTransfer: async (data: TransferFormData, executionStatus: TransferStatus) => {
    const supabase = createClientComponentClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('يجب تسجيل الدخول أولاً')

      const newTransfer: Omit<CentralTransfer, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        from_account_id: data.fromAccountId,
        to_account_id: data.toAccountId,
        base_amount: data.baseAmount,
        fees: data.fees,
        fee_type: data.feeType,
        fee_bearer: data.feeBearer,
        transfer_type: data.transferType,
        status: executionStatus,
        actual_paid_amount: data.actualPaidAmount,
        receiving_account_for_payment: data.receivingAccountForPayment,
        net_profit: data.transferType === 'instant' && data.actualPaidAmount
          ? data.actualPaidAmount - data.fees - data.baseAmount
          : undefined,
        pending_balance: executionStatus === 'pending' ? data.baseAmount : undefined,
        notes: data.notes,
      }

      const { data: result, error } = await supabase
        .from('central_transfers')
        .insert([newTransfer])
        .select()
        .single()

      if (error) throw error

      return result as CentralTransfer
    } catch (err) {
      console.error('Error creating transfer:', err)
      set({ error: 'فشل إنشاء التحويل' })
      return null
    }
  },

  // ===================================
  // 🔄 Update transfer status
  // ===================================
  updateTransferStatus: async (id: string, status: TransferStatus) => {
    const supabase = createClientComponentClient()

    try {
      const { error } = await supabase
        .from('central_transfers')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating transfer status:', err)
      set({ error: 'فشل تحديث حالة التحويل' })
    }
  },

  // ===================================
  // ✅ Mark pending as successful
  // ===================================
  markPendingAsSuccessful: async (id: string) => {
    await get().updateTransferStatus(id, 'successful')
  },

  // ===================================
  // ❌ Mark pending as failed
  // ===================================
  markPendingAsFailed: async (id: string) => {
    await get().updateTransferStatus(id, 'failed')
  },

  // ===================================
  // 🗑️ Delete transfer
  // ===================================
  deleteTransfer: async (id: string) => {
    const supabase = createClientComponentClient()

    try {
      const { error } = await supabase
        .from('central_transfers')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('Error deleting transfer:', err)
      set({ error: 'فشل حذف التحويل' })
    }
  },

  // ===================================
  // 🔍 Get transfer by ID
  // ===================================
  getTransferById: (id: string) => {
    return get().transfers.find((t) => t.id === id)
  },

  // ===================================
  // 📂 Get transfers by account
  // ===================================
  getTransfersByAccount: (accountId: string) => {
    return get().transfers.filter(
      (t) => t.from_account_id === accountId || t.to_account_id === accountId
    )
  },

  // ===================================
  // 💰 Get total transferred
  // ===================================
  getTotalTransferred: (accountId: string) => {
    return get()
      .transfers.filter((t) => t.from_account_id === accountId && t.status === 'successful')
      .reduce((sum, t) => sum + t.base_amount, 0)
  },

  // ===================================
  // 📊 Get pending transfers count
  // ===================================
  getPendingTransfersCount: () => {
    return get().transfers.filter((t) => t.status === 'pending').length
  },
}))
