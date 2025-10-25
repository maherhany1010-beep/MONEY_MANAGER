'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrepaidTransaction } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { Store, TrendingUp } from 'lucide-react'

interface TopMerchantsProps {
  transactions: PrepaidTransaction[]
}

export function TopMerchants({ transactions }: TopMerchantsProps) {
  const topMerchants = useMemo(() => {
    const merchantMap = new Map<string, { total: number; count: number }>()

    transactions
      .filter(t => t.type === 'purchase' && t.merchantName)
      .forEach(t => {
        const current = merchantMap.get(t.merchantName!) || { total: 0, count: 0 }
        merchantMap.set(t.merchantName!, {
          total: current.total + t.amount,
          count: current.count + 1,
        })
      })

    return Array.from(merchantMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [transactions])

  if (topMerchants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            أهم التجار
          </CardTitle>
          <CardDescription>التجار الأكثر إنفاقاً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد مشتريات بعد</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxTotal = topMerchants[0].total

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          أهم التجار
        </CardTitle>
        <CardDescription>التجار الأكثر إنفاقاً</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMerchants.map((merchant, index) => {
            const percentage = (merchant.total / maxTotal) * 100

            return (
              <div key={merchant.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{merchant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {merchant.count} معاملة • متوسط {formatCurrency(merchant.average)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0 mr-3">
                    <p className="font-bold text-blue-600">{formatCurrency(merchant.total)}</p>
                  </div>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {topMerchants.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">إجمالي الإنفاق</span>
              <span className="font-bold text-lg">
                {formatCurrency(topMerchants.reduce((sum, m) => sum + m.total, 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

