'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, ArrowLeftRight, Calendar, AlertCircle, Activity, Shield, CheckCircle } from 'lucide-react'

interface EWalletStatsProps {
  wallet: any
}

export function EWalletStats({ wallet }: EWalletStatsProps) {
  const dailyUsagePercentage = wallet.dailyLimit 
    ? ((wallet.dailyUsed || 0) / wallet.dailyLimit) * 100 
    : 0

  const monthlyUsagePercentage = wallet.monthlyLimit 
    ? ((wallet.monthlyUsed || 0) / wallet.monthlyLimit) * 100 
    : 0

  const netFlow = (wallet.totalDeposits || 0) - (wallet.totalWithdrawals || 0) - (wallet.totalTransfers || 0)
  const isNearDailyLimit = dailyUsagePercentage > 80
  const isNearMonthlyLimit = monthlyUsagePercentage > 80

  return (
    <div className="space-y-6">
      {/* ملخص المحفظة */}
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
              {formatCurrency(wallet.totalDeposits || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ إنشاء المحفظة
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
              {formatCurrency(wallet.totalWithdrawals || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ إنشاء المحفظة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-blue-600" />
              إجمالي التحويلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(wallet.totalTransfers || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              منذ إنشاء المحفظة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* صافي التدفق */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            صافي التدفق النقدي
          </CardTitle>
          <CardDescription>
            الفرق بين الإيداعات والسحوبات والتحويلات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {netFlow >= 0 ? 'تدفق نقدي إيجابي' : 'تدفق نقدي سلبي'}
          </p>
        </CardContent>
      </Card>

      {/* الحدود والاستخدام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            الحدود والاستخدام
          </CardTitle>
          <CardDescription>
            متابعة الحدود اليومية والشهرية للمحفظة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* الحد اليومي */}
          {wallet.dailyLimit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الحد اليومي</p>
                  <p className="text-sm text-muted-foreground">
                    المستخدم اليوم: {formatCurrency(wallet.dailyUsed || 0)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(wallet.dailyLimit)}</p>
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
              {isNearDailyLimit && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>تحذير: اقتربت من تجاوز الحد اليومي</span>
                </div>
              )}
            </div>
          )}

          {/* الحد الشهري */}
          {wallet.monthlyLimit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الحد الشهري</p>
                  <p className="text-sm text-muted-foreground">
                    المستخدم هذا الشهر: {formatCurrency(wallet.monthlyUsed || 0)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatCurrency(wallet.monthlyLimit)}</p>
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
              {isNearMonthlyLimit && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>تحذير: اقتربت من تجاوز الحد الشهري</span>
                </div>
              )}
            </div>
          )}

          {/* حد المعاملة */}
          {wallet.transactionLimit && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">حد المعاملة الواحدة</p>
                  <p className="text-sm text-blue-700">الحد الأقصى لكل معاملة</p>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(wallet.transactionLimit)}
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
                {formatCurrency(wallet.monthlyDeposits || 0)}
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <TrendingDown className="h-5 w-5" />
                <p className="font-medium">السحوبات الشهرية</p>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {formatCurrency(wallet.monthlyWithdrawals || 0)}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">صافي التدفق الشهري</p>
                <p className={`text-xl font-bold ${
                  (wallet.monthlyDeposits || 0) - (wallet.monthlyWithdrawals || 0) >= 0 
                    ? 'text-green-900' 
                    : 'text-red-900'
                }`}>
                  {formatCurrency((wallet.monthlyDeposits || 0) - (wallet.monthlyWithdrawals || 0))}
                </p>
              </div>
              <div className="text-left">
                <p className="text-sm text-blue-600 mb-1">عدد المعاملات</p>
                <p className="text-xl font-bold text-blue-900">{wallet.transactionCount || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات المحفظة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            معلومات المحفظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {wallet.createdDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">تاريخ الإنشاء</p>
                <p className="font-medium">{new Date(wallet.createdDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            {wallet.lastTransactionDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">آخر معاملة</p>
                <p className="font-medium">{new Date(wallet.lastTransactionDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            {wallet.verificationDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">تاريخ التوثيق</p>
                <p className="font-medium">{new Date(wallet.verificationDate).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">مستوى التحقق (KYC)</p>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <p className="font-medium">
                  {wallet.kycLevel ? `مستوى ${wallet.kycLevel}` : 'غير محدد'}
                </p>
              </div>
            </div>

            {wallet.isVerified && (
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700">
                    هذه المحفظة موثقة ومفعلة بالكامل
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* الرسوم */}
      {(wallet.depositFee !== undefined || wallet.withdrawalFee !== undefined || wallet.transferFee !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>الرسوم المطبقة</CardTitle>
            <CardDescription>رسوم المعاملات على هذه المحفظة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {wallet.depositFee !== undefined && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">رسوم الإيداع</p>
                  <p className="text-lg font-bold text-green-900">{wallet.depositFee}%</p>
                </div>
              )}
              {wallet.withdrawalFee !== undefined && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">رسوم السحب</p>
                  <p className="text-lg font-bold text-red-900">{wallet.withdrawalFee}%</p>
                </div>
              )}
              {wallet.transferFee !== undefined && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">رسوم التحويل</p>
                  <p className="text-lg font-bold text-blue-900">{wallet.transferFee}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نصائح */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 نصائح لإدارة أفضل</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• راقب رصيدك بانتظام وتجنب تجاوز الحدود</li>
          <li>• احتفظ برصيد احتياطي للطوارئ</li>
          <li>• راجع الرسوم قبل إجراء المعاملات الكبيرة</li>
          <li>• تحقق من جميع المعاملات للتأكد من صحتها</li>
          <li>• حافظ على مستوى التحقق (KYC) محدثاً</li>
        </ul>
      </div>
    </div>
  )
}

