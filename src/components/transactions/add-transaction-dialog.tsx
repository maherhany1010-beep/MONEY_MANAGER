'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowRightLeft } from 'lucide-react'
import { generateId } from '@/lib/utils'

const transactionSchema = z.object({
  cardId: z.string().min(1, 'يجب اختيار البطاقة'),
  type: z.enum(['withdrawal', 'deposit', 'payment']),
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر'),
  description: z.string().min(1, 'وصف المعاملة مطلوب'),
  category: z.string().min(1, 'الفئة مطلوبة'),
  transactionDate: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (transaction: any) => void
}

// Mock cards data
const mockCards = [
  { id: '1', name: 'بطاقة الراجحي الذهبية' },
  { id: '2', name: 'بطاقة الأهلي البلاتينية' },
  { id: '3', name: 'بطاقة سامبا الكلاسيكية' },
]

const categories = [
  'طعام ومشروبات',
  'وقود',
  'تسوق',
  'ترفيه',
  'صحة',
  'تعليم',
  'مواصلات',
  'فواتير',
  'سداد',
  'أخرى',
]

export function AddTransactionDialog({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
    },
  })

  const selectedType = watch('type')

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const selectedCard = mockCards.find(card => card.id === data.cardId)

      const newTransaction = {
        id: generateId(),
        cardId: data.cardId,
        cardName: selectedCard?.name || 'بطاقة غير معروفة',
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        transactionDate: data.transactionDate || new Date().toISOString(),
      }

      onSuccess(newTransaction)
      reset()
    } catch (err) {
      setError('حدث خطأ أثناء إضافة المعاملة')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-fuchsia-100 dark:border-fuchsia-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-fuchsia-100 dark:border-fuchsia-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            إضافة معاملة جديدة
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            أدخل تفاصيل المعاملة المالية الجديدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardId">البطاقة</Label>
            <Select onValueChange={(value) => setValue('cardId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر البطاقة" />
              </SelectTrigger>
              <SelectContent>
                {mockCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cardId && (
              <p className="text-sm text-destructive">{errors.cardId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع المعاملة</Label>
            <Select onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="withdrawal">سحب / مصروف</SelectItem>
                <SelectItem value="payment">سداد</SelectItem>
                <SelectItem value="deposit">إيداع</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ (ريال)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المعاملة</Label>
            <Input
              id="description"
              placeholder="مثال: سوبر ماركت العثيم"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">الفئة</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionDate">تاريخ المعاملة</Label>
            <Input
              id="transactionDate"
              type="date"
              {...register('transactionDate')}
            />
            {errors.transactionDate && (
              <p className="text-sm text-destructive">{errors.transactionDate.message}</p>
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
              إضافة المعاملة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
