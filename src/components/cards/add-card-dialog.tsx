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
import {
  Loader2,
  CreditCard,
  Building2,
  Hash,
  Percent,
  Calendar,
  User,
  Phone,
  Mail,
  IdCard,
  MapPin,
  Wallet,
  Info,
} from 'lucide-react'
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
  initialBalance: z.number().min(0, 'المديونية المبدئية يجب أن تكون صفر أو أكبر').optional(),
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
      initialBalance: 0,
    },
  })

  const cardType = watch('cardType')
  const cardTier = watch('cardTier')

  const onSubmit = async (data: CardFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const initialBalance = data.initialBalance || 0
      const result = await addCard({
        card_name: data.name,
        bank_name: data.bankName,
        card_number_last_four: getLastFourDigits(data.cardNumber),
        card_type: data.cardType,
        credit_limit: data.creditLimit,
        current_balance: initialBalance,
        available_credit: data.creditLimit - initialBalance,
        due_date: data.dueDate,
        minimum_payment: 0,
        interest_rate: 0,
        status: 'active',
      })

      if (result) {
        toast.success('تم إضافة البطاقة بنجاح')
        reset()
        onSuccess()
      } else {
        setError('فشل في إضافة البطاقة')
        toast.error('فشل في إضافة البطاقة')
      }
    } catch (err) {
      console.error('Error in onSubmit:', err)
      setError('حدث خطأ أثناء إضافة البطاقة')
      toast.error('فشل في إضافة البطاقة')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-5">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              إضافة بطاقة ائتمانية جديدة
            </span>
          </DialogTitle>
          <DialogDescription className="text-base mt-2 mr-12 opacity-90">
            أدخل تفاصيل بطاقتك الائتمانية لإضافتها إلى حسابك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* قسم معلومات البطاقة الأساسية */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
              <h3 className="text-lg font-semibold">
                معلومات البطاقة الأساسية
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                اسم البطاقة
              </Label>
              <Input
                id="name"
                placeholder="مثال: بطاقة الراجحي الذهبية"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName" className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                اسم البنك
              </Label>
              <Input
                id="bankName"
                placeholder="مثال: بنك الراجحي"
                {...register('bankName')}
              />
              {errors.bankName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {errors.bankName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                رقم البطاقة
              </Label>
              <Input
                id="cardNumber"
                placeholder="3456 9012 5678 1234"
                className="font-mono tracking-wider"
                {...register('cardNumber')}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {errors.cardNumber.message}
                </p>
              )}
              <p className="text-xs opacity-70 flex items-center gap-1">
                <Info className="h-3 w-3" />
                سيتم حفظ آخر 4 أرقام فقط لأسباب أمنية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardType" className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  نوع البطاقة
                </Label>
                <Select onValueChange={(value) => setValue('cardType', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع البطاقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">
                      <span className="flex items-center gap-2">
                        💳 Visa
                      </span>
                    </SelectItem>
                    <SelectItem value="mastercard">
                      <span className="flex items-center gap-2">
                        💳 Mastercard
                      </span>
                    </SelectItem>
                    <SelectItem value="amex">
                      <span className="flex items-center gap-2">
                        💳 American Express
                      </span>
                    </SelectItem>
                    <SelectItem value="other">
                      <span className="flex items-center gap-2">
                        💳 أخرى
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.cardType && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.cardType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardTier" className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  فئة البطاقة
                </Label>
                <Select onValueChange={(value) => setValue('cardTier', value as any)} defaultValue="classic">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة البطاقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">
                      <span className="flex items-center gap-2">
                        ⚪ كلاسيكية (Classic)
                      </span>
                    </SelectItem>
                    <SelectItem value="gold">
                      <span className="flex items-center gap-2">
                        🟡 ذهبية (Gold)
                      </span>
                    </SelectItem>
                    <SelectItem value="platinum">
                      <span className="flex items-center gap-2">
                        ⚪ بلاتينية (Platinum)
                      </span>
                    </SelectItem>
                    <SelectItem value="titanium">
                      <span className="flex items-center gap-2">
                        ⚫ تيتانيوم (Titanium)
                      </span>
                    </SelectItem>
                    <SelectItem value="black">
                      <span className="flex items-center gap-2">
                        ⬛ سوداء (Black)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.cardTier && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.cardTier.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* قسم الحدود والمزايا */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                الحدود والمزايا المالية
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditLimit" className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  الحد الائتماني (ج.م)
                </Label>
                <Input
                  id="creditLimit"
                  type="number"
                  placeholder="50000"
                  {...register('creditLimit', { valueAsNumber: true })}
                />
                {errors.creditLimit && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.creditLimit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialBalance" className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-orange-600" />
                  المديونية المبدئية (ج.م)
                </Label>
                <Input
                  id="initialBalance"
                  type="number"
                  placeholder="0"
                  {...register('initialBalance', { valueAsNumber: true })}
                />
                {errors.initialBalance && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.initialBalance.message}
                  </p>
                )}
                <p className="text-xs opacity-70 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  الرصيد المستحق الموجود مسبقاً على البطاقة (اختياري)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashbackRate" className="font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-emerald-600" />
                  نسبة الكاش باك (%)
                </Label>
                <Input
                  id="cashbackRate"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  {...register('cashbackRate', { valueAsNumber: true })}
                />
                {errors.cashbackRate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.cashbackRate.message}
                  </p>
                )}
                <p className="text-xs opacity-70 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  نسبة الكاش باك التي تحصل عليها من المشتريات
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  تاريخ السداد (يوم من الشهر)
                </Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  {...register('dueDate', { valueAsNumber: true })}
                />
                {errors.dueDate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.dueDate.message}
                  </p>
                )}
                <p className="text-xs opacity-70 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  اليوم من كل شهر الذي يجب فيه سداد المستحقات
                </p>
              </div>
            </div>
          </div>

          {/* قسم معلومات صاحب البطاقة */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                معلومات صاحب البطاقة
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holderFullName" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  الاسم الكامل
                </Label>
                <Input
                  id="holderFullName"
                  placeholder="أدخل الاسم الكامل"
                  className="border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                  {...register('holderFullName')}
                />
                {errors.holderFullName && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.holderFullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="holderPhone" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="holderPhone"
                    placeholder="+20 100 123 4567"
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                    {...register('holderPhone')}
                  />
                  {errors.holderPhone && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {errors.holderPhone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderEmail" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="holderEmail"
                    type="email"
                    placeholder="example@email.com"
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                    {...register('holderEmail')}
                  />
                  {errors.holderEmail && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {errors.holderEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderNationalId" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  الرقم القومي
                </Label>
                <Input
                  id="holderNationalId"
                  placeholder="29012011234567"
                  maxLength={14}
                  className="border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all font-mono tracking-wider"
                  {...register('holderNationalId')}
                />
                {errors.holderNationalId && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.holderNationalId.message}
                  </p>
                )}
                <p className="text-xs opacity-70 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  يجب أن يكون 14 رقماً
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderAddress" className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  العنوان
                </Label>
                <Input
                  id="holderAddress"
                  placeholder="المدينة، الحي، الشارع"
                  className="border-slate-300 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all"
                  {...register('holderAddress')}
                />
                {errors.holderAddress && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.holderAddress.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="min-w-[100px] border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[140px] bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <CreditCard className="ml-2 h-4 w-4" />
                  إضافة البطاقة
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
