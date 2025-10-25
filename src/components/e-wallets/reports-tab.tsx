'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EWallet } from '@/contexts/e-wallets-context'
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
  wallets: EWallet[]
}

export function ReportsTab({ wallets }: ReportsTabProps) {
  const [period, setPeriod] = useState<string>('month')
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all')

  // Filter wallets by selection
  const filteredWallets = useMemo(() => {
    if (selectedWalletId === 'all') {
      return wallets
    }
    return wallets.filter(w => w.id === selectedWalletId)
  }, [wallets, selectedWalletId])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const totalBalance = filteredWallets.reduce((sum, w) => sum + w.balance, 0)
    const totalDeposits = filteredWallets.reduce((sum, w) => sum + (w.monthlyDeposits || 0), 0)
    const totalWithdrawals = filteredWallets.reduce((sum, w) => sum + (w.monthlyWithdrawals || 0), 0)
    const totalTransactions = filteredWallets.reduce((sum, w) => sum + (w.transactionCount || 0), 0)
    const avgTransaction = totalTransactions > 0 ? (totalDeposits + totalWithdrawals) / totalTransactions : 0

    return {
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      totalTransactions,
      avgTransaction,
      netFlow: totalDeposits - totalWithdrawals,
    }
  }, [filteredWallets])

  // Wallets comparison
  const walletsComparison = useMemo(() => {
    return wallets.map(wallet => ({
      name: wallet.walletName,
      balance: wallet.balance,
      deposits: wallet.monthlyDeposits || 0,
      withdrawals: wallet.monthlyWithdrawals || 0,
    }))
  }, [wallets])

  // Balance distribution
  const balanceDistribution = useMemo(() => {
    return wallets.map(wallet => ({
      name: wallet.walletName,
      value: wallet.balance,
    }))
  }, [wallets])

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
              <Label>المحفظة</Label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المحافظ</SelectItem>
                  {wallets.map(wallet => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.walletName}
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
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي الرصيد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalBalance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredWallets.length} محفظة
                </p>
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

            <Card>
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
              <CardTitle>مقارنة المحافظ</CardTitle>
              <CardDescription>مقارنة الإيداعات والسحوبات لكل محفظة</CardDescription>
            </CardHeader>
            <CardContent>
              {walletsComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={walletsComparison}>
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
              <CardDescription>توزيع الأرصدة بين المحافظ</CardDescription>
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
                      label={(entry: any) => `${entry.name}: ${formatCurrency(entry.value as number)}`}
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

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات الأرصدة</CardTitle>
              <CardDescription>مقارنة أرصدة المحافظ</CardDescription>
            </CardHeader>
            <CardContent>
              {walletsComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={walletsComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
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

