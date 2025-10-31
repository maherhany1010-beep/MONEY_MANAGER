'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CreditCard as CreditCardType, Payment } from '@/contexts/cards-context'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  FileText,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Download,
  Calendar,
} from 'lucide-react'

interface ReportsTabProps {
  cards: CreditCardType[]
  payments: Payment[]
}

export function ReportsTab({ cards, payments }: ReportsTabProps) {
  const [period, setPeriod] = useState<string>('month')
  const [selectedCardId, setSelectedCardId] = useState<string>('all')

  // Filter payments by period and card
  const filteredPayments = useMemo(() => {
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return payments.filter(payment => {
      const paymentDate = new Date(payment.date)
      const matchesPeriod = paymentDate >= startDate
      const matchesCard = selectedCardId === 'all' || payment.cardId === selectedCardId
      return matchesPeriod && matchesCard
    })
  }, [payments, period, selectedCardId])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const totalSpent = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
    const avgPayment = filteredPayments.length > 0 ? totalSpent / filteredPayments.length : 0
    
    const selectedCards = selectedCardId === 'all' 
      ? cards 
      : cards.filter(c => c.id === selectedCardId)

    const totalCreditLimit = selectedCards.reduce((sum, c) => sum + (c.creditLimit ?? 0), 0)
    const totalCurrentBalance = selectedCards.reduce((sum, c) => sum + (c.currentBalance ?? 0), 0)
    const totalAvailable = totalCreditLimit - totalCurrentBalance
    const utilizationRate = totalCreditLimit > 0 ? (totalCurrentBalance / totalCreditLimit) * 100 : 0

    return {
      totalSpent,
      avgPayment,
      paymentCount: filteredPayments.length,
      totalCreditLimit,
      totalCurrentBalance,
      totalAvailable,
      utilizationRate,
    }
  }, [filteredPayments, cards, selectedCardId])

  // Group payments by merchant
  const spendingByMerchant = useMemo(() => {
    const merchantMap = new Map<string, number>()

    filteredPayments.forEach((payment: any) => {
      if (payment.merchant) {
        const current = merchantMap.get(payment.merchant) || 0
        merchantMap.set(payment.merchant, current + payment.amount)
      }
    })

    return Array.from(merchantMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
  }, [filteredPayments])

  // Monthly spending trend
  const monthlySpending = useMemo(() => {
    const monthMap = new Map<string, number>()
    
    filteredPayments.forEach(payment => {
      const date = new Date(payment.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const current = monthMap.get(monthKey) || 0
      monthMap.set(monthKey, current + payment.amount)
    })

    return Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredPayments])

  // Cards comparison
  const cardsComparison = useMemo(() => {
    return cards.map(card => {
      const cardPayments = filteredPayments.filter(p => p.cardId === card.id)
      const totalSpent = cardPayments.reduce((sum, p) => sum + p.amount, 0)
      const utilizationRate = ((card.currentBalance ?? 0) / (card.creditLimit ?? 1)) * 100

      return {
        name: (card as any).cardName || card.name,
        spent: totalSpent,
        balance: card.currentBalance ?? 0,
        available: (card.creditLimit ?? 0) - (card.currentBalance ?? 0),
        utilization: utilizationRate,
      }
    })
  }, [cards, filteredPayments])

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
              <Label>البطاقة</Label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البطاقات</SelectItem>
                  {cards.map((card: any) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.cardName || card.name}
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="spending">الإنفاق</TabsTrigger>
          <TabsTrigger value="utilization">الاستخدام</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="merchants">التجار</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي الإنفاق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.totalSpent)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overviewStats.paymentCount} معاملة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  متوسط المعاملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.avgPayment)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  الرصيد المتاح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(overviewStats.totalAvailable)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  نسبة الاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  overviewStats.utilizationRate > 80 ? 'text-red-600' :
                  overviewStats.utilizationRate > 50 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {overviewStats.utilizationRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإنفاق حسب التاجر</CardTitle>
              <CardDescription>أكثر 10 تجار من حيث الإنفاق</CardDescription>
            </CardHeader>
            <CardContent>
              {spendingByMerchant.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={spendingByMerchant}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="amount" fill="#3b82f6" />
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

        {/* Utilization Tab */}
        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نسبة استخدام البطاقات</CardTitle>
              <CardDescription>مقارنة نسبة الاستخدام لكل بطاقة</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cardsComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                    <Bar dataKey="utilization" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بطاقات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة البطاقات</CardTitle>
              <CardDescription>مقارنة الإنفاق والرصيد المتاح لكل بطاقة</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cardsComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="spent" fill="#ef4444" name="الإنفاق" />
                    <Bar dataKey="available" fill="#10b981" name="المتاح" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بطاقات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات الإنفاق</CardTitle>
              <CardDescription>الإنفاق الشهري خلال الفترة المحددة</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merchants Tab */}
        <TabsContent value="merchants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الإنفاق حسب التجار</CardTitle>
              <CardDescription>نسبة الإنفاق لكل تاجر</CardDescription>
            </CardHeader>
            <CardContent>
              {spendingByMerchant.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={spendingByMerchant}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={(entry: any) => `${entry.name}: ${formatCurrency(entry.amount)}`}
                    >
                      {spendingByMerchant.map((entry, index) => (
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
      </Tabs>
    </div>
  )
}
