'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { CreditCard, DollarSign, TrendingUp, Gift } from 'lucide-react'
import { useCards } from '@/contexts/cards-context'

export function CardsStatistics() {
  const { cards, getTotalCreditLimit, getTotalBalance, getTotalCashback } = useCards()

  const stats = useMemo(() => {
    const totalLimit = getTotalCreditLimit()
    const totalBalance = getTotalBalance()
    const totalCashback = getTotalCashback()
    const utilizationRate = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0
    const availableCredit = totalLimit - totalBalance

    return {
      totalLimit,
      totalBalance,
      totalCashback,
      utilizationRate,
      availableCredit,
      activeCards: cards.filter(c => c.isActive).length,
      totalCards: cards.length,
    }
  }, [cards, getTotalCreditLimit, getTotalBalance, getTotalCashback])

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600 dark:text-red-400'
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* إجمالي الحد الائتماني */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الحد الائتماني
              </p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.totalLimit)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.activeCards} من {stats.totalCards} بطاقة نشطة
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إجمالي الرصيد المستخدم */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الرصيد المستخدم
              </p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.totalBalance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                متاح: {formatCurrency(stats.availableCredit)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نسبة الاستخدام */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                نسبة الاستخدام
              </p>
              <p className={`text-2xl font-bold mt-2 ${getUtilizationColor(stats.utilizationRate)}`}>
                {formatPercentage(stats.utilizationRate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.utilizationRate >= 80 ? 'مرتفع جداً' : stats.utilizationRate >= 50 ? 'متوسط' : 'جيد'}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              stats.utilizationRate >= 80 
                ? 'bg-red-100 dark:bg-red-900/30' 
                : stats.utilizationRate >= 50 
                ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              <TrendingUp className={`h-6 w-6 ${getUtilizationColor(stats.utilizationRate)}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إجمالي الكاش باك */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الكاش باك
              </p>
              <p className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalCashback)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                من جميع المشتريات
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

