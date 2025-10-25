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
import { AlertCircle, TrendingUp } from 'lucide-react'

interface AddDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vault: CashVault
}

export function AddDepositDialog({ open, onOpenChange, vault }: AddDepositDialogProps) {
  const { updateVaultBalance } = useCashVaults()
  const { updateAccountBalance } = useBankAccounts()
  const { updateWalletBalance } = useEWallets()
  const { cards } = useCards()

  const [formData, setFormData] = useState({
    amount: '',
    sourceId: '',
    feeType: 'percentage' as any,
    feeValue: 0,
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

    // Calculate fee
    const fee = calculateFee(amount, formData.feeType, formData.feeValue)
    const totalAmount = amount + fee // Total to deduct from source

    // Check sufficient balance
    if (sourceDetails.balance < totalAmount) {
      toast.error(
        `الرصيد غير كافٍ في ${sourceDetails.name}. الرصيد المتاح: ${formatCurrency(sourceDetails.balance)}`
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

    // Add deposit to vault (amount only, without fees)
    updateVaultBalance(vault.id, vault.balance + amount)

    toast.success(
      `تم شحن الخزينة بنجاح`,
      `تم شحن ${formatCurrency(amount)} من ${sourceDetails.name}${fee > 0 ? ` (رسوم: ${formatCurrency(fee)})` : ''}`
    )

    // Reset form
    setFormData({
      amount: '',
      sourceId: '',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            شحن الخزينة
          </DialogTitle>
          <DialogDescription>
            شحن {vault.vaultName} من أي مصدر متاح
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vault Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الخزينة:</span>
              <span className="font-medium">{vault.vaultName}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">الرصيد الحالي:</span>
              <span className="font-bold text-green-600">{formatCurrency(vault.balance)}</span>
            </div>
          </div>

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
            excludeId={vault.id}
            excludeType="vault"
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

