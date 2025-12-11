'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Gift
} from 'lucide-react'

interface MonthlySpending {
  month: string
  amount: number
}

interface CategorySpending {
  category: string
  amount: number
  percentage: number
}

interface CashbackTrend {
  month: string
  amount: number
}

interface DashboardChartsProps {
  monthlySpending: MonthlySpending[]
  categorySpending: CategorySpending[]
  cashbackTrend: CashbackTrend[]
}

export function DashboardCharts({ monthlySpending, categorySpending, cashbackTrend }: DashboardChartsProps) {
  const maxSpending = Math.max(...monthlySpending.map(m => m.amount))
  const maxCashback = Math.max(...cashbackTrend.map(c => c.amount))
  
  const currentMonth = monthlySpending[monthlySpending.length - 1]
  const previousMonth = monthlySpending[monthlySpending.length - 2]
  const spendingGrowth = previousMonth ? ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100 : 0

  const currentCashback = cashbackTrend[cashbackTrend.length - 1]
  const previousCashback = cashbackTrend[cashbackTrend.length - 2]
  const cashbackGrowth = previousCashback ? ((currentCashback.amount - previousCashback.amount) / previousCashback.amount) * 100 : 0

  const totalCategorySpending = categorySpending.reduce((sum, cat) => sum + cat.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإنفاق هذا الشهر</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentMonth.amount)}
            </div>
            <p className={`text-xs flex items-center gap-1 ${
              spendingGrowth > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {spendingGrowth > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercentage(Math.abs(spendingGrowth))} من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكاش باك هذا الشهر</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(currentCashback.amount)}
            </div>
            <p className={`text-xs flex items-center gap-1 ${
              cashbackGrowth > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {cashbackGrowth > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercentage(Math.abs(cashbackGrowth))} من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الإنفاق</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(monthlySpending.reduce((sum, m) => sum + m.amount, 0) / monthlySpending.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              خلال آخر {monthlySpending.length} أشهر
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              الإنفاق الشهري
            </CardTitle>
            <CardDescription>
              تطور الإنفاق خلال آخر {monthlySpending.length} أشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlySpending.map((month, index) => {
                const percentage = (month.amount / maxSpending) * 100
                const isCurrentMonth = index === monthlySpending.length - 1
                
                return (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isCurrentMonth ? 'text-primary' : ''}`}>
                        {month.month}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isCurrentMonth ? 'text-primary' : ''}`}>
                          {formatCurrency(month.amount)}
                        </span>
                        {isCurrentMonth && (
                          <Badge variant="default" className="text-xs">
                            الحالي
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isCurrentMonth ? 'bg-primary/20' : ''}`}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              الإنفاق حسب الفئة
            </CardTitle>
            <CardDescription>
              توزيع الإنفاق على الفئات المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpending.map((category, index) => {
                const colors = [
                  'bg-blue-500',
                  'bg-green-500', 
                  'bg-yellow-500',
                  'bg-purple-500',
                  'bg-red-500',
                  'bg-indigo-500'
                ]
                const color = colors[index % colors.length]
                
                return (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatCurrency(category.amount)}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatPercentage(category.percentage)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                )
              })}
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm font-medium">
                  <span>إجمالي الإنفاق</span>
                  <span>{formatCurrency(totalCategorySpending)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cashback Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              اتجاه الكاش باك
            </CardTitle>
            <CardDescription>
              تطور مكافآت الكاش باك خلال آخر {cashbackTrend.length} أشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">إجمالي الكاش باك</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(cashbackTrend.reduce((sum, c) => sum + c.amount, 0))}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">متوسط شهري</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(cashbackTrend.reduce((sum, c) => sum + c.amount, 0) / cashbackTrend.length)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {cashbackTrend.map((month, index) => {
                  const percentage = (month.amount / maxCashback) * 100
                  const isCurrentMonth = index === cashbackTrend.length - 1
                  const previousAmount = index > 0 ? cashbackTrend[index - 1].amount : month.amount
                  const growth = index > 0 ? ((month.amount - previousAmount) / previousAmount) * 100 : 0
                  
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isCurrentMonth ? 'text-primary' : ''}`}>
                          {month.month}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isCurrentMonth ? 'text-primary' : ''}`}>
                            {formatCurrency(month.amount)}
                          </span>
                          {index > 0 && (
                            <Badge variant={growth > 0 ? 'default' : 'secondary'} className="text-xs">
                              {growth > 0 ? '+' : ''}{formatPercentage(Math.abs(growth))}
                            </Badge>
                          )}
                          {isCurrentMonth && (
                            <Badge variant="default" className="text-xs">
                              الحالي
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isCurrentMonth ? 'bg-purple-100' : ''}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            رؤى وتوصيات
          </CardTitle>
          <CardDescription>
            تحليل البيانات وتوصيات لتحسين الاستخدام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">أفضل فئة إنفاق</h4>
              <p className="text-sm text-blue-700">
                فئة &quot;{categorySpending[0]?.category}&quot; تمثل {formatPercentage(categorySpending[0]?.percentage || 0)} من إنفاقك.
                تأكد من استخدام البطاقة ذات أعلى كاش باك لهذه الفئة.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">نمو الكاش باك</h4>
              <p className="text-sm text-green-700">
                {cashbackGrowth > 0 ? (
                  `كاش باكك نما بنسبة ${formatPercentage(cashbackGrowth)} هذا الشهر. استمر في هذا الأداء الممتاز!`
                ) : (
                  `كاش باكك انخفض بنسبة ${formatPercentage(Math.abs(cashbackGrowth))} هذا الشهر. راجع استراتيجية الإنفاق.`
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
