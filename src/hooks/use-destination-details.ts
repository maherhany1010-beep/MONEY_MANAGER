import { useMemo } from 'react'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'

export type DestinationType = 'bank' | 'vault' | 'ewallet' | 'card' | 'prepaid'

export interface DestinationItem {
  id: string
  name: string
  balance: number
  type: DestinationType
  isActive: boolean
}

/**
 * Hook to get destination details by ID
 * Format: "type-id" (e.g., "bank-123", "ewallet-456")
 */
export function useDestinationDetails(destinationId: string): DestinationItem | null {
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: creditCards } = useCards()
  const { cards: prepaidCards } = usePrepaidCards()

  return useMemo(() => {
    if (!destinationId) return null

    const [type, id] = destinationId.split('-')

    switch (type) {
      case 'bank': {
        const account = bankAccounts.find(a => a.id === id)
        if (!account) return null
        return {
          id: destinationId,
          name: account.accountName,
          balance: account.balance,
          type: 'bank',
          isActive: account.isActive ?? true,
        }
      }
      case 'vault': {
        const vault = cashVaults.find(v => v.id === id)
        if (!vault) return null
        return {
          id: destinationId,
          name: vault.vaultName,
          balance: vault.balance,
          type: 'vault',
          isActive: true,
        }
      }
      case 'ewallet': {
        const wallet = eWallets.find(w => w.id === id)
        if (!wallet) return null
        return {
          id: destinationId,
          name: wallet.walletName,
          balance: wallet.balance,
          type: 'ewallet',
          isActive: wallet.status === 'active',
        }
      }
      case 'card': {
        const card = creditCards.find(c => c.id === id)
        if (!card) return null
        return {
          id: destinationId,
          name: card.name,
          balance: card.creditLimit - card.currentBalance,
          type: 'card',
          isActive: card.isActive ?? true,
        }
      }
      case 'prepaid': {
        const card = prepaidCards.find(c => c.id === id)
        if (!card) return null
        return {
          id: destinationId,
          name: card.cardName,
          balance: card.balance,
          type: 'prepaid',
          isActive: card.status === 'active',
        }
      }
      default:
        return null
    }
  }, [destinationId, bankAccounts, cashVaults, eWallets, creditCards, prepaidCards])
}

