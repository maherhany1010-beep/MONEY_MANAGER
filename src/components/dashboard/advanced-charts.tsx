'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface AdvancedChartsProps {
  spendingTrend: Array<{ date: string; amount: number }>
  categoryDistribution: Array<{ name: string; value: number; color: string }>
  cardComparison: Array<{ name: string; spending: number; cashback: number }>
  cashbackTrend: Array<{ month: string; earned: number }>
}

export function AdvancedCharts({
  spendingTrend,
  categoryDistribution,
  cardComparison,
  cashbackTrend,
}: AdvancedChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* تطور الإنفاق عبر الزمن */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>تطور الإنفاق عبر الزمن</CardTitle>
          <CardDescription>آخر 30 يوم</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={spendingTrend}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ direction: 'rtl' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                name="المبلغ"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* توزيع الإنفاق حسب الفئات */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإنفاق حسب الفئات</CardTitle>
          <CardDescription>الشهر الحالي</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${((percent as any) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ direction: 'rtl' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend مخصص */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* المقارنة بين البطاقات */}
      <Card>
        <CardHeader>
          <CardTitle>المقارنة بين البطاقات</CardTitle>
          <CardDescription>الإنفاق والكاش باك</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cardComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ direction: 'rtl' }}
              />
              <Legend />
              <Bar dataKey="spending" fill="#3b82f6" name="الإنفاق" radius={[8, 8, 0, 0]} />
              <Bar dataKey="cashback" fill="#10b981" name="الكاش باك" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* تطور الكاش باك */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>تطور الكاش باك المكتسب</CardTitle>
          <CardDescription>آخر 6 أشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cashbackTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ direction: 'rtl' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="earned" 
                stroke="#10b981" 
                strokeWidth={3}
                name="الكاش باك المكتسب"
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

