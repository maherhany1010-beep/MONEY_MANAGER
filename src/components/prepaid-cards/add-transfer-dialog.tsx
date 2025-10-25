'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PrepaidCard, usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { ArrowRightLeft, AlertCircle, CreditCard } from 'lucide-react'

interface AddTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: PrepaidCard
}

export function AddTransferDialog({ open, onOpenChange, card }: AddTransferDialogProps) {
  const { cards, addTransfer } = usePrepaidCards()

  const [formData, setFormData] = useState({
    amount: '',
    targetCardId: '',
    description: '',
  })

  // Get available cards for transfer (exclude current card and inactive cards)
  const availableCards = cards.filter(
    c => c.id !== card.id && c.status === 'active'
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.targetCardId) {
      toast.error('الرجاء اختيار البطاقة المستهدفة')
      return
    }

    const targetCard = cards.find(c => c.id === formData.targetCardId)
    if (!targetCard) {
      toast.error('البطاقة المستهدفة غير موجودة')
      return
    }

    // Calculate total amount with fee
    const fee = amount * (card.withdrawalFee / 100)
    const totalAmount = amount + fee

    // Check source card balance
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

    // Add transfer
    addTransfer(card.id, formData.targetCardId, amount, formData.description)

    toast.success(
      `تم التحويل بنجاح`,
      `تم تحويل ${formatCurrency(amount)} إلى ${targetCard.cardName}`
    )

    // Reset form
    setFormData({
      amount: '',
      targetCardId: '',
      description: '',
    })

    onOpenChange(false)
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = amount * (card.withdrawalFee / 100)
  const totalAmount = amount + fee
  const targetCard = cards.find(c => c.id === formData.targetCardId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-purple-600" />
            تحويل بين البطاقات
          </DialogTitle>
          <DialogDescription>
            تحويل رصيد من {card.cardName} إلى بطاقة أخرى
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* معلومات البطاقة المصدر */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-1 text-sm">
            <div className="font-medium text-blue-900 dark:text-blue-100 mb-2">من: {card.cardName}</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الرصيد الحالي:</span>
              <span className="font-medium">{formatCurrency(card.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الحد اليومي المتبقي:</span>
              <span className="font-medium">{formatCurrency(card.dailyLimit - card.dailyUsed)}</span>
            </div>
          </div>

          {/* البطاقة المستهدفة */}
          <div className="space-y-2">
            <Label htmlFor="targetCard">إلى البطاقة *</Label>
            <Select
              value={formData.targetCardId}
              onValueChange={(value) => setFormData({ ...formData, targetCardId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر البطاقة المستهدفة" />
              </SelectTrigger>
              <SelectContent>
                {availableCards.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد بطاقات نشطة أخرى</p>
                  </div>
                ) : (
                  availableCards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex flex-col items-start py-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.cardName}</span>
                          {c.isDefault && (
                            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {c.provider} - الرصيد: {formatCurrency(c.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* معلومات البطاقة المستهدفة */}
          {targetCard && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-1 text-sm">
              <div className="font-medium text-green-900 dark:text-green-100 mb-2">إلى: {targetCard.cardName}</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرصيد الحالي:</span>
                <span className="font-medium">{formatCurrency(targetCard.balance)}</span>
              </div>
              {amount > 0 && (
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>الرصيد بعد التحويل:</span>
                  <span className="font-medium">{formatCurrency(targetCard.balance + amount)}</span>
                </div>
              )}
            </div>
          )}

          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المراد تحويله *</Label>
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
                  <span>رسوم التحويل ({card.withdrawalFee}%):</span>
                  <span className="text-red-600">+ {formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>إجمالي المخصوم:</span>
                  <span className="text-red-600">- {formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>المبلغ المستلم:</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>رصيد البطاقة المصدر بعد التحويل:</span>
                  <span>{formatCurrency(card.balance - totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* تحذيرات */}
          {amount > 0 && (
            <>
              {totalAmount > card.balance && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>الرصيد غير كافٍ في البطاقة المصدر</span>
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
              placeholder="أضف ملاحظات عن التحويل..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={availableCards.length === 0}
            >
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

