'use client'

import { ReactNode } from 'react'
import { BankAccountsProvider } from '@/contexts/bank-accounts-context'
import { CashVaultsProvider } from '@/contexts/cash-vaults-context'
import { EWalletsProvider } from '@/contexts/e-wallets-context'
import { PrepaidCardsProvider } from '@/contexts/prepaid-cards-context'
import { POSMachinesProvider } from '@/contexts/pos-machines-context'

/**
 * FinancialAccountsProvider
 * 
 * Groups all financial account providers:
 * - Bank Accounts
 * - Cash Vaults
 * - E-Wallets
 * - Prepaid Cards
 * - POS Machines
 */
export function FinancialAccountsProvider({ children }: { children: ReactNode }) {
  return (
    <BankAccountsProvider>
      <CashVaultsProvider>
        <EWalletsProvider>
          <PrepaidCardsProvider>
            <POSMachinesProvider>
              {children}
            </POSMachinesProvider>
          </PrepaidCardsProvider>
        </EWalletsProvider>
      </CashVaultsProvider>
    </BankAccountsProvider>
  )
}

