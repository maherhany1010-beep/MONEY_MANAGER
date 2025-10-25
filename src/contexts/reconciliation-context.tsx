'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type AccountType = 'bank_account' | 'e_wallet' | 'cash_vault' | 'pos_machine' | 'prepaid_card'

export interface ReconciliationRecord {
  id: string
  accountId: string
  accountType: AccountType
  accountName: string
  systemBalance: number
  actualBalance: number
  difference: number
  notes?: string
  reconciliationDate: string
  createdAt: string
}

interface ReconciliationContextType {
  reconciliations: ReconciliationRecord[]
  addReconciliation: (reconciliation: Omit<ReconciliationRecord, 'id' | 'createdAt'>) => void
  getReconciliationsByAccount: (accountId: string) => ReconciliationRecord[]
  getReconciliationsByType: (accountType: AccountType) => ReconciliationRecord[]
  getAllReconciliations: () => ReconciliationRecord[]
  deleteReconciliation: (id: string) => void
}

const ReconciliationContext = createContext<ReconciliationContextType | undefined>(undefined)

export function ReconciliationProvider({ children }: { children: ReactNode }) {
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('reconciliations')
    if (stored) {
      try {
        setReconciliations(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading reconciliations:', error)
      }
    }
  }, [])

  // Save to localStorage whenever reconciliations change
  useEffect(() => {
    localStorage.setItem('reconciliations', JSON.stringify(reconciliations))
  }, [reconciliations])

  const addReconciliation = (reconciliationData: Omit<ReconciliationRecord, 'id' | 'createdAt'>) => {
    const newReconciliation: ReconciliationRecord = {
      ...reconciliationData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    setReconciliations([...reconciliations, newReconciliation])
  }

  const getReconciliationsByAccount = (accountId: string) => {
    return reconciliations
      .filter(rec => rec.accountId === accountId)
      .sort((a, b) => new Date(b.reconciliationDate).getTime() - new Date(a.reconciliationDate).getTime())
  }

  const getReconciliationsByType = (accountType: AccountType) => {
    return reconciliations
      .filter(rec => rec.accountType === accountType)
      .sort((a, b) => new Date(b.reconciliationDate).getTime() - new Date(a.reconciliationDate).getTime())
  }

  const getAllReconciliations = () => {
    return reconciliations.sort((a, b) => new Date(b.reconciliationDate).getTime() - new Date(a.reconciliationDate).getTime())
  }

  const deleteReconciliation = (id: string) => {
    setReconciliations(reconciliations.filter(rec => rec.id !== id))
  }

  return (
    <ReconciliationContext.Provider
      value={{
        reconciliations,
        addReconciliation,
        getReconciliationsByAccount,
        getReconciliationsByType,
        getAllReconciliations,
        deleteReconciliation,
      }}
    >
      {children}
    </ReconciliationContext.Provider>
  )
}

export function useReconciliation() {
  const context = useContext(ReconciliationContext)
  if (context === undefined) {
    throw new Error('useReconciliation must be used within a ReconciliationProvider')
  }
  return context
}

