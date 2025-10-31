'use client'

import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { Building2, Vault, Wallet, CreditCard, Smartphone } from 'lucide-react'

export type DestinationType = 'bank' | 'vault' | 'ewallet' | 'card' | 'prepaid' | 'pos'

export interface DestinationItem {
  id: string
  name?: string
  balance: number
  type: DestinationType
  isActive: boolean | true
}

interface DestinationSelectorProps {
  value: string
  onChange: (value: string) => void
  excludeId?: string
  excludeType?: DestinationType
  label?: string
  placeholder?: string
  required?: boolean
}

export function DestinationSelector({
  value,
  onChange,
  excludeId,
  excludeType,
  label = 'حساب الاستقبال',
  placeholder = 'اختر حساب الاستقبال',
  required = true,
}: DestinationSelectorProps) {
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: creditCards } = useCards()
  const { cards: prepaidCards } = usePrepaidCards()

  // Build all destinations
  const allDestinations = useMemo(() => {
    const destinations: DestinationItem[] = []

    // Bank Accounts
    if (excludeType !== 'bank') {
      bankAccounts
        .filter(acc => acc.id !== excludeId)
        .forEach(acc => {
          destinations.push({
            id: `bank-${acc.id}`,
            name: acc.accountName ?? acc.account_name ?? 'حساب بنكي',
            balance: acc.balance,
            type: 'bank',
            isActive: acc.isActive ?? true,
          })
        })
    }

    // Cash Vaults
    if (excludeType !== 'vault') {
      cashVaults
        .filter(vault => vault.id !== excludeId)
        .forEach(vault => {
          destinations.push({
            id: `vault-${vault.id}`,
            name: vault.vaultName ?? vault.vault_name ?? 'خزينة',
            balance: vault.balance,
            type: 'vault',
            isActive: true,
          })
        })
    }

    // E-Wallets
    if (excludeType !== 'ewallet') {
      eWallets
        .filter(wallet => wallet.id !== excludeId && wallet.status === 'active')
        .forEach(wallet => {
          destinations.push({
            id: `ewallet-${wallet.id}`,
            name: wallet.walletName ?? wallet.wallet_name ?? 'محفظة إلكترونية',
            balance: wallet.balance,
            type: 'ewallet',
            isActive: wallet.status === 'active',
          })
        })
    }

    // Credit Cards
    if (excludeType !== 'card') {
      creditCards
        .filter(card => card.id !== excludeId && card.isActive)
        .forEach(card => {
          destinations.push({
            id: `card-${card.id}`,
            name: card.name ?? card.card_name ?? 'بطاقة ائتمان',
            balance: (card.creditLimit ?? 0) - (card.currentBalance ?? 0),
            type: 'card',
            isActive: card.isActive ?? true,
          })
        })
    }

    // Prepaid Cards
    if (excludeType !== 'prepaid') {
      prepaidCards
        .filter(card => card.id !== excludeId && card.status === 'active')
        .forEach(card => {
          destinations.push({
            id: `prepaid-${card.id}`,
            name: card.cardName ?? card.card_name ?? 'بطاقة مدفوعة مسبقاً',
            balance: card.balance,
            type: 'prepaid',
            isActive: card.status === 'active',
          })
        })
    }

    return destinations
  }, [bankAccounts, cashVaults, eWallets, creditCards, prepaidCards, excludeId, excludeType])

  // Group destinations by type
  const groupedDestinations = useMemo(() => {
    return {
      bank: allDestinations.filter(d => d.type === 'bank'),
      vault: allDestinations.filter(d => d.type === 'vault'),
      ewallet: allDestinations.filter(d => d.type === 'ewallet'),
      card: allDestinations.filter(d => d.type === 'card'),
      prepaid: allDestinations.filter(d => d.type === 'prepaid'),
    }
  }, [allDestinations])

  const getIcon = (type: DestinationType) => {
    switch (type) {
      case 'bank':
        return <Building2 className="h-4 w-4" />
      case 'vault':
        return <Vault className="h-4 w-4" />
      case 'ewallet':
        return <Smartphone className="h-4 w-4" />
      case 'card':
      case 'prepaid':
        return <CreditCard className="h-4 w-4" />
      default:
        return null
    }
  }

  const getGroupLabel = (type: DestinationType) => {
    switch (type) {
      case 'bank':
        return 'الحسابات البنكية'
      case 'vault':
        return 'الخزائن النقدية'
      case 'ewallet':
        return 'المحافظ الإلكترونية'
      case 'card':
        return 'البطاقات الائتمانية'
      case 'prepaid':
        return 'البطاقات مسبقة الدفع'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="destination">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id="destination">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Bank Accounts */}
          {groupedDestinations.bank.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('bank')}
                {getGroupLabel('bank')}
              </SelectLabel>
              {groupedDestinations.bank.map(dest => (
                <SelectItem key={dest.id} value={dest.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{dest.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(dest.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Cash Vaults */}
          {groupedDestinations.vault.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('vault')}
                {getGroupLabel('vault')}
              </SelectLabel>
              {groupedDestinations.vault.map(dest => (
                <SelectItem key={dest.id} value={dest.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{dest.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(dest.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* E-Wallets */}
          {groupedDestinations.ewallet.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('ewallet')}
                {getGroupLabel('ewallet')}
              </SelectLabel>
              {groupedDestinations.ewallet.map(dest => (
                <SelectItem key={dest.id} value={dest.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{dest.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(dest.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Credit Cards */}
          {groupedDestinations.card.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('card')}
                {getGroupLabel('card')}
              </SelectLabel>
              {groupedDestinations.card.map(dest => (
                <SelectItem key={dest.id} value={dest.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{dest.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(dest.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Prepaid Cards */}
          {groupedDestinations.prepaid.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('prepaid')}
                {getGroupLabel('prepaid')}
              </SelectLabel>
              {groupedDestinations.prepaid.map(dest => (
                <SelectItem key={dest.id} value={dest.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{dest.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(dest.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {allDestinations.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد حسابات متاحة
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Hook to get destination details by ID
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
          name: account.accountName ?? account.account_name ?? 'حساب بنكي',
          balance: account.balance,
          type: 'bank' as DestinationType,
          isActive: account.isActive ?? true,
        }
      }
      case 'vault': {
        const vault = cashVaults.find(v => v.id === id)
        if (!vault) return null
        return {
          id: destinationId,
          name: vault.vaultName ?? vault.vault_name ?? 'خزينة',
          balance: vault.balance,
          type: 'vault' as DestinationType,
          isActive: true,
        }
      }
      case 'ewallet': {
        const wallet = eWallets.find(w => w.id === id)
        if (!wallet) return null
        return {
          id: destinationId,
          name: wallet.walletName ?? wallet.wallet_name ?? 'محفظة إلكترونية',
          balance: wallet.balance,
          type: 'ewallet' as DestinationType,
          isActive: wallet.status === 'active',
        }
      }
      case 'card': {
        const card = creditCards.find(c => c.id === id)
        if (!card) return null
        return {
          id: destinationId,
          name: card.name || 'بطاقة ائتمان',
          balance: (card.creditLimit ?? 0) - (card.currentBalance ?? 0),
          type: 'card' as DestinationType,
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
          type: 'prepaid' as DestinationType,
          isActive: card.status === 'active',
        }
      }
      default:
        return null
    }
  }, [destinationId, bankAccounts, cashVaults, eWallets, creditCards, prepaidCards])
}

