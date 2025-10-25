'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

interface CashFlowTabProps {
  totalBalance: number
}

export function CashFlowTab({ totalBalance }: CashFlowTabProps) {
  // بيانات تجريبية للتدفق النقدي (آخر 6 أشهر)
  const cashFlowData = useMemo(() => {
    const months = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية']
    return months.map((month, index) => {
      const income = Math.floor(Math.random() * 50000) + 30000
      const expense = Math.floor(Math.random() * 40000) + 20000
      return {
        month,
        income,
        expense,
        net: income - expense,
      }
    })
  }, [])

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalIncome = cashFlowData.reduce((sum, item) => sum + item.income, 0)
    const totalExpense = cashFlowData.reduce((sum, item) => sum + item.expense, 0)
    const netCashFlow = totalIncome - totalExpense
    const avgMonthlyIncome = totalIncome / cashFlowData.length
    const avgMonthlyExpense = totalExpense / cashFlowData.length

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      avgMonthlyIncome,
      avgMonthlyExpense,
    }
  }, [cashFlowData])

  // بيانات المقارنة الشهرية
  const monthlyComparison = useMemo(() => {
    return cashFlowData.map((item, index) => {
      const prevMonth = index > 0 ? cashFlowData[index - 1] : null
      const incomeChange = prevMonth ? ((item.income - prevMonth.income) / prevMonth.income) * 100 : 0
      const expenseChange = prevMonth ? ((item.expense - prevMonth.expense) / prevMonth.expense) * 100 : 0
      
      return {
        ...item,
        incomeChange: incomeChange.toFixed(1),
        expenseChange: expenseChange.toFixed(1),
      }
    })
  }, [cashFlowData])

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات الإجمالية */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                إجمالي الإيرادات
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalIncome)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                آخر 6 أشهر
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                إجمالي المصروفات
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.totalExpense)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                آخر 6 أشهر
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge 
                variant={stats.netCashFlow > 0 ? 'default' : 'secondary'}
                className={
                  stats.netCashFlow > 0
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                }
              >
                {stats.netCashFlow > 0 ? 'إيجابي' : 'سلبي'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                صافي التدفق النقدي
              </p>
              <p className={`text-2xl font-bold ${stats.netCashFlow > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(stats.netCashFlow)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                آخر 6 أشهر
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                متوسط الإيرادات الشهرية
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.avgMonthlyIncome)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                المتوسط الشهري
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسم الخطي - التدفق النقدي */}
      <Card>
        <CardHeader>
          <CardTitle>📈 التدفق النقدي الشهري</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => {
                  const labels: any = {
                    income: 'الإيرادات',
                    expense: 'المصروفات',
                    net: 'صافي التدفق',
                  }
                  return <span className="text-sm text-foreground">{labels[value] || value}</span>
                }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الرسم العمودي - المقارنة الشهرية */}
      <Card>
        <CardHeader>
          <CardTitle>📊 مقارنة الإيرادات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => {
                  const labels: any = {
                    income: 'الإيرادات',
                    expense: 'المصروفات',
                  }
                  return <span className="text-sm text-foreground">{labels[value] || value}</span>
                }}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول التفاصيل الشهرية */}
      <Card>
        <CardHeader>
          <CardTitle>📋 تفاصيل التدفق النقدي الشهري</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right p-3 font-semibold">الشهر</th>
                  <th className="text-right p-3 font-semibold">الإيرادات</th>
                  <th className="text-right p-3 font-semibold">المصروفات</th>
                  <th className="text-right p-3 font-semibold">صافي التدفق</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((item, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{item.month}</td>
                    <td className="p-3 text-green-600 dark:text-green-400">
                      {formatCurrency(item.income)}
                    </td>
                    <td className="p-3 text-red-600 dark:text-red-400">
                      {formatCurrency(item.expense)}
                    </td>
                    <td className={`p-3 font-bold ${item.net > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(item.net)}
                    </td>
                    <td className="p-3">
                      <Badge 
                        variant={item.net > 0 ? 'default' : 'secondary'}
                        className={
                          item.net > 0
                            ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                        }
                      >
                        {item.net > 0 ? 'فائض' : 'عجز'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

