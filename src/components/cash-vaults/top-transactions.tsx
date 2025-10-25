'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CashVault } from '@/contexts/cash-vaults-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Vault } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TopTransactionsProps {
  vaults: CashVault[]
}

export function TopTransactions({ vaults }: TopTransactionsProps) {
  const topVaults = useMemo(() => {
    // ترتيب الخزائن حسب الرصيد (الأعلى أولاً)
    const sorted = [...vaults]
      .filter(v => v.isActive)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)

    const maxBalance = sorted[0]?.balance || 1

    return sorted.map(vault => ({
      id: vault.id,
      name: vault.vaultName,
      location: vault.location,
      balance: vault.balance,
      percentage: (vault.balance / maxBalance) * 100,
      transactionCount: vault.transactionCount || 0,
      capacity: vault.maxCapacity || 0,
    }))
  }, [vaults])

  const totalBalance = useMemo(() => {
    return topVaults.reduce((sum, v) => sum + v.balance, 0)
  }, [topVaults])

  if (topVaults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أعلى الخزائن رصيداً
          </CardTitle>
          <CardDescription>أعلى 5 خزائن من حيث الرصيد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Vault className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد خزائن نشطة</p>
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
          أعلى الخزائن رصيداً
        </CardTitle>
        <CardDescription>
          أعلى 5 خزائن من حيث الرصيد - الإجمالي: {formatCurrency(totalBalance)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topVaults.map((vault, index) => (
            <div key={vault.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{vault.name}</p>
                    <p className="text-xs text-muted-foreground">{vault.location}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">{formatCurrency(vault.balance)}</p>
                  <p className="text-xs text-muted-foreground">
                    {vault.transactionCount} معاملة
                  </p>
                </div>
              </div>
              <Progress value={vault.percentage} className="h-2" />
              {vault.capacity > 0 && (
                <p className="text-xs text-muted-foreground">
                  السعة: {formatCurrency(vault.capacity)} ({((vault.balance / vault.capacity) * 100).toFixed(1)}%)
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

