'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { ProfitLossReport } from '@/types/financial-reports'
import { formatPeriodLabel } from '@/lib/financial-calculations'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Gift, ShoppingCart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface ProfitLossReportProps {
  report: ProfitLossReport
}

export function ProfitLossReportComponent({ report }: ProfitLossReportProps) {
  const isProfit = report.netProfit >= 0

  // بيانات الرسم البياني
  const chartData = [
    {
      name: 'الإيرادات',
      value: report.revenue.total,
      color: '#10b981',
    },
    {
      name: 'المصروفات',
      value: report.expenses.total,
      color: '#ef4444',
    },
    {
      name: 'صافي الربح',
      value: Math.abs(report.netProfit),
      color: isProfit ? '#3b82f6' : '#f59e0b',
    },
  ]

  // تفاصيل الإيرادات
  const revenueDetails = [
    { label: 'كاش باك مكتسب', value: report.revenue.cashbackEarned, icon: Gift, color: 'text-green-600' },
    { label: 'عوائد استثمارات', value: report.revenue.investmentReturns, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'إيرادات مبيعات', value: report.revenue.salesRevenue, icon: ShoppingCart, color: 'text-purple-600' },
    { label: 'إيرادات أخرى', value: report.revenue.otherIncome, icon: DollarSign, color: 'text-gray-600' },
  ]

  // تفاصيل المصروفات
  const expenseDetails = [
    { label: 'مدفوعات البطاقات', value: report.expenses.cardPayments, icon: CreditCard, color: 'text-red-600' },
    { label: 'أقساط', value: report.expenses.installments, icon: CreditCard, color: 'text-orange-600' },
    { label: 'رسوم', value: report.expenses.fees, icon: DollarSign, color: 'text-yellow-600' },
    { label: 'مشتريات', value: report.expenses.purchases, icon: ShoppingCart, color: 'text-pink-600' },
    { label: 'تحويلات', value: report.expenses.transfers, icon: TrendingDown, color: 'text-indigo-600' },
    { label: 'مصروفات أخرى', value: report.expenses.otherExpenses, icon: DollarSign, color: 'text-gray-600' },
  ]

  return (
    <div className="space-y-6">
      {/* العنوان والملخص */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            تقرير الأرباح والخسائر
          </CardTitle>
          <CardDescription>
            {formatPeriodLabel(report.period)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* إجمالي الإيرادات */}
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">إجمالي الإيرادات</span>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(report.revenue.total)}
              </p>
            </div>

            {/* إجمالي المصروفات */}
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">إجمالي المصروفات</span>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(report.expenses.total)}
              </p>
            </div>

            {/* صافي الربح/الخسارة */}
            <div className={`p-4 rounded-lg border ${
              isProfit 
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' 
                : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isProfit ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
                }`}>
                  {isProfit ? 'صافي الربح' : 'صافي الخسارة'}
                </span>
                {isProfit ? (
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <p className={`text-2xl font-bold ${
                isProfit ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'
              }`}>
                {formatCurrency(Math.abs(report.netProfit))}
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                هامش الربح: {formatPercentage(report.profitMargin)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الرسم البياني */}
      <Card>
        <CardHeader>
          <CardTitle>المقارنة البيانية</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ direction: 'rtl' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* تفاصيل الإيرادات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">تفاصيل الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueDetails.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(item.value)}</span>
                </div>
              )
            })}
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border-2 border-green-500">
              <span className="font-bold text-green-700 dark:text-green-400">الإجمالي</span>
              <span className="font-bold text-lg text-green-900 dark:text-green-100">
                {formatCurrency(report.revenue.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل المصروفات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400">تفاصيل المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenseDetails.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(item.value)}</span>
                </div>
              )
            })}
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-500">
              <span className="font-bold text-red-700 dark:text-red-400">الإجمالي</span>
              <span className="font-bold text-lg text-red-900 dark:text-red-100">
                {formatCurrency(report.expenses.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

