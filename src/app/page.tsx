'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useCards } from '@/contexts/cards-context'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUpDown,
  BarChart3,
  Landmark,
  Vault,
  Wallet,
  Users,
  CircleDollarSign,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardPage() {
  const [showBalances, setShowBalances] = useState(true)
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: prepaidCards } = usePrepaidCards()
  const { cards: creditCards } = useCards()

  // حساب الإحصائيات من البيانات الفعلية
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalVaultBalance = cashVaults.reduce((sum, vault) => sum + vault.balance, 0)
  const totalWalletBalance = eWallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const totalPrepaidBalance = prepaidCards.reduce((sum, card) => sum + card.balance, 0)
  const totalCreditBalance = creditCards.reduce((sum, card) => sum + ((card.creditLimit ?? card.credit_limit ?? 0) - (card.currentBalance ?? card.current_balance ?? 0)), 0)
  const totalAvailableBalance = totalBankBalance + totalVaultBalance + totalWalletBalance + totalPrepaidBalance + totalCreditBalance

  // إحصائيات شاملة من جميع الأنظمة الفرعية
  const stats = {
    totalBalance: totalAvailableBalance,
    bankAccounts: totalBankBalance,
    cashVaults: totalVaultBalance,
    eWallets: totalWalletBalance,
    prepaidCards: totalPrepaidBalance,
    creditCards: totalCreditBalance,
    totalAccounts: bankAccounts.length + cashVaults.length + eWallets.length + prepaidCards.length + creditCards.length,
    totalCards: creditCards.length + prepaidCards.length,
  }



  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">
              نظرة عامة شاملة على نظامك المالي
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
              className="gap-2"
            >
              {showBalances ? (
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
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/reports'}>
              <BarChart3 className="h-4 w-4 ml-2" />
              التقارير
            </Button>
          </div>
        </div>

        {/* الملخص الشامل - إجمالي الأرصدة */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border-slate-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة المتاحة</CardTitle>
            <DollarSign className="h-5 w-5 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {showBalances ? formatCurrency(stats.totalBalance) : '••••••'}
            </div>
            <p className="text-xs opacity-70 mt-2">
              من {stats.totalAccounts} حساب و {stats.totalCards} بطاقة
            </p>
          </CardContent>
        </Card>

        {/* توزيع الأرصدة حسب النوع */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* الحسابات البنكية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحسابات البنكية</CardTitle>
              <Landmark className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(stats.bankAccounts) : '••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {bankAccounts.length} حساب
              </p>
            </CardContent>
          </Card>

          {/* الخزائن النقدية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الخزائن النقدية</CardTitle>
              <Vault className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(stats.cashVaults) : '••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {cashVaults.length} خزينة
              </p>
            </CardContent>
          </Card>

          {/* المحافظ الإلكترونية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المحافظ الإلكترونية</CardTitle>
              <Wallet className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(stats.eWallets) : '••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {eWallets.length} محفظة
              </p>
            </CardContent>
          </Card>

          {/* البطاقات المدفوعة مسبقاً */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">بطاقات مسبقة</CardTitle>
              <CircleDollarSign className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(stats.prepaidCards) : '••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {prepaidCards.length} بطاقة
              </p>
            </CardContent>
          </Card>

          {/* البطاقات الائتمانية */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">بطاقات ائتمانية</CardTitle>
              <CreditCard className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalances ? formatCurrency(stats.creditCards) : '••••'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {creditCards.length} بطاقة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* إجراءات سريعة */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">الوصول السريع</CardTitle>
            <CardDescription>انتقل مباشرة إلى الأقسام الرئيسية</CardDescription>
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
                className="h-20 flex-col gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                onClick={() => window.location.href = '/reports'}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">التقارير</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 hover:bg-teal-50 dark:hover:bg-teal-950"
                onClick={() => window.location.href = '/customers'}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">العملاء</span>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
