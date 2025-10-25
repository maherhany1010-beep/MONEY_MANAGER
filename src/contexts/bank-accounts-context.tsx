'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface BankAccount {
  id: string
  accountName: string
  bankName: string
  accountNumber: string
  accountType: 'checking' | 'savings' | 'current' // جاري، توفير، حساب جاري
  balance: number
  isDefault?: boolean
  isActive?: boolean
  // حدود الحساب
  dailyLimit?: number
  monthlyLimit?: number
  transactionLimit?: number
  // بيانات صاحب الحساب
  holderName?: string
  holderPhone?: string
  holderEmail?: string
  holderAddress?: string
  // إعدادات
  currency?: string
  iban?: string
  swiftCode?: string
  branchName?: string
  branchCode?: string
  // تواريخ
  openDate?: string
  lastTransactionDate?: string
  // إحصائيات
  totalDeposits?: number
  totalWithdrawals?: number
  monthlySpending?: number
}

interface BankAccountsContextType {
  accounts: BankAccount[]
  updateAccounts: (accounts: BankAccount[]) => void
  addAccount: (account: BankAccount) => void
  removeAccount: (id: string) => void
  getDefaultAccount: () => BankAccount | undefined
  updateAccountBalance: (id: string, newBalance: number, transactionAmount?: number) => void
  getAccountById: (id: string) => BankAccount | undefined
}

const BankAccountsContext = createContext<BankAccountsContextType | undefined>(undefined)

// البيانات الافتراضية
const defaultAccounts: BankAccount[] = [
  {
    id: '1',
    accountName: 'حسابي الجاري الرئيسي',
    bankName: 'البنك الأهلي المصري',
    accountNumber: '1234567890',
    accountType: 'checking',
    balance: 50000,
    isDefault: true,
    isActive: true,
    dailyLimit: 20000,
    monthlyLimit: 100000,
    transactionLimit: 10000,
    holderName: 'أحمد محمد علي',
    holderPhone: '01012345678',
    holderEmail: 'ahmed@example.com',
    currency: 'EGP',
    iban: 'EG380019000100123456789012345',
    branchName: 'فرع المعادي',
    openDate: '2020-01-15',
    totalDeposits: 500000,
    totalWithdrawals: 450000,
    monthlySpending: 15000,
  },
  {
    id: '2',
    accountName: 'حساب التوفير',
    bankName: 'بنك مصر',
    accountNumber: '0987654321',
    accountType: 'savings',
    balance: 120000,
    isDefault: false,
    isActive: true,
    dailyLimit: 10000,
    monthlyLimit: 50000,
    transactionLimit: 5000,
    holderName: 'أحمد محمد علي',
    holderPhone: '01012345678',
    holderEmail: 'ahmed@example.com',
    currency: 'EGP',
    iban: 'EG380002000100987654321098765',
    branchName: 'فرع مدينة نصر',
    openDate: '2019-06-20',
    totalDeposits: 200000,
    totalWithdrawals: 80000,
    monthlySpending: 5000,
  },
  {
    id: '3',
    accountName: 'الحساب التجاري',
    bankName: 'البنك التجاري الدولي',
    accountNumber: '5555666677',
    accountType: 'current',
    balance: 75000,
    isDefault: false,
    dailyLimit: 50000,
    monthlyLimit: 200000,
    transactionLimit: 25000,
    holderName: 'أحمد محمد علي',
    holderPhone: '01012345678',
    holderEmail: 'ahmed@example.com',
    currency: 'EGP',
    iban: 'EG380003000105555666677055556',
    branchName: 'فرع التجمع الخامس',
    openDate: '2021-03-10',
    totalDeposits: 300000,
    totalWithdrawals: 225000,
    monthlySpending: 20000,
  },
]

export function BankAccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(defaultAccounts)

  // تحميل البيانات من localStorage عند بدء التطبيق
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccounts = localStorage.getItem('bankAccounts')
      if (savedAccounts) {
        try {
          setAccounts(JSON.parse(savedAccounts))
        } catch (error) {
          console.error('Error loading bank accounts:', error)
        }
      }
    }
  }, [])

  // حفظ البيانات في localStorage عند التحديث
  const updateAccounts = (newAccounts: BankAccount[]) => {
    setAccounts(newAccounts)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bankAccounts', JSON.stringify(newAccounts))
    }
  }

  const addAccount = (account: BankAccount) => {
    const newAccounts = [...accounts, account]
    updateAccounts(newAccounts)
  }

  const removeAccount = (id: string) => {
    const newAccounts = accounts.filter(acc => acc.id !== id)
    updateAccounts(newAccounts)
  }

  const getDefaultAccount = () => {
    return accounts.find(acc => acc.isDefault) || accounts[0]
  }

  const updateAccountBalance = (id: string, newBalance: number, transactionAmount?: number) => {
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === id) {
        const updates: Partial<BankAccount> = { balance: newBalance }

        // تحديث الحدود المستخدمة إذا كان هناك مبلغ معاملة
        if (transactionAmount) {
          const amount = Math.abs(transactionAmount);
          // تحديث الحدود لكل من السحب والإيداع
          (updates as any).dailyUsed = ((acc as any).dailyUsed || 0) + amount;
          (updates as any).monthlyUsed = ((acc as any).monthlyUsed || 0) + amount;
        }

        return { ...acc, ...updates }
      }
      return acc
    })
    updateAccounts(updatedAccounts)
  }

  const getAccountById = (id: string) => {
    return accounts.find(acc => acc.id === id)
  }

  return (
    <BankAccountsContext.Provider value={{
      accounts,
      updateAccounts,
      addAccount,
      removeAccount,
      getDefaultAccount,
      updateAccountBalance,
      getAccountById
    }}>
      {children}
    </BankAccountsContext.Provider>
  )
}

export function useBankAccounts() {
  const context = useContext(BankAccountsContext)
  if (context === undefined) {
    throw new Error('useBankAccounts must be used within a BankAccountsProvider')
  }
  return context
}

