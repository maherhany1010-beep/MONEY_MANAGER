'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCashVaults, CashVault } from '@/contexts/cash-vaults-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { SourceSelector, useSourceDetails } from '@/components/shared/source-selector'
import { FeeInput, calculateFee } from '@/components/shared/fee-input'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { AlertCircle, ArrowRightLeft } from 'lucide-react'

interface AddTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vault: CashVault
}

export function AddTransferDialog({ open, onOpenChange, vault }: AddTransferDialogProps) {
  const { updateVaultBalance } = useCashVaults()
  const { updateAccountBalance } = useBankAccounts()
  const { updateWalletBalance } = useEWallets()
  const { cards } = useCards()

  const [formData, setFormData] = useState({
    amount: '',
    destinationId: '',
    feeType: 'percentage' as any,
    feeValue: 0,
    description: '',
  })

  const destinationDetails = useSourceDetails(formData.destinationId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.destinationId || !destinationDetails) {
      toast.error('الرجاء اختيار وجهة التحويل')
      return
    }

    // Calculate fee
    const fee = calculateFee(amount, formData.feeType, formData.feeValue)
    const totalAmount = amount + fee // Total to deduct from vault

    // Check sufficient balance
    if (vault.balance < totalAmount) {
      toast.error(
        `الرصيد غير كافٍ في ${vault.vaultName}. الرصيد المتاح: ${formatCurrency(vault.balance)}`
      )
      return
    }

    // Deduct total amount from vault
    updateVaultBalance(vault.id, vault.balance - totalAmount)

    // Add amount to destination (without fees)
    const [destType, destId] = formData.destinationId.split('-')
    
    switch (destType) {
      case 'bank':
        updateAccountBalance(destId, destinationDetails.balance + amount)
        break
      case 'vault':
        updateVaultBalance(destId, destinationDetails.balance + amount)
        break
      case 'ewallet':
        updateWalletBalance(destId, destinationDetails.balance + amount)
        break
      case 'card':
        // For credit cards, this is a payment (decrease current balance)
        // updateCardBalance(destId, destinationDetails.balance + amount)
        break
      case 'prepaid':
        // For prepaid cards, increase balance
        // This would need the prepaid cards context method
        break
    }

    toast.success(
      `تم التحويل بنجاح`,
      `تم تحويل ${formatCurrency(amount)} إلى ${destinationDetails.name}${fee > 0 ? ` (رسوم: ${formatCurrency(fee)})` : ''}`
    )

    // Reset form
    setFormData({
      amount: '',
      destinationId: '',
      feeType: 'percentage',
      feeValue: 0,
      description: '',
    })

    onOpenChange(false)
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = calculateFee(amount, formData.feeType, formData.feeValue)
  const totalAmount = amount + fee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            تحويل من الخزينة
          </DialogTitle>
          <DialogDescription>
            تحويل من {vault.vaultName} إلى أي حساب آخر
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vault Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">من الخزينة:</span>
              <span className="font-medium">{vault.vaultName}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">الرصيد الحالي:</span>
              <span className="font-bold text-green-600">{formatCurrency(vault.balance)}</span>
            </div>
          </div>

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

          {/* وجهة التحويل */}
          <SourceSelector
            value={formData.destinationId}
            onChange={(value) => setFormData({ ...formData, destinationId: value })}
            excludeId={vault.id}
            excludeType="vault"
            label="وجهة التحويل"
            placeholder="اختر وجهة التحويل"
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

          {/* تحذير عند عدم كفاية الرصيد */}
          {totalAmount > 0 && vault.balance < totalAmount && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">الرصيد غير كافٍ في {vault.vaultName}</p>
                <p className="text-xs mt-1">
                  الرصيد المتاح: {formatCurrency(vault.balance)} • المطلوب: {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          )}

          {/* معاينة التحويل */}
          {formData.destinationId && destinationDetails && amount > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">إلى:</span>
                <span className="font-medium text-foreground">{destinationDetails.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الرصيد بعد التحويل:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(destinationDetails.balance + amount)}
                </span>
              </div>
            </div>
          )}

          {/* الوصف */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea
              id="description"
              placeholder="أضف ملاحظات أو وصف للعملية..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
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

