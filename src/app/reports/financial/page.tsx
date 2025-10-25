'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfitLossReportComponent } from '@/components/reports/profit-loss-report'
import { CashFlowReportComponent } from '@/components/reports/cash-flow-report'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useInvestments } from '@/contexts/investments-context'
import {
  calculateProfitLoss,
  calculateCashFlow,
  calculateBalanceSheet,
  calculateFinancialSummary
} from '@/lib/financial-calculations'
import { ReportPeriod, DateRange } from '@/types/financial-reports'
import { FileText, Download, Calendar, Filter, ArrowRight } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils'

export default function FinancialReportsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [activeTab, setActiveTab] = useState('summary')

  const { accounts } = useBankAccounts()
  const { vaults } = useCashVaults()
  const { wallets } = useEWallets()
  const { cards } = usePrepaidCards()
  const { investments } = useInvestments()

  // حساب الفترة الزمنية
  const dateRange = useMemo((): DateRange => {
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'daily':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    }
  }, [period])

  // حساب البيانات المالية (mock data - في التطبيق الحقيقي ستأتي من قاعدة البيانات)
  const totalCash = vaults.reduce((sum, v) => sum + v.balance, 0)
  const totalBankBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  const totalPrepaidBalance = cards.reduce((sum, c) => sum + c.balance, 0)
  const totalInvestments = investments.reduce((sum, inv: any) => sum + ((inv.currentPrice || 0) * (inv.quantity || 0)), 0)

  // تقرير الأرباح والخسائر
  const profitLossReport = useMemo(() => {
    return calculateProfitLoss(dateRange, {
      cashbackEarned: 1250.50,
      investmentReturns: 3500.00,
      salesRevenue: 15000.00,
      cardPayments: 8500.00,
      installments: 2000.00,
      fees: 350.00,
      purchases: 5500.00,
      transfers: 1200.00,
    })
  }, [dateRange])

  // تقرير التدفقات النقدية
  const cashFlowReport = useMemo(() => {
    return calculateCashFlow(dateRange, {
      cashReceived: 25000.00,
      cashPaid: 18000.00,
      investmentPurchases: 5000.00,
      investmentSales: 2000.00,
      loansReceived: 0,
      loansRepaid: 1500.00,
      openingCash: totalCash + totalBankBalance + totalWalletBalance + totalPrepaidBalance || 50000,
    })
  }, [dateRange, totalCash, totalBankBalance, totalWalletBalance, totalPrepaidBalance])

  // تقرير الميزانية العمومية
  const balanceSheetReport = useMemo(() => {
    return calculateBalanceSheet(new Date().toISOString(), {
      cash: totalCash,
      bankAccounts: totalBankBalance,
      eWallets: totalWalletBalance,
      prepaidCards: totalPrepaidBalance,
      inventory: 25000,
      accountsReceivable: 15000,
      investments: totalInvestments,
      fixedAssets: 50000,
      creditCards: 12000,
      installments: 8000,
      accountsPayable: 10000,
      savingsCircles: 5000,
      longTermLoans: 0,
      capital: 100000,
      retainedEarnings: 20000,
      currentPeriodProfit: profitLossReport.netProfit,
    })
  }, [totalCash, totalBankBalance, totalWalletBalance, totalPrepaidBalance, totalInvestments, profitLossReport])

  // الملخص المالي
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(
      dateRange,
      profitLossReport,
      balanceSheetReport,
      cashFlowReport,
      {
        revenue: 18000,
        expenses: 16000,
        profit: 2000,
        assets: balanceSheetReport.assets.totalAssets * 0.95,
        liabilities: balanceSheetReport.liabilities.totalLiabilities * 1.05,
      }
    )
  }, [dateRange, profitLossReport, balanceSheetReport, cashFlowReport])

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`سيتم تصدير التقرير بصيغة ${format === 'pdf' ? 'PDF' : 'Excel'}`)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* زر العودة */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/reports')}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى التقارير
          </Button>
        </div>

        {/* العنوان والفلاتر */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              التقارير المالية المتقدمة
            </h1>
            <p className="text-muted-foreground mt-2">
              تقارير مالية شاملة ومفصلة لجميع الأنشطة
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2">
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* الملخص السريع */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الأصول</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(financialSummary.kpis.totalAssets)}</p>
              {financialSummary.comparison && (
                <p className={`text-xs mt-1 ${financialSummary.comparison.assetsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialSummary.comparison.assetsChange >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(financialSummary.comparison.assetsChange))}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">صافي الثروة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.kpis.netWorth)}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                نسبة المديونية: {formatPercentage(financialSummary.kpis.debtRatio)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">صافي الربح</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${financialSummary.kpis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(financialSummary.kpis.netProfit))}
              </p>
              {financialSummary.comparison && (
                <p className={`text-xs mt-1 ${financialSummary.comparison.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialSummary.comparison.profitChange >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(financialSummary.comparison.profitChange))}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">نسبة السيولة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{financialSummary.kpis.liquidityRatio.toFixed(2)}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                {financialSummary.kpis.liquidityRatio >= 2 ? 'ممتاز' : financialSummary.kpis.liquidityRatio >= 1 ? 'جيد' : 'ضعيف'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* التقارير التفصيلية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">الملخص</TabsTrigger>
            <TabsTrigger value="profit-loss">الأرباح والخسائر</TabsTrigger>
            <TabsTrigger value="cash-flow">التدفقات النقدية</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الملخص المالي الشامل</CardTitle>
                <CardDescription>نظرة عامة على الوضع المالي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">سيتم إضافة المزيد من التفاصيل قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit-loss" className="mt-6">
            <ProfitLossReportComponent report={profitLossReport} />
          </TabsContent>

          <TabsContent value="cash-flow" className="mt-6">
            <CashFlowReportComponent report={cashFlowReport} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

