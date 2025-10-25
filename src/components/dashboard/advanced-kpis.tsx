'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Gift, 
  Activity,
  ArrowUpDown,
  Percent
} from 'lucide-react'

interface KPI {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: React.ElementType
  color: string
  bgColor: string
}

interface AdvancedKPIsProps {
  data: {
    totalSpending: number
    totalCashback: number
    creditUtilization: number
    transactionCount: number
    averageTransaction: number
    spendingChange: number
    cashbackChange: number
  }
}

export function AdvancedKPIs({ data }: AdvancedKPIsProps) {
  const kpis: KPI[] = [
    {
      title: 'إجمالي الإنفاق الشهري',
      value: formatCurrency(data.totalSpending),
      change: data.spendingChange,
      changeLabel: 'مقارنة بالشهر السابق',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'الكاش باك المكتسب',
      value: formatCurrency(data.totalCashback),
      change: data.cashbackChange,
      changeLabel: 'مقارنة بالشهر السابق',
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'نسبة استخدام الحد الائتماني',
      value: formatPercentage(data.creditUtilization),
      icon: Percent,
      color: data.creditUtilization > 80 ? 'text-red-600' : data.creditUtilization > 50 ? 'text-orange-600' : 'text-green-600',
      bgColor: data.creditUtilization > 80 ? 'bg-red-50 dark:bg-red-950/20' : data.creditUtilization > 50 ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'عدد المعاملات',
      value: data.transactionCount.toString(),
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: 'متوسط قيمة المعاملة',
      value: formatCurrency(data.averageTransaction),
      icon: ArrowUpDown,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        const hasPositiveChange = kpi.change !== undefined && kpi.change >= 0
        
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </p>
                
                {kpi.change !== undefined && (
                  <div className="flex items-center gap-1">
                    {hasPositiveChange ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      hasPositiveChange ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {hasPositiveChange ? '+' : ''}{formatPercentage(kpi.change, 1)}
                    </span>
                    {kpi.changeLabel && (
                      <span className="text-xs text-muted-foreground">
                        {kpi.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

