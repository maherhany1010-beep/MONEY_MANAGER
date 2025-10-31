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
import { ArrowDownToLine, AlertCircle } from 'lucide-react'

interface DepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machine: POSMachine
  onDeposit: (data: DepositData) => void
}

export interface DepositData {
  targetAccountId: string
  amount: number
  sourceType: 'ewallet' | 'bank-account' | 'cash-vault' | 'credit-card'
  sourceId: string
  feeType: 'percentage' | 'fixed'
  feeValue: number
  notes?: string
}

export function DepositDialog({ open, onOpenChange, machine, onDeposit }: DepositDialogProps) {
  const [formData, setFormData] = useState({
    targetAccountId: '',
    amount: '',
    sourceType: 'ewallet' as 'ewallet' | 'bank-account' | 'cash-vault' | 'credit-card',
    sourceId: '',
    feeType: 'percentage' as 'percentage' | 'fixed',
    feeValue: 0,
    notes: '',
  })

  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    const amount = parseFloat(formData.amount)
    const feeValue = typeof formData.feeValue === 'string' ? parseFloat(formData.feeValue) || 0 : formData.feeValue

    const depositData: DepositData = {
      targetAccountId: formData.targetAccountId,
      amount,
      sourceType: formData.sourceType,
      sourceId: formData.sourceId,
      feeType: formData.feeType,
      feeValue,
      notes: formData.notes,
    }

    onDeposit(depositData)
    onOpenChange(false)
    setShowConfirmation(false)
    
    // إعادة تعيين النموذج
    setFormData({
      targetAccountId: '',
      amount: '',
      sourceType: 'ewallet',
      sourceId: '',
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
  const totalDeduction = (parseFloat(formData.amount) || 0) + fee
  const amountToAdd = parseFloat(formData.amount) || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-green-600 dark:text-green-400" />
            شحن حساب الماكينة
          </DialogTitle>
          <DialogDescription>
            شحن رصيد حساب الماكينة {machine.machineName}
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اختيار الحساب المستهدف */}
            <div className="space-y-2">
              <Label htmlFor="targetAccount">الحساب المستهدف *</Label>
              <Select
                value={formData.targetAccountId}
                onValueChange={(value) => setFormData({ ...formData, targetAccountId: value })}
                required
              >
                <SelectTrigger id="targetAccount">
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {(machine.accounts ?? []).map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* المبلغ */}
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (جنيه) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="مثال: 5000"
                required
              />
            </div>

            {/* اختيار المصدر */}
            <div className="space-y-2">
              <Label>المصدر *</Label>
              <SourceSelector
                value={formData.sourceId}
                onChange={(id) => setFormData({ ...formData, sourceId: id })}
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
                disabled={!formData.targetAccountId || !formData.amount || !formData.sourceId}
              >
                <ArrowDownToLine className="h-4 w-4 ml-2" />
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
                    تأكيد عملية الشحن
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>• المبلغ المخصوم من المصدر: <strong>{formatCurrency(totalDeduction)}</strong></p>
                    <p>• المبلغ المضاف للحساب: <strong>{formatCurrency(amountToAdd)}</strong></p>
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
              <Button onClick={handleConfirm}>
                <ArrowDownToLine className="h-4 w-4 ml-2" />
                تأكيد الشحن
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

