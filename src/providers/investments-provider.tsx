'use client'

import { ReactNode } from 'react'
import { InvestmentsProvider as InvestmentsContextProvider } from '@/contexts/investments-context'
import { SavingsCirclesProvider } from '@/contexts/savings-circles-context'

/**
 * InvestmentsAndSavingsProvider
 * 
 * Groups investment and savings providers:
 * - Investments
 * - Savings Circles
 */
export function InvestmentsAndSavingsProvider({ children }: { children: ReactNode }) {
  return (
    <SavingsCirclesProvider>
      <InvestmentsContextProvider>
        {children}
      </InvestmentsContextProvider>
    </SavingsCirclesProvider>
  )
}

