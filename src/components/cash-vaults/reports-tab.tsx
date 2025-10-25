'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CashVault } from '@/contexts/cash-vaults-context'
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
  vaults: CashVault[]
}

export function ReportsTab({ vaults }: ReportsTabProps) {
  const [period, setPeriod] = useState<string>('month')
  const [selectedVaultId, setSelectedVaultId] = useState<string>('all')

  // Filter vaults by selection
  const filteredVaults = useMemo(() => {
    if (selectedVaultId === 'all') {
      return vaults
    }
    return vaults.filter(v => v.id === selectedVaultId)
  }, [vaults, selectedVaultId])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const totalBalance = filteredVaults.reduce((sum, v) => sum + v.balance, 0)
    const totalCapacity = filteredVaults.reduce((sum, v) => sum + (v.maxCapacity || 0), 0)
    const totalDeposits = filteredVaults.reduce((sum, v) => sum + (v.monthlyDeposits || 0), 0)
    const totalWithdrawals = filteredVaults.reduce((sum, v) => sum + (v.monthlyWithdrawals || 0), 0)
    const totalTransactions = filteredVaults.reduce((sum, v) => sum + (v.transactionCount || 0), 0)
    const avgTransaction = totalTransactions > 0 ? (totalDeposits + totalWithdrawals) / totalTransactions : 0
    const capacityUsage = totalCapacity > 0 ? (totalBalance / totalCapacity) * 100 : 0

    return {
      totalBalance,
      totalCapacity,
      totalDeposits,
      totalWithdrawals,
      totalTransactions,
      avgTransaction,
      netFlow: totalDeposits - totalWithdrawals,
      capacityUsage,
    }
  }, [filteredVaults])

  // Vaults comparison
  const vaultsComparison = useMemo(() => {
    return vaults.map(vault => ({
      name: vault.vaultName,
      balance: vault.balance,
      deposits: vault.monthlyDeposits || 0,
      withdrawals: vault.monthlyWithdrawals || 0,
      capacity: vault.maxCapacity || 0,
    }))
  }, [vaults])

  // Balance distribution
  const balanceDistribution = useMemo(() => {
    return vaults.map(vault => ({
      name: vault.vaultName,
      value: vault.balance,
    }))
  }, [vaults])

  // Capacity usage
  const capacityUsage = useMemo(() => {
    return vaults
      .filter(v => v.maxCapacity && v.maxCapacity > 0)
      .map(vault => ({
        name: vault.vaultName,
        used: vault.balance,
        available: (vault.maxCapacity || 0) - vault.balance,
        usagePercent: ((vault.balance / (vault.maxCapacity || 1)) * 100).toFixed(1),
      }))
  }, [vaults])

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
              <Label>الخزينة</Label>
              <Select value={selectedVaultId} onValueChange={setSelectedVaultId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الخزائن</SelectItem>
                  {vaults.map(vault => (
                    <SelectItem key={vault.id} value={vault.id}>
                      {vault.vaultName}
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
          <TabsTrigger value="capacity">السعة</TabsTrigger>
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
                  {filteredVaults.length} خزينة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  السعة الإجمالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalCapacity)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  استخدام: {overviewStats.capacityUsage.toFixed(1)}%
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
              <CardTitle>مقارنة الخزائن</CardTitle>
              <CardDescription>مقارنة الإيداعات والسحوبات لكل خزينة</CardDescription>
            </CardHeader>
            <CardContent>
              {vaultsComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={vaultsComparison}>
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
              <CardDescription>توزيع الأرصدة بين الخزائن</CardDescription>
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

        {/* Capacity Tab */}
        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>استخدام السعة</CardTitle>
              <CardDescription>نسبة استخدام السعة لكل خزينة</CardDescription>
            </CardHeader>
            <CardContent>
              {capacityUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={capacityUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="used" fill="#3b82f6" name="المستخدم" stackId="a" />
                    <Bar dataKey="available" fill="#94a3b8" name="المتاح" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد خزائن بسعة محددة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

