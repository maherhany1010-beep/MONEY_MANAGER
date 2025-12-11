'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface BalanceVisibilityContextType {
  isBalanceVisible: boolean
  toggleBalanceVisibility: () => void
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType | undefined>(undefined)

const BALANCE_VISIBILITY_KEY = 'balance_visibility'

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // تحميل الحالة من localStorage عند التحميل
  useEffect(() => {
    const savedVisibility = localStorage.getItem(BALANCE_VISIBILITY_KEY)
    if (savedVisibility !== null) {
      setIsBalanceVisible(JSON.parse(savedVisibility))
    }
    setIsMounted(true)
  }, [])

  // حفظ الحالة في localStorage عند التغيير
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(BALANCE_VISIBILITY_KEY, JSON.stringify(isBalanceVisible))
    }
  }, [isBalanceVisible, isMounted])

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev)
  }

  return (
    <BalanceVisibilityContext.Provider value={{ isBalanceVisible, toggleBalanceVisibility }}>
      {children}
    </BalanceVisibilityContext.Provider>
  )
}

export function useBalanceVisibility() {
  const context = useContext(BalanceVisibilityContext)
  if (context === undefined) {
    throw new Error('useBalanceVisibility must be used within a BalanceVisibilityProvider')
  }
  return context
}

