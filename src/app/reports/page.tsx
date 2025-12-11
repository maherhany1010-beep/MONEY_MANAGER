'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity,
  Landmark,
  Vault,
  Wallet,
  CreditCard,
  ArrowUpDown
} from 'lucide-react'
import { useState } from 'react'

export default function ReportsPage() {
  const { accounts: bankAccounts } = useBankAccounts()
  const { vaults: cashVaults } = useCashVaults()
  const { wallets: eWallets } = useEWallets()
  const { cards: prepaidCards } = usePrepaidCards()

  const [timePeriod, setTimePeriod] = useState('monthly')
  const [accountType, setAccountType] = useState('all')

  // حساب الإحصائيات
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalVaultBalance = cashVaults.reduce((sum, vault) => sum + vault.balance, 0)
  const totalWalletBalance = eWallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const totalPrepaidBalance = prepaidCards.reduce((sum, card) => sum + card.balance, 0)
  const totalBalance = totalBankBalance + totalVaultBalance + totalWalletBalance + totalPrepaidBalance

  // Mock data للتقارير
  const monthlyData = [
    { month: 'يناير', income: 15000, expenses: 12000, net: 3000 },
    { month: 'فبراير', income: 18000, expenses: 14000, net: 4000 },
    { month: 'مارس', income: 16000, expenses: 13000, net: 3000 },
    { month: 'أبريل', income: 20000, expenses: 15000, net: 5000 },
    { month: 'مايو', income: 19000, expenses: 14500, net: 4500 },
    { month: 'يونيو', income: 21000, expenses: 16000, net: 5000 },
  ]

  const categoryData = [
    { category: 'طعام ومشروبات', amount: 4500, percentage: 30 },
    { category: 'وقود', amount: 3000, percentage: 20 },
    { category: 'تسوق', amount: 2250, percentage: 15 },
    { category: 'ترفيه', amount: 1500, percentage: 10 },
    { category: 'فواتير', amount: 2250, percentage: 15 },
    { category: 'أخرى', amount: 1500, percentage: 10 },
  ]

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">التقارير التفصيلية</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            تقارير شاملة ومفصلة لجميع حساباتك المالية
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تصدير PDF
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 ml-2" />
              تصدير Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الفلاتر</CardTitle>
            <CardDescription>اختر الفترة الزمنية ونوع الحساب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">الفترة الزمنية</label>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="yearly">سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع الحساب</label>
                <Select value={accountType} onValueChange={setAccountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحسابات</SelectItem>
                    <SelectItem value="bank">الحسابات البنكية</SelectItem>
                    <SelectItem value="vault">الخزائن النقدية</SelectItem>
                    <SelectItem value="wallet">المحافظ الإلكترونية</SelectItem>
                    <SelectItem value="prepaid">البطاقات المسبقة الدفع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">إجمالي الأرصدة</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                من جميع الحسابات
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">إجمالي الإيرادات</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(109000)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                آخر 6 أشهر
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">إجمالي المصروفات</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(84500)}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                آخر 6 أشهر
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">صافي الربح</CardTitle>
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(24500)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                آخر 6 أشهر
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              التقرير الشهري
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              حسب الفئة
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              حسب الحساب
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              المعاملات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التقرير الشهري</CardTitle>
                <CardDescription>الإيرادات والمصروفات الشهرية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{data.month}</h4>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-green-600">
                            إيرادات: {formatCurrency(data.income)}
                          </span>
                          <span className="text-red-600">
                            مصروفات: {formatCurrency(data.expenses)}
                          </span>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge variant={data.net > 0 ? 'default' : 'destructive'}>
                          {data.net > 0 ? '+' : ''}{formatCurrency(data.net)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التقرير حسب الفئة</CardTitle>
                <CardDescription>توزيع المصروفات حسب الفئات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{data.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(data.amount)} ({data.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-blue-600" />
                    الحسابات البنكية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalBankBalance)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {bankAccounts.length} حساب بنكي
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vault className="h-5 w-5 text-green-600" />
                    الخزائن النقدية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalVaultBalance)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cashVaults.length} خزينة نقدية
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>آخر المعاملات</CardTitle>
                <CardDescription>سجل المعاملات الأخيرة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  لا توجد معاملات حالياً. سيتم عرض المعاملات هنا عند إضافتها.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )
}

