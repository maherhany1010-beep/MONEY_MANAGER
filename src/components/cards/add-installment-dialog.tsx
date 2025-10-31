'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { CreditCard, Calculator, AlertCircle, Calendar, Percent } from 'lucide-react'
import { useMerchants } from '@/contexts/merchants-context'

interface AddInstallmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: string
  onAdd?: (installment: any) => void
}

export function AddInstallmentDialog({ open, onOpenChange, cardId, onAdd }: AddInstallmentDialogProps) {
  const { merchants } = useMerchants()
  
  const [formData, setFormData] = useState({
    merchantId: '',
    totalAmount: '',
    totalMonths: '',
    startDate: new Date().toISOString().split('T')[0],
    installmentType: 'no-interest', // 'no-interest' or 'with-interest'
    interestRate: '',
    administrativeFees: '',
  })

  const [calculatedValues, setCalculatedValues] = useState({
    baseMonthlyPayment: 0,
    monthlyInterest: 0,
    monthlyAdminFees: 0,
    finalMonthlyPayment: 0,
    totalInterest: 0,
    totalAdminFees: 0,
    totalCost: 0,
  })

  // حساب القيم تلقائياً
  useEffect(() => {
    const totalAmount = parseFloat(formData.totalAmount) || 0
    const totalMonths = parseInt(formData.totalMonths) || 1
    const interestRate = formData.installmentType === 'with-interest' ? (parseFloat(formData.interestRate) || 0) : 0
    const adminFees = formData.installmentType === 'with-interest' ? (parseFloat(formData.administrativeFees) || 0) : 0

    // القسط الشهري الأساسي
    const baseMonthlyPayment = totalAmount / totalMonths

    // الفائدة الشهرية
    const monthlyInterest = (totalAmount * interestRate / 100) / totalMonths

    // المصاريف الإدارية الشهرية
    const monthlyAdminFees = adminFees / totalMonths

    // القسط الشهري النهائي
    const finalMonthlyPayment = baseMonthlyPayment + monthlyInterest + monthlyAdminFees

    // الإجماليات
    const totalInterest = monthlyInterest * totalMonths
    const totalAdminFees = adminFees
    const totalCost = totalAmount + totalInterest + totalAdminFees

    setCalculatedValues({
      baseMonthlyPayment,
      monthlyInterest,
      monthlyAdminFees,
      finalMonthlyPayment,
      totalInterest,
      totalAdminFees,
      totalCost,
    })
  }, [formData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedMerchant = merchants.find(m => m.id === formData.merchantId)
    if (!selectedMerchant) return

    const totalAmount = parseFloat(formData.totalAmount)
    const totalMonths = parseInt(formData.totalMonths)
    const startDate = new Date(formData.startDate)

    // حساب تاريخ الانتهاء
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + totalMonths)

    // حساب تاريخ القسط القادم (الشهر القادم)
    const nextPaymentDate = new Date(startDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    const installment = {
      id: Date.now().toString(),
      cardId,
      merchantName: selectedMerchant.name ?? 'تاجر',
      merchantId: formData.merchantId,
      totalAmount,
      monthlyPayment: calculatedValues.finalMonthlyPayment,
      baseMonthlyPayment: calculatedValues.baseMonthlyPayment,
      monthlyInterest: calculatedValues.monthlyInterest,
      monthlyAdminFees: calculatedValues.monthlyAdminFees,
      totalMonths,
      paidMonths: 0,
      remainingMonths: totalMonths,
      startDate: formData.startDate,
      endDate: endDate.toISOString().split('T')[0],
      installmentType: formData.installmentType,
      interestRate: formData.installmentType === 'with-interest' ? parseFloat(formData.interestRate) : 0,
      administrativeFees: formData.installmentType === 'with-interest' ? parseFloat(formData.administrativeFees) : 0,
      totalInterest: calculatedValues.totalInterest,
      totalAdminFees: calculatedValues.totalAdminFees,
      totalCost: calculatedValues.totalCost,
      status: 'active',
      nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
      nextPaymentAmount: calculatedValues.finalMonthlyPayment,
      createdAt: new Date().toISOString(),
    }

    if (onAdd) {
      onAdd(installment)
    }

    // Reset form
    setFormData({
      merchantId: '',
      totalAmount: '',
      totalMonths: '',
      startDate: new Date().toISOString().split('T')[0],
      installmentType: 'no-interest',
      interestRate: '',
      administrativeFees: '',
    })

    onOpenChange(false)
  }

  const isFormValid = formData.merchantId && formData.totalAmount && formData.totalMonths && formData.startDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-purple-100 dark:border-purple-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-purple-100 dark:border-purple-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            إضافة تقسيط جديد
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            أضف تقسيط جديد على البطاقة الائتمانية
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">المعلومات الأساسية</h3>
            
            {/* اسم التاجر */}
            <div className="space-y-2">
              <Label htmlFor="merchantId">اسم التاجر *</Label>
              <Select
                value={formData.merchantId}
                onValueChange={(value) => setFormData({ ...formData, merchantId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التاجر" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.name ?? 'تاجر'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* إجمالي المبلغ */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">إجمالي المبلغ *</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              />
            </div>

            {/* عدد الأشهر */}
            <div className="space-y-2">
              <Label htmlFor="totalMonths">عدد الأشهر *</Label>
              <Input
                id="totalMonths"
                type="number"
                min="1"
                max="60"
                placeholder="12"
                value={formData.totalMonths}
                onChange={(e) => setFormData({ ...formData, totalMonths: e.target.value })}
              />
            </div>

            {/* تاريخ البدء */}
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البدء *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>

          {/* نوع التقسيط */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">نوع التقسيط</h3>
            
            <div className="space-y-2">
              <Label htmlFor="installmentType">نوع التقسيط *</Label>
              <Select
                value={formData.installmentType}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  installmentType: value,
                  interestRate: value === 'no-interest' ? '' : formData.interestRate,
                  administrativeFees: value === 'no-interest' ? '' : formData.administrativeFees,
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-interest">تقسيط بدون فوائد (0%)</SelectItem>
                  <SelectItem value="with-interest">تقسيط بفوائد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* نسبة الفائدة - يظهر فقط للتقسيط بفوائد */}
            {formData.installmentType === 'with-interest' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">نسبة الفائدة (%)</Label>
                  <div className="relative">
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="1.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    />
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    نسبة الفائدة السنوية على إجمالي المبلغ
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="administrativeFees">المصاريف الإدارية</Label>
                  <Input
                    id="administrativeFees"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.administrativeFees}
                    onChange={(e) => setFormData({ ...formData, administrativeFees: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    المصاريف الإدارية الإجمالية (تُوزع على الأشهر)
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ملخص الحسابات */}
          {formData.totalAmount && formData.totalMonths && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-5 w-5" style={{ color: '#2563eb' }} />
                <h3 className="text-sm font-semibold" style={{ color: '#2563eb' }}>ملخص الحسابات</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">القسط الشهري الأساسي</p>
                  <p className="font-semibold">{formatCurrency(calculatedValues.baseMonthlyPayment)}</p>
                </div>

                {formData.installmentType === 'with-interest' && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الفائدة الشهرية</p>
                      <p className="font-semibold" style={{ color: '#d97706' }}>
                        {formatCurrency(calculatedValues.monthlyInterest)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">المصاريف الإدارية الشهرية</p>
                      <p className="font-semibold" style={{ color: '#d97706' }}>
                        {formatCurrency(calculatedValues.monthlyAdminFees)}
                      </p>
                    </div>
                  </>
                )}

                <div className="col-span-2 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">القسط الشهري النهائي</p>
                  <p className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                    {formatCurrency(calculatedValues.finalMonthlyPayment)}
                  </p>
                </div>
              </div>

              {formData.installmentType === 'with-interest' && (
                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">إجمالي الفوائد</p>
                    <p className="font-semibold" style={{ color: '#dc2626' }}>
                      {formatCurrency(calculatedValues.totalInterest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">إجمالي المصاريف</p>
                    <p className="font-semibold" style={{ color: '#dc2626' }}>
                      {formatCurrency(calculatedValues.totalAdminFees)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">التكلفة الإجمالية</p>
                    <p className="font-semibold" style={{ color: '#dc2626' }}>
                      {formatCurrency(calculatedValues.totalCost)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تنبيه */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: '#d97706' }} />
            <div className="text-sm">
              <p className="font-medium mb-1" style={{ color: '#d97706' }}>ملاحظة مهمة</p>
              <p className="text-muted-foreground">
                سيتم إضافة القسط الشهري ({formatCurrency(calculatedValues.finalMonthlyPayment)}) تلقائياً إلى كشف الحساب الشهري في تاريخ الاستحقاق.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              إضافة التقسيط
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

