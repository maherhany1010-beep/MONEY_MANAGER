'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency, generateId } from '@/lib/utils'

const paymentSchema = z.object({
  cardId: z.string().min(1, 'يجب اختيار البطاقة'),
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر'),
  dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  paymentMethod: z.enum(['auto', 'manual']),
  reminderEnabled: z.boolean().default(true),
  reminderDays: z.number().min(1).max(30).default(3),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface AddPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (payment: any) => void
}

// Mock cards data
const mockCards = [
  { 
    id: '1', 
    name: 'بطاقة الراجحي الذهبية',
    currentBalance: 12500.00,
    creditLimit: 25000.00,
    minimumPayment: 625.00
  },
  { 
    id: '2', 
    name: 'بطاقة الأهلي البلاتينية',
    currentBalance: 8750.00,
    creditLimit: 20000.00,
    minimumPayment: 437.50
  },
  { 
    id: '3', 
    name: 'بطاقة سامبا الكلاسيكية',
    currentBalance: 3200.00,
    creditLimit: 15000.00,
    minimumPayment: 160.00
  },
]

export function AddPaymentDialog({ open, onOpenChange, onSuccess }: AddPaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState<typeof mockCards[0] | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      reminderEnabled: true,
      reminderDays: 3,
      paymentMethod: 'manual',
    },
  })

  const watchedCardId = watch('cardId')
  const watchedAmount = watch('amount')
  const watchedReminderEnabled = watch('reminderEnabled')

  // Update selected card when cardId changes
  React.useEffect(() => {
    if (watchedCardId) {
      const card = mockCards.find(c => c.id === watchedCardId)
      setSelectedCard(card || null)
      if (card) {
        setValue('amount', card.currentBalance)
      }
    }
  }, [watchedCardId, setValue])

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newPayment = {
        id: generateId(),
        cardId: data.cardId,
        cardName: selectedCard?.name || 'بطاقة غير معروفة',
        amount: data.amount,
        dueDate: data.dueDate,
        status: 'pending',
        minimumAmount: selectedCard?.minimumPayment || 0,
        currentBalance: selectedCard?.currentBalance || 0,
        paymentMethod: data.paymentMethod,
        reminderSent: false,
      }

      onSuccess(newPayment)
      reset()
      setSelectedCard(null)
    } catch (err) {
      setError('حدث خطأ أثناء إضافة الدفعة')
    } finally {
      setIsLoading(false)
    }
  }

  const setFullAmount = () => {
    if (selectedCard) {
      setValue('amount', selectedCard.currentBalance)
    }
  }

  const setMinimumAmount = () => {
    if (selectedCard) {
      setValue('amount', selectedCard.minimumPayment)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-emerald-100 dark:border-emerald-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-emerald-100 dark:border-emerald-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            إضافة دفعة جديدة
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            أدخل تفاصيل الدفعة الجديدة للبطاقة الائتمانية
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Card Selection */}
          <div className="space-y-2">
            <Label htmlFor="cardId">البطاقة الائتمانية</Label>
            <Select onValueChange={(value) => setValue('cardId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر البطاقة" />
              </SelectTrigger>
              <SelectContent>
                {mockCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {card.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cardId && (
              <p className="text-sm text-destructive">{errors.cardId.message}</p>
            )}
          </div>

          {/* Card Details */}
          {selectedCard && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">تفاصيل البطاقة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الرصيد الحالي:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(selectedCard.currentBalance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الحد الأدنى للسداد:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedCard.minimumPayment)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الحد الائتماني:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedCard.creditLimit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ الدفعة (ريال)</Label>
            <div className="space-y-2">
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {selectedCard && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={setMinimumAmount}
                  >
                    الحد الأدنى ({formatCurrency(selectedCard.minimumPayment)})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={setFullAmount}
                  >
                    المبلغ الكامل ({formatCurrency(selectedCard.currentBalance)})
                  </Button>
                </div>
              )}
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <Select onValueChange={(value) => setValue('paymentMethod', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">دفع يدوي</SelectItem>
                <SelectItem value="auto">دفع تلقائي</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminderEnabled"
                checked={watchedReminderEnabled}
                onCheckedChange={(checked) => setValue('reminderEnabled', !!checked)}
              />
              <Label htmlFor="reminderEnabled" className="text-sm font-medium">
                تفعيل التذكيرات
              </Label>
            </div>

            {watchedReminderEnabled && (
              <div className="space-y-2 mr-6">
                <Label htmlFor="reminderDays">التذكير قبل (أيام)</Label>
                <Select onValueChange={(value) => setValue('reminderDays', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عدد الأيام" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">يوم واحد</SelectItem>
                    <SelectItem value="3">3 أيام</SelectItem>
                    <SelectItem value="7">أسبوع</SelectItem>
                    <SelectItem value="14">أسبوعين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إضافة الدفعة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
