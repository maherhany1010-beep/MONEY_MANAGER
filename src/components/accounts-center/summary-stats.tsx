'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
  Wallet,
  Hash,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface SummaryStatsProps {
  totalBalance: number
  totalAccounts: number
  highestBalance: { type: string; amount: number }
  lowestBalance: { type: string; amount: number }
}

export function SummaryStats({
  totalBalance,
  totalAccounts,
  highestBalance,
  lowestBalance
}: SummaryStatsProps) {
  // حساب إحصائيات إضافية (بيانات تجريبية)
  const additionalStats = useMemo(() => {
    // صافي التدفق النقدي (تجريبي)
    const netCashFlow = Math.floor(Math.random() * 20000) + 5000
    const cashFlowTrend = netCashFlow > 10000 ? 'up' : 'down'
    const cashFlowPercentage = Math.floor(Math.random() * 15) + 5

    // متوسط الرصيد اليومي
    const avgDailyBalance = totalBalance / (totalAccounts || 1)

    // معدل النمو الشهري (تجريبي)
    const monthlyGrowth = (Math.random() * 10 - 2).toFixed(1) // بين -2% و +8%
    const growthTrend = parseFloat(monthlyGrowth) > 0 ? 'up' : 'down'

    // عدد المعاملات الشهرية (تجريبي)
    const monthlyTransactions = Math.floor(Math.random() * 100) + 50
    const transactionsTrend = monthlyTransactions > 75 ? 'up' : 'down'
    const transactionsPercentage = Math.floor(Math.random() * 20) + 5

    return {
      netCashFlow,
      cashFlowTrend,
      cashFlowPercentage,
      avgDailyBalance,
      monthlyGrowth,
      growthTrend,
      monthlyTransactions,
      transactionsTrend,
      transactionsPercentage,
    }
  }, [totalBalance, totalAccounts])

  const stats = [
    {
      title: 'إجمالي الأرصدة',
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      trend: additionalStats.growthTrend,
      trendValue: `${additionalStats.monthlyGrowth}%`,
      trendLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'عدد الحسابات',
      value: totalAccounts.toString(),
      subtitle: 'حساب نشط',
      icon: Hash,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'صافي التدفق النقدي',
      value: formatCurrency(additionalStats.netCashFlow),
      subtitle: 'الشهر الحالي',
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      trend: additionalStats.cashFlowTrend,
      trendValue: `${additionalStats.cashFlowPercentage}%`,
      trendLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'متوسط الرصيد اليومي',
      value: formatCurrency(additionalStats.avgDailyBalance),
      subtitle: 'لكل حساب',
      icon: DollarSign,
      color: 'indigo',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    },
    {
      title: 'أعلى رصيد',
      value: formatCurrency(highestBalance.amount),
      subtitle: highestBalance.type,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'أقل رصيد',
      value: formatCurrency(lowestBalance.amount),
      subtitle: lowestBalance.type,
      icon: TrendingDown,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: 'معدل النمو الشهري',
      value: `${additionalStats.monthlyGrowth}%`,
      subtitle: 'متوسط آخر 6 أشهر',
      icon: BarChart3,
      color: 'cyan',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      trend: additionalStats.growthTrend,
    },
    {
      title: 'عدد المعاملات',
      value: additionalStats.monthlyTransactions.toString(),
      subtitle: 'الشهر الحالي',
      icon: Activity,
      color: 'pink',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      textColor: 'text-pink-600 dark:text-pink-400',
      borderColor: 'border-pink-200 dark:border-pink-800',
      trend: additionalStats.transactionsTrend,
      trendValue: `${additionalStats.transactionsPercentage}%`,
      trendLabel: 'مقارنة بالشهر السابق',
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`border-2 ${stat.borderColor}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              {stat.trend && (
                <Badge
                  variant={stat.trend === 'up' ? 'default' : 'secondary'}
                  className={
                    stat.trend === 'up'
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                      : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                  }
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 ml-1" />
                  )}
                  {stat.trendValue}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
              {stat.trendLabel && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trendLabel}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

