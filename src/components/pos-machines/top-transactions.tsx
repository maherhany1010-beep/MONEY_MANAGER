'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { POSMachine } from '@/contexts/pos-machines-context'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, CreditCard } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TopTransactionsProps {
  machines: POSMachine[]
}

export function TopTransactions({ machines }: TopTransactionsProps) {
  const topMachines = useMemo(() => {
    // ترتيب الماكينات حسب المبيعات الشهرية (الأعلى أولاً)
    const sorted = [...machines]
      .filter(m => m.status === 'active')
      .sort((a, b) => (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0))
      .slice(0, 5)

    const maxRevenue = sorted[0]?.monthlyRevenue || 1

    return sorted.map(machine => ({
      id: machine.id,
      name: machine.machineName,
      machineId: machine.machineId,
      location: machine.location,
      provider: machine.provider,
      revenue: machine.monthlyRevenue || 0,
      transactions: machine.totalTransactions || 0,
      percentage: ((machine.monthlyRevenue || 0) / maxRevenue) * 100,
    }))
  }, [machines])

  const totalRevenue = useMemo(() => {
    return topMachines.reduce((sum, m) => sum + m.revenue, 0)
  }, [topMachines])

  if (topMachines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أعلى الماكينات مبيعاً
          </CardTitle>
          <CardDescription>أعلى 5 ماكينات من حيث المبيعات الشهرية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد ماكينات نشطة</p>
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
          أعلى الماكينات مبيعاً
        </CardTitle>
        <CardDescription>
          أعلى 5 ماكينات من حيث المبيعات - الإجمالي: {formatCurrency(totalRevenue)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMachines.map((machine, index) => (
            <div key={machine.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{machine.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {machine.location} • {machine.provider}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">{formatCurrency(machine.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {machine.transactions.toLocaleString()} معاملة
                  </p>
                </div>
              </div>
              <Progress value={machine.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

