'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BankAccount } from '@/contexts/bank-accounts-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Building2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TopTransactionsProps {
  accounts: BankAccount[]
}

export function TopTransactions({ accounts }: TopTransactionsProps) {
  const topAccounts = useMemo(() => {
    // ترتيب الحسابات حسب الرصيد (الأعلى أولاً)
    const sorted = [...accounts]
      .filter(a => a.isActive)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5)

    const maxBalance = sorted[0]?.balance || 1

    return sorted.map(account => ({
      id: account.id,
      name: account.accountName,
      bank: account.bankName,
      accountNumber: account.accountNumber,
      balance: account.balance,
      percentage: (account.balance / maxBalance) * 100,
      transactionCount: (account as any).transactionCount || 0,
      accountType: account.accountType,
    }))
  }, [accounts])

  const totalBalance = useMemo(() => {
    return topAccounts.reduce((sum, a) => sum + a.balance, 0)
  }, [topAccounts])

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'جاري'
      case 'savings': return 'توفير'
      case 'business': return 'تجاري'
      case 'investment': return 'استثماري'
      default: return type
    }
  }

  if (topAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أعلى الحسابات رصيداً
          </CardTitle>
          <CardDescription>أعلى 5 حسابات من حيث الرصيد</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد حسابات نشطة</p>
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
          أعلى الحسابات رصيداً
        </CardTitle>
        <CardDescription>
          أعلى 5 حسابات من حيث الرصيد - الإجمالي: {formatCurrency(totalBalance)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topAccounts.map((account, index) => (
            <div key={account.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.bank} • {getAccountTypeLabel(account.accountType ?? 'checking')}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">{formatCurrency(account.balance)}</p>
                  <p className="text-xs text-muted-foreground">
                    {account.transactionCount} معاملة
                  </p>
                </div>
              </div>
              <Progress value={account.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

