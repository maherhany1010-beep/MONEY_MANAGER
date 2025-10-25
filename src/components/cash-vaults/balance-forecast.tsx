'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CashVault } from '@/contexts/cash-vaults-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface BalanceForecastProps {
  vaults: CashVault[]
}

export function BalanceForecast({ vaults }: BalanceForecastProps) {
  const forecasts = useMemo(() => {
    return vaults
      .filter(v => v.isActive)
      .map(vault => {
        const monthlyWithdrawals = vault.monthlyWithdrawals || 0
        const monthlyDeposits = vault.monthlyDeposits || 0
        const avgDailySpending = monthlyWithdrawals / 30
        const avgDailyIncome = monthlyDeposits / 30
        const netDailyFlow = avgDailyIncome - avgDailySpending

        let daysUntilEmpty = Infinity
        if (netDailyFlow < 0) {
          daysUntilEmpty = Math.floor(vault.balance / Math.abs(netDailyFlow))
        }

        const minBalance = vault.minBalance || 0
        const balancePercentage = minBalance > 0 ? (vault.balance / minBalance) * 100 : 100

        // حساب نسبة استخدام السعة
        const maxCapacity = vault.maxCapacity || 0
        const capacityUsage = maxCapacity > 0 ? (vault.balance / maxCapacity) * 100 : 0

        let status: 'critical' | 'warning' | 'good' = 'good'
        if (vault.balance <= minBalance || capacityUsage > 90) {
          status = 'critical'
        } else if (daysUntilEmpty <= 7 || balancePercentage <= 150 || capacityUsage > 75) {
          status = 'warning'
        }

        return {
          id: vault.id,
          name: vault.vaultName,
          location: vault.location,
          balance: vault.balance,
          minBalance,
          maxCapacity,
          daysUntilEmpty,
          avgDailySpending,
          netDailyFlow,
          status,
          balancePercentage: Math.min(balancePercentage, 100),
          capacityUsage,
        }
      })
      .filter(f => f.status !== 'good' || f.daysUntilEmpty < 30 || f.capacityUsage > 70)
      .sort((a, b) => {
        // ترتيب حسب الأولوية: critical > warning > good
        const statusOrder = { critical: 0, warning: 1, good: 2 }
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status]
        }
        return a.daysUntilEmpty - b.daysUntilEmpty
      })
      .slice(0, 5)
  }, [vaults])

  if (forecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            توقعات السيولة
          </CardTitle>
          <CardDescription>جميع الخزائن في وضع جيد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="text-sm text-muted-foreground">
              لا توجد خزائن تحتاج إلى انتباه في الوقت الحالي
            </p>
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
          توقعات السيولة
        </CardTitle>
        <CardDescription>
          الخزائن التي تحتاج إلى انتباه
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forecasts.map((forecast) => (
            <div key={forecast.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{forecast.name}</p>
                    {forecast.status === 'critical' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {forecast.status === 'warning' && (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{forecast.location}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">
                    {formatCurrency(forecast.balance)}
                  </p>
                  {forecast.maxCapacity > 0 && (
                    <p className="text-xs text-muted-foreground">
                      السعة: {forecast.capacityUsage.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>

              <Progress 
                value={forecast.capacityUsage > 0 ? forecast.capacityUsage : forecast.balancePercentage} 
                className={`h-2 ${
                  forecast.status === 'critical' ? '[&>div]:bg-red-600' :
                  forecast.status === 'warning' ? '[&>div]:bg-orange-600' :
                  '[&>div]:bg-green-600'
                }`}
              />

              {forecast.capacityUsage > 80 ? (
                <div className={`mt-2 p-2 rounded border ${
                  forecast.capacityUsage > 90
                    ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' 
                    : 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800'
                }`}>
                  <p className={`text-sm font-medium ${
                    forecast.capacityUsage > 90
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-orange-700 dark:text-orange-300'
                  }`}>
                    {forecast.capacityUsage > 90 
                      ? 'تحذير: اقتراب من السعة القصوى!'
                      : 'تنبيه: استخدام عالٍ للسعة'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    السعة القصوى: {formatCurrency(forecast.maxCapacity)}
                  </p>
                </div>
              ) : forecast.daysUntilEmpty !== Infinity ? (
                <div className={`mt-2 p-2 rounded border ${
                  forecast.status === 'critical' 
                    ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' 
                    : forecast.status === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800'
                    : 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
                }`}>
                  <p className={`text-sm font-medium ${
                    forecast.status === 'critical' 
                      ? 'text-red-700 dark:text-red-300' 
                      : forecast.status === 'warning'
                      ? 'text-orange-700 dark:text-orange-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {forecast.daysUntilEmpty === 0 
                      ? 'الرصيد أقل من الحد الأدنى!'
                      : forecast.daysUntilEmpty === 1
                      ? 'سيصل للحد الأدنى خلال يوم واحد'
                      : `سيصل للحد الأدنى خلال ${forecast.daysUntilEmpty} يوم`
                    }
                  </p>
                  {forecast.daysUntilEmpty > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      التاريخ المتوقع: {new Date(Date.now() + forecast.daysUntilEmpty * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 p-2 rounded bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    السيولة مستقرة
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

