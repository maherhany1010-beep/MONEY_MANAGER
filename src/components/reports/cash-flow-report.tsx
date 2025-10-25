'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CashFlowReport } from '@/types/financial-reports'
import { formatPeriodLabel } from '@/lib/financial-calculations'
import { TrendingUp, TrendingDown, Activity, ArrowUpDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface CashFlowReportProps {
  report: CashFlowReport
}

export function CashFlowReportComponent({ report }: CashFlowReportProps) {
  const chartData = [
    { name: 'الأنشطة التشغيلية', value: report.operatingActivities.net, color: '#3b82f6' },
    { name: 'الأنشطة الاستثمارية', value: report.investingActivities.net, color: '#8b5cf6' },
    { name: 'الأنشطة التمويلية', value: report.financingActivities.net, color: '#ec4899' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            تقرير التدفقات النقدية
          </CardTitle>
          <CardDescription>{formatPeriodLabel(report.period)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
              <span className="text-sm font-medium text-blue-700">النقد في البداية</span>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {formatCurrency(report.openingCash)}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              report.netCashChange >= 0 
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200' 
                : 'bg-red-50 dark:bg-red-950/20 border-red-200'
            }`}>
              <span className={`text-sm font-medium ${
                report.netCashChange >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                صافي التغير في النقد
              </span>
              <p className={`text-2xl font-bold mt-2 ${
                report.netCashChange >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              }`}>
                {formatCurrency(Math.abs(report.netCashChange))}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
              <span className="text-sm font-medium text-purple-700">النقد في النهاية</span>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                {formatCurrency(report.closingCash)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 text-base">الأنشطة التشغيلية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>النقد المستلم</span>
              <span className="font-bold text-green-600">{formatCurrency(report.operatingActivities.cashReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span>النقد المدفوع</span>
              <span className="font-bold text-red-600">{formatCurrency(report.operatingActivities.cashPaid)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t-2">
              <span className="font-bold">الصافي</span>
              <span className={`font-bold ${report.operatingActivities.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(report.operatingActivities.net))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-400 text-base">الأنشطة الاستثمارية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>شراء استثمارات</span>
              <span className="font-bold text-red-600">{formatCurrency(report.investingActivities.investmentPurchases)}</span>
            </div>
            <div className="flex justify-between">
              <span>بيع استثمارات</span>
              <span className="font-bold text-green-600">{formatCurrency(report.investingActivities.investmentSales)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t-2">
              <span className="font-bold">الصافي</span>
              <span className={`font-bold ${report.investingActivities.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(report.investingActivities.net))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-pink-700 dark:text-pink-400 text-base">الأنشطة التمويلية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>قروض مستلمة</span>
              <span className="font-bold text-green-600">{formatCurrency(report.financingActivities.loansReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span>قروض مسددة</span>
              <span className="font-bold text-red-600">{formatCurrency(report.financingActivities.loansRepaid)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t-2">
              <span className="font-bold">الصافي</span>
              <span className={`font-bold ${report.financingActivities.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(report.financingActivities.net))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

