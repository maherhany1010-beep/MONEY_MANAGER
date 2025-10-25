'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Info
} from 'lucide-react'

interface InstallmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  installment: any
}

export function InstallmentDetailsDialog({ open, onOpenChange, installment }: InstallmentDetailsDialogProps) {
  if (!installment) return null

  // حسابات إضافية
  const totalAmount = installment?.totalAmount || 0
  const interestRate = installment?.interestRate || 0
  const adminFees = installment?.administrativeFees || 0
  const totalInterest = installment?.totalInterest || 0
  const totalCost = installment?.totalCost || 0
  const loss = totalInterest + adminFees
  const lossPercentage = totalAmount > 0 ? (loss / totalAmount * 100) : 0
  const firstPayment = installment?.firstPayment || installment?.monthlyPayment || 0
  const baseMonthlyPayment = installment?.baseMonthlyPayment || installment?.monthlyPayment || 0

  // تحديد نوع التقسيط
  const getInstallmentType = () => {
    if (interestRate === 0 && adminFees === 0) return 'بدون فوائد وبدون مصاريف'
    if (interestRate > 0 && adminFees === 0) return 'بفوائد فقط'
    if (interestRate === 0 && adminFees > 0) return 'بمصاريف إدارية فقط'
    return 'بفوائد ومصاريف إدارية'
  }

  // توليد جدول الأقساط الشهرية
  const generatePaymentSchedule = () => {
    const schedule = []
    const startDate = new Date(installment.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < installment.totalMonths; i++) {
      const paymentDate = new Date(startDate)
      paymentDate.setMonth(paymentDate.getMonth() + i + 1)
      
      // تحديد الحالة
      let status: 'paid' | 'upcoming' | 'overdue' = 'upcoming'
      if (i < installment.paidMonths) {
        status = 'paid'
      } else if (paymentDate < today && i >= installment.paidMonths) {
        status = 'overdue'
      }

      // حساب مبلغ القسط (الأول مختلف إذا كان هناك مصاريف إدارية)
      const paymentAmount = i === 0 ? firstPayment : baseMonthlyPayment

      schedule.push({
        month: i + 1,
        date: paymentDate.toISOString().split('T')[0],
        amount: paymentAmount,
        baseAmount: baseMonthlyPayment,
        adminFees: i === 0 ? adminFees : 0,
        status,
      })
    }

    return schedule
  }

  const paymentSchedule = generatePaymentSchedule()
  const progress = (installment.paidMonths / installment.totalMonths) * 100

  // دالة للحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#16a34a' // أخضر
      case 'upcoming':
        return '#2563eb' // أزرق
      case 'overdue':
        return '#dc2626' // أحمر
      default:
        return '#6b7280' // رمادي
    }
  }

  // دالة للحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوع'
      case 'upcoming':
        return 'قادم'
      case 'overdue':
        return 'متأخر'
      default:
        return 'غير معروف'
    }
  }

  // دالة للحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4" style={{ color: '#16a34a' }} />
      case 'upcoming':
        return <Clock className="h-4 w-4" style={{ color: '#2563eb' }} />
      case 'overdue':
        return <AlertCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-indigo-100 dark:border-indigo-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-indigo-100 dark:border-indigo-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Receipt className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            تفاصيل التقسيط - {installment.merchantName}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            جميع المعلومات والأقساط الشهرية للتقسيط
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* نوع التقسيط */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5" style={{ color: '#2563eb' }} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2" style={{ color: '#2563eb' }}>
                    نوع التقسيط: {getInstallmentType()}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {adminFees > 0 && (
                      <p>• المصاريف الإدارية ({formatCurrency(adminFees)}) تُخصم في القسط الأول فقط</p>
                    )}
                    {adminFees > 0 && (
                      <>
                        <p>• القسط الأول: {formatCurrency(firstPayment)} (يشمل المصاريف الإدارية)</p>
                        <p>• الأقساط المتبقية: {formatCurrency(baseMonthlyPayment)} لكل شهر</p>
                      </>
                    )}
                    {adminFees === 0 && (
                      <p>• جميع الأقساط متساوية: {formatCurrency(baseMonthlyPayment)} لكل شهر</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المعلومات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التاجر</p>
                  <p className="font-semibold">{installment.merchantName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">المبلغ الأصلي</p>
                  <p className="font-semibold">{formatCurrency(totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">عدد الأشهر</p>
                  <p className="font-semibold">{installment.totalMonths} شهر</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">القسط الأساسي</p>
                  <p className="font-semibold" style={{ color: '#2563eb' }}>
                    {formatCurrency(baseMonthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">تاريخ البدء</p>
                  <p className="font-semibold">{formatDate(installment.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">تاريخ الانتهاء</p>
                  <p className="font-semibold">{formatDate(installment.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">نسبة الفائدة</p>
                  <p className="font-semibold" style={{ color: interestRate > 0 ? '#ea580c' : '#6b7280' }}>
                    {formatPercentage(interestRate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الحالة</p>
                  <Badge
                    variant="secondary"
                    style={{ 
                      backgroundColor: installment.status === 'active' ? '#2563eb20' : '#16a34a20',
                      color: installment.status === 'active' ? '#2563eb' : '#16a34a',
                    }}
                  >
                    {installment.status === 'active' ? 'نشط' : 'مكتمل'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* شريط التقدم */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">التقدم</CardTitle>
              <CardDescription>
                {installment.paidMonths} من {installment.totalMonths} شهر ({Math.round(progress)}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress 
                value={progress} 
                className="h-3 mb-4"
                indicatorClassName={installment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">المدفوع</p>
                  <p className="font-semibold" style={{ color: '#16a34a' }}>
                    {formatCurrency(installment.monthlyPayment * installment.paidMonths)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">المتبقي</p>
                  <p className="font-semibold" style={{ color: '#dc2626' }}>
                    {formatCurrency(installment.monthlyPayment * installment.remainingMonths)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الأشهر المتبقية</p>
                  <p className="font-semibold">{installment.remainingMonths} شهر</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* التفاصيل المالية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                التفاصيل المالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">المبلغ الأصلي</p>
                  <p className="font-semibold">{formatCurrency(totalAmount)}</p>
                </div>
                {interestRate > 0 && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">نسبة الفائدة</p>
                      <p className="font-semibold" style={{ color: '#ea580c' }}>
                        {formatPercentage(interestRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">إجمالي الفوائد</p>
                      <p className="font-semibold text-red-600">
                        + {formatCurrency(totalInterest)}
                      </p>
                    </div>
                  </>
                )}
                {adminFees > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">المصاريف الإدارية</p>
                    <p className="font-semibold text-red-600">
                      + {formatCurrency(adminFees)}
                    </p>
                  </div>
                )}
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-muted-foreground mb-1">التكلفة الإجمالية</p>
                  <p className="font-bold text-lg text-red-600">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
                {loss > 0 && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الخسارة</p>
                      <p className="font-semibold text-red-600">
                        {formatCurrency(loss)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">نسبة الخسارة</p>
                      <p className="font-semibold text-red-600">
                        {formatPercentage(lossPercentage)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {loss > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>ملاحظة:</strong> الخسارة = الفوائد ({formatCurrency(totalInterest)}) + المصاريف الإدارية ({formatCurrency(adminFees)})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* جدول الأقساط الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                جدول الأقساط الشهرية
              </CardTitle>
              <CardDescription>
                جميع الأقساط الشهرية وحالتها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {paymentSchedule.map((payment) => (
                  <div
                    key={payment.month}
                    className={`p-3 border rounded-lg hover:bg-accent/50 transition-colors ${
                      payment.month === 1 && payment.adminFees > 0 ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-medium">
                            الشهر {payment.month}
                            {payment.month === 1 && payment.adminFees > 0 && (
                              <span className="text-xs mr-2 text-amber-600 dark:text-amber-400">(يشمل المصاريف الإدارية)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${getStatusColor(payment.status)}20`,
                            color: getStatusColor(payment.status),
                          }}
                        >
                          {getStatusText(payment.status)}
                        </Badge>
                        <p className="font-semibold min-w-[100px] text-left">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>

                    {/* تفاصيل مكونات القسط */}
                    {(payment.adminFees > 0 || interestRate > 0) && (
                      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>القسط الأساسي:</span>
                          <span>{formatCurrency(payment.baseAmount)}</span>
                        </div>
                        {payment.adminFees > 0 && (
                          <div className="flex justify-between text-amber-600 dark:text-amber-400">
                            <span>المصاريف الإدارية:</span>
                            <span>+ {formatCurrency(payment.adminFees)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium text-foreground pt-1 border-t">
                          <span>الإجمالي:</span>
                          <span>{formatCurrency(payment.amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ملخص إجمالي */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">إجمالي المبلغ الأصلي</p>
                  <p className="text-lg font-bold">{formatCurrency(installment.totalAmount)}</p>
                </div>
                {installment.interestRate > 0 && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">إجمالي الفوائد</p>
                      <p className="text-lg font-bold" style={{ color: '#dc2626' }}>
                        {formatCurrency(installment.totalInterest || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">إجمالي المصاريف</p>
                      <p className="text-lg font-bold" style={{ color: '#dc2626' }}>
                        {formatCurrency(installment.totalAdminFees || 0)}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التكلفة النهائية</p>
                  <p className="text-lg font-bold" style={{ color: '#2563eb' }}>
                    {formatCurrency(installment.totalCost || installment.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

