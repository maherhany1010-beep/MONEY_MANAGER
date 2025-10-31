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
import { ShoppingCart, AlertCircle, Store } from 'lucide-react'

interface AddPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: PrepaidCard
}

const CATEGORIES = [
  'طعام ومشروبات',
  'تسوق',
  'مواصلات',
  'ترفيه',
  'صحة',
  'تعليم',
  'فواتير',
  'إلكترونيات',
  'ملابس',
  'أخرى',
]

export function AddPurchaseDialog({ open, onOpenChange, card }: AddPurchaseDialogProps) {
  const { addPurchase } = usePrepaidCards()

  const [formData, setFormData] = useState({
    amount: '',
    merchantName: '',
    category: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح')
      return
    }

    if (!formData.merchantName.trim()) {
      toast.error('الرجاء إدخال اسم التاجر')
      return
    }

    if (!formData.category) {
      toast.error('الرجاء اختيار الفئة')
      return
    }

    // Calculate total amount with fee
    const fee = amount * ((card.purchaseFee ?? 0) / 100)
    const totalAmount = amount + fee

    // Check card balance
    if (card.balance < totalAmount) {
      toast.error(`الرصيد غير كافٍ في البطاقة. الرصيد المتاح: ${formatCurrency(card.balance)}`)
      return
    }

    // Check daily limit
    if ((card.dailyUsed ?? 0) + totalAmount > (card.dailyLimit ?? Infinity)) {
      const remaining = (card.dailyLimit ?? 0) - (card.dailyUsed ?? 0)
      toast.error(`تجاوز الحد اليومي. المتبقي: ${formatCurrency(remaining)}`)
      return
    }

    // Check monthly limit
    if ((card.monthlyUsed ?? 0) + totalAmount > (card.monthlyLimit ?? Infinity)) {
      const remaining = (card.monthlyLimit ?? 0) - (card.monthlyUsed ?? 0)
      toast.error(`تجاوز الحد الشهري. المتبقي: ${formatCurrency(remaining)}`)
      return
    }

    // Check transaction limit
    if (totalAmount > (card.transactionLimit ?? Infinity)) {
      toast.error(`تجاوز حد المعاملة الواحدة: ${formatCurrency(card.transactionLimit ?? 0)}`)
      return
    }

    // Add purchase
    addPurchase(
      card.id,
      amount,
      formData.merchantName,
      formData.category
    )

    toast.success(
      `تم تسجيل الشراء بنجاح`,
      `${formatCurrency(amount)} من ${formData.merchantName}`
    )

    // Reset form
    setFormData({
      amount: '',
      merchantName: '',
      category: '',
      description: '',
    })

    onOpenChange(false)
  }

  const amount = parseFloat(formData.amount) || 0
  const fee = amount * ((card.purchaseFee ?? 0) / 100)
  const totalAmount = amount + fee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            تسجيل شراء
          </DialogTitle>
          <DialogDescription>
            تسجيل عملية شراء من {card.cardName}
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
              <span className="font-medium">{formatCurrency((card.dailyLimit ?? 0) - (card.dailyUsed ?? 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الحد الشهري المتبقي:</span>
              <span className="font-medium">{formatCurrency((card.monthlyLimit ?? 0) - (card.monthlyUsed ?? 0))}</span>
            </div>
          </div>

          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ الشراء *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={Math.min(card.balance, card.transactionLimit ?? Infinity)}
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
                {(card.purchaseFee ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>رسوم الشراء ({card.purchaseFee ?? 0}%):</span>
                    <span className="text-red-600">+ {formatCurrency(fee ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>إجمالي المخصوم:</span>
                  <span className="text-red-600">- {formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>الرصيد بعد الشراء:</span>
                  <span>{formatCurrency(card.balance - totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* اسم التاجر */}
          <div className="space-y-2">
            <Label htmlFor="merchantName">اسم التاجر/المتجر *</Label>
            <div className="relative">
              <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="merchantName"
                type="text"
                placeholder="مثال: كارفور، أمازون، سبينس..."
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                className="pr-10"
                required
              />
            </div>
          </div>

          {/* الفئة */}
          <div className="space-y-2">
            <Label htmlFor="category">الفئة *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
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
              {totalAmount > (card.transactionLimit ?? Infinity) && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>تجاوز حد المعاملة الواحدة ({formatCurrency(card.transactionLimit ?? 0)})</span>
                </div>
              )}
              {(card.dailyUsed ?? 0) + totalAmount > (card.dailyLimit ?? Infinity) && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-700 dark:text-orange-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>تجاوز الحد اليومي</span>
                </div>
              )}
            </>
          )}

          {/* الوصف */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea
              id="description"
              placeholder="أضف تفاصيل عن المشتريات..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              تأكيد الشراء
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

