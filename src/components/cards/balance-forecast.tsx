'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard as CreditCardType, Payment } from '@/contexts/cards-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface BalanceForecastProps {
  cards: CreditCardType[]
  payments: Payment[]
}

export function BalanceForecast({ cards, payments }: BalanceForecastProps) {
  const forecast = useMemo(() => {
    // Calculate average daily spending for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date)
      return paymentDate >= thirtyDaysAgo
    })

    const totalSpent = recentPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const avgDailySpending = totalSpent / 30

    return cards
      .filter(card => card.isActive)
      .map(card => {
        const availableBalance = (card.creditLimit ?? 0) - (card.currentBalance ?? 0)
        const utilizationRate = ((card.currentBalance ?? 0) / (card.creditLimit ?? 1)) * 100

        // Calculate days until credit limit is reached
        const daysUntilLimit = avgDailySpending > 0 
          ? Math.floor(availableBalance / avgDailySpending)
          : Infinity

        // Determine status
        let status: 'critical' | 'warning' | 'good'
        let statusLabel: string
        let statusColor: string
        let statusIcon: any

        if (utilizationRate >= 90) {
          status = 'critical'
          statusLabel = 'حرج'
          statusColor = 'text-red-600'
          statusIcon = AlertTriangle
        } else if (utilizationRate >= 70 || daysUntilLimit <= 7) {
          status = 'warning'
          statusLabel = 'تحذير'
          statusColor = 'text-orange-600'
          statusIcon = AlertCircle
        } else {
          status = 'good'
          statusLabel = 'جيد'
          statusColor = 'text-green-600'
          statusIcon = CheckCircle2
        }

        return {
          card,
          availableBalance,
          utilizationRate,
          daysUntilLimit,
          status,
          statusLabel,
          statusColor,
          statusIcon,
          avgDailySpending,
        }
      })
      .sort((a, b) => {
        // Sort by status priority (critical > warning > good)
        const statusPriority = { critical: 0, warning: 1, good: 2 }
        return statusPriority[a.status] - statusPriority[b.status]
      })
  }, [cards, payments])

  if (forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            توقعات الرصيد
          </CardTitle>
          <CardDescription>متى ستصل للحد الائتماني؟</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد بطاقات نشطة</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          توقعات الرصيد
        </CardTitle>
        <CardDescription>
          بناءً على متوسط الإنفاق اليومي خلال آخر 30 يوم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forecast.map(item => {
            const StatusIcon = item.statusIcon
            
            return (
              <div key={item.card.id} className="space-y-3 p-4 border rounded-lg">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{(item.card as any).cardName || item.card.name}</h4>
                      <div className={`flex items-center gap-1 text-xs font-medium ${item.statusColor}`}>
                        <StatusIcon className="h-3 w-3" />
                        {item.statusLabel}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(item.card as any).bankName}
                    </p>
                  </div>
                </div>

                {/* Utilization Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">نسبة الاستخدام:</span>
                    <span className={`font-medium ${item.statusColor}`}>
                      {item.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={item.utilizationRate} 
                    className="h-2"
                  />
                </div>

                {/* Balance Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">الحد الائتماني:</p>
                    <p className="font-medium">{formatCurrency(item.card.creditLimit ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المتاح:</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(item.availableBalance)}
                    </p>
                  </div>
                </div>

                {/* Forecast */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">متوسط الإنفاق اليومي:</span>
                    <span className="font-medium">{formatCurrency(item.avgDailySpending)}</span>
                  </div>
                  
                  {item.daysUntilLimit !== Infinity ? (
                    <div className={`mt-2 p-2 rounded ${
                      item.status === 'critical'
                        ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
                        : item.status === 'warning'
                        ? 'bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800'
                        : 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
                    }`}>
                      <p className={`text-sm font-medium ${
                        item.status === 'critical'
                          ? 'text-red-700 dark:text-red-300'
                          : item.status === 'warning'
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        {item.daysUntilLimit === 0
                          ? 'وصلت للحد الائتماني!'
                          : item.daysUntilLimit === 1
                          ? 'ستصل للحد الائتماني خلال يوم واحد'
                          : `ستصل للحد الائتماني خلال ${item.daysUntilLimit} يوم`
                        }
                      </p>
                      {item.daysUntilLimit > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          التاريخ المتوقع: {new Date(Date.now() + item.daysUntilLimit * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 p-2 rounded bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        لا يوجد إنفاق حالياً
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

