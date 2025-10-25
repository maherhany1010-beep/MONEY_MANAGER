'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EWallet } from '@/contexts/e-wallets-context'
import { formatCurrency } from '@/lib/utils'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface DashboardStatsProps {
  wallets: EWallet[]
}

export function DashboardStats({ wallets }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const activeWallets = wallets.filter(w => (w as any).isActive || w.status === 'active')
    const totalBalance = activeWallets.reduce((sum, w) => sum + w.balance, 0)
    const totalMonthlyDeposits = activeWallets.reduce((sum, w) => sum + (w.monthlyDeposits || 0), 0)
    const totalMonthlyWithdrawals = activeWallets.reduce((sum, w) => sum + (w.monthlyWithdrawals || 0), 0)
    const totalTransactions = activeWallets.reduce((sum, w) => sum + (w.transactionCount || 0), 0)

    // حساب إحصائيات الشهر السابق (محاكاة)
    const lastMonthDeposits = totalMonthlyDeposits * 0.85
    const lastMonthWithdrawals = totalMonthlyWithdrawals * 0.9
    const lastMonthBalance = totalBalance * 0.92

    // حساب نسب التغيير
    const depositsChange = lastMonthDeposits > 0 
      ? ((totalMonthlyDeposits - lastMonthDeposits) / lastMonthDeposits) * 100 
      : 0
    const withdrawalsChange = lastMonthWithdrawals > 0 
      ? ((totalMonthlyWithdrawals - lastMonthWithdrawals) / lastMonthWithdrawals) * 100 
      : 0
    const balanceChange = lastMonthBalance > 0 
      ? ((totalBalance - lastMonthBalance) / lastMonthBalance) * 100 
      : 0

    const netFlow = totalMonthlyDeposits - totalMonthlyWithdrawals

    return {
      totalBalance,
      totalMonthlyDeposits,
      totalMonthlyWithdrawals,
      totalTransactions,
      activeWalletsCount: activeWallets.length,
      depositsChange,
      withdrawalsChange,
      balanceChange,
      netFlow,
    }
  }, [wallets])

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    subtitle 
  }: { 
    title: string
    value: string
    icon: any
    change?: number
    subtitle?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-xs font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">عن الشهر السابق</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      {/* تحذير عند وجود رصيد منخفض */}
      {wallets.some(w => ((w as any).isActive || w.status === 'active') && w.balance < ((w as any).minBalance || 0)) && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-orange-900 dark:text-orange-200">
              تحذير: بعض المحافظ أقل من الحد الأدنى
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              يُنصح بشحن المحافظ التي وصلت للحد الأدنى للرصيد
            </p>
          </div>
        </div>
      )}

      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="إجمالي الرصيد"
          value={formatCurrency(stats.totalBalance)}
          icon={DollarSign}
          change={stats.balanceChange}
          subtitle={`${stats.activeWalletsCount} محفظة نشطة`}
        />

        <StatCard
          title="الإيداعات الشهرية"
          value={formatCurrency(stats.totalMonthlyDeposits)}
          icon={TrendingUp}
          change={stats.depositsChange}
        />

        <StatCard
          title="السحوبات الشهرية"
          value={formatCurrency(stats.totalMonthlyWithdrawals)}
          icon={TrendingDown}
          change={stats.withdrawalsChange}
        />

        <StatCard
          title="صافي التدفق النقدي"
          value={formatCurrency(stats.netFlow)}
          icon={Activity}
          subtitle={stats.netFlow >= 0 ? 'تدفق إيجابي' : 'تدفق سلبي'}
        />

        <StatCard
          title="إجمالي المعاملات"
          value={stats.totalTransactions.toString()}
          icon={Wallet}
          subtitle="هذا الشهر"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط الرصيد
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.activeWalletsCount > 0 ? stats.totalBalance / stats.activeWalletsCount : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              لكل محفظة نشطة
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

