'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Send } from 'lucide-react'
import { FeeInput, calculateFee } from '@/components/shared/fee-input'
import { DestinationSelector, useDestinationDetails } from '@/components/shared/destination-selector'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallet: any
}

export function TransferDialog({ open, onOpenChange, wallet }: TransferDialogProps) {
  const { updateWalletBalance } = useEWallets()
  const { updateAccountBalance } = useBankAccounts()
  const { updateVaultBalance } = useCashVaults()
  const { updateCard } = useCards()
  const { updateCardBalance: updatePrepaidBalance } = usePrepaidCards()

  const [formData, setFormData] = useState({
    amount: '',
    destinationId: '',
    feeType: 'percentage' as 'fixed' | 'percentage',
    feeValue: 0,
    feeBearerType: 'source' as 'source' | 'destination',
    commission: '',
    description: '',
  })

  const destinationDetails = useDestinationDetails(formData.destinationId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.destinationId || !destinationDetails) {
      toast.error('الرجاء اختيار حساب الاستقبال')
      return
    }

    // Calculate fee and commission
    const fee = calculateFee(amount, formData.feeType, formData.feeValue)
    const commission = parseFloat(formData.commission) || 0

    // Determine amounts based on who bears the fee
    let sourceDeduction = amount
    let destinationAddition = amount

    if (formData.feeBearerType === 'source') {
      sourceDeduction = amount + fee
    } else {
      destinationAddition = amount - fee
    }

    // Add commission to destination
    destinationAddition += commission

    // Check sufficient balance
    if (wallet.balance < sourceDeduction) {
      toast.error(
        `الرصيد غير كافٍ. الرصيد المتاح: ${formatCurrency(wallet.balance)}`
      )
      return
    }

    // Check daily limit for source wallet
    const dailyRemaining = (wallet.dailyLimit || 0) - (wallet.dailyUsed || 0)
    if (amount > dailyRemaining) {
      toast.error(
        `تجاوز الحد اليومي. الحد المتبقي: ${formatCurrency(dailyRemaining)}`
      )
      return
    }

    // Check monthly limit for source wallet
    const monthlyRemaining = (wallet.monthlyLimit || 0) - (wallet.monthlyUsed || 0)
    if (amount > monthlyRemaining) {
      toast.error(
        `تجاوز الحد الشهري. الحد المتبقي: ${formatCurrency(monthlyRemaining)}`
      )
      return
    }

    // Check transaction limit for source wallet
    if (amount > (wallet.transactionLimit || 0)) {
      toast.error(
        `تجاوز حد المعاملة الواحدة. الحد المسموح: ${formatCurrency(wallet.transactionLimit || 0)}`
      )
      return
    }

    // Deduct from source wallet
    updateWalletBalance(wallet.id, wallet.balance - sourceDeduction, -sourceDeduction)

    // Add to destination
    const [destType, destId] = formData.destinationId.split('-')

    switch (destType) {
      case 'bank':
        const bankAccount = { balance: destinationDetails.balance }
        updateAccountBalance(destId, bankAccount.balance + destinationAddition)
        break
      case 'vault':
        const vault = { balance: destinationDetails.balance }
        updateVaultBalance(destId, vault.balance + destinationAddition)
        break
      case 'ewallet':
        const eWallet = { balance: destinationDetails.balance }
        updateWalletBalance(destId, eWallet.balance + destinationAddition, destinationAddition)
        break
      case 'card':
        const creditCard = { balance: destinationDetails.balance }
        updateCard(destId, { currentBalance: creditCard.balance + destinationAddition })
        break
      case 'prepaid':
        const prepaidCard = { balance: destinationDetails.balance }
        updatePrepaidBalance(destId, prepaidCard.balance + destinationAddition)
        break
    }

    toast.success(
      `تم التحويل بنجاح`,
      `تم تحويل ${formatCurrency(amount)} إلى ${destinationDetails.name}${fee > 0 ? ` (رسوم: ${formatCurrency(fee)})` : ''}${commission > 0 ? ` + عمولة: ${formatCurrency(commission)}` : ''}`
    )

    // Reset form
    setFormData({
      amount: '',
      destinationId: '',
      feeType: 'percentage',
      feeValue: 0,
      feeBearerType: 'source',
      commission: '',
      description: '',
    })

    onOpenChange(false)
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = calculateFee(amount, formData.feeType, formData.feeValue)
  const commission = parseFloat(formData.commission) || 0

  let sourceDeduction = formData.feeBearerType === 'source' ? amount + fee : amount
  let destinationAddition = formData.feeBearerType === 'source' ? amount : amount - fee
  destinationAddition += commission

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            تحويل أموال
          </DialogTitle>
          <DialogDescription>
            حول أموالاً من محفظتك إلى حساب آخر
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المراد تحويله *</Label>
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

          {/* حساب الاستقبال */}
          <DestinationSelector
            value={formData.destinationId}
            onChange={(value) => setFormData({ ...formData, destinationId: value })}
            excludeId={wallet.id}
            excludeType="ewallet"
            label="حساب الاستقبال"
            placeholder="اختر حساب الاستقبال"
          />

          {/* رسوم التحويل */}
          <FeeInput
            feeType={formData.feeType}
            feeValue={formData.feeValue}
            onFeeTypeChange={(type) => setFormData({ ...formData, feeType: type })}
            onFeeValueChange={(value) => setFormData({ ...formData, feeValue: value })}
            amount={amount}
            label="رسوم التحويل (اختياري)"
          />

          {/* من يتحمل الرسوم */}
          {fee > 0 && (
            <div className="space-y-2">
              <Label>من يتحمل الرسوم؟</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <input
                    type="radio"
                    name="feeBearerType"
                    value="source"
                    checked={formData.feeBearerType === 'source'}
                    onChange={(e) => setFormData({ ...formData, feeBearerType: e.target.value as 'source' | 'destination' })}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">المحفظة (خصم إضافي)</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      خصم: {formatCurrency(sourceDeduction)} (المبلغ + الرسوم)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <input
                    type="radio"
                    name="feeBearerType"
                    value="destination"
                    checked={formData.feeBearerType === 'destination'}
                    onChange={(e) => setFormData({ ...formData, feeBearerType: e.target.value as 'source' | 'destination' })}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">حساب الاستقبال (خصم من المبلغ)</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      يستقبل: {formatCurrency(destinationAddition - commission)} (المبلغ - الرسوم)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

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
              العمولة هي مبلغ إضافي يُضاف إلى حساب الاستقبال كربح (لا تُخصم من المصدر)
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
                  <span>المخصوم من المحفظة:</span>
                  <span>{formatCurrency(sourceDeduction)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>المضاف للحساب المستقبل:</span>
                  <span>{formatCurrency(destinationAddition)}</span>
                </div>
              </div>
            </div>
          )}

          {/* تحذير عند عدم كفاية الرصيد */}
          {wallet.balance < sourceDeduction && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">الرصيد غير كافٍ</p>
                <p className="text-xs mt-1">
                  الرصيد المتاح: {formatCurrency(wallet.balance)} • المطلوب: {formatCurrency(sourceDeduction)}
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
              تأكيد التحويل
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

