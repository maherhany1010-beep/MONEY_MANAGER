'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { POSMachine, POSAccount } from '@/contexts/pos-machines-context'
import { SourceSelector } from '@/components/shared/source-selector'
import { FeeInput } from '@/components/shared/fee-input'
import { formatCurrency } from '@/lib/utils'
import { ArrowUpFromLine, AlertCircle, AlertTriangle } from 'lucide-react'

interface WithdrawalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machine: POSMachine
  onWithdrawal: (data: WithdrawalData) => void
}

export interface WithdrawalData {
  sourceAccountId: string
  amount: number
  destinationType: 'ewallet' | 'bank-account' | 'cash-vault' | 'credit-card'
  destinationId: string
  feeType: 'percentage' | 'fixed'
  feeValue: number
  notes?: string
}

export function WithdrawalDialog({ open, onOpenChange, machine, onWithdrawal }: WithdrawalDialogProps) {
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    amount: '',
    destinationType: 'ewallet' as 'ewallet' | 'bank-account' | 'cash-vault' | 'credit-card',
    destinationId: '',
    feeType: 'percentage' as 'percentage' | 'fixed',
    feeValue: 0,
    notes: '',
  })

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // التحقق من كفاية الرصيد
    const sourceAccount = machine.accounts.find(acc => acc.id === formData.sourceAccountId)
    const amount = parseFloat(formData.amount) || 0

    if (!sourceAccount) {
      setError('الحساب المصدر غير موجود')
      return
    }

    if (sourceAccount.balance < amount) {
      setError('الرصيد غير كافٍ في الحساب المصدر')
      return
    }

    const fee = calculateFee()
    if (fee >= amount) {
      setError('الرسوم لا يمكن أن تساوي أو تتجاوز المبلغ')
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    const amount = parseFloat(formData.amount)
    const feeValue = typeof formData.feeValue === 'string' ? parseFloat(formData.feeValue) || 0 : formData.feeValue

    const withdrawalData: WithdrawalData = {
      sourceAccountId: formData.sourceAccountId,
      amount,
      destinationType: formData.destinationType,
      destinationId: formData.destinationId,
      feeType: formData.feeType,
      feeValue,
      notes: formData.notes,
    }

    onWithdrawal(withdrawalData)
    onOpenChange(false)
    setShowConfirmation(false)
    setError('')
    
    // إعادة تعيين النموذج
    setFormData({
      sourceAccountId: '',
      amount: '',
      destinationType: 'ewallet',
      destinationId: '',
      feeType: 'percentage',
      feeValue: 0,
      notes: '',
    })
  }

  // حساب الرسوم
  const calculateFee = () => {
    const amount = parseFloat(formData.amount) || 0
    const feeValue = typeof formData.feeValue === 'string' ? parseFloat(formData.feeValue) || 0 : formData.feeValue
    
    if (formData.feeType === 'percentage') {
      return (amount * feeValue) / 100
    }
    return feeValue
  }

  const fee = calculateFee()
  const amountToDestination = (parseFloat(formData.amount) || 0) - fee
  const sourceAccount = machine.accounts.find(acc => acc.id === formData.sourceAccountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="h-5 w-5 text-red-600 dark:text-red-400" />
            سحب من حساب الماكينة
          </DialogTitle>
          <DialogDescription>
            سحب رصيد من حساب الماكينة {machine.machineName}
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* رسالة خطأ */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* اختيار الحساب المصدر */}
            <div className="space-y-2">
              <Label htmlFor="sourceAccount">الحساب المصدر *</Label>
              <Select
                value={formData.sourceAccountId}
                onValueChange={(value) => setFormData({ ...formData, sourceAccountId: value })}
                required
              >
                <SelectTrigger id="sourceAccount">
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {machine.accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sourceAccount && (
                <p className="text-xs text-muted-foreground">
                  الرصيد المتاح: {formatCurrency(sourceAccount.balance)}
                </p>
              )}
            </div>

            {/* المبلغ */}
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (جنيه) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                max={sourceAccount?.balance || undefined}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="مثال: 3000"
                required
              />
            </div>

            {/* اختيار الوجهة */}
            <div className="space-y-2">
              <Label>الوجهة *</Label>
              <SourceSelector
                value={formData.destinationId}
                onChange={(id) => setFormData({ ...formData, destinationId: id })}
              />
            </div>

            {/* الرسوم */}
            <div className="space-y-2">
              <Label>الرسوم</Label>
              <FeeInput
                feeType={formData.feeType}
                feeValue={formData.feeValue}
                onFeeTypeChange={(type) => setFormData({ ...formData, feeType: type })}
                onFeeValueChange={(value) => setFormData({ ...formData, feeValue: value })}
                amount={parseFloat(formData.amount) || 0}
              />
              {fee > 0 && (
                <p className="text-xs text-muted-foreground">
                  قيمة الرسوم: {formatCurrency(fee)}
                </p>
              )}
            </div>

            {/* الملاحظات */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أضف ملاحظات اختيارية..."
                rows={3}
              />
            </div>

            {/* الأزرار */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                variant="destructive"
                disabled={!formData.sourceAccountId || !formData.amount || !formData.destinationId}
              >
                <ArrowUpFromLine className="h-4 w-4 ml-2" />
                متابعة
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* رسالة التأكيد */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    تأكيد عملية السحب
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>• المبلغ المخصوم من الحساب: <strong>{formatCurrency(parseFloat(formData.amount))}</strong></p>
                    <p>• المبلغ المضاف للوجهة: <strong>{formatCurrency(amountToDestination)}</strong></p>
                    <p>• قيمة الرسوم: <strong>{formatCurrency(fee)}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
              >
                رجوع
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                <ArrowUpFromLine className="h-4 w-4 ml-2" />
                تأكيد السحب
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

