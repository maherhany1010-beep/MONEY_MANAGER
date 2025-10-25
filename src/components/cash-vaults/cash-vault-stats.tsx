'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, Activity, Lock } from 'lucide-react'

interface CashVaultStatsProps {
  vault: any
}

export function CashVaultStats({ vault }: CashVaultStatsProps) {
  const capacityPercentage = vault.maxCapacity 
    ? (vault.balance / vault.maxCapacity) * 100 
    : 0

  const netFlow = (vault.totalDeposits || 0) - (vault.totalWithdrawals || 0)
  const isNearMinBalance = vault.minBalance && vault.balance <= vault.minBalance * 1.2
  const isNearMaxCapacity = vault.maxCapacity && vault.balance >= vault.maxCapacity * 0.9

  return (
    <div className="space-y-6">
      {/* ملخص الخزينة */}
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
              {formatCurrency(vault.totalDeposits || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ إنشاء الخزينة
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
              {formatCurrency(vault.totalWithdrawals || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ إنشاء الخزينة
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

      {/* السعة والحدود */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            السعة والحدود
          </CardTitle>
          <CardDescription>
            متابعة سعة الخزينة والحدود المحددة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* السعة القصوى */}
          {vault.maxCapacity && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">السعة القصوى</p>
                  <p className="text-sm text-muted-foreground">
                    الرصيد الحالي: {formatCurrency(vault.balance)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(vault.maxCapacity)}</p>
                  <p className={`text-sm ${
                    capacityPercentage > 90 ? 'text-red-600' : 
                    capacityPercentage > 70 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {formatPercentage(capacityPercentage / 100)} ممتلئة
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    capacityPercentage > 90 ? 'bg-red-500' : 
                    capacityPercentage > 70 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                />
              </div>
              {isNearMaxCapacity && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>تحذير: الخزينة قريبة من السعة القصوى</span>
                </div>
              )}
            </div>
          )}

          {/* الحد الأدنى */}
          {vault.minBalance !== undefined && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الحد الأدنى للرصيد</p>
                  <p className="text-sm text-muted-foreground">
                    الرصيد الحالي: {formatCurrency(vault.balance)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(vault.minBalance)}</p>
                  <p className={`text-sm ${
                    vault.balance <= vault.minBalance ? 'text-red-600' : 
                    vault.balance <= vault.minBalance * 1.2 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {vault.balance > vault.minBalance ? 'آمن' : 'تحذير'}
                  </p>
                </div>
              </div>
              {isNearMinBalance && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>تحذير: الرصيد قريب من الحد الأدنى</span>
                </div>
              )}
            </div>
          )}

          {/* حد السحب اليومي */}
          {vault.dailyWithdrawalLimit && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">حد السحب اليومي</p>
                  <p className="text-sm text-blue-700">الحد الأقصى للسحب في اليوم الواحد</p>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(vault.dailyWithdrawalLimit)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* الإحصائيات الشهرية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            الإحصائيات الشهرية
          </CardTitle>
          <CardDescription>
            ملخص النشاط المالي للشهر الحالي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="h-5 w-5" />
                <p className="font-medium">الإيداعات الشهرية</p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(vault.monthlyDeposits || 0)}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown className="h-5 w-5" />
                <p className="font-medium">السحوبات الشهرية</p>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(vault.monthlyWithdrawals || 0)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">صافي التدفق الشهري</p>
                <p className={`text-xl font-bold ${
                  (vault.monthlyDeposits || 0) - (vault.monthlyWithdrawals || 0) >= 0 
                    ? 'text-green-900' 
                    : 'text-red-900'
                }`}>
                  {formatCurrency((vault.monthlyDeposits || 0) - (vault.monthlyWithdrawals || 0))}
                </p>
              </div>
              <div className="text-left">
                <p className="text-sm text-blue-600 mb-1">عدد المعاملات</p>
                <p className="text-xl font-bold text-blue-900">{vault.transactionCount || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الخزينة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            معلومات الخزينة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {vault.createdDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">تاريخ الإنشاء</p>
                <p className="font-medium">{new Date(vault.createdDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            {vault.lastAccessDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">آخر وصول</p>
                <p className="font-medium">{new Date(vault.lastAccessDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">العملة</p>
              <p className="font-medium">{vault.currency}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">مستوى الوصول</p>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <p className="font-medium">
                  {vault.accessLevel === 'public' ? 'عام' : 
                   vault.accessLevel === 'restricted' ? 'محدود' : 'خاص'}
                </p>
              </div>
            </div>

            {vault.requiresApproval && (
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-700">
                    هذه الخزينة تتطلب موافقة قبل أي عملية سحب
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* نصائح */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 نصائح لإدارة أفضل</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• راقب رصيد الخزينة بانتظام للتأكد من عدم تجاوز الحدود</li>
          <li>• حافظ على رصيد احتياطي فوق الحد الأدنى</li>
          <li>• راجع المعاملات بشكل دوري للتأكد من صحتها</li>
          <li>• قم بتحديث الحدود بناءً على احتياجاتك المتغيرة</li>
          <li>• احتفظ بسجل للمعاملات الكبيرة والمهمة</li>
        </ul>
      </div>
    </div>
  )
}

