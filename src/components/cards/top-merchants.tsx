'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard as CreditCardType, Payment } from '@/contexts/cards-context'
import { formatCurrency } from '@/lib/utils'
import { Store, TrendingUp, ShoppingBag } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TopMerchantsProps {
  cards: CreditCardType[]
  payments: Payment[]
}

export function TopMerchants({ cards, payments }: TopMerchantsProps) {
  const topMerchants = useMemo(() => {
    // Group payments by merchant
    const merchantMap = new Map<string, { total: number; count: number }>()

    payments.forEach((payment: any) => {
      if (payment.merchant) {
        const existing = merchantMap.get(payment.merchant) || { total: 0, count: 0 }
        merchantMap.set(payment.merchant, {
          total: existing.total + payment.amount,
          count: existing.count + 1,
        })
      }
    })

    // Convert to array and sort by total
    const merchantsArray = Array.from(merchantMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
    }))

    merchantsArray.sort((a, b) => b.total - a.total)

    // Get top 5
    return merchantsArray.slice(0, 5)
  }, [payments])

  const maxTotal = topMerchants.length > 0 ? topMerchants[0].total : 0

  if (topMerchants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            أهم التجار
          </CardTitle>
          <CardDescription>أكثر 5 تجار من حيث الإنفاق</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد معاملات مع تجار بعد</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          أهم التجار
        </CardTitle>
        <CardDescription>أكثر 5 تجار من حيث الإنفاق</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMerchants.map((merchant, index) => (
            <div key={merchant.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {merchant.count} {merchant.count === 1 ? 'معاملة' : 'معاملات'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{formatCurrency(merchant.total)}</p>
                  <p className="text-xs text-muted-foreground">
                    متوسط: {formatCurrency(merchant.average)}
                  </p>
                </div>
              </div>
              <Progress value={(merchant.total / maxTotal) * 100} className="h-2" />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">إجمالي الإنفاق مع أهم 5 تجار:</span>
            <span className="font-bold">
              {formatCurrency(topMerchants.reduce((sum, m) => sum + m.total, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

