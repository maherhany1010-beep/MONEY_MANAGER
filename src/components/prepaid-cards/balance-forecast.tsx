'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PrepaidCard, PrepaidTransaction } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'

interface BalanceForecastProps {
  cards: PrepaidCard[]
  transactions: PrepaidTransaction[]
}

export function BalanceForecast({ cards, transactions }: BalanceForecastProps) {
  const forecast = useMemo(() => {
    // Calculate average daily spending for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date >= thirtyDaysAgo && (t.type === 'withdrawal' || t.type === 'purchase')
    })

    const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
    const avgDailySpending = totalSpent / 30

    // Calculate forecast for each card
    return cards
      .filter(card => card.status === 'active')
      .map(card => {
        const daysUntilEmpty = avgDailySpending > 0 ? Math.floor(card.balance / avgDailySpending) : Infinity
        const estimatedEmptyDate = new Date()
        estimatedEmptyDate.setDate(estimatedEmptyDate.getDate() + daysUntilEmpty)

        let status: 'critical' | 'warning' | 'good'
        if (daysUntilEmpty < 7) status = 'critical'
        else if (daysUntilEmpty < 30) status = 'warning'
        else status = 'good'

        return {
          cardId: card.id,
          cardName: card.cardName,
          balance: card.balance,
          avgDailySpending,
          daysUntilEmpty,
          estimatedEmptyDate,
          status,
        }
      })
      .sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty)
  }, [cards, transactions])

  const getStatusBadge = (status: 'critical' | 'warning' | 'good') => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">حرج</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">تحذير</Badge>
      case 'good':
        return <Badge variant="outline" className="border-green-500 text-green-600">جيد</Badge>
    }
  }

  const getStatusIcon = (status: 'critical' | 'warning' | 'good') => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <TrendingDown className="h-5 w-5 text-orange-600" />
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  if (forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            توقعات الرصيد
          </CardTitle>
          <CardDescription>توقعات ذكية لنفاد الرصيد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد بطاقات نشطة</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          توقعات الرصيد
        </CardTitle>
        <CardDescription>توقعات ذكية بناءً على متوسط الإنفاق اليومي</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forecast.map((item) => (
            <div
              key={item.cardId}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium">{item.cardName}</p>
                    <p className="text-sm text-muted-foreground">
                      الرصيد الحالي: {formatCurrency(item.balance)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">متوسط الإنفاق اليومي</p>
                  <p className="font-medium">{formatCurrency(item.avgDailySpending)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">الأيام المتبقية</p>
                  <p className="font-medium">
                    {item.daysUntilEmpty === Infinity ? (
                      <span className="text-green-600">غير محدد</span>
                    ) : (
                      <span className={
                        item.status === 'critical' ? 'text-red-600' :
                        item.status === 'warning' ? 'text-orange-600' :
                        'text-green-600'
                      }>
                        {item.daysUntilEmpty} يوم
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {item.daysUntilEmpty !== Infinity && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      التاريخ المتوقع لنفاد الرصيد:{' '}
                      <span className="font-medium text-foreground">
                        {item.estimatedEmptyDate.toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {item.status === 'critical' && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                  ⚠️ تحذير: الرصيد قد ينفد خلال أسبوع! يُنصح بشحن البطاقة قريباً.
                </div>
              )}

              {item.status === 'warning' && (
                <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm text-orange-800 dark:text-orange-200">
                  💡 تنبيه: الرصيد قد ينفد خلال شهر. خطط لشحن البطاقة قريباً.
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>ملاحظة:</strong> التوقعات مبنية على متوسط الإنفاق اليومي خلال آخر 30 يوم.
            قد تختلف النتائج الفعلية حسب نمط الإنفاق.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

