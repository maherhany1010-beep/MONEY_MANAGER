'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useInvestments } from '@/contexts/investments-context'
import {
  Landmark,
  Vault,
  Wallet,
  CheckCircle2,
  Check,
  ChevronsUpDown,
  AlertCircle,
  CreditCard,
  Smartphone,
  TrendingUp,
  Ban
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Account {
  id: string
  name: string
  balance: number
  type: 'bank' | 'cash' | 'wallet' | 'credit' | 'prepaid' | 'investment'
  icon: React.ReactNode
  insufficientBalance?: boolean
  isDisabled?: boolean
  statusLabel?: string
}

interface CircleTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'payment' | 'withdrawal'
  circleName: string
  amount: number
  onConfirm: (accountId: string, accountType: string) => Promise<void>
}

export function CircleTransactionDialog({
  open,
  onOpenChange,
  type,
  circleName,
  amount,
  onConfirm,
}: CircleTransactionDialogProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  // جلب جميع أنواع الحسابات
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: creditCards } = useCards()
  const { cards: prepaidCards } = usePrepaidCards()
  const { investments } = useInvestments()

  // تنسيق العملة
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
  }

  // دالة للتحقق من حالة الحساب
  const getAccountStatus = (item: any): { isDisabled: boolean; statusLabel: string } => {
    if (item.is_active === false || item.status === 'disabled' || item.disabled === true) {
      return { isDisabled: true, statusLabel: 'معطل' }
    }
    if (item.status === 'blocked') {
      return { isDisabled: true, statusLabel: 'محظور' }
    }
    if (item.status === 'cancelled') {
      return { isDisabled: true, statusLabel: 'ملغي' }
    }
    if (item.status === 'expired') {
      return { isDisabled: true, statusLabel: 'منتهي' }
    }
    return { isDisabled: false, statusLabel: '' }
  }

  // تجميع جميع الحسابات بدون تصفية
  const { bankAccountsList, cashVaultsList, walletsList, creditCardsList, prepaidCardsList, investmentsList, allAccounts } = useMemo(() => {
    // الحسابات البنكية - جميعها
    const bankList: Account[] = bankAccounts.map(acc => {
      const status = getAccountStatus(acc)
      return {
        id: acc.id,
        name: acc.account_name || acc.bank_name || 'حساب بنكي',
        balance: acc.balance || 0,
        type: 'bank' as const,
        icon: <Landmark className="h-5 w-5 text-emerald-600" />,
        insufficientBalance: type === 'payment' && (acc.balance || 0) < amount,
        ...status,
      }
    }).sort((a, b) => b.balance - a.balance)

    // الخزائن النقدية - جميعها
    const cashList: Account[] = cashVaults.map(vault => {
      const status = getAccountStatus(vault)
      return {
        id: vault.id,
        name: vault.vault_name || 'خزنة نقدية',
        balance: vault.balance || 0,
        type: 'cash' as const,
        icon: <Vault className="h-5 w-5 text-amber-600" />,
        insufficientBalance: type === 'payment' && (vault.balance || 0) < amount,
        ...status,
      }
    }).sort((a, b) => b.balance - a.balance)

    // المحافظ الإلكترونية - جميعها
    const walletList: Account[] = eWallets.map(wallet => {
      const status = getAccountStatus(wallet)
      return {
        id: wallet.id,
        name: wallet.wallet_name || wallet.provider || 'محفظة إلكترونية',
        balance: wallet.balance || 0,
        type: 'wallet' as const,
        icon: <Smartphone className="h-5 w-5 text-violet-600" />,
        insufficientBalance: type === 'payment' && (wallet.balance || 0) < amount,
        ...status,
      }
    }).sort((a, b) => b.balance - a.balance)

    // البطاقات الائتمانية - جميعها
    const creditList: Account[] = creditCards.map(card => {
      const status = getAccountStatus(card)
      return {
        id: card.id,
        name: card.card_name || `${card.bank_name} - ${card.card_type}`,
        balance: card.available_credit || 0,
        type: 'credit' as const,
        icon: <CreditCard className="h-5 w-5 text-blue-600" />,
        insufficientBalance: type === 'payment' && (card.available_credit || 0) < amount,
        ...status,
      }
    }).sort((a, b) => b.balance - a.balance)

    // البطاقات مسبقة الدفع - جميعها
    const prepaidList: Account[] = prepaidCards.map(card => {
      const status = getAccountStatus(card)
      return {
        id: card.id,
        name: card.card_name || 'بطاقة مسبقة الدفع',
        balance: card.balance || 0,
        type: 'prepaid' as const,
        icon: <Wallet className="h-5 w-5 text-pink-600" />,
        insufficientBalance: type === 'payment' && (card.balance || 0) < amount,
        ...status,
      }
    }).sort((a, b) => b.balance - a.balance)

    // الاستثمارات (الشهادات البنكية فقط) - جميعها
    const investList: Account[] = investments
      .filter(inv => inv.investment_type === 'certificate')
      .map(inv => {
        const status = getAccountStatus(inv)
        return {
          id: inv.id,
          name: inv.name || 'شهادة استثمار',
          balance: inv.current_value || inv.initial_amount || 0,
          type: 'investment' as const,
          icon: <TrendingUp className="h-5 w-5 text-teal-600" />,
          insufficientBalance: type === 'payment' && (inv.current_value || inv.initial_amount || 0) < amount,
          ...status,
        }
      }).sort((a, b) => b.balance - a.balance)

    return {
      bankAccountsList: bankList,
      cashVaultsList: cashList,
      walletsList: walletList,
      creditCardsList: creditList,
      prepaidCardsList: prepaidList,
      investmentsList: investList,
      allAccounts: [...bankList, ...cashList, ...walletList, ...creditList, ...prepaidList, ...investList],
    }
  }, [bankAccounts, cashVaults, eWallets, creditCards, prepaidCards, investments, type, amount])

  // الحساب المختار
  const selectedAccountData = useMemo(() => {
    return allAccounts.find(a => a.id === selectedAccount)
  }, [allAccounts, selectedAccount])

  // إعادة تعيين الحالة عند فتح النافذة
  useEffect(() => {
    if (open) {
      setSelectedAccount('')
      setSuccess(false)
    }
  }, [open])

  const handleConfirm = async () => {
    if (!selectedAccount) return

    const account = allAccounts.find(a => a.id === selectedAccount)
    if (!account) return

    // التحقق من الرصيد للسداد
    if (type === 'payment' && account.balance < amount) {
      alert('رصيد الحساب غير كافٍ!')
      return
    }

    setLoading(true)
    try {
      await onConfirm(selectedAccount, account.type)
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء العملية')
    } finally {
      setLoading(false)
    }
  }

  // مكون لعرض عنصر الحساب
  const AccountItem = ({ account, showCheck = true }: { account: Account; showCheck?: boolean }) => (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className={cn(
        "p-2 rounded-lg",
        account.isDisabled ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
      )}>
        {account.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("font-medium truncate", account.isDisabled && "text-muted-foreground")}>
            {account.name}
          </p>
          {account.isDisabled && (
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
              <Ban className="h-3 w-3 ml-1" />
              {account.statusLabel}
            </Badge>
          )}
        </div>
        <p className={cn(
          "text-sm",
          account.insufficientBalance ? "text-red-500" : "text-muted-foreground"
        )}>
          الرصيد: {formatCurrency(account.balance)}
        </p>
      </div>
      {account.insufficientBalance ? (
        <Badge variant="destructive" className="text-xs shrink-0">
          <AlertCircle className="h-3 w-3 ml-1" />
          رصيد غير كافٍ
        </Badge>
      ) : showCheck ? (
        <Check
          className={cn(
            "h-5 w-5 shrink-0 text-primary",
            selectedAccount === account.id ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}
    </div>
  )

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl" dir="rtl">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              {type === 'payment' ? '✅ تم السداد بنجاح!' : '✅ تم السحب بنجاح!'}
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(amount)}
            </p>
            <p className="text-muted-foreground mt-2">
              {type === 'payment' ? 'تم خصم المبلغ من حسابك' : 'تم إضافة المبلغ إلى حسابك'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-3">
            {type === 'payment' ? (
              <>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                سداد قسط الجمعية
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                سحب من الجمعية
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {type === 'payment'
              ? `اختر الحساب الذي سيُخصم منه مبلغ السداد لجمعية "${circleName}"`
              : `اختر الحساب الذي سيُضاف إليه مبلغ السحب من جمعية "${circleName}"`
            }
          </DialogDescription>
        </DialogHeader>

        {/* المبلغ */}
        <div className={cn(
          "p-6 rounded-xl text-center shadow-sm border-2",
          type === 'payment'
            ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
            : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
        )}>
          <p className="text-sm text-muted-foreground mb-2">
            {type === 'payment' ? 'المبلغ المطلوب سداده' : 'المبلغ المستحق للسحب'}
          </p>
          <p className={cn(
            "text-4xl font-bold",
            type === 'payment' ? 'text-red-600' : 'text-green-600'
          )}>
            {formatCurrency(amount)}
          </p>
        </div>

        {/* قائمة الحسابات - Combobox مع البحث */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">اختر الحساب:</Label>
          {allAccounts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-xl">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">لا توجد حسابات متاحة</p>
              <p className="text-sm">أضف حساباً من مركز الحسابات</p>
            </div>
          ) : (
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between h-auto py-4 px-4 border-2 hover:border-primary/50 transition-all"
                >
                  {selectedAccountData ? (
                    <AccountItem account={selectedAccountData} showCheck={false} />
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <ChevronsUpDown className="h-4 w-4" />
                      ابحث واختر حساباً...
                    </span>
                  )}
                  <ChevronsUpDown className="h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 shadow-xl border-2"
                align="start"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
              >
                <Command>
                  <CommandInput
                    placeholder="🔍 ابحث عن حساب بالاسم..."
                    className="h-12 text-base"
                  />
                  <CommandList className="max-h-[400px]">
                    <CommandEmpty className="py-6 text-center">
                      <p className="text-muted-foreground">لا توجد نتائج للبحث</p>
                    </CommandEmpty>

                    {/* الحسابات البنكية */}
                    {bankAccountsList.length > 0 && (
                      <CommandGroup heading="🏦 الحسابات البنكية" className="px-2">
                        {bankAccountsList.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`bank ${account.name} ${account.id}`}
                            onSelect={() => {
                              if (!account.insufficientBalance) {
                                setSelectedAccount(account.id)
                                setComboboxOpen(false)
                              }
                            }}
                            className={cn(
                              "py-3 px-3 my-1 rounded-lg cursor-pointer",
                              account.insufficientBalance && "opacity-60"
                            )}
                          >
                            <AccountItem account={account} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {bankAccountsList.length > 0 && (cashVaultsList.length > 0 || walletsList.length > 0 || creditCardsList.length > 0) && (
                      <CommandSeparator className="my-2" />
                    )}

                    {/* الخزائن النقدية */}
                    {cashVaultsList.length > 0 && (
                      <CommandGroup heading="💰 الخزائن النقدية" className="px-2">
                        {cashVaultsList.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`cash ${account.name} ${account.id}`}
                            onSelect={() => {
                              if (!account.insufficientBalance) {
                                setSelectedAccount(account.id)
                                setComboboxOpen(false)
                              }
                            }}
                            className={cn(
                              "py-3 px-3 my-1 rounded-lg cursor-pointer",
                              account.insufficientBalance && "opacity-60"
                            )}
                          >
                            <AccountItem account={account} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {cashVaultsList.length > 0 && (walletsList.length > 0 || creditCardsList.length > 0) && (
                      <CommandSeparator className="my-2" />
                    )}

                    {/* المحافظ الإلكترونية */}
                    {walletsList.length > 0 && (
                      <CommandGroup heading="📱 المحافظ الإلكترونية" className="px-2">
                        {walletsList.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`wallet ${account.name} ${account.id}`}
                            onSelect={() => {
                              if (!account.insufficientBalance) {
                                setSelectedAccount(account.id)
                                setComboboxOpen(false)
                              }
                            }}
                            className={cn(
                              "py-3 px-3 my-1 rounded-lg cursor-pointer",
                              account.insufficientBalance && "opacity-60"
                            )}
                          >
                            <AccountItem account={account} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {walletsList.length > 0 && (creditCardsList.length > 0 || prepaidCardsList.length > 0) && (
                      <CommandSeparator className="my-2" />
                    )}

                    {/* البطاقات الائتمانية */}
                    {creditCardsList.length > 0 && (
                      <CommandGroup heading="💳 البطاقات الائتمانية" className="px-2">
                        {creditCardsList.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`credit ${account.name} ${account.id}`}
                            onSelect={() => {
                              if (!account.insufficientBalance) {
                                setSelectedAccount(account.id)
                                setComboboxOpen(false)
                              }
                            }}
                            className={cn(
                              "py-3 px-3 my-1 rounded-lg cursor-pointer",
                              account.insufficientBalance && "opacity-60"
                            )}
                          >
                            <AccountItem account={account} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {creditCardsList.length > 0 && (prepaidCardsList.length > 0 || investmentsList.length > 0) && (
                      <CommandSeparator className="my-2" />
                    )}

                    {/* البطاقات مسبقة الدفع */}
                    {prepaidCardsList.length > 0 && (
                      <CommandGroup heading="🎴 البطاقات مسبقة الدفع" className="px-2">
                        {prepaidCardsList.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`prepaid ${account.name} ${account.id}`}
                            onSelect={() => {
                              if (!account.insufficientBalance) {
                                setSelectedAccount(account.id)
                                setComboboxOpen(false)
                              }
                            }}
                            className={cn(
                              "py-3 px-3 my-1 rounded-lg cursor-pointer",
                              account.insufficientBalance && "opacity-60"
                            )}
                          >
                            <AccountItem account={account} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {prepaidCardsList.length > 0 && investmentsList.length > 0 && (
                      <CommandSeparator className="my-2" />
                    )}

                    {/* الاستثمارات */}
                    {investmentsList.length > 0 && (
                      <CommandGroup heading="📈 الشهادات والاستثمارات" className="px-2">
                        {investmentsList.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`investment ${account.name} ${account.id}`}
                            onSelect={() => {
                              if (!account.insufficientBalance) {
                                setSelectedAccount(account.id)
                                setComboboxOpen(false)
                              }
                            }}
                            className={cn(
                              "py-3 px-3 my-1 rounded-lg cursor-pointer",
                              account.insufficientBalance && "opacity-60"
                            )}
                          >
                            <AccountItem account={account} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <DialogFooter className="gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 h-12 text-base"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAccount || loading}
            className={cn(
              "flex-1 h-12 text-base font-semibold transition-all",
              type === 'payment'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                جاري التنفيذ...
              </span>
            ) : type === 'payment' ? (
              <span className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                تأكيد السداد
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                تأكيد السحب
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

