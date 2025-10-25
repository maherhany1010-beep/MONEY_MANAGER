'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// حساب داخل ماكينة الدفع
export interface POSAccount {
  id: string
  accountName: string
  accountNumber: string
  balance: number
  isPrimary: boolean // الحساب الرئيسي
  currency: string
  createdDate: string
  lastTransactionDate?: string
  totalDeposits?: number
  totalWithdrawals?: number
  transactionCount?: number
}

// ماكينة الدفع الإلكتروني
export interface POSMachine {
  id: string
  machineName: string
  machineId: string // رقم الماكينة
  provider: string // مزود الخدمة (فوري، أمان، ممكن، بنك، إلخ)
  location: string // موقع الماكينة
  status: 'active' | 'inactive' | 'maintenance' // نشط، معطل، صيانة
  accounts: POSAccount[] // الحسابات داخل الماكينة
  // معلومات إضافية
  serialNumber?: string
  model?: string
  installationDate?: string
  lastMaintenanceDate?: string
  // معلومات الاتصال
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  // إحصائيات
  totalTransactions?: number
  monthlyRevenue?: number
  dailyRevenue?: number
  // الأهداف والغرامات
  monthlyTarget?: number          // الهدف الشهري للمبيعات
  targetAchieved?: number         // المبلغ المحقق من الهدف
  targetPercentage?: number       // نسبة تحقيق الهدف (%)
  penaltyAmount?: number          // قيمة الغرامة عند عدم تحقيق الهدف
  hasPenalty?: boolean            // هل توجد غرامة؟
  penaltyThreshold?: number       // الحد الأدنى لتحقيق الهدف لتجنب الغرامة (مثلاً 80%)
}

// معاملة تحويل داخلي بين حسابات الماكينة
export interface InternalTransfer {
  id: string
  machineId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  notes?: string
}

interface POSMachinesContextType {
  machines: POSMachine[]
  transfers: InternalTransfer[]
  updateMachines: (machines: POSMachine[]) => void
  addMachine: (machine: POSMachine) => void
  removeMachine: (id: string) => void
  getMachineById: (id: string) => POSMachine | undefined
  updateMachineStatus: (id: string, status: 'active' | 'inactive' | 'maintenance') => void
  // إدارة الحسابات داخل الماكينة
  addAccountToMachine: (machineId: string, account: POSAccount) => void
  removeAccountFromMachine: (machineId: string, accountId: string) => void
  setPrimaryAccount: (machineId: string, accountId: string) => void
  updateAccountBalance: (machineId: string, accountId: string, newBalance: number) => void
  // التحويل الداخلي
  addInternalTransfer: (transfer: InternalTransfer) => void
  getTransfersByMachine: (machineId: string) => InternalTransfer[]
}

const POSMachinesContext = createContext<POSMachinesContextType | undefined>(undefined)

