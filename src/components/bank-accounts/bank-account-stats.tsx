'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from 'lucide-react'

interface BankAccountStatsProps {
  account: any
}

export function BankAccountStats({ account }: BankAccountStatsProps) {
  const dailyUsagePercentage = account.dailyLimit 
    ? ((account.monthlySpending || 0) / 30 / account.dailyLimit) * 100 
    : 0

  const monthlyUsagePercentage = account.monthlyLimit 
    ? ((account.monthlySpending || 0) / account.monthlyLimit) * 100 
    : 0

  const netFlow = (account.totalDeposits || 0) - (account.totalWithdrawals || 0)

  return (
    <div className="space-y-6">
      {/* ملخص الحساب */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              إجمالي الإيداعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(account.totalDeposits || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ فتح الحساب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              إجمالي السحوبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(account.totalWithdrawals || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ فتح الحساب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              صافي التدفق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              الفرق بين الإيداعات والسحوبات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الحدود والاستخدام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            الحدود والاستخدام
          </CardTitle>
          <CardDescription>
            متابعة الحدود اليومية والشهرية للحساب
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* الحد اليومي */}
          {account.dailyLimit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الحد اليومي</p>
                  <p className="text-sm text-muted-foreground">
                    متوسط الإنفاق اليومي: {formatCurrency((account.monthlySpending || 0) / 30)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(account.dailyLimit)}</p>
                  <p className={`text-sm ${
                    dailyUsagePercentage > 80 ? 'text-red-600' : 
                    dailyUsagePercentage > 50 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {formatPercentage(dailyUsagePercentage / 100)} مستخدم
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    dailyUsagePercentage > 80 ? 'bg-red-500' : 
                    dailyUsagePercentage > 50 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(dailyUsagePercentage, 100)}%` }}
                />
              </div>
              {dailyUsagePercentage > 80 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>تحذير: اقتربت من تجاوز الحد اليومي</span>
                </div>
              )}
            </div>
          )}

          {/* الحد الشهري */}
          {account.monthlyLimit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الحد الشهري</p>
                  <p className="text-sm text-muted-foreground">
                    الإنفاق الشهري: {formatCurrency(account.monthlySpending || 0)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(account.monthlyLimit)}</p>
                  <p className={`text-sm ${
                    monthlyUsagePercentage > 80 ? 'text-red-600' : 
                    monthlyUsagePercentage > 50 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {formatPercentage(monthlyUsagePercentage / 100)} مستخدم
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    monthlyUsagePercentage > 80 ? 'bg-red-500' : 
                    monthlyUsagePercentage > 50 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(monthlyUsagePercentage, 100)}%` }}
                />
              </div>
              {monthlyUsagePercentage > 80 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>تحذير: اقتربت من تجاوز الحد الشهري</span>
                </div>
              )}
            </div>
          )}

          {/* حد المعاملة */}
          {account.transactionLimit && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">حد المعاملة الواحدة</p>
                  <p className="text-sm text-blue-700">الحد الأقصى لكل معاملة</p>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(account.transactionLimit)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            معلومات الحساب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {account.openDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">تاريخ فتح الحساب</p>
                <p className="font-medium">{new Date(account.openDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            {account.lastTransactionDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">آخر معاملة</p>
                <p className="font-medium">{new Date(account.lastTransactionDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            {account.currency && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">العملة</p>
                <p className="font-medium">{account.currency}</p>
              </div>
            )}

            {account.branchName && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">الفرع</p>
                <p className="font-medium">{account.branchName}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* نصائح */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 نصائح لإدارة أفضل</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• راقب رصيدك بانتظام لتجنب السحب على المكشوف</li>
          <li>• حافظ على رصيد احتياطي للطوارئ</li>
          <li>• راجع الحدود اليومية والشهرية بشكل دوري</li>
          <li>• تحقق من جميع المعاملات للتأكد من عدم وجود معاملات غير مصرح بها</li>
        </ul>
      </div>
    </div>
  )
}

