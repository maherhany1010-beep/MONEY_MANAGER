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

export type SourceType = 'bank' | 'vault' | 'ewallet' | 'card' | 'prepaid'

export interface SourceItem {
  id: string
  name?: string
  balance: number
  type: SourceType
  isActive?: boolean | true
}

interface SourceSelectorProps {
  value: string
  onChange: (value: string) => void
  excludeId?: string // لاستبعاد المصدر الحالي (مثلاً عند الشحن لنفس الحساب)
  excludeType?: SourceType // لاستبعاد نوع معين من المصادر
  label?: string
  placeholder?: string
  required?: boolean
}

export function SourceSelector({
  value,
  onChange,
  excludeId,
  excludeType,
  label = 'مصدر الشحن',
  placeholder = 'اختر مصدر الشحن',
  required = true,
}: SourceSelectorProps) {
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: creditCards } = useCards()
  const { cards: prepaidCards } = usePrepaidCards()

  // Prepare all sources
  const allSources = useMemo(() => {
    const sources: SourceItem[] = []

    // Bank Accounts
    if (excludeType !== 'bank') {
      bankAccounts
        .filter(acc => acc.isActive && acc.id !== excludeId)
        .forEach(acc => {
          sources.push({
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
        .filter(vault => vault.isActive && vault.id !== excludeId)
        .forEach(vault => {
          sources.push({
            id: `vault-${vault.id}`,
            name: vault.vaultName ?? vault.vault_name ?? 'خزينة',
            balance: vault.balance,
            type: 'vault',
            isActive: vault.isActive ?? true,
          })
        })
    }

    // E-Wallets
    if (excludeType !== 'ewallet') {
      eWallets
        .filter(wallet => wallet.status === 'active' && wallet.id !== excludeId)
        .forEach(wallet => {
          sources.push({
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
        .filter(card => card.isActive && card.id !== excludeId)
        .forEach(card => {
          // For credit cards, available balance = credit limit - current balance
          const availableBalance = (card.creditLimit ?? 0) - (card.currentBalance ?? 0)
          sources.push({
            id: `card-${card.id}`,
            name: card.name ?? card.card_name ?? 'بطاقة ائتمان',
            balance: availableBalance,
            type: 'card',
            isActive: card.isActive ?? true,
          })
        })
    }

    // Prepaid Cards
    if (excludeType !== 'prepaid') {
      prepaidCards
        .filter(card => card.status === 'active' && card.id !== excludeId)
        .forEach(card => {
          sources.push({
            id: `prepaid-${card.id}`,
            name: card.cardName ?? card.card_name ?? 'بطاقة مدفوعة مسبقاً',
            balance: card.balance,
            type: 'prepaid',
            isActive: card.status === 'active',
          })
        })
    }

    return sources
  }, [bankAccounts, cashVaults, eWallets, creditCards, prepaidCards, excludeId, excludeType])

  // Group sources by type
  const groupedSources = useMemo(() => {
    return {
      bank: allSources.filter(s => s.type === 'bank'),
      vault: allSources.filter(s => s.type === 'vault'),
      ewallet: allSources.filter(s => s.type === 'ewallet'),
      card: allSources.filter(s => s.type === 'card'),
      prepaid: allSources.filter(s => s.type === 'prepaid'),
    }
  }, [allSources])

  const getIcon = (type: SourceType) => {
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
    }
  }

  const getGroupLabel = (type: SourceType) => {
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
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="source">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id="source">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Bank Accounts */}
          {groupedSources.bank.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('bank')}
                {getGroupLabel('bank')}
              </SelectLabel>
              {groupedSources.bank.map(source => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{source.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(source.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Cash Vaults */}
          {groupedSources.vault.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('vault')}
                {getGroupLabel('vault')}
              </SelectLabel>
              {groupedSources.vault.map(source => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{source.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(source.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* E-Wallets */}
          {groupedSources.ewallet.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('ewallet')}
                {getGroupLabel('ewallet')}
              </SelectLabel>
              {groupedSources.ewallet.map(source => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{source.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(source.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Credit Cards */}
          {groupedSources.card.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('card')}
                {getGroupLabel('card')}
              </SelectLabel>
              {groupedSources.card.map(source => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{source.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(source.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {/* Prepaid Cards */}
          {groupedSources.prepaid.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2">
                {getIcon('prepaid')}
                {getGroupLabel('prepaid')}
              </SelectLabel>
              {groupedSources.prepaid.map(source => (
                <SelectItem key={source.id} value={source.id}>
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="truncate">{source.name}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatCurrency(source.balance)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}

          {allSources.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              لا توجد مصادر متاحة
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Hook to get source details by ID
 */
export function useSourceDetails(sourceId: string): SourceItem | null {
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: creditCards } = useCards()
  const { cards: prepaidCards } = usePrepaidCards()

  return useMemo(() => {
    if (!sourceId) return null

    const [type, id] = sourceId.split('-')

    switch (type) {
      case 'bank': {
        const account = bankAccounts.find(acc => acc.id === id)
        if (!account) return null
        return {
          id: sourceId,
          name: account.accountName ?? account.account_name ?? 'حساب بنكي',
          balance: account.balance,
          type: 'bank' as SourceType,
          isActive: account.isActive ?? true,
        }
      }
      case 'vault': {
        const vault = cashVaults.find(v => v.id === id)
        if (!vault) return null
        return {
          id: sourceId,
          name: vault.vaultName ?? vault.vault_name ?? 'خزينة',
          balance: vault.balance,
          type: 'vault' as SourceType,
          isActive: vault.isActive ?? true,
        }
      }
      case 'ewallet': {
        const wallet = eWallets.find(w => w.id === id)
        if (!wallet) return null
        return {
          id: sourceId,
          name: wallet.walletName ?? wallet.wallet_name ?? 'محفظة إلكترونية',
          balance: wallet.balance,
          type: 'ewallet' as SourceType,
          isActive: wallet.status === 'active',
        }
      }
      case 'card': {
        const card = creditCards.find(c => c.id === id)
        if (!card) return null
        const availableBalance = (card.creditLimit ?? 0) - (card.currentBalance ?? 0)
        return {
          id: sourceId,
          name: card.name || 'بطاقة ائتمان',
          balance: availableBalance,
          type: 'card' as SourceType,
          isActive: card.isActive,
        }
      }
      case 'prepaid': {
        const card = prepaidCards.find(c => c.id === id)
        if (!card) return null
        return {
          id: sourceId,
          name: card.cardName,
          balance: card.balance,
          type: 'prepaid' as SourceType,
          isActive: card.status === 'active',
        }
      }
      default:
        return null
    }
  }, [sourceId, bankAccounts, cashVaults, eWallets, creditCards, prepaidCards])
}

