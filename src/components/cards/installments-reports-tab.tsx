'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Store,
  Calendar,
  PieChart,
  BarChart3,
  AlertCircle,
} from 'lucide-react'

interface InstallmentsReportsTabProps {
  cardId?: string // إذا كان undefined، يعرض تقارير جميع البطاقات
}

export function InstallmentsReportsTab({ cardId }: InstallmentsReportsTabProps) {
  const [allInstallments, setAllInstallments] = useState<any[]>([])

  useEffect(() => {
    // تحميل جميع التقسيطات
    if (cardId) {
      // تقسيطات بطاقة واحدة
      const saved = localStorage.getItem(`installments_${cardId}`)
      setAllInstallments(saved ? JSON.parse(saved) : [])
    } else {
      // تقسيطات جميع البطاقات
      const allCards = ['1', '2', '3'] // يمكن تحسينها لاحقاً
      const allInst: any[] = []
      allCards.forEach(id => {
        const saved = localStorage.getItem(`installments_${id}`)
        if (saved) {
          allInst.push(...JSON.parse(saved))
        }
      })
      setAllInstallments(allInst)
    }
  }, [cardId])

  // تصنيف التقسيطات حسب النوع
  const noInterestNoFees = allInstallments.filter(i => i.interestRate === 0 && i.administrativeFees === 0)
  const interestOnly = allInstallments.filter(i => i.interestRate > 0 && i.administrativeFees === 0)
  const feesOnly = allInstallments.filter(i => i.interestRate === 0 && i.administrativeFees > 0)
  const interestAndFees = allInstallments.filter(i => i.interestRate > 0 && i.administrativeFees > 0)

  // تصنيف حسب الحالة
  const activeInstallments = allInstallments.filter(i => i.status === 'active')
  const completedInstallments = allInstallments.filter(i => i.status === 'completed')

  // الحسابات الإجمالية
  const totalOriginalAmount = allInstallments.reduce((sum, i) => sum + i.totalAmount, 0)
  const totalInterest = allInstallments.reduce((sum, i) => sum + (i.totalInterest || 0), 0)
  const totalAdminFees = allInstallments.reduce((sum, i) => sum + (i.administrativeFees || 0), 0)
  const totalCost = allInstallments.reduce((sum, i) => sum + (i.totalCost || i.totalAmount), 0)
  const totalLoss = totalInterest + totalAdminFees
  const lossPercentage = totalOriginalAmount > 0 ? (totalLoss / totalOriginalAmount * 100) : 0

  // حسابات الأقساط الشهرية
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let monthlyDue = 0
  const monthlyPaid = 0
  let monthlyOverdue = 0

  activeInstallments.forEach(inst => {
    const nextPaymentDate = inst.nextPaymentDate ? new Date(inst.nextPaymentDate) : null
    if (nextPaymentDate) {
      const thisMonth = today.getMonth()
      const paymentMonth = nextPaymentDate.getMonth()
      
      if (thisMonth === paymentMonth) {
        monthlyDue += inst.nextPaymentAmount || inst.monthlyPayment
      }
      
      if (nextPaymentDate < today) {
        monthlyOverdue += inst.nextPaymentAmount || inst.monthlyPayment
      }
    }
  })

  // تجميع حسب التاجر
  const merchantStats = allInstallments.reduce((acc: any, inst) => {
    const merchantName = inst.merchantName || 'غير محدد'
    if (!acc[merchantName]) {
      acc[merchantName] = {
        count: 0,
        totalAmount: 0,
        totalInterest: 0,
        totalAdminFees: 0,
        totalCost: 0,
      }
    }
    acc[merchantName].count++
    acc[merchantName].totalAmount += inst.totalAmount
    acc[merchantName].totalInterest += inst.totalInterest || 0
    acc[merchantName].totalAdminFees += inst.administrativeFees || 0
    acc[merchantName].totalCost += inst.totalCost || inst.totalAmount
    return acc
  }, {})

  const merchantList = Object.entries(merchantStats).map(([name, stats]: [string, any]) => ({
    name,
    ...stats,
    loss: stats.totalInterest + stats.totalAdminFees,
  })).sort((a, b) => b.totalAmount - a.totalAmount)

  return (
    <div className="space-y-6">
      {/* عنوان التقرير */}
      <div>
        <h2 className="text-2xl font-bold mb-2">تقارير التقسيط الشاملة</h2>
        <p className="text-muted-foreground">
          {cardId ? 'تقرير شامل لجميع التقسيطات في هذه البطاقة' : 'تقرير شامل لجميع التقسيطات في جميع البطاقات'}
        </p>
      </div>

      {/* ملخص عام */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التقسيطات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allInstallments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              نشط: {activeInstallments.length} | مكتمل: {completedInstallments.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ الأصلية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOriginalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              قبل الفوائد والمصاريف
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخسارة</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalLoss)}</div>
            <p className="text-xs text-red-600 mt-1">
              نسبة الخسارة: {formatPercentage(lossPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التكلفة الإجمالية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              بعد الفوائد والمصاريف
            </p>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل الفوائد والمصاريف */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            تفاصيل الخسارة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الفوائد</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalInterest)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي المصاريف الإدارية</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAdminFees)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الخسارة</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalLoss)}</p>
              <p className="text-xs text-red-600 mt-1">
                {formatPercentage(lossPercentage)} من المبلغ الأصلي
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقسيط حسب النوع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            التقسيط حسب النوع
          </CardTitle>
          <CardDescription>توزيع التقسيطات حسب نوع الفوائد والمصاريف</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* بدون فوائد وبدون مصاريف */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">بدون فوائد وبدون مصاريف</p>
                <p className="text-sm text-muted-foreground">
                  {noInterestNoFees.length} تقسيط
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold" style={{ color: '#16a34a' }}>
                  {formatCurrency(noInterestNoFees.reduce((sum, i) => sum + i.totalAmount, 0))}
                </p>
                <p className="text-xs text-muted-foreground">خسارة: 0</p>
              </div>
            </div>

            {/* بفوائد فقط */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">بفوائد فقط</p>
                <p className="text-sm text-muted-foreground">
                  {interestOnly.length} تقسيط
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold" style={{ color: '#2563eb' }}>
                  {formatCurrency(interestOnly.reduce((sum, i) => sum + i.totalAmount, 0))}
                </p>
                <p className="text-xs text-red-600">
                  خسارة: {formatCurrency(interestOnly.reduce((sum, i) => sum + (i.totalInterest || 0), 0))}
                </p>
              </div>
            </div>

            {/* بمصاريف إدارية فقط */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">بمصاريف إدارية فقط</p>
                <p className="text-sm text-muted-foreground">
                  {feesOnly.length} تقسيط
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold" style={{ color: '#ea580c' }}>
                  {formatCurrency(feesOnly.reduce((sum, i) => sum + i.totalAmount, 0))}
                </p>
                <p className="text-xs text-red-600">
                  خسارة: {formatCurrency(feesOnly.reduce((sum, i) => sum + (i.administrativeFees || 0), 0))}
                </p>
              </div>
            </div>

            {/* بفوائد ومصاريف */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">بفوائد ومصاريف إدارية</p>
                <p className="text-sm text-muted-foreground">
                  {interestAndFees.length} تقسيط
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold" style={{ color: '#dc2626' }}>
                  {formatCurrency(interestAndFees.reduce((sum, i) => sum + i.totalAmount, 0))}
                </p>
                <p className="text-xs text-red-600">
                  خسارة: {formatCurrency(interestAndFees.reduce((sum, i) => sum + (i.totalInterest || 0) + (i.administrativeFees || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الأقساط الشهرية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            الأقساط الشهرية
          </CardTitle>
          <CardDescription>ملخص الأقساط المستحقة هذا الشهر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">المستحق هذا الشهر</p>
              <p className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                {formatCurrency(monthlyDue)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">المدفوع</p>
              <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>
                {formatCurrency(monthlyPaid)}
              </p>
            </div>
            <div className="p-4 border rounded-lg border-red-200 dark:border-red-800">
              <p className="text-sm text-muted-foreground mb-1">المتأخر</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyOverdue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التقسيط حسب التاجر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            التقسيط حسب التاجر
          </CardTitle>
          <CardDescription>ملخص التقسيطات لكل تاجر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {merchantList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد تقسيطات</p>
            ) : (
              merchantList.map((merchant, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{merchant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {merchant.count} تقسيط
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {formatCurrency(merchant.totalAmount)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">الفوائد</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(merchant.totalInterest)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">المصاريف</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(merchant.totalAdminFees)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">الخسارة</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(merchant.loss)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

