'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { POSAccount, InternalTransfer } from '@/contexts/pos-machines-context'
import { formatCurrency } from '@/lib/design-system'
import { ArrowRightLeft, AlertCircle } from 'lucide-react'

interface InternalTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransfer: (transfer: InternalTransfer) => void
  machineId: string
  accounts: POSAccount[]
  updateAccountBalance: (accountId: string, newBalance: number) => void
}

export function InternalTransferDialog({ 
  open, 
  onOpenChange, 
  onTransfer, 
  machineId, 
  accounts,
  updateAccountBalance 
}: InternalTransferDialogProps) {
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    notes: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amount = parseFloat(formData.amount)
    
    // التحقق من صحة البيانات
    if (!formData.fromAccountId || !formData.toAccountId) {
      setError('يرجى اختيار الحسابات')
      return
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setError('لا يمكن التحويل إلى نفس الحساب')
      return
    }

    if (amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح')
      return
    }

    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId)
    if (!fromAccount) {
      setError('الحساب المصدر غير موجود')
      return
    }

    if (fromAccount.balance < amount) {
      setError('الرصيد غير كافٍ في الحساب المصدر')
      return
    }

    const toAccount = accounts.find(acc => acc.id === formData.toAccountId)
    if (!toAccount) {
      setError('الحساب المستهدف غير موجود')
      return
    }

    // إنشاء التحويل
    const transfer: InternalTransfer = {
      id: `tr-${Date.now()}`,
      machineId,
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes: formData.notes,
    }

    // تحديث الأرصدة
    updateAccountBalance(formData.fromAccountId, fromAccount.balance - amount)
    updateAccountBalance(formData.toAccountId, toAccount.balance + amount)

    // حفظ التحويل
    onTransfer(transfer)
    onOpenChange(false)
    
    // إعادة تعيين النموذج
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      notes: '',
    })
  }

  const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId)
  const toAccount = accounts.find(acc => acc.id === formData.toAccountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-rose-100 dark:border-rose-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-rose-100 dark:border-rose-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            تحويل داخلي
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            تحويل الأموال بين حسابات الماكينة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الحساب المصدر */}
          <div className="space-y-2">
            <Label htmlFor="fromAccount">من الحساب *</Label>
            <Select
              value={formData.fromAccountId}
              onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحساب المصدر" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName} - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fromAccount && (
              <p className="text-xs text-muted-foreground">
                الرصيد المتاح: {formatCurrency(fromAccount.balance)}
              </p>
            )}
          </div>

          {/* الحساب المستهدف */}
          <div className="space-y-2">
            <Label htmlFor="toAccount">إلى الحساب *</Label>
            <Select
              value={formData.toAccountId}
              onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحساب المستهدف" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter(acc => acc.id !== formData.fromAccountId)
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName} - {formatCurrency(account.balance)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {toAccount && (
              <p className="text-xs text-muted-foreground">
                الرصيد الحالي: {formatCurrency(toAccount.balance)}
              </p>
            )}
          </div>

          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أدخل ملاحظات إضافية (اختياري)"
              rows={3}
            />
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* معاينة التحويل */}
          {formData.fromAccountId && formData.toAccountId && formData.amount && !error && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-blue-900">معاينة التحويل:</p>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• من: {fromAccount?.accountName}</p>
                <p>• إلى: {toAccount?.accountName}</p>
                <p>• المبلغ: {formatCurrency(parseFloat(formData.amount))}</p>
                {fromAccount && (
                  <p>• الرصيد بعد التحويل: {formatCurrency(fromAccount.balance - parseFloat(formData.amount))}</p>
                )}
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setError('')
              }}
            >
              إلغاء
            </Button>
            <Button type="submit">
              <ArrowRightLeft className="h-4 w-4 ml-2" />
              تنفيذ التحويل
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

