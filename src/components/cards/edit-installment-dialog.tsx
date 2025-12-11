'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Edit, Calculator, AlertCircle } from 'lucide-react'

interface EditInstallmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  installment: any
  onSave?: (updatedInstallment: any) => void
}

export function EditInstallmentDialog({ open, onOpenChange, installment, onSave }: EditInstallmentDialogProps) {
  const [formData, setFormData] = useState({
    totalMonths: '',
    paidMonths: '',
    interestRate: '',
    administrativeFees: '',
    status: 'active',
  })

  // تحميل البيانات عند فتح النافذة
  useEffect(() => {
    if (installment && open) {
      setFormData({
        totalMonths: (installment.totalMonths || 12).toString(),
        paidMonths: (installment.paidMonths || 0).toString(),
        interestRate: (installment.interestRate || 0).toString(),
        administrativeFees: (installment.administrativeFees || 0).toString(),
        status: installment.status || 'active',
      })
    }
  }, [installment, open])

  // الحسابات التلقائية
  const totalAmount = installment?.totalAmount || 0
  const totalMonths = parseInt(formData.totalMonths) || installment?.totalMonths || 12
  const paidMonths = parseInt(formData.paidMonths) || 0
  const remainingMonths = totalMonths - paidMonths
  const interestRate = parseFloat(formData.interestRate) || 0
  const adminFees = parseFloat(formData.administrativeFees) || 0

  // حساب الفائدة الإجمالية
  const totalInterest = (totalAmount * interestRate / 100)
  // المبلغ بعد الفائدة
  const amountWithInterest = totalAmount + totalInterest
  // القسط الشهري الأساسي
  const baseMonthlyPayment = amountWithInterest / totalMonths
  // القسط الأول (مع المصاريف الإدارية)
  const firstPayment = baseMonthlyPayment + adminFees
  // التكلفة الإجمالية
  const totalCost = totalAmount + totalInterest + adminFees
  // الخسارة
  const loss = totalInterest + adminFees
  // نسبة الخسارة
  const lossPercentage = totalAmount > 0 ? (loss / totalAmount * 100) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!installment) return

    // حساب تاريخ الانتهاء الجديد
    const startDate = new Date(installment.startDate)
    const newEndDate = new Date(startDate)
    newEndDate.setMonth(newEndDate.getMonth() + totalMonths)

    // حساب تاريخ القسط القادم
    const nextPaymentDate = new Date(startDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + paidMonths + 1)

    const updatedInstallment = {
      ...installment,
      totalMonths: totalMonths,
      paidMonths: paidMonths,
      remainingMonths: remainingMonths,
      interestRate: interestRate,
      administrativeFees: adminFees,
      totalInterest: totalInterest,
      totalAdminFees: adminFees,
      totalCost: totalCost,
      monthlyPayment: baseMonthlyPayment,
      baseMonthlyPayment: baseMonthlyPayment,
      monthlyInterest: totalInterest / totalMonths,
      firstPayment: firstPayment,
      nextPaymentAmount: paidMonths === 0 ? firstPayment : baseMonthlyPayment,
      endDate: newEndDate.toISOString().split('T')[0],
      nextPaymentDate: remainingMonths > 0 ? nextPaymentDate.toISOString().split('T')[0] : null,
      status: formData.status,
      installmentType: interestRate > 0 ? 'with-interest' : 'no-interest',
      updatedAt: new Date().toISOString(),
    }

    if (onSave) {
      onSave(updatedInstallment)
    }

    onOpenChange(false)
  }

  if (!installment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-amber-100 dark:border-amber-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-amber-100 dark:border-amber-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Edit className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            تعديل التقسيط - {installment.merchantName}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            تعديل تفاصيل التقسيط وإعادة حساب الأقساط
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* المعلومات الأساسية (للعرض فقط) */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التاجر:</span>
                <span className="font-medium">{installment.merchantName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المبلغ الأصلي:</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">تاريخ البدء:</span>
                <span className="font-medium">{new Date(installment.startDate).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            {/* عدد الأشهر الإجمالي */}
            <div className="space-y-2">
              <Label htmlFor="totalMonths">عدد الأشهر الإجمالي *</Label>
              <Input
                id="totalMonths"
                type="number"
                min="3"
                max="60"
                value={formData.totalMonths}
                onChange={(e) => setFormData({ ...formData, totalMonths: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">من 3 إلى 60 شهر</p>
            </div>

            {/* عدد الأشهر المدفوعة */}
            <div className="space-y-2">
              <Label htmlFor="paidMonths">عدد الأشهر المدفوعة *</Label>
              <Input
                id="paidMonths"
                type="number"
                min="0"
                max={totalMonths}
                value={formData.paidMonths}
                onChange={(e) => setFormData({ ...formData, paidMonths: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                الأشهر المتبقية: {remainingMonths} شهر
              </p>
            </div>

            {/* نسبة الفائدة */}
            <div className="space-y-2">
              <Label htmlFor="interestRate">نسبة الفائدة (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                min="0"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">0 للتقسيط بدون فوائد</p>
            </div>

            {/* المصاريف الإدارية */}
            <div className="space-y-2">
              <Label htmlFor="adminFees">المصاريف الإدارية (EGP)</Label>
              <Input
                id="adminFees"
                type="number"
                step="0.01"
                min="0"
                value={formData.administrativeFees}
                onChange={(e) => setFormData({ ...formData, administrativeFees: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">تضاف للقسط الأول فقط</p>
            </div>

            {/* الحالة */}
            <div className="space-y-2">
              <Label htmlFor="status">حالة التقسيط</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ملخص الحسابات الجديدة */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5" style={{ color: '#2563eb' }} />
                <h4 className="font-semibold text-sm" style={{ color: '#2563eb' }}>
                  ملخص الحسابات الجديدة
                </h4>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبلغ الأصلي:</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>

                {interestRate > 0 && (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span>نسبة الفائدة:</span>
                      <span className="font-medium">{formatPercentage(interestRate)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>إجمالي الفائدة:</span>
                      <span className="font-medium">{formatCurrency(totalInterest)}</span>
                    </div>
                  </>
                )}

                {adminFees > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>المصاريف الإدارية:</span>
                    <span className="font-medium">{formatCurrency(adminFees)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">عدد الأشهر:</span>
                  <span className="font-medium">{totalMonths} شهر</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">الأشهر المدفوعة:</span>
                  <span className="font-medium" style={{ color: '#16a34a' }}>{paidMonths} شهر</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">الأشهر المتبقية:</span>
                  <span className="font-medium" style={{ color: '#dc2626' }}>{remainingMonths} شهر</span>
                </div>

                <div className="flex justify-between border-t pt-2" style={{ color: '#2563eb' }}>
                  <span className="font-semibold">القسط الأول:</span>
                  <span className="font-bold">{formatCurrency(firstPayment)}</span>
                </div>

                <div className="flex justify-between" style={{ color: '#2563eb' }}>
                  <span className="font-semibold">القسط الشهري (من الشهر 2):</span>
                  <span className="font-bold">{formatCurrency(baseMonthlyPayment)}</span>
                </div>

                <div className="flex justify-between border-t pt-2 text-red-600">
                  <span className="font-bold">التكلفة الإجمالية:</span>
                  <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
                </div>

                {loss > 0 && (
                  <>
                    <div className="flex justify-between text-red-600">
                      <span className="font-semibold">الخسارة:</span>
                      <span className="font-bold">{formatCurrency(loss)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span className="font-semibold">نسبة الخسارة:</span>
                      <span className="font-bold">{formatPercentage(lossPercentage)}</span>
                    </div>
                  </>
                )}
              </div>

              {(interestRate > 0 || adminFees > 0) && (
                <div className="flex items-start gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded text-xs mt-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-700 dark:text-amber-200">
                      ملاحظة هامة:
                    </p>
                    {adminFees > 0 && (
                      <p className="text-foreground">
                        • المصاريف الإدارية ({formatCurrency(adminFees)}) تُخصم في القسط الأول فقط
                      </p>
                    )}
                    <p className="text-foreground">
                      • سيتم إعادة حساب جميع الأقساط بناءً على البيانات الجديدة
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              <Edit className="h-4 w-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

