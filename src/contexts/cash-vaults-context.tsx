'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CashVault {
  id: string
  vaultName: string
  location: string
  currency: string
  balance: number
  isDefault?: boolean
  isActive?: boolean
  // حدود الخزينة
  maxCapacity?: number
  minBalance?: number
  dailyWithdrawalLimit?: number
  // بيانات المسؤول
  managerName?: string
  managerPhone?: string
  managerEmail?: string
  // إعدادات
  vaultType: 'main' | 'branch' | 'personal' | 'emergency' // رئيسية، فرع، شخصية، طوارئ
  accessLevel: 'public' | 'restricted' | 'private' // عام، محدود، خاص
  requiresApproval?: boolean
  // تواريخ
  createdDate?: string
  lastAccessDate?: string
  // إحصائيات
  totalDeposits?: number
  totalWithdrawals?: number
  monthlyDeposits?: number
  monthlyWithdrawals?: number
  transactionCount?: number
  // ملاحظات
  notes?: string
  description?: string
}

interface CashVaultsContextType {
  vaults: CashVault[]
  updateVaults: (vaults: CashVault[]) => void
  addVault: (vault: CashVault) => void
  removeVault: (id: string) => void
  getDefaultVault: () => CashVault | undefined
  updateVaultBalance: (id: string, newBalance: number) => void
  getVaultById: (id: string) => CashVault | undefined
}

const CashVaultsContext = createContext<CashVaultsContextType | undefined>(undefined)

// البيانات الافتراضية
const defaultVaults: CashVault[] = [
  {
    id: '1',
    vaultName: 'الخزينة الرئيسية',
    location: 'المكتب الرئيسي - الطابق الأول',
    currency: 'EGP',
    balance: 150000,
    isDefault: true,
    isActive: true,
    maxCapacity: 500000,
    minBalance: 20000,
    dailyWithdrawalLimit: 50000,
    managerName: 'أحمد محمد علي',
    managerPhone: '01012345678',
    managerEmail: 'ahmed@example.com',
    vaultType: 'main',
    accessLevel: 'restricted',
    requiresApproval: true,
    createdDate: '2024-01-01',
    lastAccessDate: '2025-10-08',
    totalDeposits: 1500000,
    totalWithdrawals: 1350000,
    monthlyDeposits: 200000,
    monthlyWithdrawals: 180000,
    transactionCount: 245,
    description: 'الخزينة الرئيسية للشركة - تحتوي على السيولة النقدية الأساسية',
  },
  {
    id: '2',
    vaultName: 'خزينة الفرع - المعادي',
    location: 'فرع المعادي - مكتب المدير',
    isActive: true,
    currency: 'EGP',
    balance: 75000,
    isDefault: false,
    maxCapacity: 200000,
    minBalance: 10000,
    dailyWithdrawalLimit: 30000,
    managerName: 'محمد أحمد حسن',
    managerPhone: '01098765432',
    managerEmail: 'mohamed@example.com',
    vaultType: 'branch',
    accessLevel: 'restricted',
    requiresApproval: true,
    createdDate: '2024-03-15',
    lastAccessDate: '2025-10-07',
    totalDeposits: 800000,
    totalWithdrawals: 725000,
    monthlyDeposits: 100000,
    monthlyWithdrawals: 95000,
    transactionCount: 156,
    description: 'خزينة فرع المعادي - للمعاملات اليومية',
  },
  {
    id: '3',
    vaultName: 'الخزينة الشخصية',
    location: 'المنزل - غرفة المكتب',
    currency: 'EGP',
    balance: 25000,
    isDefault: false,
    maxCapacity: 100000,
    minBalance: 5000,
    dailyWithdrawalLimit: 10000,
    managerName: 'أحمد محمد علي',
    managerPhone: '01012345678',
    managerEmail: 'ahmed@example.com',
    vaultType: 'personal',
    accessLevel: 'private',
    requiresApproval: false,
    createdDate: '2024-06-01',
    lastAccessDate: '2025-10-06',
    totalDeposits: 300000,
    totalWithdrawals: 275000,
    monthlyDeposits: 40000,
    monthlyWithdrawals: 38000,
    transactionCount: 89,
    description: 'خزينة شخصية للمصروفات اليومية والطوارئ',
  },
  {
    id: '4',
    vaultName: 'خزينة الطوارئ',
    location: 'المكتب الرئيسي - الخزنة الآمنة',
    currency: 'EGP',
    balance: 200000,
    isDefault: false,
    maxCapacity: 300000,
    minBalance: 100000,
    dailyWithdrawalLimit: 20000,
    managerName: 'أحمد محمد علي',
    managerPhone: '01012345678',
    managerEmail: 'ahmed@example.com',
    vaultType: 'emergency',
    accessLevel: 'private',
    requiresApproval: true,
    createdDate: '2024-01-01',
    lastAccessDate: '2025-09-15',
    totalDeposits: 500000,
    totalWithdrawals: 300000,
    monthlyDeposits: 50000,
    monthlyWithdrawals: 20000,
    transactionCount: 45,
    description: 'خزينة احتياطية للطوارئ - لا تُستخدم إلا عند الضرورة',
  },
]

export function CashVaultsProvider({ children }: { children: ReactNode }) {
  const [vaults, setVaults] = useState<CashVault[]>(defaultVaults)

  // تحميل البيانات من localStorage عند بدء التطبيق
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVaults = localStorage.getItem('cashVaults')
      if (savedVaults) {
        try {
          setVaults(JSON.parse(savedVaults))
        } catch (error) {
          console.error('Error loading cash vaults:', error)
        }
      }
    }
  }, [])

  // حفظ البيانات في localStorage عند التحديث
  const updateVaults = (newVaults: CashVault[]) => {
    setVaults(newVaults)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cashVaults', JSON.stringify(newVaults))
    }
  }

  const addVault = (vault: CashVault) => {
    const newVaults = [...vaults, vault]
    updateVaults(newVaults)
  }

  const removeVault = (id: string) => {
    const newVaults = vaults.filter(v => v.id !== id)
    updateVaults(newVaults)
  }

  const getDefaultVault = () => {
    return vaults.find(v => v.isDefault) || vaults[0]
  }

  const updateVaultBalance = (id: string, newBalance: number) => {
    const updatedVaults = vaults.map(v => 
      v.id === id ? { ...v, balance: newBalance } : v
    )
    updateVaults(updatedVaults)
  }

  const getVaultById = (id: string) => {
    return vaults.find(v => v.id === id)
  }

  return (
    <CashVaultsContext.Provider value={{ 
      vaults, 
      updateVaults, 
      addVault, 
      removeVault,
      getDefaultVault,
      updateVaultBalance,
      getVaultById
    }}>
      {children}
    </CashVaultsContext.Provider>
  )
}

export function useCashVaults() {
  const context = useContext(CashVaultsContext)
  if (context === undefined) {
    throw new Error('useCashVaults must be used within a CashVaultsProvider')
  }
  return context
}

