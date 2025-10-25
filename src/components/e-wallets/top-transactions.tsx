'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EWallet } from '@/contexts/e-wallets-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Wallet } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TopTransactionsProps {
  wallets: EWallet[]
}

export function TopTransactions({ wallets }: TopTransactionsProps) {
  const topWallets = useMemo(() => {
    // ترتيب المحافظ حسب الرصيد (الأعلى أولاً)
    const sorted = [...wallets]
      .filter(w => (w as any).isActive || w.status === 'active')
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)

    const maxBalance = sorted[0]?.balance || 1

    return sorted.map(wallet => ({
      id: wallet.id,
      name: wallet.walletName,
      provider: wallet.provider,
      balance: wallet.balance,
      percentage: (wallet.balance / maxBalance) * 100,
      transactionCount: wallet.transactionCount || 0,
    }))
  }, [wallets])

  const totalBalance = useMemo(() => {
    return topWallets.reduce((sum, w) => sum + w.balance, 0)
  }, [topWallets])

  if (topWallets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أعلى المحافظ رصيداً
          </CardTitle>
          <CardDescription>أعلى 5 محافظ من حيث الرصيد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد محافظ نشطة</p>
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
          أعلى المحافظ رصيداً
        </CardTitle>
        <CardDescription>
          أعلى 5 محافظ من حيث الرصيد - الإجمالي: {formatCurrency(totalBalance)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topWallets.map((wallet, index) => (
            <div key={wallet.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{wallet.name}</p>
                    <p className="text-xs text-muted-foreground">{wallet.provider}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">{formatCurrency(wallet.balance)}</p>
                  <p className="text-xs text-muted-foreground">
                    {wallet.transactionCount} معاملة
                  </p>
                </div>
              </div>
              <Progress value={wallet.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

