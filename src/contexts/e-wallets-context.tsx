'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface EWallet {
  id: string
  walletName: string
  provider: string // فودافون كاش، اتصالات كاش، أورانج كاش، إلخ
  phoneNumber: string
  balance: number
  isDefault?: boolean
  // حدود المحفظة
  dailyLimit?: number
  monthlyLimit?: number
  transactionLimit?: number
  dailyUsed?: number // المستخدم اليوم
  monthlyUsed?: number // المستخدم هذا الشهر
  // بيانات صاحب المحفظة
  holderName?: string
  holderNationalId?: string
  holderEmail?: string
  // إعدادات
  walletType: 'personal' | 'business' | 'savings' // شخصية، تجارية، توفير
  status: 'active' | 'suspended' | 'blocked' // نشطة، معلقة، محظورة
  isVerified?: boolean
  kycLevel?: 1 | 2 | 3 // مستوى التحقق
  // تواريخ
  createdDate?: string
  lastTransactionDate?: string
  verificationDate?: string
  // إحصائيات
  totalDeposits?: number
  totalWithdrawals?: number
  totalTransfers?: number
  monthlyDeposits?: number
  monthlyWithdrawals?: number
  transactionCount?: number
  // رسوم
  depositFee?: number // رسوم الإيداع (نسبة مئوية)
  withdrawalFee?: number // رسوم السحب (نسبة مئوية)
  transferFee?: number // رسوم التحويل (نسبة مئوية)
  // ملاحظات
  notes?: string
  description?: string
}

interface EWalletsContextType {
  wallets: EWallet[]
  updateWallets: (wallets: EWallet[]) => void
  addWallet: (wallet: EWallet) => void
  removeWallet: (id: string) => void
  getDefaultWallet: () => EWallet | undefined
  updateWalletBalance: (id: string, newBalance: number, transactionAmount?: number) => void
  getWalletById: (id: string) => EWallet | undefined
  updateDailyUsage: (id: string, amount: number) => void
  updateMonthlyUsage: (id: string, amount: number) => void
}

const EWalletsContext = createContext<EWalletsContextType | undefined>(undefined)

// البيانات الافتراضية
const defaultWallets: EWallet[] = [
  {
    id: '1',
    walletName: 'فودافون كاش الرئيسية',
    provider: 'Vodafone Cash',
    phoneNumber: '01012345678',
    balance: 15000,
    isDefault: true,
    dailyLimit: 10000,
    monthlyLimit: 100000,
    transactionLimit: 5000,
    dailyUsed: 2500,
    monthlyUsed: 35000,
    holderName: 'أحمد محمد علي',
    holderNationalId: '29012011234567',
    holderEmail: 'ahmed@example.com',
    walletType: 'personal',
    status: 'active',
    isVerified: true,
    kycLevel: 3,
    createdDate: '2023-01-15',
    lastTransactionDate: '2025-10-08',
    verificationDate: '2023-01-20',
    totalDeposits: 500000,
    totalWithdrawals: 450000,
    totalTransfers: 35000,
    monthlyDeposits: 50000,
    monthlyWithdrawals: 45000,
    transactionCount: 342,
    depositFee: 0,
    withdrawalFee: 0,
    transferFee: 0,
    description: 'المحفظة الرئيسية للمعاملات اليومية',
  },
  {
    id: '2',
    walletName: 'اتصالات كاش',
    provider: 'Etisalat Cash',
    phoneNumber: '01112345678',
    balance: 8500,
    isDefault: false,
    dailyLimit: 7000,
    monthlyLimit: 70000,
    transactionLimit: 3000,
    dailyUsed: 1200,
    monthlyUsed: 18000,
    holderName: 'أحمد محمد علي',
    holderNationalId: '29012011234567',
    holderEmail: 'ahmed@example.com',
    walletType: 'personal',
    status: 'active',
    isVerified: true,
    kycLevel: 2,
    createdDate: '2023-06-10',
    lastTransactionDate: '2025-10-07',
    verificationDate: '2023-06-15',
    totalDeposits: 250000,
    totalWithdrawals: 230000,
    totalTransfers: 11500,
    monthlyDeposits: 25000,
    monthlyWithdrawals: 23000,
    transactionCount: 156,
    depositFee: 0,
    withdrawalFee: 0.5,
    transferFee: 0,
    description: 'محفظة احتياطية للمعاملات',
  },
  {
    id: '3',
    walletName: 'أورانج كاش',
    provider: 'Orange Cash',
    phoneNumber: '01212345678',
    balance: 5200,
    isDefault: false,
    dailyLimit: 5000,
    monthlyLimit: 50000,
    transactionLimit: 2000,
    dailyUsed: 800,
    monthlyUsed: 12000,
    holderName: 'أحمد محمد علي',
    holderNationalId: '29012011234567',
    holderEmail: 'ahmed@example.com',
    walletType: 'personal',
    status: 'active',
    isVerified: true,
    kycLevel: 2,
    createdDate: '2024-02-20',
    lastTransactionDate: '2025-10-06',
    verificationDate: '2024-02-25',
    totalDeposits: 150000,
    totalWithdrawals: 140000,
    totalTransfers: 4800,
    monthlyDeposits: 15000,
    monthlyWithdrawals: 14000,
    transactionCount: 89,
    depositFee: 0,
    withdrawalFee: 1,
    transferFee: 0.5,
    description: 'محفظة للمدفوعات الصغيرة',
  },
  {
    id: '4',
    walletName: 'محفظة الأعمال',
    provider: 'Vodafone Cash',
    phoneNumber: '01512345678',
    balance: 45000,
    isDefault: false,
    dailyLimit: 50000,
    monthlyLimit: 500000,
    transactionLimit: 20000,
    dailyUsed: 15000,
    monthlyUsed: 180000,
    holderName: 'شركة أحمد للتجارة',
    holderNationalId: '12345678901234',
    holderEmail: 'business@example.com',
    walletType: 'business',
    status: 'active',
    isVerified: true,
    kycLevel: 3,
    createdDate: '2023-03-01',
    lastTransactionDate: '2025-10-08',
    verificationDate: '2023-03-05',
    totalDeposits: 2000000,
    totalWithdrawals: 1800000,
    totalTransfers: 155000,
    monthlyDeposits: 200000,
    monthlyWithdrawals: 180000,
    transactionCount: 567,
    depositFee: 0,
    withdrawalFee: 0,
    transferFee: 0,
    description: 'محفظة الأعمال للمعاملات التجارية',
  },
]