// البيانات الافتراضية
const defaultMachines: POSMachine[] = [
  {
    id: '1',
    machineName: 'ماكينة الفرع الرئيسي',
    machineId: 'POS-001',
    provider: 'فوري',
    location: 'القاهرة - المعادي',
    status: 'active',
    serialNumber: 'FWR-2024-001',
    model: 'Fawry POS Pro',
    installationDate: '2024-01-15',
    contactPerson: 'أحمد محمد',
    contactPhone: '01012345678',
    totalTransactions: 1250,
    monthlyRevenue: 125000,
    dailyRevenue: 4500,
    // الأهداف والغرامات
    monthlyTarget: 150000,
    targetAchieved: 125000,
    targetPercentage: 83.33,
    penaltyAmount: 5000,
    hasPenalty: true,
    penaltyThreshold: 80,
    accounts: [
      {
        id: 'acc-1-1',
        accountName: 'الحساب الرئيسي',
        accountNumber: 'FWR-001-001',
        balance: 45000,
        isPrimary: true,
        currency: 'EGP',
        createdDate: '2024-01-15',
        totalDeposits: 200000,
        totalWithdrawals: 155000,
        transactionCount: 850,
      },
      {
        id: 'acc-1-2',
        accountName: 'حساب احتياطي',
        accountNumber: 'FWR-001-002',
        balance: 15000,
        isPrimary: false,
        currency: 'EGP',
        createdDate: '2024-02-01',
        totalDeposits: 50000,
        totalWithdrawals: 35000,
        transactionCount: 200,
      },
      {
        id: 'acc-1-3',
        accountName: 'حساب المصروفات',
        accountNumber: 'FWR-001-003',
        balance: 8000,
        isPrimary: false,
        currency: 'EGP',
        createdDate: '2024-03-01',
        totalDeposits: 20000,
        totalWithdrawals: 12000,
        transactionCount: 200,
      },
    ],
  },
  {
    id: '2',
    machineName: 'ماكينة الفرع الثاني',
    machineId: 'POS-002',
    provider: 'أمان',
    location: 'الجيزة - الهرم',
    status: 'active',
    serialNumber: 'AMN-2024-002',
    model: 'Aman Smart POS',
    installationDate: '2024-02-20',
    contactPerson: 'محمد علي',
    contactPhone: '01098765432',
    totalTransactions: 980,
    monthlyRevenue: 98000,
    dailyRevenue: 3500,
    // الأهداف والغرامات
    monthlyTarget: 120000,
    targetAchieved: 98000,
    targetPercentage: 81.67,
    penaltyAmount: 3000,
    hasPenalty: true,
    penaltyThreshold: 85,
    accounts: [
      {
        id: 'acc-2-1',
        accountName: 'الحساب الرئيسي',
        accountNumber: 'AMN-002-001',
        balance: 32000,
        isPrimary: true,
        currency: 'EGP',
        createdDate: '2024-02-20',
        totalDeposits: 150000,
        totalWithdrawals: 118000,
        transactionCount: 650,
      },
      {
        id: 'acc-2-2',
        accountName: 'حساب ثانوي',
        accountNumber: 'AMN-002-002',
        balance: 12000,
        isPrimary: false,
        currency: 'EGP',
        createdDate: '2024-03-01',
        totalDeposits: 30000,
        totalWithdrawals: 18000,
        transactionCount: 330,
      },
    ],
  },
  {
    id: '3',
    machineName: 'ماكينة الفرع الثالث',
    machineId: 'POS-003',
    provider: 'ممكن',
    location: 'الإسكندرية - سموحة',
    status: 'active',
    serialNumber: 'MMK-2024-003',
    model: 'Momken POS Plus',
    installationDate: '2024-03-10',
    contactPerson: 'خالد حسن',
    contactPhone: '01123456789',
    totalTransactions: 750,
    monthlyRevenue: 75000,
    dailyRevenue: 2800,
    // الأهداف والغرامات
    monthlyTarget: 100000,
    targetAchieved: 75000,
    targetPercentage: 75,
    penaltyAmount: 4000,
    hasPenalty: true,
    penaltyThreshold: 80,
    accounts: [
      {
        id: 'acc-3-1',
        accountName: 'الحساب الرئيسي',
        accountNumber: 'MMK-003-001',
        balance: 28000,
        isPrimary: true,
        currency: 'EGP',
        createdDate: '2024-03-10',
        totalDeposits: 100000,
        totalWithdrawals: 72000,
        transactionCount: 500,
      },
      {
        id: 'acc-3-2',
        accountName: 'حساب احتياطي',
        accountNumber: 'MMK-003-002',
        balance: 10000,
        isPrimary: false,
        currency: 'EGP',
        createdDate: '2024-03-15',
        totalDeposits: 25000,
        totalWithdrawals: 15000,
        transactionCount: 250,
      },
    ],
  },
  {
    id: '4',
    machineName: 'ماكينة الفرع الرابع',
    machineId: 'POS-004',
    provider: 'فوري',
    location: 'القاهرة - مدينة نصر',
    status: 'active',
    serialNumber: 'FWR-2024-004',
    model: 'Fawry POS Pro',
    installationDate: '2024-01-20',
    contactPerson: 'سارة أحمد',
    contactPhone: '01156789012',
    totalTransactions: 1500,
    monthlyRevenue: 165000,
    dailyRevenue: 5500,
    // الأهداف والغرامات
    monthlyTarget: 150000,
    targetAchieved: 165000,
    targetPercentage: 110,
    penaltyAmount: 0,
    hasPenalty: false,
    penaltyThreshold: 80,
    accounts: [
      {
        id: 'acc-4-1',
        accountName: 'الحساب الرئيسي',
        accountNumber: 'FWR-004-001',
        balance: 55000,
        isPrimary: true,
        currency: 'EGP',
        createdDate: '2024-01-20',
        totalDeposits: 250000,
        totalWithdrawals: 195000,
        transactionCount: 1000,
      },
    ],
  },
]

