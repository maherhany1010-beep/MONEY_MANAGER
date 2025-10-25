'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Combobox, ComboboxOption } from '@/components/ui/combobox'
import {
  AccountType,
  TransferAccount,
  CentralTransfer,
  FeeBearer,
  useCentralTransfers
} from '@/contexts/central-transfers-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'
import { formatCurrency } from '@/lib/design-system'
import {
  ArrowRightLeft,
  AlertCircle,
  CheckCircle,
  Landmark,
  Vault,
  Wallet,
  CreditCard,
  DollarSign
} from 'lucide-react'

interface CentralTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransfer: (transfer: CentralTransfer) => void
}

export function CentralTransferDialog({ open, onOpenChange, onTransfer }: CentralTransferDialogProps) {
  const { getTotalTransferred } = useCentralTransfers()
  const { accounts: bankAccounts, updateAccountBalance: updateBankBalance } = useBankAccounts()
  const { vaults, updateVaultBalance } = useCashVaults()
  const { wallets, updateWalletBalance } = useEWallets()
  const { cards: prepaidCards, updateCardBalance } = usePrepaidCards()
  const { machines, updateAccountBalance: updatePOSBalance } = usePOSMachines()

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    fee: '',
    feeBearer: 'none' as FeeBearer,
    status: 'completed' as 'completed' | 'pending',
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // إعادة تعيين النموذج عند الإغلاق
  useEffect(() => {
    if (!open) {
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        fee: '',
        feeBearer: 'none',
        status: 'completed',
        notes: '',
      })
      setError('')
      setSuccess(false)
    }
  }, [open])

  /**
   * الحصول على جميع الحسابات النشطة من جميع الأنواع
   * يتم استخدام useMemo لتجنب إعادة الحساب في كل render
   */
  const allAccounts = useMemo((): TransferAccount[] => {
    const accounts: TransferAccount[] = []

    // الحسابات البنكية (جميع الحسابات نشطة)
    bankAccounts.forEach(acc => {
      const accountId = `bank-${acc.id}`
      const dailyTransferred = getTotalTransferred(accountId, 'day')
      const monthlyTransferred = getTotalTransferred(accountId, 'month')

      accounts.push({
        id: accountId,
        type: 'bank-account' as AccountType,
        name: acc.accountName,
        accountNumber: acc.accountNumber,
        balance: acc.balance,
        dailyLimit: acc.dailyLimit,
        monthlyLimit: acc.monthlyLimit,
        dailyUsed: dailyTransferred,
        monthlyUsed: monthlyTransferred,
      })
    })

    // الخزائن النقدية (جميع الخزائن نشطة)
    vaults.forEach(v => {
      accounts.push({
        id: `vault-${v.id}`,
        type: 'cash-vault' as AccountType,
        name: v.vaultName,
        balance: v.balance,
      })
    })

    // المحافظ الإلكترونية (النشطة فقط)
    wallets
      .filter(w => w.status === 'active')
      .forEach(w => {
        const accountId = `wallet-${w.id}`
        const dailyTransferred = getTotalTransferred(accountId, 'day')
        const monthlyTransferred = getTotalTransferred(accountId, 'month')

        accounts.push({
          id: accountId,
          type: 'e-wallet' as AccountType,
          name: w.walletName,
          accountNumber: w.phoneNumber,
          balance: w.balance,
          dailyLimit: w.dailyLimit,
          monthlyLimit: w.monthlyLimit,
          dailyUsed: dailyTransferred,
          monthlyUsed: monthlyTransferred,
        })
      })

    // البطاقات مسبقة الدفع (النشطة فقط)
    prepaidCards
      .filter(c => c.status === 'active')
      .forEach(c => {
        const accountId = `card-${c.id}`
        const dailyTransferred = getTotalTransferred(accountId, 'day')
        const monthlyTransferred = getTotalTransferred(accountId, 'month')

        accounts.push({
          id: accountId,
          type: 'prepaid-card' as AccountType,
          name: c.cardName,
          accountNumber: c.cardNumber.slice(-4),
          balance: c.balance,
          dailyLimit: c.dailyLimit,
          monthlyLimit: c.monthlyLimit,
          dailyUsed: dailyTransferred,
          monthlyUsed: monthlyTransferred,
        })
      })

    // ماكينات الدفع (النشطة فقط - الحساب الرئيسي فقط)
    machines
      .filter(m => m.status === 'active')
      .forEach(m => {
        const primaryAccount = m.accounts.find(acc => acc.isPrimary)
        if (primaryAccount) {
          accounts.push({
            id: `pos-${m.id}-${primaryAccount.id}`,
            type: 'pos-machine' as AccountType,
            name: `${m.machineName} - ${primaryAccount.accountName}`,
            accountNumber: primaryAccount.accountNumber,
            balance: primaryAccount.balance,
          })
        }
      })

    return accounts
  }, [bankAccounts, vaults, wallets, prepaidCards, machines, getTotalTransferred])

  // الحصول على الحساب المصدر والمستهدف
  const fromAccount = useMemo(
    () => allAccounts.find(acc => acc.id === formData.fromAccountId),
    [allAccounts, formData.fromAccountId]
  )

  const toAccount = useMemo(
    () => allAccounts.find(acc => acc.id === formData.toAccountId),
    [allAccounts, formData.toAccountId]
  )

  /**
   * الحصول على تسمية نوع الحساب بالعربية
   */
  const getTypeLabel = useCallback((type: AccountType): string => {
    switch (type) {
      case 'bank-account': return 'حساب بنكي'
      case 'cash-vault': return 'خزينة نقدية'
      case 'e-wallet': return 'محفظة إلكترونية'
      case 'prepaid-card': return 'بطاقة مسبقة الدفع'
      case 'pos-machine': return 'ماكينة دفع'
      default: return ''
    }
  }, [])

  /**
   * الحصول على أيقونة نوع الحساب مع اللون المناسب
   */
  const getAccountTypeIcon = useCallback((type: AccountType): React.ReactNode => {
    switch (type) {
      case 'bank-account': return <Landmark className="h-4 w-4 text-blue-600" />
      case 'cash-vault': return <Vault className="h-4 w-4 text-green-600" />
      case 'e-wallet': return <Wallet className="h-4 w-4 text-purple-600" />
      case 'prepaid-card': return <CreditCard className="h-4 w-4 text-orange-600" />
      case 'pos-machine': return <CreditCard className="h-4 w-4 text-indigo-600" />
    }
  }, [])

  /**
   * تحويل الحسابات إلى خيارات Combobox مع التصفية الاختيارية
   */
  const createComboboxOptions = useCallback((
    accounts: TransferAccount[],
    excludeId?: string
  ): ComboboxOption[] => {
    return accounts
      .filter(acc => acc.id !== excludeId)
      .map(acc => ({
        value: acc.id,
        label: `${acc.name} (${getTypeLabel(acc.type)})`,
        subtitle: `${formatCurrency(acc.balance)}${acc.accountNumber ? ` • ${acc.accountNumber}` : ''}`,
        icon: getAccountTypeIcon(acc.type),
        searchText: `${acc.name} ${acc.accountNumber || ''} ${getTypeLabel(acc.type)}`,
      }))
  }, [getTypeLabel, getAccountTypeIcon])

  // خيارات الحساب المصدر (جميع الحسابات)
  const fromAccountOptions = useMemo(
    () => createComboboxOptions(allAccounts),
    [allAccounts, createComboboxOptions]
  )

  // خيارات الحساب المستهدف (استبعاد الحساب المصدر)
  const toAccountOptions = useMemo(
    () => createComboboxOptions(allAccounts, formData.fromAccountId),
    [allAccounts, formData.fromAccountId, createComboboxOptions]
  )

  /**
   * تحديث رصيد الحساب بناءً على نوعه
   * يقوم باستخراج ID الأصلي من accountId المركب ويستدعي دالة التحديث المناسبة
   */
  const updateBalance = useCallback((
    type: AccountType,
    accountId: string,
    newBalance: number,
    change: number
  ) => {
    switch (type) {
      case 'bank-account': {
        const bankId = accountId.replace('bank-', '')
        updateBankBalance(bankId, newBalance, change)
        break
      }

      case 'cash-vault': {
        const vaultId = accountId.replace('vault-', '')
        updateVaultBalance(vaultId, newBalance)
        break
      }

      case 'e-wallet': {
        const walletId = accountId.replace('wallet-', '')
        updateWalletBalance(walletId, newBalance, change)
        break
      }

      case 'prepaid-card': {
        const cardId = accountId.replace('card-', '')
        updateCardBalance(cardId, newBalance, change)
        break
      }

      case 'pos-machine': {
        const parts = accountId.split('-')
        const machineId = parts[1]
        const posAccountId = parts[2]
        updatePOSBalance(machineId, posAccountId, newBalance)
        break
      }
    }
  }, [updateBankBalance, updateVaultBalance, updateWalletBalance, updateCardBalance, updatePOSBalance])

  /**
   * معالجة إرسال النموذج وتنفيذ التحويل
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // تحويل القيم النصية إلى أرقام
    const amount = parseFloat(formData.amount)
    const fee = formData.fee ? parseFloat(formData.fee) : 0

    // التحقق من صحة البيانات الأساسية
    if (!formData.fromAccountId) {
      setError('يرجى اختيار الحساب المصدر')
      return
    }

    if (!formData.toAccountId) {
      setError('يرجى اختيار الحساب المستهدف')
      return
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('لا يمكن التحويل إلى نفس الحساب')
      return
    }

    // التحقق من صحة المبلغ
    if (isNaN(amount) || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من صفر')
      return
    }

    // التحقق من صحة الرسوم
    if (isNaN(fee) || fee < 0) {
      setError('يرجى إدخال رسوم صحيحة (صفر أو أكثر)')
      return
    }

    // التحقق من وجود الحسابات
    if (!fromAccount || !toAccount) {
      setError('الحساب المحدد غير موجود أو غير نشط')
      return
    }

    // حساب المبالغ النهائية
    let finalAmountFrom = amount
    let finalAmountTo = amount

    if (fee > 0) {
      if (formData.feeBearer === 'sender') {
        finalAmountFrom = amount + fee
      } else if (formData.feeBearer === 'receiver') {
        finalAmountTo = amount - fee
      }
    }

    // التحقق من كفاية الرصيد بعد احتساب الرسوم
    if (fromAccount.balance < finalAmountFrom) {
      setError('الرصيد غير كافٍ في الحساب المصدر (بعد احتساب الرسوم)')
      return
    }

    // التحقق من الحدود اليومية والشهرية (فقط إذا كانت الحالة مكتملة)
    if (formData.status === 'completed') {
      if (fromAccount.dailyLimit && fromAccount.dailyUsed !== undefined) {
        if (fromAccount.dailyUsed + finalAmountFrom > fromAccount.dailyLimit) {
          setError('تجاوز الحد اليومي للحساب المصدر')
          return
        }
      }

      if (fromAccount.monthlyLimit && fromAccount.monthlyUsed !== undefined) {
        if (fromAccount.monthlyUsed + finalAmountFrom > fromAccount.monthlyLimit) {
          setError('تجاوز الحد الشهري للحساب المصدر')
          return
        }
      }
    }

    // تنفيذ التحويل
    try {
      // تحديث الأرصدة فقط إذا كانت الحالة مكتملة
      if (formData.status === 'completed') {
        updateBalance(fromAccount.type, formData.fromAccountId, fromAccount.balance - finalAmountFrom, -finalAmountFrom)
        updateBalance(toAccount.type, formData.toAccountId, toAccount.balance + finalAmountTo, finalAmountTo)
      }

      // إنشاء سجل التحويل
      const transfer: CentralTransfer = {
        id: `ct-${Date.now()}`,
        fromAccount: { ...fromAccount },
        toAccount: { ...toAccount },
        amount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        status: formData.status,
        notes: formData.notes,
        fee: fee > 0 ? fee : undefined,
        feeBearer: fee > 0 ? formData.feeBearer : undefined,
        finalAmountFrom,
        finalAmountTo,
      }

      onTransfer(transfer)
      setSuccess(true)

      // إغلاق بعد ثانيتين
      setTimeout(() => {
        onOpenChange(false)
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء التحويل'
      setError(errorMessage)
      console.error('Transfer error:', err)
    }
  }, [formData, fromAccount, toAccount, updateBalance, onTransfer, onOpenChange])

  // عرض رسالة النجاح
  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md" aria-describedby="success-message" dir="rtl">
          <div className="text-center py-8">
            <div
              className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 shadow-lg"
              aria-hidden="true"
            >
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">تم التحويل بنجاح!</h3>
            <p id="success-message" className="text-sm text-green-700 dark:text-green-300">
              تم تحويل {formatCurrency(parseFloat(formData.amount))} بنجاح
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-900/30"
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-blue-100 dark:border-blue-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            تحويل مركزي
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            تحويل الأموال بين جميع أنواع الحسابات
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6" aria-label="نموذج التحويل المركزي">
          {/* الحساب المصدر */}
          <div
            className="space-y-4 p-6 bg-gradient-to-br from-rose-600 to-red-700 dark:from-rose-700 dark:to-rose-800 border-2 border-rose-400 dark:border-rose-600 rounded-xl shadow-lg transition-all duration-300"
            role="region"
            aria-label="معلومات الحساب المصدر"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md" aria-hidden="true">
                <ArrowRightLeft className="h-5 w-5 text-white rotate-180" />
              </div>
              <h3 className="text-base font-bold text-white">من الحساب</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="from-account" className="text-white font-semibold text-base">
                اختر الحساب المصدر *
              </Label>
              <Combobox
                options={fromAccountOptions}
                value={formData.fromAccountId}
                onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
                placeholder="ابحث عن الحساب..."
                searchPlaceholder="ابحث بالاسم أو النوع أو الرقم..."
                emptyText="لا توجد حسابات متاحة"
              />
            </div>

            {fromAccount && (
              <div className="mt-4 p-4 bg-white/95 dark:bg-gray-900/90 rounded-lg border-2 border-white/50 dark:border-gray-700 space-y-2 text-base shadow-md">
                <div className="flex items-center justify-between py-1">
                  <span className="text-rose-900 dark:text-rose-200 font-semibold">الرصيد المتاح:</span>
                  <span className="font-bold text-rose-700 dark:text-rose-300">{formatCurrency(fromAccount.balance)}</span>
                </div>
                {fromAccount.dailyLimit && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-rose-900 dark:text-rose-200 font-semibold">الحد اليومي:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-300">{formatCurrency(fromAccount.dailyLimit)}</span>
                  </div>
                )}
                {fromAccount.monthlyLimit && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-rose-900 dark:text-rose-200 font-semibold">الحد الشهري:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-300">{formatCurrency(fromAccount.monthlyLimit)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* الحساب المستهدف */}
          <div
            className="space-y-4 p-6 bg-gradient-to-br from-emerald-600 to-green-700 dark:from-emerald-700 dark:to-emerald-800 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl shadow-lg transition-all duration-300"
            role="region"
            aria-label="معلومات الحساب المستهدف"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md" aria-hidden="true">
                <ArrowRightLeft className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">إلى الحساب</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="to-account" className="text-white font-semibold text-base">
                اختر الحساب المستهدف *
              </Label>
              <Combobox
                options={toAccountOptions}
                value={formData.toAccountId}
                onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                placeholder="ابحث عن الحساب..."
                searchPlaceholder="ابحث بالاسم أو النوع أو الرقم..."
                emptyText="لا توجد حسابات متاحة"
              />
            </div>

            {toAccount && (
              <div className="mt-4 p-4 bg-white/95 dark:bg-gray-900/90 rounded-lg border-2 border-white/50 dark:border-gray-700 space-y-2 text-base shadow-md">
                <div className="flex items-center justify-between py-1">
                  <span className="text-emerald-900 dark:text-emerald-200 font-semibold">الرصيد الحالي:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(toAccount.balance)}</span>
                </div>
              </div>
            )}
          </div>

          {/* المبلغ والرسوم */}
          <div
            className="space-y-5 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 border-2 border-blue-400 dark:border-blue-600 rounded-xl shadow-lg transition-all duration-300"
            role="region"
            aria-label="تفاصيل المبلغ والرسوم"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md" aria-hidden="true">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">تفاصيل المبلغ</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-white font-semibold text-base">
                  المبلغ الأساسي *
                </Label>
                <div className="relative" dir="ltr">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    aria-required="true"
                    aria-label="المبلغ الأساسي للتحويل بالجنيه المصري"
                    className="pl-16 pr-4 h-12 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-input text-gray-900 dark:text-gray-100 text-right text-base font-semibold"
                  />
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-blue-700 dark:text-blue-300 pointer-events-none"
                    aria-hidden="true"
                  >
                    EGP
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="fee" className="text-white font-semibold text-base">
                  رسوم التحويل (اختياري)
                </Label>
                <div className="relative" dir="ltr">
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    placeholder="0.00"
                    aria-label="رسوم التحويل بالجنيه المصري"
                    className="pl-16 pr-4 h-12 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-input text-gray-900 dark:text-gray-100 text-right text-base font-semibold"
                  />
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-blue-700 dark:text-blue-300 pointer-events-none"
                    aria-hidden="true"
                  >
                    EGP
                  </span>
                </div>
              </div>
            </div>

            {formData.fee && parseFloat(formData.fee) > 0 && (
              <div className="space-y-3 p-4 bg-white/95 dark:bg-gray-900/90 rounded-lg border-2 border-white/50 dark:border-gray-700 shadow-md mt-4">
                <Label htmlFor="fee-bearer" className="text-blue-900 dark:text-blue-200 font-semibold text-base">
                  من يتحمل الرسوم؟
                </Label>
                <Select
                  value={formData.feeBearer}
                  onValueChange={(value) => setFormData({ ...formData, feeBearer: value as FeeBearer })}
                >
                  <SelectTrigger
                    id="fee-bearer"
                    className="h-12 border-blue-300 dark:border-blue-700 bg-white dark:bg-input text-base font-semibold"
                    aria-label="اختر من يتحمل رسوم التحويل"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sender">
                      المرسل (يتم خصم المبلغ + الرسوم)
                    </SelectItem>
                    <SelectItem value="receiver">
                      المستقبل (يتم إضافة المبلغ - الرسوم)
                    </SelectItem>
                    <SelectItem value="none">
                      لا أحد (الرسوم للسجل فقط)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* حالة المعاملة */}
          <div
            className="space-y-5 p-6 bg-gradient-to-br from-purple-600 to-pink-700 dark:from-purple-700 dark:to-pink-800 border-2 border-purple-400 dark:border-purple-600 rounded-xl shadow-lg transition-all duration-300"
            role="region"
            aria-label="حالة المعاملة"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md" aria-hidden="true">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">حالة المعاملة</h3>
            </div>

            <div className="space-y-3">
              <Label htmlFor="status" className="text-white font-semibold text-base">
                الحالة *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'completed' | 'pending' })}
              >
                <SelectTrigger
                  id="status"
                  className="h-12 border-purple-300 dark:border-purple-700 bg-white dark:bg-input text-base font-semibold"
                  aria-label="اختر حالة التحويل"
                  aria-required="true"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                      <span>مكتملة - تنفيذ فوري</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                      <span>معلقة - حفظ بدون تنفيذ</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-white/90 dark:text-white/80 mt-2 font-medium" role="status" aria-live="polite">
                {formData.status === 'completed'
                  ? 'سيتم تحديث الأرصدة فوراً عند التنفيذ'
                  : 'سيتم حفظ التحويل بدون تحديث الأرصدة'}
              </p>
            </div>
          </div>

          {/* الملاحظات */}
          <div className="space-y-3 p-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl shadow-sm">
            <Label htmlFor="notes" className="text-gray-900 dark:text-gray-100 font-semibold text-base">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل ملاحظات إضافية عن التحويل..."
              rows={3}
              aria-label="ملاحظات إضافية عن التحويل"
              className="resize-none bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 min-h-[80px] text-base"
              dir="rtl"
            />
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm shadow-sm"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* معاينة التحويل */}
          {fromAccount && toAccount && formData.amount && !error && (() => {
            const amount = parseFloat(formData.amount)
            const fee = formData.fee ? parseFloat(formData.fee) : 0
            let finalAmountFrom = amount
            let finalAmountTo = amount

            if (fee > 0) {
              if (formData.feeBearer === 'sender') {
                finalAmountFrom = amount + fee
              } else if (formData.feeBearer === 'receiver') {
                finalAmountTo = amount - fee
              }
            }

            return (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-700 rounded-lg space-y-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">معاينة التحويل</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* المرسل */}
                  <div className="space-y-2 p-4 bg-white/80 dark:bg-card/80 rounded-xl border-2 border-rose-200 dark:border-rose-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {getAccountTypeIcon(fromAccount.type)}
                      <p className="text-xs font-bold text-rose-900 dark:text-rose-100">المرسل</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{fromAccount.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">({getTypeLabel(fromAccount.type)})</p>
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 mt-3">
                      <p>الرصيد الحالي: <span className="font-semibold">{formatCurrency(fromAccount.balance)}</span></p>
                      <p>المبلغ المحول: <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(amount)}</span></p>
                      {fee > 0 && formData.feeBearer === 'sender' && (
                        <p>الرسوم: <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(fee)}</span></p>
                      )}
                      <p className="pt-2 border-t border-rose-200 dark:border-rose-700">
                        المخصوم الكلي: <span className="font-bold text-rose-700 dark:text-rose-300">-{formatCurrency(finalAmountFrom)}</span>
                      </p>
                      {formData.status === 'completed' && (
                        <p className="text-emerald-700 dark:text-emerald-300 pt-1">
                          الرصيد بعد التحويل: <span className="font-bold">{formatCurrency(fromAccount.balance - finalAmountFrom)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* المستقبل */}
                  <div className="space-y-2 p-4 bg-white/80 dark:bg-card/80 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {getAccountTypeIcon(toAccount.type)}
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">المستقبل</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{toAccount.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">({getTypeLabel(toAccount.type)})</p>
                    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5 mt-3">
                      <p>الرصيد الحالي: <span className="font-semibold">{formatCurrency(toAccount.balance)}</span></p>
                      <p>المبلغ المستلم: <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(amount)}</span></p>
                      {fee > 0 && formData.feeBearer === 'receiver' && (
                        <p>الرسوم: <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(fee)}</span></p>
                      )}
                      <p className="pt-2 border-t border-emerald-200 dark:border-emerald-700">
                        المضاف الكلي: <span className="font-bold text-emerald-700 dark:text-emerald-300">+{formatCurrency(finalAmountTo)}</span>
                      </p>
                      {formData.status === 'completed' && (
                        <p className="text-green-700 dark:text-green-300">
                          الرصيد بعد التحويل: <span className="font-bold">{formatCurrency(toAccount.balance + finalAmountTo)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ملخص */}
                <div className="pt-2 border-t border-blue-200 dark:border-blue-700 space-y-1 text-xs text-blue-900 dark:text-blue-100">
                  <div className="flex justify-between">
                    <span>المبلغ الأساسي:</span>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                  {fee > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>الرسوم:</span>
                        <span className="font-semibold">{formatCurrency(fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>يتحمل الرسوم:</span>
                        <span className="font-semibold">
                          {formData.feeBearer === 'sender' ? 'المرسل' : formData.feeBearer === 'receiver' ? 'المستقبل' : 'لا أحد'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-1 border-t border-blue-200 dark:border-blue-700">
                    <span>الحالة:</span>
                    <span className={`font-semibold ${formData.status === 'completed' ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                      {formData.status === 'completed' ? 'مكتملة - تنفيذ فوري' : 'معلقة - بدون تنفيذ'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              aria-label="إلغاء التحويل وإغلاق النافذة"
              className="hover:bg-accent"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className={formData.status === 'pending' ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}
              aria-label={formData.status === 'completed' ? 'تنفيذ التحويل فوراً' : 'حفظ التحويل كمعلق'}
            >
              {formData.status === 'completed' ? (
                <>
                  <CheckCircle className="h-4 w-4 ml-2" aria-hidden="true" />
                  تنفيذ التحويل فوراً
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 ml-2" aria-hidden="true" />
                  حفظ كمعلق
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

