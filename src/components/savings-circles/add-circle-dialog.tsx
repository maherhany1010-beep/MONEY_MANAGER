'use client'

import { useState } from 'react'
import { Plus, X, AlertCircle, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useSavingsCircles } from '@/contexts/savings-circles-context'
import type { CircleFormData, CircleRole, CircleType, FeeType, PaymentMethod } from '@/types/savings-circles'

interface AddCircleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCircleDialog({ open, onOpenChange }: AddCircleDialogProps) {
  const { addCircle } = useSavingsCircles()
  const [error, setError] = useState<string>('')

  const [formData, setFormData] = useState<CircleFormData>({
    name: '',
    description: '',
    type: 'personal',
    role: 'member',
    monthlyAmount: '',
    totalMembers: '',
    duration: '',
    startDate: new Date().toISOString().split('T')[0],
    hasFees: false,
    managementFee: '',
    feeType: 'monthly',
    lateFee: '',
    earlyWithdrawalFee: '',
    paymentMethod: 'cash',
    linkedAccountId: '',
    myTurnNumber: '',
    appName: '',
    appAccountId: '',
    members: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // التحقق من البيانات
    if (!formData.name.trim()) {
      setError('الرجاء إدخال اسم الجمعية')
      return
    }

    if (!formData.monthlyAmount || parseFloat(formData.monthlyAmount) <= 0) {
      setError('الرجاء إدخال مبلغ شهري صحيح')
      return
    }

    if (!formData.totalMembers || parseInt(formData.totalMembers) < 2) {
      setError('عدد الأعضاء يجب أن يكون 2 على الأقل')
      return
    }

    if (!formData.duration || parseInt(formData.duration) < 2) {
      setError('المدة يجب أن تكون شهرين على الأقل')
      return
    }

    if (formData.role === 'member' && formData.myTurnNumber) {
      const turnNumber = parseInt(formData.myTurnNumber)
      const totalMembers = parseInt(formData.totalMembers)
      if (turnNumber < 1 || turnNumber > totalMembers) {
        setError(`رقم الدور يجب أن يكون بين 1 و ${totalMembers}`)
        return
      }
    }

    if (formData.type === 'app-based' && !formData.appName?.trim()) {
      setError('الرجاء إدخال اسم التطبيق')
      return
    }

    setIsSubmitting(true)

    try {
      // حساب إجمالي الرسوم
      const managementFee = parseFloat(formData.managementFee || '0')
      const totalMembers = parseInt(formData.totalMembers)
      const duration = parseInt(formData.duration)
      let totalFees = 0

      if (formData.hasFees && managementFee > 0) {
        if (formData.feeType === 'monthly') {
          // رسوم شهرية × عدد الأعضاء × عدد الأشهر
          totalFees = managementFee * totalMembers * duration
        } else {
          // رسوم لمرة واحدة فقط
          totalFees = managementFee
        }
      }

      const result = await addCircle({
        circle_name: formData.name,
        total_amount: parseFloat(formData.monthlyAmount) * totalMembers,
        monthly_payment: parseFloat(formData.monthlyAmount),
        start_date: formData.startDate,
        end_date: null,
        status: 'active',
        // Legacy fields
        name: formData.name,
        description: formData.description,
        type: formData.type,
        role: formData.role,
        monthlyAmount: parseFloat(formData.monthlyAmount),
        totalMembers: totalMembers,
        duration: duration,
        startDate: formData.startDate,
        hasFees: formData.hasFees,
        managementFee: managementFee,
        feeType: formData.feeType,
        paymentMethod: formData.paymentMethod,
        myTurnNumber: formData.myTurnNumber ? parseInt(formData.myTurnNumber) : undefined,
        appName: formData.appName,
        appAccountId: formData.appAccountId,
        totalFees: totalFees,
        currentBalance: 0,
        currentRound: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      if (result) {
        onOpenChange(false)
        // إعادة تعيين النموذج
        setFormData({
          name: '',
          description: '',
          type: 'personal',
          role: 'member',
          monthlyAmount: '',
          totalMembers: '',
          duration: '',
          startDate: new Date().toISOString().split('T')[0],
          hasFees: false,
          managementFee: '',
          feeType: 'monthly',
          lateFee: '',
          earlyWithdrawalFee: '',
          paymentMethod: 'cash',
          linkedAccountId: '',
          myTurnNumber: '',
          appName: '',
          appAccountId: '',
          members: [],
        })
      } else {
        setError('حدث خطأ أثناء إضافة الجمعية. تحقق من الـ Console للتفاصيل.')
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError('حدث خطأ غير متوقع أثناء إضافة الجمعية')
    } finally {
      setIsSubmitting(false)
    }
  }

  // دالة تنسيق العملة بالأرقام اللاتينية
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
  }

  // حساب المبلغ الكلي
  const totalAmount = formData.monthlyAmount && formData.totalMembers
    ? parseFloat(formData.monthlyAmount) * parseInt(formData.totalMembers)
    : 0

  // حساب المبلغ الصافي للعضو بعد الرسوم
  const netAmountForMember = formData.role === 'member' && formData.hasFees && formData.managementFee
    ? totalAmount - (formData.feeType === 'one-time'
        ? parseFloat(formData.managementFee)
        : parseFloat(formData.managementFee) * parseInt(formData.totalMembers || '0'))
    : totalAmount

  // حساب العمولة الشهرية للمدير
  const monthlyCommission = formData.role === 'manager' && formData.hasFees && formData.managementFee && formData.feeType === 'monthly'
    ? parseFloat(formData.managementFee) * parseInt(formData.totalMembers || '0')
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b-2 border-blue-200 dark:border-blue-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-l from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                إضافة جمعية جديدة
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                أضف جمعية مالية جديدة وحدد دورك فيها
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* رسالة الخطأ */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* المعلومات الأساسية */}
          <div className="space-y-5 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 border-2 border-blue-400 dark:border-blue-600 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">المعلومات الأساسية</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-white font-semibold text-base">
                  اسم الجمعية *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: جمعية الأصدقاء 2025"
                  required
                  className="h-12 bg-white dark:bg-gray-950 border-blue-300 dark:border-blue-700 text-foreground text-base font-semibold"
                  dir="rtl"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-white font-semibold text-base">
                  دورك في الجمعية *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: CircleRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="role" className="h-12 bg-white dark:bg-gray-950 border-blue-300 dark:border-blue-700 text-base font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">عضو (مشترك)</SelectItem>
                    <SelectItem value="manager">مدير (منظم)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-white font-semibold text-base">
                وصف الجمعية (اختياري)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أضف وصفاً للجمعية..."
                rows={2}
                className="resize-none bg-white dark:bg-gray-950 border-blue-300 dark:border-blue-700 text-foreground text-base"
                dir="rtl"
              />
            </div>
          </div>

          {/* نوع الجمعية */}
          <div className="space-y-5 p-6 bg-gradient-to-br from-purple-600 to-pink-700 dark:from-purple-700 dark:to-pink-800 border-2 border-purple-400 dark:border-purple-600 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">نوع الجمعية</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="type" className="text-white font-semibold text-base">
                  {formData.role === 'member' ? 'مشترك مع' : 'نوع الجمعية'} *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: CircleType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type" className="h-12 bg-white dark:bg-gray-950 border-purple-300 dark:border-purple-700 text-base font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">
                      {formData.role === 'member' ? '👥 شخص (صديق/قريب/زميل)' : '👥 جمعية شخصية'}
                    </SelectItem>
                    <SelectItem value="app-based">
                      {formData.role === 'member' ? '📱 تطبيق (MoneyFellows, Gam3eety, إلخ)' : '📱 جمعية عبر تطبيق'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'app-based' && (
                <div className="space-y-3">
                  <Label htmlFor="appName" className="text-white font-semibold text-base">
                    اسم التطبيق *
                  </Label>
                  <Input
                    id="appName"
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    placeholder="مثال: MoneyFellows"
                    className="h-12 bg-white dark:bg-gray-950 border-purple-300 dark:border-purple-700 text-foreground text-base font-semibold"
                    dir="rtl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* التفاصيل المالية */}
          <div className="space-y-5 p-6 bg-gradient-to-br from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800 border-2 border-green-400 dark:border-green-600 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md">
                <Info className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">التفاصيل المالية</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-3">
                <Label htmlFor="monthlyAmount" className="text-white font-semibold text-base">
                  المبلغ الشهري (لكل عضو) *
                </Label>
                <div className="relative" dir="ltr">
                  <Input
                    id="monthlyAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.monthlyAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="pl-16 pr-4 h-12 bg-white dark:bg-gray-950 border-green-300 dark:border-green-700 text-foreground text-right text-base font-semibold"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-green-700 dark:text-green-300 pointer-events-none">
                    EGP
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="totalMembers" className="text-white font-semibold text-base">
                  عدد الأعضاء *
                </Label>
                <Input
                  id="totalMembers"
                  type="number"
                  min="2"
                  value={formData.totalMembers}
                  onChange={(e) => {
                    setFormData({ ...formData, totalMembers: e.target.value, duration: e.target.value })
                  }}
                  placeholder="مثال: 10"
                  required
                  className="h-12 bg-white dark:bg-gray-950 border-green-300 dark:border-green-700 text-foreground text-base font-semibold"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="duration" className="text-white font-semibold text-base">
                  المدة (بالأشهر) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="2"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="مثال: 10"
                  required
                  className="h-12 bg-white dark:bg-gray-950 border-green-300 dark:border-green-700 text-foreground text-base font-semibold"
                />
              </div>
            </div>

            {totalAmount > 0 && (
              <div className="p-4 bg-white/95 dark:bg-gray-900/90 rounded-lg border-2 border-white/50 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-green-900 dark:text-green-200 font-semibold text-base">المبلغ الكلي (شهرياً):</span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-white font-semibold text-base">
                  تاريخ البداية *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="h-12 bg-white dark:bg-gray-950 border-green-300 dark:border-green-700 text-foreground text-base font-semibold"
                />
              </div>

              {formData.role === 'member' && (
                <div className="space-y-3">
                  <Label htmlFor="myTurnNumber" className="text-white font-semibold text-base">
                    رقم دورك (اختياري)
                  </Label>
                  <Input
                    id="myTurnNumber"
                    type="number"
                    min="1"
                    max={formData.totalMembers || undefined}
                    value={formData.myTurnNumber}
                    onChange={(e) => setFormData({ ...formData, myTurnNumber: e.target.value })}
                    placeholder={`من 1 إلى ${formData.totalMembers || '...'}`}
                    className="h-12 bg-white dark:bg-gray-950 border-green-300 dark:border-green-700 text-foreground text-base font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* الرسوم */}
          <div className="space-y-5 p-6 bg-gradient-to-br from-orange-600 to-red-700 dark:from-orange-700 dark:to-red-800 border-2 border-orange-400 dark:border-orange-600 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shadow-md">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {formData.role === 'manager' ? 'العمولة الإدارية' : 'الرسوم'}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="hasFees" className="text-white font-semibold text-base">
                  {formData.role === 'manager' ? 'هل توجد عمولة؟' : 'هل توجد رسوم؟'}
                </Label>
                <Switch
                  id="hasFees"
                  checked={formData.hasFees}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasFees: checked })}
                />
              </div>
            </div>

            {formData.hasFees && (
              <>
                {/* توضيح طبيعة الرسوم */}
                <div className="p-4 bg-white/95 dark:bg-gray-900/90 rounded-lg border-2 border-white/50 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      {formData.role === 'manager' ? (
                        <>
                          <p className="text-sm font-bold text-green-700 dark:text-green-300">
                            ✅ العمولة = دخل إضافي لك
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ستحصل على عمولة من كل عضو كدخل إضافي مقابل إدارة الجمعية
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-red-700 dark:text-red-300">
                            ❌ الرسوم = خصم من المبلغ المستلم
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ستدفع رسوم إضافية للمدير أو التطبيق، وسيتم خصمها من المبلغ الذي تستلمه
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="managementFee" className="text-white font-semibold text-base">
                      {formData.role === 'manager' ? 'العمولة *' : 'الرسوم *'}
                    </Label>
                    <div className="relative" dir="ltr">
                      <Input
                        id="managementFee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.managementFee}
                        onChange={(e) => setFormData({ ...formData, managementFee: e.target.value })}
                        placeholder="0.00"
                        className="pl-16 pr-4 h-12 bg-white dark:bg-gray-950 border-orange-300 dark:border-orange-700 text-gray-900 dark:text-gray-100 text-right text-base font-semibold"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-orange-700 dark:text-orange-300 pointer-events-none">
                        EGP
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="feeType" className="text-white font-semibold text-base">
                      نوع {formData.role === 'manager' ? 'العمولة' : 'الرسوم'} *
                    </Label>
                    <Select
                      value={formData.feeType}
                      onValueChange={(value: FeeType) => setFormData({ ...formData, feeType: value })}
                    >
                      <SelectTrigger id="feeType" className="h-12 bg-white dark:bg-gray-950 border-orange-300 dark:border-orange-700 text-base font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">شهرية (لكل عضو كل شهر)</SelectItem>
                        <SelectItem value="one-time">لمرة واحدة (عند الاستلام)</SelectItem>
                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* عرض الحسابات */}
                {formData.managementFee && parseFloat(formData.managementFee) > 0 && (
                  <div className="p-4 bg-white/95 dark:bg-gray-900/90 rounded-lg border-2 border-white/50 dark:border-gray-700 space-y-3">
                    {formData.role === 'manager' && formData.feeType === 'monthly' && monthlyCommission > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-green-900 dark:text-green-200 font-semibold text-base">
                          💰 دخلك الشهري من العمولات:
                        </span>
                        <span className="text-xl font-bold text-green-700 dark:text-green-300">
                          {formatCurrency(monthlyCommission)}
                        </span>
                      </div>
                    )}
                    {formData.role === 'member' && netAmountForMember > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-orange-900 dark:text-orange-200 font-semibold text-base">
                          💵 المبلغ الصافي الذي ستستلمه:
                        </span>
                        <span className="text-xl font-bold text-orange-700 dark:text-orange-300">
                          {formatCurrency(netAmountForMember)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin ml-2">⏳</span>
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة الجمعية
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-12 px-8 text-base font-semibold border-2"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

