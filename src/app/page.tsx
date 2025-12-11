'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useCards } from '@/contexts/cards-context'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'
import { useCentralTransfers } from '@/contexts/central-transfers-context'
import { useSales } from '@/contexts/sales-context'
import { useInvestments } from '@/contexts/investments-context'
import { useCustomers } from '@/contexts/customers-context'
import {
  CreditCard,
  DollarSign,
  ArrowUpDown,
  Landmark,
  Vault,
  Wallet,
  CircleDollarSign,
  Eye,
  EyeOff,
  PieChart,
  BarChart3,
  Users,
  Zap,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'

export default function DashboardPage() {
  const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility()
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: prepaidCards } = usePrepaidCards()
  const { cards: creditCards } = useCards()
  const { transfers } = useCentralTransfers()
  const { sales } = useSales()
  const { investments, getTotalProfitLoss } = useInvestments()
  const { customers } = useCustomers()

  // حساب الإحصائيات من البيانات الفعلية
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalVaultBalance = cashVaults.reduce((sum, vault) => sum + vault.balance, 0)
  const totalWalletBalance = eWallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const totalPrepaidBalance = prepaidCards.reduce((sum, card) => sum + card.balance, 0)
  const totalCreditBalance = creditCards.reduce((sum, card) => sum + ((card.creditLimit ?? card.credit_limit ?? 0) - (card.currentBalance ?? card.current_balance ?? 0)), 0)
  const totalAvailableBalance = totalBankBalance + totalVaultBalance + totalWalletBalance + totalPrepaidBalance + totalCreditBalance

  // حساب المديونية (الديون من البطاقات الائتمانية)
  const totalDebt = creditCards.reduce((sum, card) => sum + (card.currentBalance ?? card.current_balance ?? 0), 0)

  // حساب صافي الموازنة العامة (الأرصدة المتاحة - المديونية)
  const netBalance = totalAvailableBalance - totalDebt

  // حساب إجمالي التحويلات
  const totalTransfers = transfers.reduce((sum, t) => sum + (t.amount ?? 0), 0)

  // حساب إجمالي المبيعات
  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.total_amount ?? 0), 0)

  // حساب الأرباح والمصروفات (بيانات وهمية للآن - يمكن تحديثها لاحقاً)
  const totalProfit = getTotalProfitLoss()
  const totalExpenses = 0 // سيتم تحديثه عند إضافة نظام المصروفات

  // حساب إجمالي الاستثمارات
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.current_value ?? inv.currentValue ?? 0), 0)

  // حساب إجمالي مديونيات العملاء
  const totalCustomerDebts = customers.reduce((sum, c) => sum + (c.currentDebt ?? 0), 0)

  // بيانات الرسم البياني (فارغة - سيتم ملؤها من البيانات الفعلية)
  const chartData: Array<{ name: string; value: number }> = []



  return (
          <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="mt-1 text-muted-foreground">
              نظرة عامة شاملة على نظامك المالي
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBalanceVisibility}
              className="gap-2"
            >
              {isBalanceVisible ? (
                <>
                  <Eye className="h-4 w-4" />
                  إخفاء
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  إظهار
                </>
              )}
            </Button>
          </div>
        </div>

        {/* الملخص الشامل - صافي الموازنة العامة */}
        <Card className="bg-primary dark:bg-primary border-2 border-primary/50 shadow-xl rounded-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-5 sm:pt-6 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold text-primary-foreground">صافي الموازنة العامة</CardTitle>
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground/70" />
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 text-primary-foreground">
              {isBalanceVisible ? formatCurrency(netBalance) : '••••••'}
            </div>
            <p className="text-xs sm:text-sm text-primary-foreground/70">
              الفرق بين الأرصدة المتاحة والمديونية
            </p>
          </CardContent>
        </Card>

        {/* المؤشرات المالية الرئيسية - 8 مؤشرات */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. إجمالي المديونية */}
          <MetricCard
            title="إجمالي المديونية"
            value={totalDebt}
            icon={TrendingDownIcon}
            color="text-red-500"
            trend={-2.5}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 2. إجمالي الأرصدة المتاحة */}
          <MetricCard
            title="الأرصدة المتاحة"
            value={totalAvailableBalance}
            icon={DollarSign}
            color="text-blue-500"
            trend={3.2}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 3. التحويلات */}
          <MetricCard
            title="إجمالي التحويلات"
            value={totalTransfers}
            icon={ArrowUpDown}
            color="text-purple-500"
            trend={1.8}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 4. المبيعات */}
          <MetricCard
            title="إجمالي المبيعات"
            value={totalSalesAmount}
            icon={BarChart3}
            color="text-green-500"
            trend={5.4}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 5. الأرباح */}
          <MetricCard
            title="صافي الأرباح"
            value={totalProfit}
            icon={TrendingUpIcon}
            color="text-emerald-500"
            trend={4.1}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 6. المصروفات */}
          <MetricCard
            title="إجمالي المصروفات"
            value={totalExpenses}
            icon={Zap}
            color="text-orange-500"
            trend={-1.2}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 7. الاستثمارات */}
          <MetricCard
            title="إجمالي الاستثمارات"
            value={totalInvestments}
            icon={PieChart}
            color="text-cyan-500"
            trend={2.7}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />

          {/* 8. مديونيات العملاء */}
          <MetricCard
            title="مديونيات العملاء"
            value={totalCustomerDebts}
            icon={Users}
            color="text-pink-500"
            trend={-0.5}
            chartData={chartData}
            isVisible={isBalanceVisible}
            format={formatCurrency}
          />
        </div>

        {/* إجراءات سريعة */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">الوصول السريع</CardTitle>
            <CardDescription className="text-muted-foreground">انتقل مباشرة إلى الأقسام الرئيسية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => window.location.href = '/bank-accounts'}
              >
                <Landmark className="h-5 w-5" />
                <span className="text-xs">الحسابات البنكية</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => window.location.href = '/cash-vaults'}
              >
                <Vault className="h-5 w-5" />
                <span className="text-xs">الخزائن النقدية</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                onClick={() => window.location.href = '/e-wallets'}
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs">المحافظ الإلكترونية</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => window.location.href = '/cards'}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">البطاقات</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-950"
                onClick={() => window.location.href = '/prepaid-cards'}
              >
                <CircleDollarSign className="h-5 w-5" />
                <span className="text-xs">بطاقات مسبقة</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                onClick={() => window.location.href = '/transactions'}
              >
                <ArrowUpDown className="h-5 w-5" />
                <span className="text-xs">المعاملات</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-teal-50 dark:hover:bg-teal-950"
                onClick={() => window.location.href = '/customers'}
              >
                <CircleDollarSign className="h-5 w-5" />
                <span className="text-xs">العملاء</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
      )
}
