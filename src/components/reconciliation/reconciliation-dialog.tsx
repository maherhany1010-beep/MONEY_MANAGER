'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useReconciliation, AccountType } from '@/contexts/reconciliation-context'
import { Check, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface ReconciliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  accountName: string
  accountType: AccountType
  currentBalance: number
  onReconcile: (actualBalance: number, difference: number, notes?: string) => void
}

export function ReconciliationDialog({
  open,
  onOpenChange,
  accountId,
  accountName,
  accountType,
  currentBalance,
  onReconcile,
}: ReconciliationDialogProps) {
  const { addReconciliation } = useReconciliation()
  const [actualBalance, setActualBalance] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setActualBalance('')
      setNotes('')
      setIsSubmitting(false)
    }
  }, [open])

  // Calculate difference
  const difference = actualBalance ? parseFloat(actualBalance) - currentBalance : 0
  const hasDifference = Math.abs(difference) > 0.01 // Allow for small floating point errors

  const handleSubmit = () => {
    if (!actualBalance || parseFloat(actualBalance) < 0) {
      alert('الرجاء إدخال رصيد فعلي صحيح')
      return
    }

    const actualBalanceNum = parseFloat(actualBalance)

    if (!hasDifference) {
      alert('الرصيد متطابق، لا حاجة للتسوية ✅')
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)

    // Add reconciliation record
    addReconciliation({
      accountId,
      accountType: accountType as any,
      accountName,
      systemBalance: currentBalance,
      actualBalance: actualBalanceNum,
      difference,
      notes: notes.trim() || null,
      reconciliationDate: new Date().toISOString(),
    } as any)

    // Call the onReconcile callback to update the account balance
    onReconcile(actualBalanceNum, difference, notes.trim() || undefined)

    // Show success message
    setTimeout(() => {
      alert('تمت التسوية بنجاح ✅')
      setIsSubmitting(false)
      onOpenChange(false)
    }, 300)
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} EGP`
  }

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'bank_account': return 'حساب بنكي'
      case 'e_wallet': return 'محفظة إلكترونية'
      case 'cash_vault': return 'خزينة نقدية'
      case 'pos_machine': return 'جهاز POS'
      case 'prepaid_card': return 'بطاقة مدفوعة مسبقاً'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">تسوية الرصيد</DialogTitle>
          <DialogDescription>
            {accountName} ({getAccountTypeLabel(accountType)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current System Balance */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">الرصيد الحالي في النظام</Label>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(currentBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">للقراءة فقط</p>
            </div>
          </div>

          {/* Actual Balance Input */}
          <div className="space-y-2">
            <Label htmlFor="actualBalance" className="text-sm font-medium">
              الرصيد الفعلي <span className="text-red-500">*</span>
            </Label>
            <Input
              id="actualBalance"
              type="number"
              step="0.01"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              placeholder="أدخل الرصيد الفعلي"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              أدخل الرصيد الفعلي كما يظهر في البنك/المحفظة/الخزينة
            </p>
          </div>

          {/* Difference Display */}
          {actualBalance && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">الفرق</Label>
              <div
                className={`p-4 rounded-lg border-2 ${
                  difference > 0
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : difference < 0
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {difference > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : difference < 0 ? (
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={`text-xl font-bold ${
                        difference > 0
                          ? 'text-green-600 dark:text-green-400'
                          : difference < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      difference > 0
                        ? 'text-green-700 dark:text-green-300'
                        : difference < 0
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-foreground'
                    }`}
                  >
                    {difference > 0 ? 'زيادة' : difference < 0 ? 'نقص' : 'متطابق'}
                  </span>
                </div>
                {hasDifference && (
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-current/20">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">
                      {difference > 0
                        ? 'سيتم إضافة الفرق إلى الرصيد في النظام'
                        : 'سيتم خصم الفرق من الرصيد في النظام'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              ملاحظات <span className="text-muted-foreground">(اختياري)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: فرق بسبب مصاريف بنكية غير مسجلة"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Reconciliation Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">تاريخ التسوية</Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-sm">
                {new Date().toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!actualBalance || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-4 w-4 ml-2" />
            {isSubmitting ? 'جاري التسوية...' : 'تأكيد التسوية'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

