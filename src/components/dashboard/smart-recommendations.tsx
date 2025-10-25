'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface Recommendation {
  id: string
  type: 'success' | 'warning' | 'info' | 'tip'
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

interface SmartRecommendationsProps {
  data: {
    creditUtilization: number
    totalCashback: number
    spendingTrend: number
    hasOverduePayments: boolean
    lowBalanceAccounts: number
  }
}

export function SmartRecommendations({ data }: SmartRecommendationsProps) {
  const recommendations: Recommendation[] = []

  // توصيات بناءً على نسبة استخدام الحد الائتماني
  if (data.creditUtilization > 80) {
    recommendations.push({
      id: 'high-utilization',
      type: 'warning',
      title: 'نسبة استخدام عالية للحد الائتماني',
      description: `نسبة الاستخدام الحالية ${data.creditUtilization.toFixed(1)}%. يُنصح بتقليلها إلى أقل من 30% لتحسين التصنيف الائتماني.`,
      action: {
        label: 'عرض البطاقات',
        href: '/cards',
      },
    })
  } else if (data.creditUtilization < 30) {
    recommendations.push({
      id: 'good-utilization',
      type: 'success',
      title: 'نسبة استخدام ممتازة',
      description: `نسبة الاستخدام الحالية ${data.creditUtilization.toFixed(1)}%. هذا مثالي للحفاظ على تصنيف ائتماني جيد.`,
    })
  }

  // توصيات بناءً على الكاش باك
  if (data.totalCashback > 1000) {
    recommendations.push({
      id: 'high-cashback',
      type: 'success',
      title: 'كاش باك ممتاز هذا الشهر!',
      description: `لقد كسبت ${data.totalCashback.toFixed(2)} جنيه كاش باك. استمر في استخدام البطاقات ذات النسب العالية.`,
      action: {
        label: 'عرض الكاش باك',
        href: '/cashback',
      },
    })
  }

  // توصيات بناءً على اتجاه الإنفاق
  if (data.spendingTrend > 20) {
    recommendations.push({
      id: 'high-spending-increase',
      type: 'warning',
      title: 'زيادة كبيرة في الإنفاق',
      description: `الإنفاق زاد بنسبة ${data.spendingTrend.toFixed(1)}% مقارنة بالشهر السابق. راجع ميزانيتك.`,
      action: {
        label: 'عرض التقارير',
        href: '/reports/financial',
      },
    })
  } else if (data.spendingTrend < -10) {
    recommendations.push({
      id: 'spending-decrease',
      type: 'success',
      title: 'انخفاض في الإنفاق',
      description: `الإنفاق انخفض بنسبة ${Math.abs(data.spendingTrend).toFixed(1)}%. عمل رائع في التحكم بالمصروفات!`,
    })
  }

  // توصيات بناءً على المدفوعات المتأخرة
  if (data.hasOverduePayments) {
    recommendations.push({
      id: 'overdue-payments',
      type: 'warning',
      title: 'لديك مدفوعات متأخرة',
      description: 'يوجد مدفوعات متأخرة. قم بسدادها في أقرب وقت لتجنب الرسوم الإضافية.',
      action: {
        label: 'عرض المدفوعات',
        href: '/payments',
      },
    })
  }

  // توصيات بناءً على الأرصدة المنخفضة
  if (data.lowBalanceAccounts > 0) {
    recommendations.push({
      id: 'low-balance',
      type: 'info',
      title: 'أرصدة منخفضة',
      description: `لديك ${data.lowBalanceAccounts} حساب برصيد منخفض. قد تحتاج إلى تحويل أموال.`,
      action: {
        label: 'عرض الحسابات',
        href: '/bank-accounts',
      },
    })
  }

  // نصائح عامة
  recommendations.push({
    id: 'general-tip',
    type: 'tip',
    title: 'نصيحة: استخدم البطاقة المناسبة',
    description: 'استخدم البطاقة ذات أعلى نسبة كاش باك لكل فئة من المشتريات لتحقيق أقصى استفادة.',
  })

  const getIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-purple-600" />
    }
  }

  const getBgColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
      case 'tip':
        return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          التوصيات الذكية
        </CardTitle>
        <CardDescription>
          نصائح مخصصة بناءً على نشاطك المالي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <p className="text-muted-foreground">
                كل شيء يبدو رائعاً! لا توجد توصيات في الوقت الحالي.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border ${getBgColor(rec.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getIcon(rec.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    {rec.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.location.href = rec.action!.href}
                      >
                        {rec.action.label}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