export function EWalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<EWallet[]>(defaultWallets)

  // تحميل البيانات من localStorage عند بدء التطبيق
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWallets = localStorage.getItem('eWallets')
      if (savedWallets) {
        try {
          setWallets(JSON.parse(savedWallets))
        } catch (error) {
          console.error('Error loading e-wallets:', error)
        }
      }
    }
  }, [])

  // حفظ البيانات في localStorage عند التحديث
  const updateWallets = (newWallets: EWallet[]) => {
    setWallets(newWallets)
    if (typeof window !== 'undefined') {
      localStorage.setItem('eWallets', JSON.stringify(newWallets))
    }
  }

  const addWallet = (wallet: EWallet) => {
    const newWallets = [...wallets, wallet]
    updateWallets(newWallets)
  }

  const removeWallet = (id: string) => {
    const newWallets = wallets.filter(w => w.id !== id)
    updateWallets(newWallets)
  }

  const getDefaultWallet = () => {
    return wallets.find(w => w.isDefault) || wallets[0]
  }

  const updateWalletBalance = (id: string, newBalance: number, transactionAmount?: number) => {
    const updatedWallets = wallets.map(w => {
      if (w.id === id) {
        const updates: Partial<EWallet> = { balance: newBalance }

        // تحديث الحدود المستخدمة إذا كان هناك مبلغ معاملة
        if (transactionAmount) {
          const amount = Math.abs(transactionAmount)
          // تحديث الحدود لكل من السحب والإيداع
          updates.dailyUsed = (w.dailyUsed || 0) + amount
          updates.monthlyUsed = (w.monthlyUsed || 0) + amount
        }

        return { ...w, ...updates }
      }
      return w
    })
    updateWallets(updatedWallets)
  }

  const getWalletById = (id: string) => {
    return wallets.find(w => w.id === id)
  }

  const updateDailyUsage = (id: string, amount: number) => {
    const updatedWallets = wallets.map(w => 
      w.id === id ? { ...w, dailyUsed: (w.dailyUsed || 0) + amount } : w
    )
    updateWallets(updatedWallets)
  }

  const updateMonthlyUsage = (id: string, amount: number) => {
    const updatedWallets = wallets.map(w => 
      w.id === id ? { ...w, monthlyUsed: (w.monthlyUsed || 0) + amount } : w
    )
    updateWallets(updatedWallets)
  }

  return (
    <EWalletsContext.Provider value={{ 
      wallets, 
      updateWallets, 
      addWallet, 
      removeWallet,
      getDefaultWallet,
      updateWalletBalance,
      getWalletById,
      updateDailyUsage,
      updateMonthlyUsage
    }}>
      {children}
    </EWalletsContext.Provider>
  )
}

export function useEWallets() {
  const context = useContext(EWalletsContext)
  if (context === undefined) {
    throw new Error('useEWallets must be used within an EWalletsProvider')
  }
  return context
}

