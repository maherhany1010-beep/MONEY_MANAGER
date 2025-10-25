'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { POSMachine } from '@/contexts/pos-machines-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, AlertCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface BalanceForecastProps {
  machines: POSMachine[]
}

export function BalanceForecast({ machines }: BalanceForecastProps) {
  const analysis = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - currentDay

    return machines
      .filter(m => m.status === 'active' && m.monthlyTarget && m.monthlyTarget > 0)
      .map(machine => {
        const target = machine.monthlyTarget || 0
        const achieved = machine.monthlyRevenue || 0
        const targetPercentage = target > 0 ? (achieved / target) * 100 : 0
        const remaining = Math.max(0, target - achieved)
        const penaltyThreshold = machine.penaltyThreshold || 80
        const penaltyAmount = machine.penaltyAmount || 0

        // تحديد حالة الهدف
        let status: 'achieved' | 'close' | 'far' = 'far'
        if (targetPercentage >= 100) {
          status = 'achieved'
        } else if (targetPercentage >= penaltyThreshold) {
          status = 'close'
        }

        // حساب المطلوب يومياً لتحقيق الهدف
        const dailyRequired = daysRemaining > 0 ? remaining / daysRemaining : remaining

        // اقتراحات للتحسين
        const suggestions: string[] = []
        if (status === 'far') {
          suggestions.push(`يجب تحقيق ${formatCurrency(dailyRequired)} يومياً للوصول للهدف`)
          suggestions.push('زيادة الحملات التسويقية بشكل عاجل')
          suggestions.push('مراجعة استراتيجية التسعير والعروض')
        } else if (status === 'close') {
          suggestions.push(`يجب تحقيق ${formatCurrency(dailyRequired)} يومياً للوصول للهدف`)
          suggestions.push('الحفاظ على الأداء الحالي')
        }

        return {
          id: machine.id,
          name: machine.machineName,
          location: machine.location,
          target,
          achieved,
          targetPercentage,
          remaining,
          daysRemaining,
          dailyRequired,
          penaltyAmount,
          penaltyThreshold,
          status,
          suggestions,
        }
      })
      .sort((a, b) => {
        // ترتيب حسب الأولوية: far > close > achieved
        const statusOrder = { far: 0, close: 1, achieved: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      })
      .slice(0, 5)
  }, [machines])

  if (analysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            تحليل الأهداف الشهرية
          </CardTitle>
          <CardDescription>جميع الماكينات حققت أهدافها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="text-sm text-muted-foreground">
              لا توجد ماكينات تحتاج إلى تحسين في الوقت الحالي
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
          تحليل الأهداف الشهرية
        </CardTitle>
        <CardDescription>
          متابعة تحقيق الأهداف والغرامات المتوقعة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analysis.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.status === 'far' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {item.status === 'close' && (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    {item.status === 'achieved' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">
                    {item.targetPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    من الهدف
                  </p>
                </div>
              </div>

              {/* معلومات الهدف */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">الهدف الشهري</p>
                  <p className="font-semibold text-foreground">{formatCurrency(item.target)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المحقق حتى الآن</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.achieved)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">المتبقي</p>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(item.remaining)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">الأيام المتبقية</p>
                  <p className="font-semibold text-foreground">{item.daysRemaining} يوم</p>
                </div>
              </div>

              <Progress
                value={Math.min(item.targetPercentage, 100)}
                className={`h-2 ${
                  item.status === 'far' ? '[&>div]:bg-red-600 dark:[&>div]:bg-red-500' :
                  item.status === 'close' ? '[&>div]:bg-orange-600 dark:[&>div]:bg-orange-500' :
                  '[&>div]:bg-green-600 dark:[&>div]:bg-green-500'
                }`}
              />

              <div className={`mt-2 p-2 rounded border ${
                item.status === 'far'
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'
                  : item.status === 'close'
                  ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800'
                  : 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
              }`}>
                <p className={`text-sm font-medium ${
                  item.status === 'far'
                    ? 'text-red-700 dark:text-red-300'
                    : item.status === 'close'
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-green-700 dark:text-green-300'
                }`}>
                  {item.status === 'far'
                    ? `⚠️ بعيد عن الهدف - غرامة متوقعة: ${formatCurrency(item.penaltyAmount)}`
                    : item.status === 'close'
                    ? `⚡ قريب من الهدف - تجنب الغرامة بتحقيق ${item.penaltyThreshold}%`
                    : '✅ تم تحقيق الهدف - ممتاز!'
                  }
                </p>

                {item.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Lightbulb className="h-3 w-3" />
                      <span>اقتراحات للتحسين:</span>
                    </div>
                    {item.suggestions.map((suggestion, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground mr-4">
                        • {suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

