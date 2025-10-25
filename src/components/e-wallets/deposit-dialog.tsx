'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, TrendingUp } from 'lucide-react'
import { FeeInput, calculateFee } from '@/components/shared/fee-input'
import { SourceSelector, useSourceDetails } from '@/components/shared/source-selector'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'

interface DepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallet: any
}

export function DepositDialog({ open, onOpenChange, wallet }: DepositDialogProps) {
  const { updateWalletBalance } = useEWallets()
  const { updateAccountBalance } = useBankAccounts()
  const { updateVaultBalance } = useCashVaults()
  const { updateCard } = useCards()
  const { updateCardBalance: updatePrepaidBalance } = usePrepaidCards()

  const [formData, setFormData] = useState({
    amount: '',
    sourceId: '',
    feeType: 'percentage' as 'fixed' | 'percentage',
    feeValue: 0,
    commission: '',
    description: '',
  })

  const sourceDetails = useSourceDetails(formData.sourceId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.sourceId || !sourceDetails) {
      toast.error('الرجاء اختيار مصدر الشحن')
      return
    }

    // Calculate fee and commission
    const fee = calculateFee(amount, formData.feeType, formData.feeValue)
    const commission = parseFloat(formData.commission) || 0
    const totalAmount = amount + fee

    // Check sufficient balance
    if (sourceDetails.balance < totalAmount) {
      toast.error(
        `الرصيد غير كافٍ في ${sourceDetails.name}. الرصيد المتاح: ${formatCurrency(sourceDetails.balance)}`
      )
      return
    }

    // Check daily limit for destination wallet
    const dailyRemaining = (wallet.dailyLimit || 0) - (wallet.dailyUsed || 0)
    if (amount > dailyRemaining) {
      toast.error(
        `تجاوز الحد اليومي. الحد المتبقي: ${formatCurrency(dailyRemaining)}`
      )
      return
    }

    // Check monthly limit for destination wallet
    const monthlyRemaining = (wallet.monthlyLimit || 0) - (wallet.monthlyUsed || 0)
    if (amount > monthlyRemaining) {
      toast.error(
        `تجاوز الحد الشهري. الحد المتبقي: ${formatCurrency(monthlyRemaining)}`
      )
      return
    }

    // Check transaction limit for destination wallet
    if (amount > (wallet.transactionLimit || 0)) {
      toast.error(
        `تجاوز حد المعاملة الواحدة. الحد المسموح: ${formatCurrency(wallet.transactionLimit || 0)}`
      )
      return
    }

    // Deduct total amount from source
    const [sourceType, sourceId] = formData.sourceId.split('-')

    switch (sourceType) {
      case 'bank':
        updateAccountBalance(sourceId, sourceDetails.balance - totalAmount)
        break
      case 'vault':
        updateVaultBalance(sourceId, sourceDetails.balance - totalAmount)
        break
      case 'ewallet':
        updateWalletBalance(sourceId, sourceDetails.balance - totalAmount, -totalAmount)
        break
      case 'card':
        updateCard(sourceId, { currentBalance: sourceDetails.balance - totalAmount })
        break
      case 'prepaid':
        updatePrepaidBalance(sourceId, sourceDetails.balance - totalAmount, -totalAmount)
        break
    }

    // Add deposit to wallet (amount + commission, without fees)
    const depositAmount = amount + commission
    updateWalletBalance(wallet.id, wallet.balance + depositAmount, depositAmount)

    toast.success(
      `تم شحن المحفظة بنجاح`,
      `تم شحن ${formatCurrency(amount)} من ${sourceDetails.name}${fee > 0 ? ` (رسوم: ${formatCurrency(fee)})` : ''}${commission > 0 ? ` + عمولة: ${formatCurrency(commission)}` : ''}`
    )

    // Reset form
    setFormData({
      amount: '',
      sourceId: '',
      feeType: 'percentage',
      feeValue: 0,
      commission: '',
      description: '',
    })

    onOpenChange(false)
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = calculateFee(amount, formData.feeType, formData.feeValue)
  const commission = parseFloat(formData.commission) || 0
  const totalAmount = amount + fee
  const depositAmount = amount + commission

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            شحن المحفظة
          </DialogTitle>
          <DialogDescription>
            أضف رصيد إلى محفظتك من حساب آخر
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المراد شحنه *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          {/* مصدر الشحن */}
          <SourceSelector
            value={formData.sourceId}
            onChange={(value) => setFormData({ ...formData, sourceId: value })}
            excludeId={wallet.id}
            excludeType="ewallet"
            label="مصدر الشحن"
            placeholder="اختر مصدر الشحن"
          />

          {/* رسوم الشحن */}
          <FeeInput
            feeType={formData.feeType}
            feeValue={formData.feeValue}
            onFeeTypeChange={(type) => setFormData({ ...formData, feeType: type })}
            onFeeValueChange={(value) => setFormData({ ...formData, feeValue: value })}
            amount={amount}
            label="رسوم الشحن (اختياري)"
          />

          {/* العمولة */}
          <div className="space-y-2">
            <Label htmlFor="commission">العمولة (جنيه) - اختياري</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              العمولة هي مبلغ إضافي يُضاف إلى المحفظة كربح (لا تُخصم من المصدر)
            </p>
          </div>

          {/* ملخص المبالغ */}
          {amount > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">ملخص العملية:</p>
              <div className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <div className="flex justify-between">
                  <span>المبلغ الأصلي:</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between">
                    <span>الرسوم:</span>
                    <span>{formatCurrency(fee)}</span>
                  </div>
                )}
                {commission > 0 && (
                  <div className="flex justify-between">
                    <span>العمولة:</span>
                    <span>{formatCurrency(commission)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1 font-medium">
                  <span>المخصوم من المصدر:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>المضاف للمحفظة:</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* تحذير عند عدم كفاية الرصيد */}
          {formData.sourceId && sourceDetails && totalAmount > 0 && sourceDetails.balance < totalAmount && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">الرصيد غير كافٍ في {sourceDetails.name}</p>
                <p className="text-xs mt-1">
                  الرصيد المتاح: {formatCurrency(sourceDetails.balance)} • المطلوب: {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          )}

          {/* تحذير عند تجاوز الحدود */}
          {amount > 0 && wallet && (
            <>
              {amount > (wallet.dailyLimit || 0) - (wallet.dailyUsed || 0) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">تحذير: تجاوز الحد اليومي</p>
                    <p className="text-xs mt-1">
                      الحد المتبقي: {formatCurrency((wallet.dailyLimit || 0) - (wallet.dailyUsed || 0))}
                    </p>
                  </div>
                </div>
              )}
              {amount > (wallet.monthlyLimit || 0) - (wallet.monthlyUsed || 0) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">تحذير: تجاوز الحد الشهري</p>
                    <p className="text-xs mt-1">
                      الحد المتبقي: {formatCurrency((wallet.monthlyLimit || 0) - (wallet.monthlyUsed || 0))}
                    </p>
                  </div>
                </div>
              )}
              {amount > (wallet.transactionLimit || 0) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">تحذير: تجاوز حد المعاملة الواحدة</p>
                    <p className="text-xs mt-1">
                      الحد المسموح: {formatCurrency(wallet.transactionLimit || 0)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* الوصف */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea
              id="description"
              placeholder="أضف ملاحظات أو وصف للعملية..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              تأكيد الشحن
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

