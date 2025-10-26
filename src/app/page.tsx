'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpDown,
  Gift,
  AlertTriangle,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Landmark,
  Vault,
  Wallet,
  Users,
  CircleDollarSign
} from 'lucide-react'

export default function DashboardPage() {
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: prepaidCards } = usePrepaidCards()

  // حساب الإحصائيات من البيانات الفعلية
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalVaultBalance = cashVaults.reduce((sum, vault) => sum + vault.balance, 0)
  const totalWalletBalance = eWallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const totalPrepaidBalance = prepaidCards.reduce((sum, card) => sum + card.balance, 0)
  const totalAvailableBalance = totalBankBalance + totalVaultBalance + totalWalletBalance + totalPrepaidBalance

  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalBalance: 45250.75,
    totalLimit: 180000.00,
    monthlySpending: 12450.50,
    lastMonthSpending: 11200.00,
    cashbackEarned: 685.30,
    cashbackThisYear: 4850.75,
    totalCashback: 685.30,
    pendingPayments: 2,
    overduePayments: 0,
    upcomingPayments: 2,
    totalCards: 3,
    activeCards: 3,
    creditUtilization: 25.1,
    averageMonthlySpending: 11800.00,
  }

  const recentActivity = [
    {
      id: '1',
      type: 'transaction',
      description: 'كارفور مصر',
      amount: -850.50,
      date: '2024-01-15T10:30:00Z',
      card: 'بطاقة البنك الأهلي المصري',
      category: 'طعام ومشروبات'
    },
    {
      id: '2',
      type: 'payment',
      description: 'سداد فاتورة',
      amount: 3500.00,
      date: '2024-01-14T15:45:00Z',
      card: 'بطاقة بنك مصر الذهبية',
      category: 'سداد'
    },
    {
      id: '3',
      type: 'cashback',
      description: 'كاش باك شهري',
      amount: 125.30,
      date: '2024-01-12T20:15:00Z',
      card: 'بطاقة البنك الأهلي المصري',
      category: 'مكافآت'
    },
    {
      id: '4',
      type: 'transaction',
      description: 'محطة توتال مصر',
      amount: -420.00,
      date: '2024-01-10T18:30:00Z',
      card: 'بطاقة البنك التجاري الدولي',
      category: 'وقود'
    },
    {
      id: '5',
      type: 'transaction',
      description: 'مطعم البيك',
      amount: -95.75,
      date: '2024-01-09T19:20:00Z',
      card: 'بطاقة الراجحي الذهبية',
      category: 'طعام ومشروبات'
    },
  ]

  const cards = [
    {
      id: '1',
      name: 'بطاقة الراجحي الذهبية',
      balance: 12500.00,
      limit: 25000.00,
      utilization: 50.0,
      cashbackRate: 2.0,
      status: 'active'
    },
    {
      id: '2',
      name: 'بطاقة الأهلي البلاتينية',
      balance: 8750.00,
      limit: 20000.00,
      utilization: 43.8,
      cashbackRate: 3.0,
      status: 'active'
    },
    {
      id: '3',
      name: 'بطاقة سامبا الكلاسيكية',
      balance: 3200.00,
      limit: 20000.00,
      utilization: 16.0,
      cashbackRate: 1.5,
      status: 'active'
    },
  ]

  const utilizationPercentage = (stats.totalBalance / stats.totalLimit) * 100
  const spendingGrowth = ((stats.monthlySpending - stats.lastMonthSpending) / stats.lastMonthSpending) * 100

  // بيانات للمكونات المتقدمة
  const kpisData = {
    totalSpending: stats.monthlySpending,
    totalCashback: stats.cashbackEarned,
    creditUtilization: utilizationPercentage,
    transactionCount: 45,
    averageTransaction: stats.monthlySpending / 45,
    spendingChange: spendingGrowth,
    cashbackChange: 15.5,
  }

  const spendingTrendData = [
    { date: '1', amount: 350 },
    { date: '5', amount: 520 },
    { date: '10', amount: 890 },
    { date: '15', amount: 1200 },
    { date: '20', amount: 1650 },
    { date: '25', amount: 2100 },
    { date: '30', amount: 2450 },
  ]

  const categoryDistributionData = [
    { name: 'طعام ومشروبات', value: 3500, color: '#3b82f6' },
    { name: 'وقود', value: 2200, color: '#10b981' },
    { name: 'تسوق', value: 4100, color: '#f59e0b' },
    { name: 'ترفيه', value: 1500, color: '#8b5cf6' },
    { name: 'فواتير', value: 1150, color: '#ef4444' },
  ]

  const cardComparisonData = [
    { name: 'الراجحي', spending: 5200, cashback: 104 },
    { name: 'الأهلي', spending: 4300, cashback: 129 },
    { name: 'سامبا', spending: 2950, cashback: 44 },
  ]

  const cashbackTrendData = [
    { month: 'يناير', earned: 95 },
    { month: 'فبراير', earned: 110 },
    { month: 'مارس', earned: 125 },
    { month: 'أبريل', earned: 140 },
    { month: 'مايو', earned: 155 },
    { month: 'يونيو', earned: 170 },
  ]

  const recommendationsData = {
    creditUtilization: utilizationPercentage,
    totalCashback: stats.cashbackEarned,
    spendingTrend: spendingGrowth,
    hasOverduePayments: stats.overduePayments > 0,
    lowBalanceAccounts: bankAccounts.filter(a => a.balance < 1000).length +
                        cashVaults.filter(v => v.balance < 1000).length,
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">
              نظرة سريعة على ملخص حساباتك المالية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/reports'}>
              التقارير التفصيلية
            </Button>
          </div>
        </div>

        {/* Quick Stats - ملخص سريع */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">إجمالي الأرصدة المتاحة</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totalAvailableBalance)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                من {bankAccounts.length + cashVaults.length + eWallets.length + prepaidCards.length} حساب
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">المصروفات الشهرية</CardTitle>
              <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(stats.monthlySpending)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {spendingGrowth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <p className="text-xs text-green-600 dark:text-green-400">
                  {Math.abs(spendingGrowth).toFixed(1)}% عن الشهر الماضي
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">الكاش باك المتاح</CardTitle>
              <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(stats.totalCashback)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                جاهز للاسترداد
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">الدفعات القادمة</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {formatCurrency(stats.upcomingPayments)}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                خلال 7 أيام
              </p>
            </CardContent>
          </Card>
        </div>

        {/* إجراءات سريعة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">إجراءات سريعة</CardTitle>
            <CardDescription>الوصول السريع للعمليات الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/transfers'}>
                <ArrowUpDown className="h-5 w-5" />
                <span>تحويل مركزي</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/customers'}>
                <Users className="h-5 w-5" />
                <span>إدارة العملاء</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/savings-circles'}>
                <DollarSign className="h-5 w-5" />
                <span>الجمعيات</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => window.location.href = '/cards'}>
                <CreditCard className="h-5 w-5" />
                <span>البطاقات</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
