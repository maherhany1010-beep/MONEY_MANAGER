'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PrepaidCard, PrepaidTransaction } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface DashboardStatsProps {
  cards: PrepaidCard[]
  transactions: PrepaidTransaction[]
}

export function DashboardStats({ cards, transactions }: DashboardStatsProps) {
  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    return {
      deposits: currentMonthTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawals: currentMonthTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      purchases: currentMonthTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0),
      fees: currentMonthTransactions.reduce((sum, t) => sum + t.fee, 0),
      count: currentMonthTransactions.length,
    }
  }, [transactions])

  // Calculate previous month stats for comparison
  const previousMonthStats = useMemo(() => {
    const now = new Date()
    const previousMonth = now.getMonth() - 1
    const previousYear = previousMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()
    const adjustedMonth = previousMonth < 0 ? 11 : previousMonth

    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === adjustedMonth && date.getFullYear() === previousYear
    })

    return {
      deposits: previousMonthTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawals: previousMonthTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      purchases: previousMonthTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0),
      count: previousMonthTransactions.length,
    }
  }, [transactions])

  // Calculate percentage changes
  const changes = useMemo(() => {
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      deposits: calculateChange(currentMonthStats.deposits, previousMonthStats.deposits),
      withdrawals: calculateChange(currentMonthStats.withdrawals, previousMonthStats.withdrawals),
      purchases: calculateChange(currentMonthStats.purchases, previousMonthStats.purchases),
      transactions: calculateChange(currentMonthStats.count, previousMonthStats.count),
    }
  }, [currentMonthStats, previousMonthStats])

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return cards.reduce((sum, card) => sum + card.balance, 0)
  }, [cards])

  // Calculate active cards
  const activeCards = useMemo(() => {
    return cards.filter(card => card.status === 'active').length
  }, [cards])

  const stats = [
    {
      title: 'إجمالي الرصيد',
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: `${activeCards} بطاقة نشطة`,
    },
    {
      title: 'الشحن هذا الشهر',
      value: formatCurrency(currentMonthStats.deposits),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: changes.deposits,
      changeLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'السحب والمشتريات',
      value: formatCurrency(currentMonthStats.withdrawals + currentMonthStats.purchases),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      change: changes.withdrawals + changes.purchases,
      changeLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'الرسوم المدفوعة',
      value: formatCurrency(currentMonthStats.fees),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'هذا الشهر',
    },
    {
      title: 'عدد المعاملات',
      value: currentMonthStats.count.toString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: changes.transactions,
      changeLabel: 'مقارنة بالشهر السابق',
    },
    {
      title: 'البطاقات النشطة',
      value: `${activeCards} / ${cards.length}`,
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
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
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
  )
}

