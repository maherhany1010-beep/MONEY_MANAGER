'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface ComparisonData {
  period1: string
  period2: string
  totalBalance1: number
  totalBalance2: number
  accountCount1: number
  accountCount2: number
  cashFlow1: number
  cashFlow2: number
  byType: Array<{
    type: string
    balance1: number
    balance2: number
    change: number
    changePercent: number
  }>
}

export function ComparisonTool() {
  const [period1, setPeriod1] = useState('current-month')
  const [period2, setPeriod2] = useState('previous-month')

  // بيانات وهمية للمقارنة
  const comparisonData = useMemo<ComparisonData>(() => {
    const mockData = {
      'current-month': {
        totalBalance: 450000,
        accountCount: 12,
        cashFlow: 85000,
      },
      'previous-month': {
        totalBalance: 380000,
        accountCount: 11,
        cashFlow: 62000,
      },
      'last-quarter': {
        totalBalance: 320000,
        accountCount: 10,
        cashFlow: 45000,
      },
    }

    const data1 = mockData[period1 as keyof typeof mockData]
    const data2 = mockData[period2 as keyof typeof mockData]

    return {
      period1,
      period2,
      totalBalance1: data1.totalBalance,
      totalBalance2: data2.totalBalance,
      accountCount1: data1.accountCount,
      accountCount2: data2.accountCount,
      cashFlow1: data1.cashFlow,
      cashFlow2: data2.cashFlow,
      byType: [
        {
          type: 'بطاقات ائتمانية',
          balance1: 120000,
          balance2: 95000,
          change: 25000,
          changePercent: 26.3,
        },
        {
          type: 'حسابات بنكية',
          balance1: 180000,
          balance2: 160000,
          change: 20000,
          changePercent: 12.5,
        },
        {
          type: 'محافظ إلكترونية',
          balance1: 95000,
          balance2: 85000,
          change: 10000,
          changePercent: 11.8,
        },
        {
          type: 'خزائن نقدية',
          balance1: 55000,
          balance2: 40000,
          change: 15000,
          changePercent: 37.5,
        },
      ],
    }
  }, [period1, period2])

  const calculateChange = (value1: number, value2: number) => {
    const change = value1 - value2
    const percent = value2 !== 0 ? ((change / value2) * 100).toFixed(1) : 0
    return { change, percent }
  }

  const balanceChange = calculateChange(
    comparisonData.totalBalance1,
    comparisonData.totalBalance2
  )
  const accountChange = calculateChange(
    comparisonData.accountCount1,
    comparisonData.accountCount2
  )
  const cashFlowChange = calculateChange(
    comparisonData.cashFlow1,
    comparisonData.cashFlow2
  )

  const chartData = comparisonData.byType.map((item) => ({
    name: item.type,
    'الفترة الأولى': item.balance1,
    'الفترة الثانية': item.balance2,
  }))

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400'
    if (change < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* اختيار الفترات */}
      <Card>
        <CardHeader>
          <CardTitle>أداة المقارنة المتقدمة</CardTitle>
          <CardDescription>قارن الأرصدة والإحصائيات بين فترتين زمنيتين</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الأولى</label>
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">الشهر الحالي</SelectItem>
                  <SelectItem value="previous-month">الشهر السابق</SelectItem>
                  <SelectItem value="last-quarter">الربع الأخير</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الثانية</label>
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">الشهر الحالي</SelectItem>
                  <SelectItem value="previous-month">الشهر السابق</SelectItem>
                  <SelectItem value="last-quarter">الربع الأخير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص المقارنة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* إجمالي الأرصدة */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الأرصدة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-muted-foreground">الفترة الأولى</p>
                <p className="text-lg font-bold">
                  {(comparisonData.totalBalance1 / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الفترة الثانية</p>
                <p className="text-lg font-bold">
                  {(comparisonData.totalBalance2 / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
            <div className="border-t my-2" />
            <div className={`flex items-center gap-2 ${getChangeColor(balanceChange.change)}`}>
              {getChangeIcon(balanceChange.change)}
              <span className="font-semibold">
                {balanceChange.change > 0 ? '+' : ''}
                {(balanceChange.change / 1000).toFixed(0)}K ({balanceChange.percent}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* عدد الحسابات */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">عدد الحسابات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-muted-foreground">الفترة الأولى</p>
                <p className="text-lg font-bold">{comparisonData.accountCount1}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الفترة الثانية</p>
                <p className="text-lg font-bold">{comparisonData.accountCount2}</p>
              </div>
            </div>
            <div className="border-t my-2" />
            <div className={`flex items-center gap-2 ${getChangeColor(accountChange.change)}`}>
              {getChangeIcon(accountChange.change)}
              <span className="font-semibold">
                {accountChange.change > 0 ? '+' : ''}
                {accountChange.change} ({accountChange.percent}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* التدفقات النقدية */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">التدفقات النقدية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-muted-foreground">الفترة الأولى</p>
                <p className="text-lg font-bold">
                  {(comparisonData.cashFlow1 / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الفترة الثانية</p>
                <p className="text-lg font-bold">
                  {(comparisonData.cashFlow2 / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
            <div className="border-t my-2" />
            <div className={`flex items-center gap-2 ${getChangeColor(cashFlowChange.change)}`}>
              {getChangeIcon(cashFlowChange.change)}
              <span className="font-semibold">
                {cashFlowChange.change > 0 ? '+' : ''}
                {(cashFlowChange.change / 1000).toFixed(0)}K ({cashFlowChange.percent}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسم البياني المقارن */}
      <Card>
        <CardHeader>
          <CardTitle>مقارنة الأرصدة حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="الفترة الأولى" fill="#3b82f6" />
              <Bar dataKey="الفترة الثانية" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول المقارنة التفصيلي */}
      <Card>
        <CardHeader>
          <CardTitle>المقارنة التفصيلية حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-2">نوع الحساب</th>
                  <th className="text-right py-2 px-2">الفترة الأولى</th>
                  <th className="text-right py-2 px-2">الفترة الثانية</th>
                  <th className="text-right py-2 px-2">التغيير</th>
                  <th className="text-right py-2 px-2">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.byType.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{item.type}</td>
                    <td className="py-2 px-2">{(item.balance1 / 1000).toFixed(0)}K</td>
                    <td className="py-2 px-2">{(item.balance2 / 1000).toFixed(0)}K</td>
                    <td className={`py-2 px-2 font-semibold ${getChangeColor(item.change)}`}>
                      <div className="flex items-center gap-1">
                        {getChangeIcon(item.change)}
                        {item.change > 0 ? '+' : ''}
                        {(item.change / 1000).toFixed(0)}K
                      </div>
                    </td>
                    <td className={`py-2 px-2 font-semibold ${getChangeColor(item.change)}`}>
                      {item.change > 0 ? '+' : ''}
                      {item.changePercent.toFixed(1)}%
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

