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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard } from 'lucide-react'
import { getLastFourDigits } from '@/lib/utils'
import { useCards } from '@/contexts/cards-context'
import { toast } from '@/lib/toast'

const cardSchema = z.object({
  name: z.string().min(1, 'اسم البطاقة مطلوب'),
  bankName: z.string().min(1, 'اسم البنك مطلوب'),
  cardNumber: z.string().min(13, 'رقم البطاقة يجب أن يكون 13-19 رقم').max(19, 'رقم البطاقة يجب أن يكون 13-19 رقم'),
  cardType: z.enum(['visa', 'mastercard', 'amex', 'other']),
  cardTier: z.enum(['classic', 'gold', 'platinum', 'titanium', 'black']),
  creditLimit: z.number().min(1, 'الحد الائتماني يجب أن يكون أكبر من صفر'),
  cashbackRate: z.number().min(0).max(10, 'نسبة الكاش باك يجب أن تكون بين 0 و 10'),
  dueDate: z.number().min(1, 'تاريخ السداد يجب أن يكون بين 1 و 31').max(31, 'تاريخ السداد يجب أن يكون بين 1 و 31'),
  // Card Holder Info
  holderFullName: z.string().min(1, 'اسم صاحب البطاقة مطلوب'),
  holderPhone: z.string().min(1, 'رقم الهاتف مطلوب'),
  holderEmail: z.string().email('البريد الإلكتروني غير صحيح'),
  holderNationalId: z.string().min(14, 'الرقم القومي يجب أن يكون 14 رقم').max(14, 'الرقم القومي يجب أن يكون 14 رقم'),
  holderAddress: z.string().min(1, 'العنوان مطلوب'),
})

type CardFormData = z.infer<typeof cardSchema>

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddCardDialog({ open, onOpenChange, onSuccess }: AddCardDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { addCard } = useCards()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cashbackRate: 0,
      dueDate: 1,
      cardTier: 'classic',
    },
  })

  const cardType = watch('cardType')
  const cardTier = watch('cardTier')

  const onSubmit = async (data: CardFormData) => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      addCard({
        name: data.name,
        bankName: data.bankName,
        cardNumberLastFour: getLastFourDigits(data.cardNumber),
        cardType: data.cardType,
        cardTier: data.cardTier,
        creditLimit: data.creditLimit,
        currentBalance: 0,
        cashbackRate: data.cashbackRate,
        dueDate: data.dueDate,
        isActive: true,
        holderInfo: {
          fullName: data.holderFullName,
          phoneNumber: data.holderPhone,
          email: data.holderEmail,
          nationalId: data.holderNationalId,
          address: data.holderAddress,
        },
      })

      toast.success('تم إضافة البطاقة بنجاح')
      reset()
      onSuccess()
    } catch (err) {
      setError('حدث خطأ أثناء إضافة البطاقة')
      toast.error('فشل في إضافة البطاقة')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-blue-100 dark:border-blue-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            إضافة بطاقة ائتمانية جديدة
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            أدخل تفاصيل بطاقتك الائتمانية لإضافتها إلى حسابك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">اسم البطاقة</Label>
            <Input
              id="name"
              placeholder="مثال: بطاقة الراجحي الذهبية"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName">اسم البنك</Label>
            <Input
              id="bankName"
              placeholder="مثال: بنك الراجحي"
              {...register('bankName')}
            />
            {errors.bankName && (
              <p className="text-sm text-destructive">{errors.bankName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">رقم البطاقة</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              {...register('cardNumber')}
            />
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardType">نوع البطاقة</Label>
              <Select onValueChange={(value) => setValue('cardType', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع البطاقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              {errors.cardType && (
                <p className="text-sm text-destructive">{errors.cardType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardTier">فئة البطاقة</Label>
              <Select onValueChange={(value) => setValue('cardTier', value as any)} defaultValue="classic">
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة البطاقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">كلاسيكية (Classic)</SelectItem>
                  <SelectItem value="gold">ذهبية (Gold)</SelectItem>
                  <SelectItem value="platinum">بلاتينية (Platinum)</SelectItem>
                  <SelectItem value="titanium">تيتانيوم (Titanium)</SelectItem>
                  <SelectItem value="black">سوداء (Black)</SelectItem>
                </SelectContent>
              </Select>
              {errors.cardTier && (
                <p className="text-sm text-destructive">{errors.cardTier.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditLimit">الحد الائتماني (ج.م)</Label>
              <Input
                id="creditLimit"
                type="number"
                placeholder="50000"
                {...register('creditLimit', { valueAsNumber: true })}
              />
              {errors.creditLimit && (
                <p className="text-sm text-destructive">{errors.creditLimit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashbackRate">نسبة الكاش باك (%)</Label>
              <Input
                id="cashbackRate"
                type="number"
                step="0.1"
                placeholder="2.5"
                {...register('cashbackRate', { valueAsNumber: true })}
              />
              {errors.cashbackRate && (
                <p className="text-sm text-destructive">{errors.cashbackRate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">تاريخ السداد (يوم من الشهر)</Label>
            <Input
              id="dueDate"
              type="number"
              min="1"
              max="31"
              placeholder="15"
              {...register('dueDate', { valueAsNumber: true })}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Card Holder Information Section */}
          <div className="pt-4 border-t border-blue-100 dark:border-blue-900/30">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">معلومات صاحب البطاقة</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holderFullName">الاسم الكامل</Label>
                <Input
                  id="holderFullName"
                  placeholder="أدخل الاسم الكامل"
                  {...register('holderFullName')}
                />
                {errors.holderFullName && (
                  <p className="text-sm text-destructive">{errors.holderFullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="holderPhone">رقم الهاتف</Label>
                  <Input
                    id="holderPhone"
                    placeholder="+20 100 123 4567"
                    {...register('holderPhone')}
                  />
                  {errors.holderPhone && (
                    <p className="text-sm text-destructive">{errors.holderPhone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderEmail">البريد الإلكتروني</Label>
                  <Input
                    id="holderEmail"
                    type="email"
                    placeholder="example@email.com"
                    {...register('holderEmail')}
                  />
                  {errors.holderEmail && (
                    <p className="text-sm text-destructive">{errors.holderEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderNationalId">الرقم القومي</Label>
                <Input
                  id="holderNationalId"
                  placeholder="29012011234567"
                  maxLength={14}
                  {...register('holderNationalId')}
                />
                {errors.holderNationalId && (
                  <p className="text-sm text-destructive">{errors.holderNationalId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderAddress">العنوان</Label>
                <Input
                  id="holderAddress"
                  placeholder="المدينة، الحي، الشارع"
                  {...register('holderAddress')}
                />
                {errors.holderAddress && (
                  <p className="text-sm text-destructive">{errors.holderAddress.message}</p>
                )}
              </div>
            </div>
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
              إضافة البطاقة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
