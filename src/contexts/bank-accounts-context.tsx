'use client'

/**
 * Bank Accounts Context - Zustand Wrapper
 * 
 * This file provides backward compatibility by wrapping the Zustand store
 * with the old Context API interface. This allows existing components to
 * work without changes while using Zustand under the hood.
 */

import { useBankAccountsStore, type BankAccount } from '@/stores/bank-accounts-store'

// Re-export the BankAccount interface from the store
export type { BankAccount } from '@/stores/bank-accounts-store'

/**
 * Custom hook that wraps the Zustand store with the old Context API interface
 * This provides backward compatibility for existing components
 */
export function useBankAccounts() {
  const store = useBankAccountsStore()
  
  return {
    accounts: store.accounts,
    loading: store.loading,
    error: store.error,
    addAccount: store.addAccount,
    updateAccount: store.updateAccount,
    deleteAccount: store.deleteAccount,
    updateAccountBalance: async (id: string, newBalance: number) => {
      await store.updateAccount(id, { balance: newBalance })
    },
    getAccountById: (id: string) => store.accounts.find(a => a.id === id),
    getDefaultAccount: () => store.accounts.find(a => a.isDefault === true) || store.accounts[0],
    refreshAccounts: async () => {
      // Data is already synced via real-time subscription
      // This is a no-op for compatibility
    },
    removeAccount: store.deleteAccount,
    updateAccounts: async (accounts: BankAccount[]) => {
      // This was used for bulk updates - not needed with Zustand
      // Individual updates should use updateAccount instead
    }
  }
}

// Legacy Provider - No longer needed with Zustand
// Kept for backward compatibility but does nothing
export function BankAccountsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
