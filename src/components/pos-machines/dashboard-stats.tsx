'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { POSMachine } from '@/contexts/pos-machines-context'
import { formatCurrency } from '@/lib/utils'
import {
  CreditCard,
  Activity,
  TrendingUp,
  DollarSign,
  Percent,
  ShoppingCart,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Target
} from 'lucide-react'

interface DashboardStatsProps {
  machines: POSMachine[]
}

export function DashboardStats({ machines }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const activeMachines = machines.filter(m => m.status === 'active')
    const inactiveMachines = machines.filter(m => m.status === 'inactive' || m.status === 'maintenance')

    const totalMachines = machines.length
    const activeCount = activeMachines.length

    // حساب المبيعات الشهرية
    const monthlyRevenue = machines.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0)

    // حساب متوسط المبيعات اليومية
    const dailyRevenue = machines.reduce((sum, m) => sum + (m.dailyRevenue || 0), 0)
    const avgDailyRevenue = activeCount > 0 ? dailyRevenue / activeCount : 0

    // حساب إجمالي المعاملات
    const totalTransactions = machines.reduce((sum, m) => sum + (m.totalTransactions || 0), 0)

    // حساب متوسط قيمة المعاملة
    const avgTransactionValue = totalTransactions > 0 ? monthlyRevenue / totalTransactions : 0

    // حساب العمولات (افتراض 2% من المبيعات)
    const totalCommissions = monthlyRevenue * 0.02

    // مقارنة بالشهر السابق (محاكاة)
    const lastMonthRevenue = monthlyRevenue * 0.92 // افتراض نمو 8%
    const revenueChange = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

    const lastMonthTransactions = totalTransactions * 0.95 // افتراض نمو 5%
    const transactionsChange = ((totalTransactions - lastMonthTransactions) / lastMonthTransactions) * 100

    // حساب الأهداف والغرامات
    const machinesWithTargets = machines.filter(m => m.monthlyTarget && m.monthlyTarget > 0)
    const machinesNotAchievedTarget = machinesWithTargets.filter(m =>
      (m.targetPercentage || 0) < (m.penaltyThreshold || 100)
    )
    const totalPenalties = machinesNotAchievedTarget.reduce((sum, m) => sum + (m.penaltyAmount || 0), 0)

    // حساب تقدم الأهداف
    const machinesAchievedTarget = machinesWithTargets.filter(m => (m.targetPercentage || 0) >= 100)
    const avgTargetPercentage = machinesWithTargets.length > 0
      ? machinesWithTargets.reduce((sum, m) => sum + (m.targetPercentage || 0), 0) / machinesWithTargets.length
      : 0

    return {
      totalMachines,
      activeCount,
      inactiveCount: inactiveMachines.length,
      monthlyRevenue,
      dailyRevenue,
      avgDailyRevenue,
      totalTransactions,
      avgTransactionValue,
      totalCommissions,
      revenueChange,
      transactionsChange,
      inactiveMachines,
      machinesNotAchievedTarget,
      totalPenalties,
      machinesWithTargets: machinesWithTargets.length,
      machinesAchievedTarget: machinesAchievedTarget.length,
      avgTargetPercentage,
    }
  }, [machines])

  return (
    <div className="space-y-6">
      {/* تحذير للماكينات غير النشطة */}
      {stats.inactiveCount > 0 && (
        <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                تنبيه: ماكينات غير نشطة
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                يوجد {stats.inactiveCount} ماكينة غير نشطة أو في حالة صيانة. يرجى المراجعة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* تحذير للماكينات التي لم تحقق الهدف */}
      {stats.machinesNotAchievedTarget.length > 0 && (
        <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                تحذير: ماكينات لم تحقق الهدف الشهري
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                يوجد {stats.machinesNotAchievedTarget.length} ماكينة لم تحقق الهدف الشهري المطلوب.
              </p>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200 mt-2">
                إجمالي الغرامات المتوقعة: {formatCurrency(stats.totalPenalties)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* البطاقات الإحصائية */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* إجمالي الماكينات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الماكينات
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMachines}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeCount} نشطة • {stats.inactiveCount} غير نشطة
            </p>
          </CardContent>
        </Card>

        {/* المبيعات الشهرية */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المبيعات الشهرية
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {stats.revenueChange >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <p className={`text-xs ${
                stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.revenueChange).toFixed(1)}% عن الشهر السابق
              </p>
            </div>
          </CardContent>
        </Card>

        {/* متوسط المبيعات اليومية */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط المبيعات اليومية
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgDailyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              لكل ماكينة نشطة
            </p>
          </CardContent>
        </Card>

        {/* إجمالي المعاملات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المعاملات
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              {stats.transactionsChange >= 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <p className={`text-xs ${
                stats.transactionsChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.transactionsChange).toFixed(1)}% عن الشهر السابق
              </p>
            </div>
          </CardContent>
        </Card>

        {/* متوسط قيمة المعاملة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط قيمة المعاملة
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgTransactionValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              لكل معاملة
            </p>
          </CardContent>
        </Card>

        {/* إجمالي العمولات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي العمولات
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.totalCommissions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              2% من المبيعات
            </p>
          </CardContent>
        </Card>

        {/* ماكينات لم تحقق الهدف */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ماكينات لم تحقق الهدف
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.machinesNotAchievedTarget.length > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {stats.machinesNotAchievedTarget.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              من إجمالي {stats.totalMachines} ماكينة
            </p>
          </CardContent>
        </Card>

        {/* إجمالي الغرامات المتوقعة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الغرامات المتوقعة
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              stats.totalPenalties > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {formatCurrency(stats.totalPenalties)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPenalties > 0 ? 'يجب تحسين الأداء' : 'لا توجد غرامات'}
            </p>
          </CardContent>
        </Card>

        {/* تقدم الأهداف الشهرية */}
        {stats.machinesWithTargets > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                تقدم الأهداف الشهرية
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {stats.avgTargetPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground text-left">
                  {stats.machinesAchievedTarget} / {stats.machinesWithTargets}
                </div>
              </div>

              <Progress
                value={Math.min(stats.avgTargetPercentage, 100)}
                className={`h-2 ${
                  stats.avgTargetPercentage >= 100
                    ? '[&>div]:bg-green-600 dark:[&>div]:bg-green-500'
                    : stats.avgTargetPercentage >= 80
                    ? '[&>div]:bg-orange-600 dark:[&>div]:bg-orange-500'
                    : '[&>div]:bg-red-600 dark:[&>div]:bg-red-500'
                }`}
              />

              <p className={`text-xs font-medium ${
                stats.avgTargetPercentage >= 100
                  ? 'text-green-600 dark:text-green-400'
                  : stats.avgTargetPercentage >= 80
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.avgTargetPercentage >= 100
                  ? '✅ أداء ممتاز'
                  : stats.avgTargetPercentage >= 80
                  ? '⚡ أداء جيد'
                  : '⚠️ يحتاج تحسين'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

