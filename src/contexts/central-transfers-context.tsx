'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// أنواع الحسابات المختلفة
export type AccountType = 
  | 'bank-account'
  | 'cash-vault'
  | 'e-wallet'
  | 'prepaid-card'
  | 'pos-machine'

// معلومات الحساب في التحويل
export interface TransferAccount {
  id: string
  type: AccountType
  name: string
  accountNumber?: string
  balance: number
  // للحدود
  dailyLimit?: number
  monthlyLimit?: number
  dailyUsed?: number
  monthlyUsed?: number
}

// من يتحمل الرسوم
export type FeeBearer = 'sender' | 'receiver' | 'none'

// التحويل المركزي
export interface CentralTransfer {
  id: string
  fromAccount: TransferAccount
  toAccount: TransferAccount
  amount: number
  date: string
  time: string
  status: 'completed' | 'pending' | 'failed'
  notes?: string
  fee?: number // رسوم التحويل (اختياري)
  feeBearer?: FeeBearer // من يتحمل الرسوم
  finalAmountFrom?: number // المبلغ النهائي المخصوم من المرسل
  finalAmountTo?: number // المبلغ النهائي المضاف للمستقبل
}

interface CentralTransfersContextType {
  transfers: CentralTransfer[]
  addTransfer: (transfer: CentralTransfer) => void
  getTransfersByAccount: (accountId: string) => CentralTransfer[]
  getTransfersByType: (type: AccountType) => CentralTransfer[]
  getTransfersByDateRange: (startDate: string, endDate: string) => CentralTransfer[]
  getTodayTransfers: () => CentralTransfer[]
  getMonthTransfers: () => CentralTransfer[]
  getTotalTransferred: (accountId: string, period: 'day' | 'month') => number
}

const CentralTransfersContext = createContext<CentralTransfersContextType | undefined>(undefined)

// البيانات الافتراضية
const defaultTransfers: CentralTransfer[] = [
  {
    id: 'ct-1',
    fromAccount: {
      id: '1',
      type: 'bank-account',
      name: 'حسابي الجاري الرئيسي',
      accountNumber: '1234567890',
      balance: 50000,
    },
    toAccount: {
      id: '1',
      type: 'cash-vault',
      name: 'الخزينة الرئيسية',
      balance: 25000,
    },
    amount: 10000,
    date: '2024-10-08',
    time: '14:30',
    status: 'completed',
    notes: 'تعزيز رصيد الخزينة',
  },
  {
    id: 'ct-2',
    fromAccount: {
      id: '1',
      type: 'cash-vault',
      name: 'الخزينة الرئيسية',
      balance: 25000,
    },
    toAccount: {
      id: '1',
      type: 'e-wallet',
      name: 'فودافون كاش',
      accountNumber: '01012345678',
      balance: 5000,
    },
    amount: 3000,
    date: '2024-10-09',
    time: '10:15',
    status: 'completed',
    notes: 'شحن المحفظة الإلكترونية',
  },
  {
    id: 'ct-3',
    fromAccount: {
      id: '1',
      type: 'bank-account',
      name: 'حسابي الجاري الرئيسي',
      accountNumber: '1234567890',
      balance: 50000,
    },
    toAccount: {
      id: '1',
      type: 'prepaid-card',
      name: 'بطاقة فوري الرئيسية',
      accountNumber: '1234',
      balance: 2000,
    },
    amount: 5000,
    date: '2024-10-09',
    time: '11:45',
    status: 'completed',
    notes: 'شحن البطاقة المسبقة الدفع',
  },
]

export function CentralTransfersProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<CentralTransfer[]>([])

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedTransfers = localStorage.getItem('centralTransfers')
    
    if (savedTransfers) {
      setTransfers(JSON.parse(savedTransfers))
    } else {
      setTransfers(defaultTransfers)
    }
  }, [])

  // حفظ البيانات في localStorage
  useEffect(() => {
    if (transfers.length > 0) {
      localStorage.setItem('centralTransfers', JSON.stringify(transfers))
    }
  }, [transfers])

  const addTransfer = (transfer: CentralTransfer) => {
    setTransfers([transfer, ...transfers])
  }

  const getTransfersByAccount = (accountId: string) => {
    return transfers.filter(
      t => t.fromAccount.id === accountId || t.toAccount.id === accountId
    )
  }

  const getTransfersByType = (type: AccountType) => {
    return transfers.filter(
      t => t.fromAccount.type === type || t.toAccount.type === type
    )
  }

  const getTransfersByDateRange = (startDate: string, endDate: string) => {
    return transfers.filter(
      t => t.date >= startDate && t.date <= endDate
    )
  }

  const getTodayTransfers = () => {
    const today = new Date().toISOString().split('T')[0]
    return transfers.filter(t => t.date === today)
  }

  const getMonthTransfers = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    return getTransfersByDateRange(firstDay, lastDay)
  }

  const getTotalTransferred = (accountId: string, period: 'day' | 'month') => {
    const relevantTransfers = period === 'day' ? getTodayTransfers() : getMonthTransfers()

    // حساب المبلغ المحول من الحساب (الخارج فقط)
    return relevantTransfers
      .filter(t => t.fromAccount.id === accountId && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  return (
    <CentralTransfersContext.Provider
      value={{
        transfers,
        addTransfer,
        getTransfersByAccount,
        getTransfersByType,
        getTransfersByDateRange,
        getTodayTransfers,
        getMonthTransfers,
        getTotalTransferred,
      }}
    >
      {children}
    </CentralTransfersContext.Provider>
  )
}

export function useCentralTransfers() {
  const context = useContext(CentralTransfersContext)
  if (context === undefined) {
    throw new Error('useCentralTransfers must be used within a CentralTransfersProvider')
  }
  return context
}

