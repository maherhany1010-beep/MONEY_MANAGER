'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard as CreditCardType } from '@/contexts/cards-context'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react'

interface DashboardStatsProps {
  cards: CreditCardType[]
}

export function DashboardStats({ cards }: DashboardStatsProps) {
  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return {
      totalCreditLimit: cards.reduce((sum, card) => sum + card.creditLimit, 0),
      totalCurrentBalance: cards.reduce((sum, card) => sum + card.currentBalance, 0),
      totalAvailableBalance: cards.reduce((sum, card) => sum + (card.creditLimit - card.currentBalance), 0),
      totalMinPayment: cards.reduce((sum, card) => sum + ((card as any).minimumPayment || 0), 0),
      activeCards: cards.filter(card => card.isActive).length,
      utilizationRate: 0,
    }
  }, [cards])

  // Calculate utilization rate
  currentMonthStats.utilizationRate = currentMonthStats.totalCreditLimit > 0
    ? (currentMonthStats.totalCurrentBalance / currentMonthStats.totalCreditLimit) * 100
    : 0

  // Calculate previous month stats for comparison
  const previousMonthStats = useMemo(() => {
    // For demo purposes, we'll simulate previous month data
    // In a real app, this would come from historical data
    return {
      totalCurrentBalance: currentMonthStats.totalCurrentBalance * 0.9,
      totalMinPayment: currentMonthStats.totalMinPayment * 0.85,
      utilizationRate: currentMonthStats.utilizationRate * 0.92,
    }
  }, [currentMonthStats])

  // Calculate percentage changes
  const changes = useMemo(() => {
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      balance: calculateChange(currentMonthStats.totalCurrentBalance, previousMonthStats.totalCurrentBalance),
      minPayment: calculateChange(currentMonthStats.totalMinPayment, previousMonthStats.totalMinPayment),
      utilization: calculateChange(currentMonthStats.utilizationRate, previousMonthStats.utilizationRate),
    }
  }, [currentMonthStats, previousMonthStats])

  const stats = [
    {
      title: 'إجمالي الحد الائتماني',
      value: formatCurrency(currentMonthStats.totalCreditLimit),
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: `${currentMonthStats.activeCards} بطاقة نشطة`,
    },
    {
      title: 'الرصيد المستخدم',
      value: formatCurrency(currentMonthStats.totalCurrentBalance),
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      change: changes.balance,
      changeLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'الرصيد المتاح',
      value: formatCurrency(currentMonthStats.totalAvailableBalance),
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'متاح للاستخدام',
    },
    {
      title: 'الحد الأدنى للسداد',
      value: formatCurrency(currentMonthStats.totalMinPayment),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      change: changes.minPayment,
      changeLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'نسبة الاستخدام',
      value: `${currentMonthStats.utilizationRate.toFixed(1)}%`,
      icon: Activity,
      color: currentMonthStats.utilizationRate > 80 ? 'text-red-600' : currentMonthStats.utilizationRate > 50 ? 'text-orange-600' : 'text-green-600',
      bgColor: currentMonthStats.utilizationRate > 80 ? 'bg-red-100 dark:bg-red-900/20' : currentMonthStats.utilizationRate > 50 ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-green-100 dark:bg-green-900/20',
      change: changes.utilization,
      changeLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'البطاقات النشطة',
      value: `${currentMonthStats.activeCards} / ${cards.length}`,
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      description: 'من إجمالي البطاقات',
    },
  ]

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />
    return null
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600' // For credit cards, increase is bad
    if (change < 0) return 'text-green-600' // Decrease is good
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-4">
      {/* Warning for high utilization */}
      {currentMonthStats.utilizationRate > 80 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200">
              تحذير: نسبة استخدام عالية ({currentMonthStats.utilizationRate.toFixed(1)}%)
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              يُنصح بتقليل نسبة الاستخدام إلى أقل من 30% للحفاظ على تقييم ائتماني جيد
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mb-2">{stat.value}</p>
                  
                  {stat.change !== undefined ? (
                    <div className="flex items-center gap-1">
                      <span className={`flex items-center gap-1 text-sm font-medium ${getChangeColor(stat.change)}`}>
                        {getChangeIcon(stat.change)}
                        {Math.abs(stat.change).toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stat.changeLabel}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  )}
                </div>
                
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

