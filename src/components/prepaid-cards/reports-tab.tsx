'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PrepaidCard, PrepaidTransaction } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  ShoppingCart,
  CreditCard
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ReportsTabProps {
  cards: PrepaidCard[]
  transactions: PrepaidTransaction[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function ReportsTab({ cards, transactions }: ReportsTabProps) {
  const [period, setPeriod] = useState<string>('month')
  const [selectedCardId, setSelectedCardId] = useState<string>('all')

  // Filter transactions by period and card
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filter by card
    if (selectedCardId !== 'all') {
      filtered = filtered.filter(t => t.cardId === selectedCardId)
    }

    // Filter by period
    const now = new Date()
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date)
      switch (period) {
        case 'day':
          return transactionDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case 'month':
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          )
        case 'year':
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    })

    return filtered
  }, [transactions, period, selectedCardId])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalPurchases: 0,
      totalFees: 0,
      transactionCount: filteredTransactions.length,
      avgTransactionAmount: 0,
    }

    filteredTransactions.forEach(t => {
      if (t.type === 'deposit') {
        stats.totalDeposits += t.amount
      } else if (t.type === 'withdrawal') {
        stats.totalWithdrawals += t.amount
      } else if (t.type === 'purchase') {
        stats.totalPurchases += t.amount
      }
      stats.totalFees += t.fee
    })

    stats.avgTransactionAmount = stats.transactionCount > 0
      ? (stats.totalDeposits + stats.totalWithdrawals + stats.totalPurchases) / stats.transactionCount
      : 0

    return stats
  }, [filteredTransactions])

  // Spending by category
  const spendingByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>()

    filteredTransactions
      .filter(t => t.type === 'purchase' && t.category)
      .forEach(t => {
        const current = categoryMap.get(t.category!) || 0
        categoryMap.set(t.category!, current + t.amount)
      })

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredTransactions])

  // Top merchants
  const topMerchants = useMemo(() => {
    const merchantMap = new Map<string, number>()

    filteredTransactions
      .filter(t => t.type === 'purchase' && t.merchantName)
      .forEach(t => {
        const current = merchantMap.get(t.merchantName!) || 0
        merchantMap.set(t.merchantName!, current + t.amount)
      })

    return Array.from(merchantMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredTransactions])

  // Balance over time
  const balanceOverTime = useMemo(() => {
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return sortedTransactions.map(t => ({
      date: new Date(t.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
      balance: t.balanceAfter,
    }))
  }, [filteredTransactions])

  // Monthly spending trend
  const monthlySpending = useMemo(() => {
    const monthMap = new Map<string, { deposits: number; withdrawals: number; purchases: number }>()

    filteredTransactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('ar-EG', { month: 'short' })
      const current = monthMap.get(month) || { deposits: 0, withdrawals: 0, purchases: 0 }

      if (t.type === 'deposit') {
        current.deposits += t.amount
      } else if (t.type === 'withdrawal') {
        current.withdrawals += t.amount
      } else if (t.type === 'purchase') {
        current.purchases += t.amount
      }

      monthMap.set(month, current)
    })

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }))
  }, [filteredTransactions])

  // Limits usage
  const limitsUsage = useMemo(() => {
    if (selectedCardId === 'all') return []

    const card = cards.find(c => c.id === selectedCardId)
    if (!card) return []

    return [
      {
        name: 'الحد اليومي',
        used: card.dailyUsed,
        limit: card.dailyLimit,
        percentage: (card.dailyUsed / card.dailyLimit) * 100,
      },
      {
        name: 'الحد الشهري',
        used: card.monthlyUsed,
        limit: card.monthlyLimit,
        percentage: (card.monthlyUsed / card.monthlyLimit) * 100,
      },
    ]
  }, [cards, selectedCardId])

  // Fees breakdown
  const feesBreakdown = useMemo(() => {
    const fees = {
      deposit: 0,
      withdrawal: 0,
      purchase: 0,
      transfer: 0,
    }

    filteredTransactions.forEach(t => {
      if (t.type === 'deposit') fees.deposit += t.fee
      else if (t.type === 'withdrawal') fees.withdrawal += t.fee
      else if (t.type === 'purchase') fees.purchase += t.fee
      else if (t.type === 'transfer_out') fees.transfer += t.fee
    })

    return [
      { name: 'رسوم الشحن', value: fees.deposit },
      { name: 'رسوم السحب', value: fees.withdrawal },
      { name: 'رسوم الشراء', value: fees.purchase },
      { name: 'رسوم التحويل', value: fees.transfer },
    ].filter(f => f.value > 0)
  }, [filteredTransactions])

  // Cards comparison
  const cardsComparison = useMemo(() => {
    return cards.map(card => {
      const cardTransactions = transactions.filter(t => t.cardId === card.id)
      const totalSpent = cardTransactions
        .filter(t => t.type === 'withdrawal' || t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        name: card.cardName,
        balance: card.balance,
        spent: totalSpent,
        transactions: cardTransactions.length,
      }
    })
  }, [cards, transactions])

  const exportReport = () => {
    // TODO: Implement PDF/Excel export
    alert('سيتم إضافة ميزة التصدير قريباً')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            التقارير والتحليلات
          </CardTitle>
          <CardDescription>تحليل شامل لأداء البطاقات والمعاملات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Period Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">اليوم</SelectItem>
                  <SelectItem value="week">آخر 7 أيام</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                  <SelectItem value="all">كل الفترات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">البطاقة</label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البطاقات</SelectItem>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.cardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">تصدير</label>
              <Button variant="outline" className="w-full" onClick={exportReport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="spending">الإنفاق</TabsTrigger>
          <TabsTrigger value="limits">الحدود</TabsTrigger>
          <TabsTrigger value="fees">الرسوم</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Will continue in next part */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الشحن</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(overviewStats.totalDeposits)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي السحب</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(overviewStats.totalWithdrawals)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(overviewStats.totalPurchases)}
                    </p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الرسوم</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(overviewStats.totalFees)}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Over Time Chart */}
          {balanceOverTime.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الرصيد عبر الزمن</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={balanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="الرصيد" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Spending by Category */}
            {spendingByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الإنفاق حسب الفئات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Merchants */}
            {topMerchants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>أهم 5 تجار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topMerchants.map((merchant, index) => (
                      <div key={merchant.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{merchant.name}</span>
                        </div>
                        <span className="font-bold text-blue-600">{formatCurrency(merchant.value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Category Details Table */}
          {spendingByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الإنفاق حسب الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {spendingByCategory.map((category, index) => {
                    const percentage = (category.value / overviewStats.totalPurchases) * 100
                    return (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(category.value)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits" className="space-y-6">
          {selectedCardId === 'all' ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">اختر بطاقة محددة</h3>
                <p className="text-muted-foreground">
                  الرجاء اختيار بطاقة محددة من الفلتر أعلاه لعرض تقرير الحدود
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Limits Usage Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>استخدام الحدود</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={limitsUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="used" fill="#ef4444" name="المستخدم" />
                      <Bar dataKey="limit" fill="#10b981" name="الحد الأقصى" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Limits Details */}
              <div className="grid gap-4 md:grid-cols-2">
                {limitsUsage.map((limit) => (
                  <Card key={limit.name}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{limit.name}</span>
                          <span className={`font-bold ${limit.percentage >= 80 ? 'text-red-600' : 'text-green-600'}`}>
                            {limit.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>المستخدم: {formatCurrency(limit.used)}</span>
                            <span>الحد: {formatCurrency(limit.limit)}</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                limit.percentage >= 80 ? 'bg-red-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(limit.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          المتبقي: {formatCurrency(limit.limit - limit.used)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Fees Breakdown Pie Chart */}
            {feesBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الرسوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={feesBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} (${((percent as number) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {feesBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Fees Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الرسوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">إجمالي الرسوم</span>
                    <span className="text-xl font-bold text-orange-600">
                      {formatCurrency(overviewStats.totalFees)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {feesBreakdown.map((fee, index) => (
                      <div key={fee.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{fee.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(fee.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Cards Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>مقارنة البطاقات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cardsComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="balance" fill="#10b981" name="الرصيد" />
                  <Bar dataKey="spent" fill="#ef4444" name="المصروف" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cards Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المقارنة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cardsComparison.map((card) => (
                  <div key={card.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{card.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {card.transactions} معاملة
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">الرصيد الحالي</p>
                        <p className="font-bold text-green-600">{formatCurrency(card.balance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">إجمالي المصروف</p>
                        <p className="font-bold text-red-600">{formatCurrency(card.spent)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Spending Trend */}
          {monthlySpending.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>اتجاه الإنفاق الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="deposits"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      name="الشحن"
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawals"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      name="السحب"
                    />
                    <Area
                      type="monotone"
                      dataKey="purchases"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      name="المشتريات"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Transaction Count Trend */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">عدد المعاملات</p>
                  <p className="text-2xl font-bold">{overviewStats.transactionCount}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">متوسط قيمة المعاملة</p>
                  <p className="text-2xl font-bold">{formatCurrency(overviewStats.avgTransactionAmount)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">صافي التدفق النقدي</p>
                  <p className={`text-2xl font-bold ${
                    overviewStats.totalDeposits - overviewStats.totalWithdrawals - overviewStats.totalPurchases >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      overviewStats.totalDeposits - overviewStats.totalWithdrawals - overviewStats.totalPurchases
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

