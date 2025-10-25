'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Merchant } from '@/components/cards/merchants-manager'

interface MerchantsContextType {
  merchants: Merchant[]
  updateMerchants: (merchants: Merchant[]) => void
  addMerchant: (merchant: Merchant) => void
  removeMerchant: (id: string) => void
}

const MerchantsContext = createContext<MerchantsContextType | undefined>(undefined)

// البيانات الافتراضية
const defaultMerchants: Merchant[] = [
  {
    id: '1',
    name: 'كارفور مصر',
    category: 'طعام ومشروبات',
    purchaseFee: 0,
    purchaseFeeFixed: 0
  },
  {
    id: '2',
    name: 'محطة توتال مصر',
    category: 'وقود',
    purchaseFee: 2.5,
    purchaseFeeFixed: 5
  },
  {
    id: '3',
    name: 'سيتي ستارز مول',
    category: 'تسوق',
    purchaseFee: 0,
    purchaseFeeFixed: 0
  },
  {
    id: '4',
    name: 'مطعم أندريا',
    category: 'طعام ومشروبات',
    purchaseFee: 0,
    purchaseFeeFixed: 0
  },
  {
    id: '5',
    name: 'فودافون',
    category: 'فواتير',
    purchaseFee: 1.5,
    purchaseFeeFixed: 0
  },
  {
    id: '6',
    name: 'أمازون',
    category: 'تسوق',
    purchaseFee: 2.0,
    purchaseFeeFixed: 0
  },
]

export function MerchantsProvider({ children }: { children: ReactNode }) {
  const [merchants, setMerchants] = useState<Merchant[]>(defaultMerchants)

  // تحميل البيانات من localStorage عند بدء التطبيق
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMerchants = localStorage.getItem('merchants')
      if (savedMerchants) {
        try {
          setMerchants(JSON.parse(savedMerchants))
        } catch (error) {
          console.error('Error loading merchants:', error)
        }
      }
    }
  }, [])

  // حفظ البيانات في localStorage عند التحديث
  const updateMerchants = (newMerchants: Merchant[]) => {
    setMerchants(newMerchants)
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchants', JSON.stringify(newMerchants))
    }
  }

  const addMerchant = (merchant: Merchant) => {
    const newMerchants = [...merchants, merchant]
    updateMerchants(newMerchants)
  }

  const removeMerchant = (id: string) => {
    const newMerchants = merchants.filter(m => m.id !== id)
    updateMerchants(newMerchants)
  }

  return (
    <MerchantsContext.Provider value={{ merchants, updateMerchants, addMerchant, removeMerchant }}>
      {children}
    </MerchantsContext.Provider>
  )
}

export function useMerchants() {
  const context = useContext(MerchantsContext)
  if (context === undefined) {
    throw new Error('useMerchants must be used within a MerchantsProvider')
  }
  return context
}

