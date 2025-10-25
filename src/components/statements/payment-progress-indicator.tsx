'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react'

interface PaymentProgressIndicatorProps {
  statementAmount: number // إجمالي مبلغ الكشف
  paidAmount: number // المبلغ المدفوع
  minimumPayment?: number // الحد الأدنى للسداد (اختياري)
  dueDate?: string // تاريخ الاستحقاق (اختياري)
  showDetails?: boolean // عرض التفاصيل (افتراضي: true)
  compact?: boolean // عرض مضغوط (افتراضي: false)
}

export function PaymentProgressIndicator({
  statementAmount,
  paidAmount,
  minimumPayment,
  dueDate,
  showDetails = true,
  compact = false,
}: PaymentProgressIndicatorProps) {
  // الحسابات
  const remainingAmount = statementAmount - paidAmount
  const paymentPercentage = statementAmount > 0 ? (paidAmount / statementAmount) * 100 : 0
  const minimumPercentage = minimumPayment && statementAmount > 0 
    ? (minimumPayment / statementAmount) * 100 
    : 0

  // تحديد الحالة
  const getPaymentStatus = () => {
    if (paymentPercentage >= 100) return 'paid'
    if (minimumPayment && paidAmount >= minimumPayment) return 'minimum-met'
    if (paidAmount > 0) return 'partial'
    return 'unpaid'
  }

  const status = getPaymentStatus()

  // الألوان والأيقونات حسب الحالة
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-700',
          progressColor: 'bg-green-600',
          icon: CheckCircle2,
          label: 'مدفوع بالكامل',
          badgeVariant: 'default' as const,
        }
      case 'minimum-met':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-700',
          progressColor: 'bg-blue-600',
          icon: TrendingUp,
          label: 'تم سداد الحد الأدنى',
          badgeVariant: 'secondary' as const,
        }
      case 'partial':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-700',
          progressColor: 'bg-amber-600',
          icon: Clock,
          label: 'سداد جزئي',
          badgeVariant: 'secondary' as const,
        }
      default:
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-700',
          progressColor: 'bg-red-600',
          icon: AlertCircle,
          label: 'غير مدفوع',
          badgeVariant: 'destructive' as const,
        }
    }
  }

  const config = getStatusConfig()
  const StatusIcon = config.icon

  // حساب عدد الأيام المتبقية
  const getDaysRemaining = () => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  // العرض المضغوط
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium dark:text-gray-200">نسبة السداد</span>
          <span className={`font-bold ${config.color}`}>
            {formatPercentage(paymentPercentage)}
          </span>
        </div>
        <Progress 
          value={paymentPercentage} 
          className="h-2"
          indicatorClassName={config.progressColor}
        />
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>مدفوع: {formatCurrency(paidAmount)}</span>
          <span>متبقي: {formatCurrency(remainingAmount)}</span>
        </div>
      </div>
    )
  }

  // العرض الكامل
  return (
    <Card className={`${config.bgColor} border ${config.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${config.color}`} />
            <CardTitle className="text-lg dark:text-gray-100">مؤشر السداد</CardTitle>
          </div>
          <Badge variant={config.badgeVariant} className={config.color}>
            {config.label}
          </Badge>
        </div>
        {daysRemaining !== null && (
          <CardDescription className="dark:text-gray-400">
            {daysRemaining > 0 
              ? `متبقي ${daysRemaining} يوم على تاريخ الاستحقاق`
              : daysRemaining === 0
              ? 'تاريخ الاستحقاق اليوم'
              : `متأخر ${Math.abs(daysRemaining)} يوم`
            }
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* نسبة السداد */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium dark:text-gray-200">نسبة السداد</span>
            <span className={`text-2xl font-bold ${config.color}`}>
              {formatPercentage(paymentPercentage)}
            </span>
          </div>
          
          {/* شريط التقدم */}
          <div className="relative">
            <Progress 
              value={Math.min(paymentPercentage, 100)} 
              className="h-4"
              indicatorClassName={config.progressColor}
            />
            
            {/* علامة الحد الأدنى */}
            {minimumPayment && minimumPercentage > 0 && minimumPercentage < 100 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-gray-800 dark:bg-gray-200"
                style={{ left: `${minimumPercentage}%` }}
                title={`الحد الأدنى: ${formatPercentage(minimumPercentage)}`}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full" />
              </div>
            )}
          </div>
          
          {/* مؤشر الحد الأدنى */}
          {minimumPayment && (
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>الحد الأدنى: {formatCurrency(minimumPayment)}</span>
              <span>({formatPercentage(minimumPercentage)})</span>
            </div>
          )}
        </div>

        {/* التفاصيل */}
        {showDetails && (
          <div className="space-y-3 pt-3 border-t dark:border-gray-700">
            {/* إجمالي الكشف */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">إجمالي الكشف:</span>
              <span className="font-semibold dark:text-gray-100">{formatCurrency(statementAmount)}</span>
            </div>

            {/* المبلغ المدفوع */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">المبلغ المدفوع:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(paidAmount)}
              </span>
            </div>

            {/* المبلغ المتبقي */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">المبلغ المتبقي:</span>
              <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>

            {/* الحد الأدنى للسداد */}
            {minimumPayment && (
              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                <span className="text-sm font-medium dark:text-gray-300">الحد الأدنى للسداد:</span>
                <span className="font-semibold dark:text-gray-100">{formatCurrency(minimumPayment)}</span>
              </div>
            )}
          </div>
        )}

        {/* رسالة تحذيرية */}
        {status === 'unpaid' && daysRemaining !== null && daysRemaining <= 3 && (
          <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm dark:text-red-200" style={{ color: '#dc2626' }}>
              <p className="font-semibold">تحذير: اقتراب موعد الاستحقاق</p>
              <p className="text-xs mt-1 dark:text-red-300">
                يرجى سداد الحد الأدنى على الأقل لتجنب الرسوم الإضافية
              </p>
            </div>
          </div>
        )}

        {/* رسالة نجاح */}
        {status === 'paid' && (
          <div className="flex items-start gap-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm dark:text-green-200" style={{ color: '#16a34a' }}>
              <p className="font-semibold">تم السداد بالكامل</p>
              <p className="text-xs mt-1 dark:text-green-300">
                تم سداد كشف الحساب بالكامل. شكراً لالتزامك!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

