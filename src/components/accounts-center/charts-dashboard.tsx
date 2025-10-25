'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface AccountType {
  id: string
  title: string
  count: number
  totalBalance: number
}

interface ChartsDashboardProps {
  accountTypes: AccountType[]
  totalBalance: number
}

// ألوان مخصصة لكل نوع حساب
const COLORS = {
  'credit-cards': '#3b82f6',      // blue
  'prepaid-cards': '#a855f7',     // purple
  'bank-accounts': '#22c55e',     // green
  'cash-vaults': '#f97316',       // orange
  'e-wallets': '#6366f1',         // indigo
  'pos-machines': '#06b6d4',      // cyan
}

export function ChartsDashboard({ accountTypes, totalBalance }: ChartsDashboardProps) {
  // بيانات الرسم الدائري (توزيع الأرصدة)
  const pieChartData = useMemo(() => {
    return accountTypes
      .filter(type => type.totalBalance > 0)
      .map(type => ({
        name: type.title,
        value: type.totalBalance,
        percentage: totalBalance > 0 ? ((type.totalBalance / totalBalance) * 100).toFixed(1) : '0',
        color: COLORS[type.id as keyof typeof COLORS] || '#6b7280',
      }))
  }, [accountTypes, totalBalance])

  // بيانات الرسم العمودي (مقارنة الأرصدة)
  const barChartData = useMemo(() => {
    return accountTypes.map(type => ({
      name: type.title.replace('ماكينات الدفع الإلكتروني', 'ماكينات الدفع'),
      balance: type.totalBalance,
      count: type.count,
      color: COLORS[type.id as keyof typeof COLORS] || '#6b7280',
    }))
  }, [accountTypes])

  // بيانات تجريبية للتدفق النقدي (آخر 6 أشهر)
  const cashFlowData = useMemo(() => {
    const months = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية']
    return months.map((month, index) => ({
      month,
      income: Math.floor(Math.random() * 50000) + 30000,
      expense: Math.floor(Math.random() * 40000) + 20000,
      net: 0, // سيتم حسابه
    })).map(item => ({
      ...item,
      net: item.income - item.expense,
    }))
  }, [])

  // بيانات تجريبية لنمو الأرصدة (آخر 12 شهر)
  const growthData = useMemo(() => {
    const months = [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 
      'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
      'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ]
    let currentBalance = totalBalance * 0.7 // نبدأ من 70% من الرصيد الحالي
    return months.map((month) => {
      const growth = Math.random() * 0.1 - 0.02 // نمو عشوائي بين -2% و +8%
      currentBalance = currentBalance * (1 + growth)
      return {
        month,
        balance: Math.floor(currentBalance),
      }
    })
  }, [totalBalance])

  // Custom Tooltip للرسم الدائري
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].payload.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  // Custom Tooltip للرسوم الأخرى
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* الرسم الدائري - توزيع الأرصدة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 توزيع الأرصدة حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الرسم العمودي - مقارنة الأرصدة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 مقارنة الأرصدة بين الأنواع</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="balance" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الرسم الخطي - التدفق النقدي */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💰 التدفق النقدي (آخر 6 أشهر)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الرسم المساحي - نمو الأرصدة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 نمو الأرصدة (آخر 12 شهر)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBalance)"
                name="إجمالي الأرصدة"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

