'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerChartsProps {
  debtHistory?: Array<{ date: string; amount: number }>
  monthlySales?: Array<{ month: string; sales: number }>
  paymentRatio?: { paid: number; pending: number }
}

const COLORS = ['#10b981', '#ef4444']

export function CustomerCharts({
  debtHistory = [],
  monthlySales = [],
  paymentRatio = { paid: 0, pending: 0 },
}: CustomerChartsProps) {
  // إذا لم تكن هناك بيانات، عرض رسالة فارغة
  const hasData = debtHistory.length > 0 || monthlySales.length > 0

  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تطور المديونية</CardTitle>
            <CardDescription>لا توجد بيانات متاحة</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            لا توجد بيانات تاريخية للمديونية
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
            <CardDescription>لا توجد بيانات متاحة</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            لا توجد بيانات تاريخية للمبيعات
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* رسم بياني تطور المديونية */}
      {debtHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>تطور المديونية</CardTitle>
            <CardDescription>تطور المديونية عبر الزمن</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={debtHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="المديونية"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* رسم بياني المبيعات الشهرية */}
      {monthlySales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
            <CardDescription>إجمالي المبيعات لكل شهر</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="sales"
                  fill="#3b82f6"
                  name="المبيعات"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* رسم بياني نسبة الدفع */}
      {(paymentRatio.paid > 0 || paymentRatio.pending > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>نسبة الدفع</CardTitle>
            <CardDescription>نسبة الفواتير المدفوعة والمعلقة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'مدفوع', value: paymentRatio.paid },
                    { name: 'معلق', value: paymentRatio.pending },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