const defaultTransfers: InternalTransfer[] = [
  {
    id: 'tr-1',
    machineId: '1',
    fromAccountId: 'acc-1-1',
    toAccountId: 'acc-1-2',
    amount: 5000,
    date: '2024-10-05',
    notes: 'تحويل لتعزيز الحساب الاحتياطي',
  },
  {
    id: 'tr-2',
    machineId: '1',
    fromAccountId: 'acc-1-1',
    toAccountId: 'acc-1-3',
    amount: 3000,
    date: '2024-10-07',
    notes: 'تحويل لحساب المصروفات',
  },
]

export function POSMachinesProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<POSMachine[]>([])
  const [transfers, setTransfers] = useState<InternalTransfer[]>([])

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedMachines = localStorage.getItem('posMachines')
    const savedTransfers = localStorage.getItem('posTransfers')
    
    if (savedMachines) {
      setMachines(JSON.parse(savedMachines))
    } else {
      setMachines(defaultMachines)
    }
    
    if (savedTransfers) {
      setTransfers(JSON.parse(savedTransfers))
    } else {
      setTransfers(defaultTransfers)
    }
  }, [])

  // حفظ البيانات في localStorage
  useEffect(() => {
    if (machines.length > 0) {
      localStorage.setItem('posMachines', JSON.stringify(machines))
    }
  }, [machines])

  useEffect(() => {
    if (transfers.length > 0) {
      localStorage.setItem('posTransfers', JSON.stringify(transfers))
    }
  }, [transfers])

  const updateMachines = (newMachines: POSMachine[]) => {
    setMachines(newMachines)
  }

  const addMachine = (machine: POSMachine) => {
    setMachines([...machines, machine])
  }

  const removeMachine = (id: string) => {
    setMachines(machines.filter(m => m.id !== id))
  }

  const getMachineById = (id: string) => {
    return machines.find(m => m.id === id)
  }

  const updateMachineStatus = (id: string, status: 'active' | 'inactive' | 'maintenance') => {
    setMachines(machines.map(m => m.id === id ? { ...m, status } : m))
  }

  const addAccountToMachine = (machineId: string, account: POSAccount) => {
    setMachines(machines.map(m => {
      if (m.id === machineId) {
        return { ...m, accounts: [...m.accounts, account] }
      }
      return m
    }))
  }

  const removeAccountFromMachine = (machineId: string, accountId: string) => {
    setMachines(machines.map(m => {
      if (m.id === machineId) {
        return { ...m, accounts: m.accounts.filter(a => a.id !== accountId) }
      }
      return m
    }))
  }

  const setPrimaryAccount = (machineId: string, accountId: string) => {
    setMachines(machines.map(m => {
      if (m.id === machineId) {
        return {
          ...m,
          accounts: m.accounts.map(a => ({
            ...a,
            isPrimary: a.id === accountId
          }))
        }
      }
      return m
    }))
  }

  const updateAccountBalance = (machineId: string, accountId: string, newBalance: number) => {
    setMachines(machines.map(m => {
      if (m.id === machineId) {
        return {
          ...m,
          accounts: m.accounts.map(a => 
            a.id === accountId ? { ...a, balance: newBalance } : a
          )
        }
      }
      return m
    }))
  }

  const addInternalTransfer = (transfer: InternalTransfer) => {
    setTransfers([...transfers, transfer])
  }

  const getTransfersByMachine = (machineId: string) => {
    return transfers.filter(t => t.machineId === machineId)
  }

  return (
    <POSMachinesContext.Provider
      value={{
        machines,
        transfers,
        updateMachines,
        addMachine,
        removeMachine,
        getMachineById,
        updateMachineStatus,
        addAccountToMachine,
        removeAccountFromMachine,
        setPrimaryAccount,
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
  if (context === undefined) {
    throw new Error('usePOSMachines must be used within a POSMachinesProvider')
  }
  return context
}

