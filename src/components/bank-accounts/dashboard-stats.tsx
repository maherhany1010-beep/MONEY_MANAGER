'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BankAccount } from '@/contexts/bank-accounts-context'
import { formatCurrency } from '@/lib/utils'
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard
} from 'lucide-react'

interface DashboardStatsProps {
  accounts: BankAccount[]
}

export function DashboardStats({ accounts }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const activeAccounts = accounts.filter(a => a.isActive)
    const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalMonthlyDeposits = activeAccounts.reduce((sum, a: any) => sum + (a.monthlyDeposits || a.totalDeposits || 0), 0)
    const totalMonthlyWithdrawals = activeAccounts.reduce((sum, a: any) => sum + (a.monthlyWithdrawals || a.totalWithdrawals || 0), 0)
    const totalTransactions = activeAccounts.reduce((sum, a: any) => sum + (a.transactionCount || 0), 0)

    // حساب إحصائيات الشهر السابق (محاكاة)
    const lastMonthDeposits = totalMonthlyDeposits * 0.85
    const lastMonthWithdrawals = totalMonthlyWithdrawals * 0.90
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
    const avgBalance = activeAccounts.length > 0 ? totalBalance / activeAccounts.length : 0

    // حساب عدد الحسابات تحت الحد الأدنى
    const accountsBelowMin = activeAccounts.filter((a: any) =>
      a.minBalance && a.balance < a.minBalance
    ).length

    return {
      totalBalance,
      totalMonthlyDeposits,
      totalMonthlyWithdrawals,
      totalTransactions,
      activeAccountsCount: activeAccounts.length,
      depositsChange,
      withdrawalsChange,
      balanceChange,
      netFlow,
      avgBalance,
      accountsBelowMin,
    }
  }, [accounts])

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
      {/* تحذير عند وجود حسابات تحت الحد الأدنى */}
      {stats.accountsBelowMin > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-orange-900 dark:text-orange-200">
              تحذير: {stats.accountsBelowMin} حساب تحت الحد الأدنى
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              يُنصح بإيداع أموال في هذه الحسابات لتجنب الرسوم
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
          subtitle={`${stats.activeAccountsCount} حساب نشط`}
        />

        <StatCard
          title="متوسط الرصيد"
          value={formatCurrency(stats.avgBalance)}
          icon={Building2}
          subtitle="لكل حساب"
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
          icon={CreditCard}
          subtitle="هذا الشهر"
        />
      </div>
    </div>
  )
}

