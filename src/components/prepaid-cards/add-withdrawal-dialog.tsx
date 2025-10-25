'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PrepaidCard, usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { Landmark, Vault, AlertCircle, TrendingDown } from 'lucide-react'

interface AddWithdrawalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: PrepaidCard
}

export function AddWithdrawalDialog({ open, onOpenChange, card }: AddWithdrawalDialogProps) {
  const { addWithdrawal } = usePrepaidCards()
  const { accounts, updateAccountBalance } = useBankAccounts()
  const { vaults, updateVaultBalance } = useCashVaults()

  const [formData, setFormData] = useState({
    amount: '',
    sourceType: 'bank' as 'bank' | 'vault',
    sourceId: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.sourceId) {
      toast.error('الرجاء اختيار وجهة السحب')
      return
    }

    // Calculate total amount with fee
    const fee = amount * (card.withdrawalFee / 100)
    const totalAmount = amount + fee

    // Check card balance
    if (card.balance < totalAmount) {
      toast.error(`الرصيد غير كافٍ في البطاقة. الرصيد المتاح: ${formatCurrency(card.balance)}`)
      return
    }

    // Check daily limit
    if (card.dailyUsed + totalAmount > card.dailyLimit) {
      const remaining = card.dailyLimit - card.dailyUsed
      toast.error(`تجاوز الحد اليومي. المتبقي: ${formatCurrency(remaining)}`)
      return
    }

    // Check monthly limit
    if (card.monthlyUsed + totalAmount > card.monthlyLimit) {
      const remaining = card.monthlyLimit - card.monthlyUsed
      toast.error(`تجاوز الحد الشهري. المتبقي: ${formatCurrency(remaining)}`)
      return
    }

    // Check transaction limit
    if (totalAmount > card.transactionLimit) {
      toast.error(`تجاوز حد المعاملة الواحدة: ${formatCurrency(card.transactionLimit)}`)
      return
    }

    let sourceName = ''

    // Get destination details
    if (formData.sourceType === 'bank') {
      const account = accounts.find(acc => acc.id === formData.sourceId)
      if (!account) {
        toast.error('الحساب البنكي غير موجود')
        return
      }
      sourceName = account.accountName
      // Add to bank account
      updateAccountBalance(formData.sourceId, account.balance + amount)
    } else {
      const vault = vaults.find(v => v.id === formData.sourceId)
      if (!vault) {
        toast.error('الخزينة النقدية غير موجودة')
        return
      }
      sourceName = vault.vaultName
      // Add to vault
      updateVaultBalance(formData.sourceId, vault.balance + amount)
    }

    // Add withdrawal from card
    addWithdrawal(card.id, amount, formData.sourceType, formData.sourceId, sourceName, formData.description)

    toast.success(
      `تم السحب بنجاح`,
      `تم سحب ${formatCurrency(amount)} (رسوم: ${formatCurrency(fee)}) إلى ${sourceName}`
    )

    // Reset form
    setFormData({
      amount: '',
      sourceType: 'bank',
      sourceId: '',
      description: '',
    })

    onOpenChange(false)
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = amount * (card.withdrawalFee / 100)
  const totalAmount = amount + fee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            سحب نقدي
          </DialogTitle>
          <DialogDescription>
            سحب من {card.cardName} إلى حساب بنكي أو خزينة نقدية
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* معلومات البطاقة */}
          <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الرصيد الحالي:</span>
              <span className="font-medium">{formatCurrency(card.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الحد اليومي المتبقي:</span>
              <span className="font-medium">{formatCurrency(card.dailyLimit - card.dailyUsed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الحد الشهري المتبقي:</span>
              <span className="font-medium">{formatCurrency(card.monthlyLimit - card.monthlyUsed)}</span>
            </div>
          </div>

          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المراد سحبه *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={Math.min(card.balance, card.transactionLimit)}
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            {amount > 0 && (
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>المبلغ:</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>رسوم السحب ({card.withdrawalFee}%):</span>
                  <span className="text-red-600">+ {formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>إجمالي المخصوم:</span>
                  <span className="text-red-600">- {formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الرصيد بعد السحب:</span>
                  <span>{formatCurrency(card.balance - totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* وجهة السحب */}
          <div className="space-y-2">
            <Label htmlFor="destination">وجهة السحب *</Label>
            <Select
              value={`${formData.sourceType}-${formData.sourceId}`}
              onValueChange={(value) => {
                const [type, id] = value.split('-')
                setFormData({ ...formData, sourceType: type as 'bank' | 'vault', sourceId: id })
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر وجهة السحب" />
              </SelectTrigger>
              <SelectContent>
                {/* الحسابات البنكية */}
                {accounts.filter(acc => acc.isActive !== false).length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-3 w-3" />
                        الحسابات البنكية
                      </div>
                    </div>
                    {accounts
                      .filter(acc => acc.isActive !== false)
                      .map((account) => (
                        <SelectItem key={`bank-${account.id}`} value={`bank-${account.id}`}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">{account.accountName}</span>
                            <span className="text-xs text-muted-foreground">
                              {account.bankName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}

                {/* الخزائن النقدية */}
                {vaults.filter(v => v.isActive !== false).length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1">
                      <div className="flex items-center gap-2">
                        <Vault className="h-3 w-3" />
                        الخزائن النقدية
                      </div>
                    </div>
                    {vaults
                      .filter(v => v.isActive !== false)
                      .map((vault) => (
                        <SelectItem key={`vault-${vault.id}`} value={`vault-${vault.id}`}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium">{vault.vaultName}</span>
                            <span className="text-xs text-muted-foreground">
                              {vault.location}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* تحذيرات */}
          {amount > 0 && (
            <>
              {totalAmount > card.balance && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>الرصيد غير كافٍ في البطاقة</span>
                </div>
              )}
              {totalAmount > card.transactionLimit && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>تجاوز حد المعاملة الواحدة ({formatCurrency(card.transactionLimit)})</span>
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
              rows={3}
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" variant="destructive">
              تأكيد السحب
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

