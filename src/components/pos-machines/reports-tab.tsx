'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { POSMachine } from '@/contexts/pos-machines-context'
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
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ReportsTabProps {
  machines: POSMachine[]
}

export function ReportsTab({ machines }: ReportsTabProps) {
  const [period, setPeriod] = useState<string>('month')
  const [selectedMachineId, setSelectedMachineId] = useState<string>('all')

  // Filter machines by selection
  const filteredMachines = useMemo(() => {
    if (selectedMachineId === 'all') {
      return machines
    }
    return machines.filter(m => m.id === selectedMachineId)
  }, [machines, selectedMachineId])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const totalMachines = filteredMachines.length
    const activeMachines = filteredMachines.filter(m => m.status === 'active').length
    const totalRevenue = filteredMachines.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0)
    const totalTransactions = filteredMachines.reduce((sum, m) => sum + (m.totalTransactions || 0), 0)
    const avgRevenuePerMachine = totalMachines > 0 ? totalRevenue / totalMachines : 0
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const totalCommissions = totalRevenue * 0.02

    return {
      totalMachines,
      activeMachines,
      totalRevenue,
      totalTransactions,
      avgRevenuePerMachine,
      avgTransactionValue,
      totalCommissions,
    }
  }, [filteredMachines])

  // Machines comparison
  const machinesComparison = useMemo(() => {
    return machines.map(machine => ({
      name: machine.machineName,
      revenue: machine.monthlyRevenue || 0,
      transactions: machine.totalTransactions || 0,
    }))
  }, [machines])

  // Revenue distribution by location
  const locationDistribution = useMemo(() => {
    const locationGroups = machines.reduce((acc, machine) => {
      const location = machine.location || 'غير محدد'
      if (!acc[location]) {
        acc[location] = { revenue: 0, count: 0 }
      }
      acc[location].revenue += machine.monthlyRevenue || 0
      acc[location].count++
      return acc
    }, {} as Record<string, { revenue: number; count: number }>)

    return Object.entries(locationGroups).map(([location, data]) => ({
      name: location,
      value: data.revenue,
      count: data.count,
    }))
  }, [machines])

  // Revenue distribution by provider
  const providerDistribution = useMemo(() => {
    const providerGroups = machines.reduce((acc, machine) => {
      const provider = machine.provider || 'غير محدد'
      if (!acc[provider]) {
        acc[provider] = { revenue: 0, count: 0 }
      }
      acc[provider].revenue += machine.monthlyRevenue || 0
      acc[provider].count++
      return acc
    }, {} as Record<string, { revenue: number; count: number }>)

    return Object.entries(providerGroups).map(([provider, data]) => ({
      name: provider,
      value: data.revenue,
      count: data.count,
    }))
  }, [machines])

  // Sales trend (simulated monthly data)
  const salesTrend = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    const currentRevenue = overviewStats.totalRevenue
    
    return months.map((month, index) => {
      const factor = 0.7 + (index * 0.05) // نمو تدريجي
      return {
        month,
        revenue: Math.round(currentRevenue * factor),
        transactions: Math.round(overviewStats.totalTransactions * factor),
      }
    })
  }, [overviewStats])

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  // بيانات الأهداف والغرامات
  const targetsData = useMemo(() => {
    const machinesWithTargets = machines.filter(m => m.monthlyTarget && m.monthlyTarget > 0)

    // بيانات المقارنة (الهدف مقابل المحقق)
    const comparisonData = machinesWithTargets.map(m => ({
      name: m.machineName,
      target: m.monthlyTarget || 0,
      achieved: m.monthlyRevenue || 0,
      percentage: m.targetPercentage || 0,
    }))

    // توزيع الماكينات حسب الحالة
    const statusDistribution = machinesWithTargets.reduce((acc, m) => {
      const percentage = m.targetPercentage || 0
      const threshold = m.penaltyThreshold || 80

      if (percentage >= 100) {
        acc.achieved++
      } else if (percentage >= threshold) {
        acc.close++
      } else {
        acc.far++
      }
      return acc
    }, { achieved: 0, close: 0, far: 0 })

    const distributionData = [
      { name: 'تم تحقيق الهدف', value: statusDistribution.achieved, color: '#10b981' },
      { name: 'قريب من الهدف', value: statusDistribution.close, color: '#f59e0b' },
      { name: 'بعيد عن الهدف', value: statusDistribution.far, color: '#ef4444' },
    ].filter(item => item.value > 0)

    // جدول البيانات
    const tableData = machinesWithTargets.map(m => ({
      id: m.id,
      name: m.machineName,
      target: m.monthlyTarget || 0,
      achieved: m.monthlyRevenue || 0,
      percentage: m.targetPercentage || 0,
      penalty: m.penaltyAmount || 0,
      hasPenalty: m.hasPenalty || false,
      threshold: m.penaltyThreshold || 80,
    }))

    return {
      comparisonData,
      distributionData,
      tableData,
      totalPenalties: tableData.reduce((sum, m) => sum + (m.hasPenalty ? m.penalty : 0), 0),
      machinesWithPenalty: tableData.filter(m => m.hasPenalty).length,
    }
  }, [machines])

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
              <Label>الماكينة</Label>
              <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الماكينات</SelectItem>
                  {machines.map(machine => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.machineName}
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="comparison">المقارنة</TabsTrigger>
          <TabsTrigger value="distribution">التوزيع</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="targets">الأهداف والغرامات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي الماكينات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.totalMachines}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overviewStats.activeMachines} نشطة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(overviewStats.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  متوسط المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(overviewStats.avgRevenuePerMachine)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">لكل ماكينة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي المعاملات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.totalTransactions.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  متوسط قيمة المعاملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(overviewStats.avgTransactionValue)}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي العمولات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(overviewStats.totalCommissions)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">2% من المبيعات</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة الماكينات</CardTitle>
              <CardDescription>مقارنة المبيعات والمعاملات لكل ماكينة</CardDescription>
            </CardHeader>
            <CardContent>
              {machinesComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={machinesComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="المبيعات" />
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
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المبيعات حسب الموقع</CardTitle>
                <CardDescription>توزيع المبيعات بين المواقع المختلفة</CardDescription>
              </CardHeader>
              <CardContent>
                {locationDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${formatCurrency(entry.value as number)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {locationDistribution.map((entry, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle>توزيع المبيعات حسب المزود</CardTitle>
                <CardDescription>توزيع المبيعات بين مزودي الخدمة</CardDescription>
              </CardHeader>
              <CardContent>
                {providerDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={providerDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${formatCurrency(entry.value as number)}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {providerDistribution.map((entry, index) => (
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
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاه المبيعات</CardTitle>
              <CardDescription>تطور المبيعات عبر الأشهر الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              {salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="المبيعات" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الأهداف والغرامات */}
        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الأهداف والغرامات</CardTitle>
              <CardDescription>
                متابعة تحقيق الأهداف الشهرية والغرامات المتوقعة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {targetsData.tableData.length > 0 ? (
                <>
                  {/* ملخص سريع */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الماكينات</p>
                      <p className="text-2xl font-bold text-foreground">
                        {targetsData.tableData.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ماكينات بغرامات</p>
                      <p className="text-2xl font-bold text-red-600">
                        {targetsData.machinesWithPenalty}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الغرامات</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(targetsData.totalPenalties)}
                      </p>
                    </div>
                  </div>

                  {/* جدول البيانات */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-right p-3 text-sm font-semibold text-foreground">الماكينة</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">الهدف</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">المحقق</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">النسبة</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">الحالة</th>
                          <th className="text-right p-3 text-sm font-semibold text-foreground">الغرامة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {targetsData.tableData.map((row) => {
                          const percentage = row.percentage
                          const threshold = row.threshold
                          let statusVariant: 'default' | 'secondary' | 'destructive' = 'destructive'
                          let statusLabel = 'بعيد عن الهدف'

                          if (percentage >= 100) {
                            statusVariant = 'default'
                            statusLabel = 'تم تحقيق الهدف'
                          } else if (percentage >= threshold) {
                            statusVariant = 'secondary'
                            statusLabel = 'قريب من الهدف'
                          }

                          return (
                            <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="p-3 text-sm text-foreground">{row.name}</td>
                              <td className="p-3 text-sm text-foreground">{formatCurrency(row.target)}</td>
                              <td className="p-3 text-sm text-green-600">{formatCurrency(row.achieved)}</td>
                              <td className="p-3 text-sm font-semibold">
                                <span className={
                                  percentage >= 100 ? 'text-green-600' :
                                  percentage >= threshold ? 'text-orange-600' :
                                  'text-red-600'
                                }>
                                  {percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="p-3">
                                <Badge variant={statusVariant}>
                                  {statusLabel}
                                </Badge>
                              </td>
                              <td className="p-3 text-sm">
                                {row.hasPenalty ? (
                                  <span className="font-semibold text-red-600">
                                    {formatCurrency(row.penalty)}
                                  </span>
                                ) : (
                                  <span className="text-green-600">-</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* الرسوم البيانية */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* رسم المقارنة */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h3 className="text-sm font-semibold text-foreground mb-4">
                        مقارنة الهدف بالمحقق
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={targetsData.comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#f3f4f6'
                            }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Legend wrapperStyle={{ color: '#9ca3af' }} />
                          <Bar dataKey="target" fill="#3b82f6" name="الهدف" />
                          <Bar dataKey="achieved" fill="#10b981" name="المحقق" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* رسم التوزيع */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h3 className="text-sm font-semibold text-foreground mb-4">
                        توزيع الماكينات حسب الحالة
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={targetsData.distributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {targetsData.distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '8px',
                              color: '#f3f4f6'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد ماكينات بأهداف محددة
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

