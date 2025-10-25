'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { SourceSelector, useSourceDetails } from '@/components/shared/source-selector'
import { FeeInput, calculateFee } from '@/components/shared/fee-input'
import { toast } from '@/lib/toast'
import { Wallet, Calculator, CheckCircle, AlertCircle } from 'lucide-react'

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: any
  onAdd?: (payment: any) => void
}

export function AddPaymentDialog({ open, onOpenChange, card, onAdd }: AddPaymentDialogProps) {
  const { updateAccountBalance } = useBankAccounts()
  const { updateVaultBalance } = useCashVaults()
  const { updateWalletBalance } = useEWallets()
  const { cards } = useCards()

  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'full', // full, minimum, custom
    description: '',
    date: new Date().toISOString().split('T')[0],
    sourceId: '',
    feeType: 'percentage' as any,
    feeValue: 0,
  })

  const sourceDetails = useSourceDetails(formData.sourceId)

  const currentBalance = card.currentBalance || 0
  const minimumPayment = currentBalance * 0.05 // 5% من الرصيد كحد أدنى

  const amount = formData.paymentType === 'full'
    ? currentBalance
    : formData.paymentType === 'minimum'
    ? minimumPayment
    : parseFloat(formData.amount) || 0

  const fee = calculateFee(amount, formData.feeType, formData.feeValue)
  const totalAmount = amount + fee // Total to deduct from source

  const remainingBalance = currentBalance - amount
  const utilizationAfterPayment = (remainingBalance / card.creditLimit) * 100

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.sourceId || !sourceDetails) {
      toast.error('الرجاء اختيار مصدر السداد')
      return
    }

    // التحقق من كفاية الرصيد
    if (sourceDetails.balance < totalAmount) {
      toast.error(
        `الرصيد غير كافٍ في ${sourceDetails.name}. الرصيد المتاح: ${formatCurrency(sourceDetails.balance)}`
      )
      return
    }

    const payment = {
      id: Date.now().toString(),
      type: 'payment',
      amount: amount,
      fee: fee,
      description: formData.description || getPaymentDescription(),
      category: 'سداد',
      transactionDate: new Date(formData.date).toISOString(),
      cardId: card.id,
      paymentType: formData.paymentType,
      sourceId: formData.sourceId,
      sourceName: sourceDetails.name,
    }

    // خصم المبلغ الإجمالي (مبلغ + رسوم) من المصدر
    const [sourceType, sourceId] = formData.sourceId.split('-')

    switch (sourceType) {
      case 'bank':
        updateAccountBalance(sourceId, sourceDetails.balance - totalAmount)
        break
      case 'vault':
        updateVaultBalance(sourceId, sourceDetails.balance - totalAmount)
        break
      case 'ewallet':
        updateWalletBalance(sourceId, sourceDetails.balance - totalAmount)
        break
      case 'card':
        // For credit cards, increase current balance (used amount)
        // updateCardBalance(sourceId, sourceDetails.balance - totalAmount)
        break
      case 'prepaid':
        // For prepaid cards, handled separately
        break
    }

    if (onAdd) {
      onAdd(payment)
    }

    toast.success(
      'تم السداد بنجاح',
      `تم سداد ${formatCurrency(amount)} من ${sourceDetails.name}${fee > 0 ? ` (رسوم: ${formatCurrency(fee)})` : ''}`
    )

    // Reset form
    setFormData({
      amount: '',
      paymentType: 'full',
      description: '',
      date: new Date().toISOString().split('T')[0],
      sourceId: '',
      feeType: 'percentage',
      feeValue: 0,
    })

    onOpenChange(false)
  }

  const getPaymentDescription = () => {
    switch (formData.paymentType) {
      case 'full':
        return 'سداد كامل'
      case 'minimum':
        return 'سداد الحد الأدنى'
      case 'custom':
        return 'سداد جزئي'
      default:
        return 'سداد'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-green-100 dark:border-green-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-green-100 dark:border-green-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            سداد البطاقة
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            سداد رصيد البطاقة <span className="font-semibold text-green-600 dark:text-green-400">{card.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* معلومات الرصيد الحالي */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-red-700">الرصيد المستحق:</span>
                <span className="text-2xl font-bold text-red-900">{formatCurrency(currentBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600">الحد الأدنى للسداد:</span>
                <span className="font-medium text-red-800">{formatCurrency(minimumPayment)}</span>
              </div>
            </div>

            {/* نوع السداد */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">نوع السداد *</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع السداد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">سداد كامل</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(currentBalance)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="minimum">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">الحد الأدنى</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(minimumPayment)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <span className="font-medium">مبلغ مخصص</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* المبلغ المخصص */}
            {formData.paymentType === 'custom' && (
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
                  max={currentBalance}
                />
                <p className="text-xs text-muted-foreground">
                  الحد الأقصى: {formatCurrency(currentBalance)}
                </p>
              </div>
            )}

            {/* اختيار مصدر السداد */}
            <SourceSelector
              value={formData.sourceId}
              onChange={(value) => setFormData({ ...formData, sourceId: value })}
              excludeId={card.id}
              excludeType="card"
              label="مصدر السداد"
              placeholder="اختر مصدر السداد"
            />

            {/* رسوم السداد */}
            <FeeInput
              feeType={formData.feeType}
              feeValue={formData.feeValue}
              onFeeTypeChange={(type) => setFormData({ ...formData, feeType: type })}
              onFeeValueChange={(value) => setFormData({ ...formData, feeValue: value })}
              amount={amount}
              label="رسوم السداد (اختياري)"
            />

            {/* تحذير عند عدم كفاية الرصيد */}
            {formData.sourceId && sourceDetails && totalAmount > 0 && sourceDetails.balance < totalAmount && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">الرصيد غير كافٍ في {sourceDetails.name}</p>
                  <p className="text-xs mt-1">
                    الرصيد المتاح: {formatCurrency(sourceDetails.balance)} • المطلوب: {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            )}

            {/* معاينة السداد */}
            {formData.sourceId && sourceDetails && amount > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">من:</span>
                  <span className="font-medium text-foreground">{sourceDetails.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الرصيد بعد السداد:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(sourceDetails.balance - totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* نسبة الاستخدام بعد السداد */}
            {amount > 0 && (
              <div className={`p-3 rounded-lg border ${
                utilizationAfterPayment <= 30
                  ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
                  : utilizationAfterPayment <= 50
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
                  : 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800'
              }`}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">الرصيد المتبقي:</span>
                  <span className="font-bold text-foreground">{formatCurrency(remainingBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">نسبة الاستخدام بعد السداد:</span>
                  <span className={`font-bold ${
                    utilizationAfterPayment <= 30 ? 'text-green-600' :
                    utilizationAfterPayment <= 50 ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {utilizationAfterPayment.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Input
                id="description"
                placeholder="أضف ملاحظات..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* التاريخ */}
            <div className="space-y-2">
              <Label htmlFor="date">تاريخ السداد</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={amount <= 0 || !formData.sourceId || (sourceDetails ? sourceDetails.balance < totalAmount : false)}
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              تأكيد السداد
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
