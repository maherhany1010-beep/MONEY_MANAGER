'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BankAccount } from '@/contexts/bank-accounts-context'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download } from 'lucide-react'

interface ReportsTabProps {
  accounts: BankAccount[]
}

export function ReportsTab({ accounts }: ReportsTabProps) {
  const [period, setPeriod] = useState<string>('month')
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all')

  // Filter accounts by selection
  const filteredAccounts = useMemo(() => {
    if (selectedAccountId === 'all') {
      return accounts
    }
    return accounts.filter(a => a.id === selectedAccountId)
  }, [accounts, selectedAccountId])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalDeposits = filteredAccounts.reduce((sum, a: any) => sum + (a.monthlyDeposits || a.totalDeposits || 0), 0)
    const totalWithdrawals = filteredAccounts.reduce((sum, a: any) => sum + (a.monthlyWithdrawals || a.totalWithdrawals || 0), 0)
    const totalTransactions = filteredAccounts.reduce((sum, a: any) => sum + (a.transactionCount || 0), 0)
    const avgTransaction = totalTransactions > 0 ? (totalDeposits + totalWithdrawals) / totalTransactions : 0
    const avgBalance = filteredAccounts.length > 0 ? totalBalance / filteredAccounts.length : 0

    return {
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      totalTransactions,
      avgTransaction,
      avgBalance,
      netFlow: totalDeposits - totalWithdrawals,
    }
  }, [filteredAccounts])

  // Accounts comparison
  const accountsComparison = useMemo(() => {
    return accounts.map((account: any) => ({
      name: account.accountName,
      balance: account.balance,
      deposits: account.monthlyDeposits || account.totalDeposits || 0,
      withdrawals: account.monthlyWithdrawals || account.totalWithdrawals || 0,
    }))
  }, [accounts])

  // Balance distribution
  const balanceDistribution = useMemo(() => {
    return accounts.map(account => ({
      name: account.accountName,
      value: account.balance,
    }))
  }, [accounts])

  // Account types distribution
  const accountTypesDistribution = useMemo(() => {
    const typeGroups = accounts.reduce((acc, account) => {
      const type = account.accountType || 'other'
      if (!acc[type]) {
        acc[type] = { count: 0, balance: 0 }
      }
      acc[type].count++
      acc[type].balance += account.balance
      return acc
    }, {} as Record<string, { count: number; balance: number }>)

    const getTypeLabel = (type: string) => {
      switch (type) {
        case 'checking': return 'جاري'
        case 'savings': return 'توفير'
        case 'business': return 'تجاري'
        case 'investment': return 'استثماري'
        default: return 'أخرى'
      }
    }

    return Object.entries(typeGroups).map(([type, data]) => ({
      name: getTypeLabel(type),
      count: data.count,
      balance: data.balance,
    }))
  }, [accounts])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  const handleExport = () => {
    alert('سيتم إضافة ميزة التصدير قريباً')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>الفترة الزمنية</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                  <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label>الحساب</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحسابات</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
          <TabsTrigger value="distribution">التوزيع</TabsTrigger>
          <TabsTrigger value="types">أنواع الحسابات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي الرصيد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredAccounts.length} حساب
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  متوسط الرصيد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.avgBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">لكل حساب</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي الإيداعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(overviewStats.totalDeposits)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي السحوبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(overviewStats.totalWithdrawals)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  صافي التدفق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  overviewStats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(overviewStats.netFlow)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي المعاملات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.totalTransactions}</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  متوسط المعاملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.avgTransaction)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة الحسابات</CardTitle>
              <CardDescription>مقارنة الإيداعات والسحوبات لكل حساب</CardDescription>
            </CardHeader>
            <CardContent>
              {accountsComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={accountsComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="deposits" fill="#10b981" name="الإيداعات" />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="السحوبات" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الأرصدة</CardTitle>
              <CardDescription>توزيع الأرصدة بين الحسابات</CardDescription>
            </CardHeader>
            <CardContent>
              {balanceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={balanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {balanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع أنواع الحسابات</CardTitle>
              <CardDescription>توزيع الأرصدة حسب نوع الحساب</CardDescription>
            </CardHeader>
            <CardContent>
              {accountTypesDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={accountTypesDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="balance" fill="#3b82f6" name="الرصيد" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

