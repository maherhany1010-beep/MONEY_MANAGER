'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { ShoppingCart, Calculator, AlertCircle, Wallet, DollarSign, Percent } from 'lucide-react'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'

interface AddPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: any
  onAdd?: (purchase: any) => void
}

export function AddPurchaseDialog({ open, onOpenChange, card, onAdd }: AddPurchaseDialogProps) {
  const { wallets, updateWalletBalance } = useEWallets()
  const { cards: prepaidCards, updateCardBalance: updatePrepaidCardBalance } = usePrepaidCards()
  const { machines, updateAccountBalance } = usePOSMachines()

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    beneficiaryAccount: '', // {type}-{id}
    date: new Date().toISOString().split('T')[0],
    purchaseFeeAmount: '',
    purchaseFeeType: 'fixed', // 'fixed' or 'percentage'
    purchaseFeeAccount: 'card', // 'card' or account id
  })
  const [excludeFromCashback, setExcludeFromCashback] = useState(false)

  // حالات التقسيط
  const [enableInstallment, setEnableInstallment] = useState(false)
  const [installmentData, setInstallmentData] = useState({
    months: '12',
    interestRate: '1.5',
    adminFees: '120',
  })

  // الحسابات المتاحة (نشطة فقط)
  const availableAccounts = useMemo(() => {
    const accounts: Array<{ id: string; type: 'ewallet' | 'prepaid' | 'pos'; name: string; balance: number }> = []

    // إضافة المحافظ الإلكترونية النشطة
    wallets.forEach(wallet => {
      if (wallet.status === 'active' && wallet.walletName) {
        accounts.push({
          id: `ewallet-${wallet.id}`,
          type: 'ewallet',
          name: `${wallet.walletName} (محفظة)`,
          balance: wallet.balance,
        })
      }
    })

    // إضافة البطاقات مسبقة الدفع النشطة
    prepaidCards.forEach(card => {
      if (card.status === 'active' && card.cardName) {
        accounts.push({
          id: `prepaid-${card.id}`,
          type: 'prepaid',
          name: `${card.cardName} (بطاقة مسبقة الدفع)`,
          balance: card.balance,
        })
      }
    })

    // إضافة ماكينات الدفع النشطة (الحساب الأساسي فقط)
    machines.forEach(machine => {
      if (machine.status !== 'inactive' && machine.machineName) {
        const primaryAccount = machine.accounts.find(a => a.isPrimary)
        if (primaryAccount && primaryAccount.accountName) {
          accounts.push({
            id: `pos-${machine.id}-${primaryAccount.id}`,
            type: 'pos',
            name: `${machine.machineName} - ${primaryAccount.accountName} (ماكينة دفع)`,
            balance: primaryAccount.balance,
          })
        }
      }
    })

    return accounts
  }, [wallets, prepaidCards, machines])

  // خيارات من يتحمل الرسوم (البطاقة أو الحساب المستفيد فقط)
  const feeAccounts = useMemo(() => {
    return [
      { id: 'card', name: `البطاقة الائتمانية (${card.name})` },
      { id: 'beneficiary', name: 'الحساب المستفيد' }
    ]
  }, [card.name])

  const amount = parseFloat(formData.amount) || 0
  const purchaseFeeAmount = parseFloat(formData.purchaseFeeAmount) || 0
  const purchaseFee = formData.purchaseFeeType === 'percentage'
    ? (amount * purchaseFeeAmount / 100)
    : purchaseFeeAmount

  const cashback = excludeFromCashback ? 0 : (amount * (card.cashbackRate || 0) / 100)
  const totalAmount = amount + purchaseFee
  const netCost = totalAmount - cashback

  // حساب المبلغ الذي سيستلمه الحساب المستفيد
  // إذا كان الحساب المستفيد يتحمل الرسوم، يستلم (المبلغ - الرسوم)
  // وإلا يستلم المبلغ كاملاً
  const beneficiaryAmount = formData.purchaseFeeAccount === 'beneficiary'
    ? (amount - purchaseFee)
    : amount

  // حسابات التقسيط
  const months = parseInt(installmentData.months) || 12
  const interestRate = parseFloat(installmentData.interestRate) || 0
  const adminFees = parseFloat(installmentData.adminFees) || 0

  // حساب الفائدة الإجمالية
  const totalInterest = enableInstallment ? (amount * interestRate / 100) : 0
  // المبلغ بعد الفائدة
  const amountWithInterest = amount + totalInterest
  // القسط الشهري الأساسي
  const baseMonthlyPayment = enableInstallment ? (amountWithInterest / months) : 0
  // القسط الأول (مع المصاريف الإدارية)
  const firstPayment = enableInstallment ? (baseMonthlyPayment + adminFees) : 0
  // التكلفة الإجمالية للتقسيط
  const totalInstallmentCost = enableInstallment ? (amount + totalInterest + adminFees) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من اختيار حساب مستفيد
    if (!formData.beneficiaryAccount) {
      alert('يرجى اختيار حساب مستفيد')
      return
    }

    // تحليل معرف الحساب المستفيد
    const [accountType, ...accountIdParts] = formData.beneficiaryAccount.split('-')
    const accountId = accountIdParts.join('-')

    // تحديث رصيد الحساب المستفيد
    try {
      if (accountType === 'ewallet') {
        const wallet = wallets.find(w => w.id === accountId)
        if (wallet) {
          updateWalletBalance(accountId, wallet.balance + beneficiaryAmount, beneficiaryAmount)
        }
      } else if (accountType === 'prepaid') {
        const prepaidCard = prepaidCards.find(c => c.id === accountId)
        if (prepaidCard) {
          updatePrepaidCardBalance(accountId, prepaidCard.balance + beneficiaryAmount, beneficiaryAmount)
        }
      } else if (accountType === 'pos') {
        const [machineId, posAccountId] = accountIdParts
        const machine = machines.find(m => m.id === machineId)
        if (machine) {
          const currentBalance = machine.accounts.find(a => a.id === posAccountId)?.balance || 0
          updateAccountBalance(machineId, posAccountId, currentBalance + beneficiaryAmount)
        }
      }
    } catch (error) {
      console.error('Error updating beneficiary account:', error)
      alert('حدث خطأ في تحديث الحساب المستفيد')
      return
    }

    // تحديث رصيد حساب الرسوم إذا كان الحساب المستفيد يتحمل الرسوم
    // (الرسوم تُخصم من الحساب المستفيد نفسه بعد استقباله للمبلغ)
    if (purchaseFee > 0 && formData.purchaseFeeAccount === 'beneficiary') {
      try {
        if (accountType === 'ewallet') {
          const wallet = wallets.find(w => w.id === accountId)
          if (wallet) {
            // الحساب استقبل المبلغ بالفعل، الآن نخصم الرسوم
            updateWalletBalance(accountId, wallet.balance + beneficiaryAmount - purchaseFee, -purchaseFee)
          }
        } else if (accountType === 'prepaid') {
          const prepaidCard = prepaidCards.find(c => c.id === accountId)
          if (prepaidCard) {
            // الحساب استقبل المبلغ بالفعل، الآن نخصم الرسوم
            updatePrepaidCardBalance(accountId, prepaidCard.balance + beneficiaryAmount - purchaseFee, -purchaseFee)
          }
        } else if (accountType === 'pos') {
          const [machineId, posAccountId] = accountIdParts
          const machine = machines.find(m => m.id === machineId)
          if (machine) {
            const currentBalance = machine.accounts.find(a => a.id === posAccountId)?.balance || 0
            // الحساب استقبل المبلغ بالفعل، الآن نخصم الرسوم
            updateAccountBalance(machineId, posAccountId, currentBalance + beneficiaryAmount - purchaseFee)
          }
        }
      } catch (error) {
        console.error('Error deducting fees from beneficiary account:', error)
        alert('حدث خطأ في خصم الرسوم من الحساب المستفيد')
        return
      }
    }

    const purchase = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount: totalAmount,
      baseAmount: amount,
      beneficiaryAmount: beneficiaryAmount,
      purchaseFee: purchaseFee,
      purchaseFeeType: formData.purchaseFeeType,
      purchaseFeeAccount: formData.purchaseFeeAccount,
      cashback: cashback,
      excludedFromCashback: excludeFromCashback,
      description: formData.description,
      beneficiaryAccount: formData.beneficiaryAccount,
      transactionDate: new Date(formData.date).toISOString(),
      cardId: card.id,
      isInstallment: enableInstallment,
    }

    if (onAdd) {
      onAdd(purchase)
    }

    // إذا كان تقسيط، أضف سجل التقسيط
    if (enableInstallment) {
      const startDate = new Date(formData.date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + months)

      const nextPaymentDate = new Date(startDate)
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

      const installment = {
        id: Date.now().toString() + '_inst',
        cardId: card.id,
        description: formData.description,
        totalAmount: amount,
        monthlyPayment: baseMonthlyPayment,
        baseMonthlyPayment: baseMonthlyPayment,
        monthlyInterest: totalInterest / months,
        monthlyAdminFees: 0, // المصاريف في القسط الأول فقط
        totalMonths: months,
        paidMonths: 0,
        remainingMonths: months,
        startDate: formData.date,
        endDate: endDate.toISOString().split('T')[0],
        installmentType: interestRate > 0 ? 'with-interest' : 'no-interest',
        interestRate: interestRate,
        administrativeFees: adminFees,
        totalInterest: totalInterest,
        totalAdminFees: adminFees,
        totalCost: totalInstallmentCost,
        status: 'active',
        nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
        nextPaymentAmount: firstPayment,
        firstPayment: firstPayment,
        createdAt: new Date().toISOString(),
        purchaseId: purchase.id,
      }

      // حفظ التقسيط في localStorage
      const savedInstallments = localStorage.getItem(`installments_${card.id}`)
      const installments = savedInstallments ? JSON.parse(savedInstallments) : []
      installments.push(installment)
      localStorage.setItem(`installments_${card.id}`, JSON.stringify(installments))
    }

    // Reset form
    setFormData({
      amount: '',
      description: '',
      beneficiaryAccount: '',
      date: new Date().toISOString().split('T')[0],
      purchaseFeeAmount: '',
      purchaseFeeType: 'fixed',
      purchaseFeeAccount: 'card',
    })
    setExcludeFromCashback(false)
    setEnableInstallment(false)
    setInstallmentData({
      months: '12',
      interestRate: '1.5',
      adminFees: '120',
    })

    onOpenChange(false)
  }

  const isFormValid = formData.amount && formData.description && formData.beneficiaryAccount

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-900/30"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b pb-4 border-blue-100 dark:border-blue-900/30">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              إضافة عملية شراء
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              أضف عملية شراء جديدة على البطاقة <span className="font-semibold text-blue-600 dark:text-blue-400">{card.name}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* المبلغ */}
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              {/* الوصف */}
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  placeholder="وصف عملية الشراء (اختياري)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* اختيار الحساب المستفيد */}
              <div className="space-y-2">
                <Label htmlFor="beneficiary" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  الحساب المستفيد *
                </Label>
                <Select
                  value={formData.beneficiaryAccount}
                  onValueChange={(value) => setFormData({ ...formData, beneficiaryAccount: value })}
                  required
                >
                  <SelectTrigger id="beneficiary">
                    <SelectValue placeholder="اختر الحساب المستفيد" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        لا توجد حسابات متاحة
                      </div>
                    ) : (
                      availableAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <span>{account.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatCurrency(account.balance)})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* التاريخ */}
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* قسم رسوم الشراء */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-4" style={{ color: '#2563eb' }}>
                  <DollarSign className="h-4 w-4" />
                  رسوم الشراء (اختياري)
                </h4>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* مبلغ الرسوم */}
                  <div className="space-y-2">
                    <Label htmlFor="fee-amount">مبلغ الرسوم</Label>
                    <Input
                      id="fee-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.purchaseFeeAmount}
                      onChange={(e) => setFormData({ ...formData, purchaseFeeAmount: e.target.value })}
                    />
                  </div>

                  {/* نوع الرسوم */}
                  <div className="space-y-2">
                    <Label htmlFor="fee-type">نوع الرسوم</Label>
                    <Select
                      value={formData.purchaseFeeType}
                      onValueChange={(value) => setFormData({ ...formData, purchaseFeeType: value as 'fixed' | 'percentage' })}
                    >
                      <SelectTrigger id="fee-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            ثابتة (جنيه)
                          </div>
                        </SelectItem>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            نسبة مئوية (%)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* من يتحمل الرسوم */}
                  <div className="space-y-2">
                    <Label htmlFor="fee-account" className="flex items-center gap-2">
                      من يتحمل الرسوم؟
                      <span className="text-xs text-muted-foreground">(من سيدفع الرسوم)</span>
                    </Label>
                    <Select
                      value={formData.purchaseFeeAccount}
                      onValueChange={(value) => setFormData({ ...formData, purchaseFeeAccount: value })}
                    >
                      <SelectTrigger id="fee-account">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {feeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* رسالة توضيحية عن الرسوم */}
                <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg border border-cyan-200 dark:border-cyan-700">
                  <p className="text-xs font-semibold text-cyan-900 dark:text-cyan-200 mb-2">
                    📌 شرح آلية الرسوم:
                  </p>
                  {formData.purchaseFeeAccount === 'card' ? (
                    <div className="text-xs text-cyan-800 dark:text-cyan-300 space-y-1">
                      <p>✓ البطاقة الائتمانية ستتحمل الرسوم</p>
                      <p>✓ سيتم خصم <span className="font-semibold">{formatCurrency(totalAmount)}</span> من البطاقة</p>
                      <p>✓ الحساب المستفيد سيستلم <span className="font-semibold">{formatCurrency(amount)}</span> كاملاً</p>
                    </div>
                  ) : (
                    <div className="text-xs text-cyan-800 dark:text-cyan-300 space-y-1">
                      <p>✓ الحساب المستفيد سيتحمل الرسوم</p>
                      <p>✓ سيتم خصم <span className="font-semibold">{formatCurrency(amount)}</span> من البطاقة</p>
                      <p>✓ الحساب المستفيد سيستلم <span className="font-semibold">{formatCurrency(amount)}</span> ثم يُخصم منه <span className="font-semibold">{formatCurrency(purchaseFee)}</span> رسوم</p>
                      <p>✓ الرصيد النهائي للحساب المستفيد: <span className="font-semibold">{formatCurrency(amount - purchaseFee)}</span></p>
                    </div>
                  )}
                </div>

                {purchaseFee > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-muted-foreground">
                      رسوم الشراء: <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(purchaseFee)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* استثناء من الكاش باك */}
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="exclude-cashback" className="cursor-pointer font-medium dark:text-amber-100" style={{ color: '#d97706' }}>
                      استثناء من الكاش باك
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    لن يتم احتساب كاش باك على هذه المعاملة
                  </p>
                </div>
                <Switch
                  id="exclude-cashback"
                  checked={excludeFromCashback}
                  onCheckedChange={setExcludeFromCashback}
                />
              </div>

              {/* تقسيط المعاملة */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="enable-installment" className="cursor-pointer font-medium dark:text-blue-100" style={{ color: '#2563eb' }}>
                      تقسيط المعاملة
                    </Label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    تقسيم المبلغ على عدة أشهر مع إمكانية إضافة فوائد ومصاريف
                  </p>
                </div>
                <Switch
                  id="enable-installment"
                  checked={enableInstallment}
                  onCheckedChange={setEnableInstallment}
                />
              </div>

              {/* حقول التقسيط */}
              {enableInstallment && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm flex items-center gap-2" style={{ color: '#2563eb' }}>
                    <Calculator className="h-4 w-4" />
                    تفاصيل التقسيط
                  </h4>

                  <div className="grid gap-4 md:grid-cols-3">
                    {/* عدد الأشهر */}
                    <div className="space-y-2">
                      <Label htmlFor="months">عدد الأشهر *</Label>
                      <Input
                        id="months"
                        type="number"
                        min="3"
                        max="60"
                        placeholder="12"
                        value={installmentData.months}
                        onChange={(e) => setInstallmentData({ ...installmentData, months: e.target.value })}
                        required={enableInstallment}
                      />
                      <p className="text-xs text-muted-foreground">من 3 إلى 60 شهر</p>
                    </div>

                    {/* نسبة الفائدة */}
                    <div className="space-y-2">
                      <Label htmlFor="interest-rate">نسبة الفائدة (%)</Label>
                      <Input
                        id="interest-rate"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="1.5"
                        value={installmentData.interestRate}
                        onChange={(e) => setInstallmentData({ ...installmentData, interestRate: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">اختياري - 0 للتقسيط بدون فوائد</p>
                    </div>

                    {/* المصاريف الإدارية */}
                    <div className="space-y-2">
                      <Label htmlFor="admin-fees">المصاريف الإدارية (EGP)</Label>
                      <Input
                        id="admin-fees"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="120"
                        value={installmentData.adminFees}
                        onChange={(e) => setInstallmentData({ ...installmentData, adminFees: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">اختياري - تضاف للقسط الأول</p>
                    </div>
                  </div>
                </div>
              )}

            {/* ملخص الحساب */}
            {amount > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-5 w-5" />
                  <h4 className="font-semibold">ملخص العملية</h4>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">مبلغ الشراء:</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>

                  {purchaseFee > 0 && (
                    <div className="flex justify-between text-orange-600 dark:text-orange-400">
                      <span>رسوم الشراء ({formData.purchaseFeeType === 'percentage' ? `${purchaseFeeAmount}%` : 'ثابتة'}):</span>
                      <span className="font-medium">+ {formatCurrency(purchaseFee)}</span>
                    </div>
                  )}

                  {!enableInstallment && (
                    <>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">إجمالي المبلغ المخصوم من البطاقة:</span>
                        <span className="font-bold">{formatCurrency(totalAmount)}</span>
                      </div>

                      {/* ملخص ما سيستلمه الحساب المستفيد */}
                      <div className="flex justify-between bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-700">
                        <span className="font-semibold text-green-900 dark:text-green-200">ما سيستلمه الحساب المستفيد:</span>
                        <span className="font-bold text-green-700 dark:text-green-300">{formatCurrency(beneficiaryAmount)}</span>
                      </div>
                    </>
                  )}

                  {!excludeFromCashback && cashback > 0 && !enableInstallment && (
                    <>
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>كاش باك ({formatPercentage(card.cashbackRate)}):</span>
                        <span className="font-medium">- {formatCurrency(cashback)}</span>
                      </div>

                      <div className="flex justify-between border-t pt-2 text-primary">
                        <span className="font-semibold">صافي التكلفة:</span>
                        <span className="font-bold">{formatCurrency(netCost)}</span>
                      </div>
                    </>
                  )}

                  {excludeFromCashback && !enableInstallment && (
                    <div className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded text-xs dark:text-amber-200" style={{ color: '#d97706' }}>
                      <AlertCircle className="h-4 w-4" />
                      <span>تم استثناء هذه المعاملة من الكاش باك</span>
                    </div>
                  )}

                  {/* ملخص التقسيط */}
                  {enableInstallment && (
                    <div className="space-y-2 border-t pt-3 mt-3">
                      <h5 className="font-semibold text-sm mb-2" style={{ color: '#2563eb' }}>
                        ملخص التقسيط
                      </h5>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">مبلغ المعاملة الأصلي:</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>

                      {interestRate > 0 && (
                        <>
                          <div className="flex justify-between text-orange-600">
                            <span>نسبة الفائدة:</span>
                            <span className="font-medium">{formatPercentage(interestRate)}</span>
                          </div>

                          <div className="flex justify-between text-red-600">
                            <span>إجمالي الفائدة:</span>
                            <span className="font-medium">+ {formatCurrency(totalInterest)}</span>
                          </div>
                        </>
                      )}

                      {adminFees > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>المصاريف الإدارية:</span>
                          <span className="font-medium">+ {formatCurrency(adminFees)}</span>
                        </div>
                      )}

                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">عدد الأشهر:</span>
                        <span className="font-medium">{months} شهر</span>
                      </div>

                      <div className="flex justify-between" style={{ color: '#2563eb' }}>
                        <span className="font-semibold">القسط الأول:</span>
                        <span className="font-bold">{formatCurrency(firstPayment)}</span>
                      </div>

                      <div className="flex justify-between" style={{ color: '#2563eb' }}>
                        <span className="font-semibold">القسط الشهري (من الشهر 2):</span>
                        <span className="font-bold">{formatCurrency(baseMonthlyPayment)}</span>
                      </div>

                      <div className="flex justify-between border-t pt-2 text-red-600">
                        <span className="font-bold">التكلفة الإجمالية:</span>
                        <span className="font-bold text-lg">{formatCurrency(totalInstallmentCost)}</span>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600 rounded text-xs mt-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: '#2563eb' }} />
                        <div className="space-y-1">
                          <p className="font-semibold dark:text-blue-200" style={{ color: '#2563eb' }}>
                            ملاحظة هامة:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            • القسط الأول ({formatCurrency(firstPayment)}) يشمل المصاريف الإدارية الكاملة
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            • الأقساط المتبقية ({months - 1} شهر) ستكون {formatCurrency(baseMonthlyPayment)} لكل شهر
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            • سيتم إضافة التقسيط تلقائياً إلى تبويب &quot;التقسيط&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* تحذير الحد الائتماني */}
                {(card.currentBalance + totalAmount) > card.creditLimit && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-red-900">تحذير: تجاوز الحد الائتماني</p>
                      <p className="text-red-700">
                        هذه العملية ستتجاوز الحد الائتماني المتاح. قد يتم تطبيق رسوم إضافية.
                      </p>
                    </div>
                  </div>
                )}

                {/* تحذير نسبة الاستخدام */}
                {((card.currentBalance + totalAmount) / card.creditLimit * 100) > (card.alertLimits?.utilizationWarning || 80) && 
                 (card.currentBalance + totalAmount) <= card.creditLimit && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-900">تنبيه: نسبة استخدام عالية</p>
                      <p className="text-yellow-700">
                        ستصل نسبة الاستخدام إلى {formatPercentage((card.currentBalance + totalAmount) / card.creditLimit * 100)} من الحد الائتماني.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              <ShoppingCart className="h-4 w-4 ml-2" />
              إضافة العملية
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    </>
  )
}

