'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useInvestments, Investment, InvestmentType } from '@/contexts/investments-context'
import { AddInvestmentDialog } from '@/components/investments/add-investment-dialog'
import { UpdatePriceDialog } from '@/components/investments/update-price-dialog'
import { AddQuantityDialog } from '@/components/investments/add-quantity-dialog'
import { SellInvestmentDialog } from '@/components/investments/sell-investment-dialog'
import { CertificateMaturityDialog } from '@/components/investments/certificate-maturity-dialog'
import { EditCertificateDialog } from '@/components/investments/edit-certificate-dialog'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
  Plus,
  Search,
  Edit,
  Trash2,
  Coins,
  Bitcoin,
  FileText,
  BarChart3,
  RefreshCw,
  Minus,
  ArrowRight,
  AlertCircle,
  Calendar,
  Wallet
} from 'lucide-react'

export default function InvestmentsPage() {
  const {
    investments,
    deleteInvestment,
    getTotalPortfolioValue,
    getTotalCost,
    getTotalProfitLoss,
    getReturnPercentage,
    getPriceChange,
  } = useInvestments()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUpdatePriceDialog, setShowUpdatePriceDialog] = useState(false)
  const [showAddQuantityDialog, setShowAddQuantityDialog] = useState(false)
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [showMaturityDialog, setShowMaturityDialog] = useState(false)
  const [showEditCertificateDialog, setShowEditCertificateDialog] = useState(false)
  const [maturityDialogAction, setMaturityDialogAction] = useState<'renew' | 'withdraw'>('renew')
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<InvestmentType | 'all'>('all')

  // Statistics
  const totalValue = getTotalPortfolioValue()
  const totalCost = getTotalCost()
  const totalProfitLoss = getTotalProfitLoss()
  const returnPercentage = getReturnPercentage()
  const activeInvestments = investments.length

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return `${amount.toFixed(2)} ${currency}`
  }

  // Calculate individual investment metrics
  const calculateInvestmentMetrics = (investment: Investment) => {
    let currentValueInOriginalCurrency = 0
    let costInOriginalCurrency = 0
    let originalCurrency = investment.currency || 'EGP'
    let fees = 0

    // استخدام سعر الصرف المحفوظ مع الاستثمار أو من localStorage
    const savedExchangeRate = localStorage.getItem('currentExchangeRate')
    const currentExchangeRate = investment.currentExchangeRate || (savedExchangeRate ? parseFloat(savedExchangeRate) : 50)
    const purchaseExchangeRate = investment.exchangeRateAtPurchase || currentExchangeRate

    switch (investment.type) {
      case 'precious_metals':
        currentValueInOriginalCurrency = (investment.quantity ?? 0) * (investment.currentPrice ?? 0)
        costInOriginalCurrency = (investment.quantity ?? 0) * (investment.purchasePrice ?? 0)
        fees = investment.purchaseFee ?? 0
        break
      case 'cryptocurrency':
        currentValueInOriginalCurrency = (investment.quantity ?? 0) * (investment.currentPrice ?? 0)
        costInOriginalCurrency = (investment.quantity ?? 0) * (investment.purchasePrice ?? 0)
        fees = investment.cryptoPurchaseFee ?? 0
        originalCurrency = 'USD'
        break
      case 'certificate':
        // الشهادات بالجنيه المصري
        const principal = investment.amount ?? 0
        const interestRate = investment.interestRate ?? 0
        const startDate = new Date(investment.startDate ?? investment.purchaseDate ?? new Date())
        const maturityDate = investment.maturityDate ? new Date(investment.maturityDate) : startDate
        const now = new Date()

        // حساب الفائدة المستحقة حتى الآن
        const totalDays = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysElapsed = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysRatio = Math.min(1, daysElapsed / totalDays)

        const totalInterest = principal * (interestRate / 100)
        const accruedInterest = totalInterest * daysRatio

        currentValueInOriginalCurrency = principal + accruedInterest
        costInOriginalCurrency = principal
        originalCurrency = 'EGP'
        break
      case 'stock':
        currentValueInOriginalCurrency = (investment.shares ?? 0) * (investment.currentPrice ?? 0)
        costInOriginalCurrency = (investment.shares ?? 0) * (investment.purchasePrice ?? 0)
        fees = investment.commission ?? 0
        originalCurrency = 'USD'
        break
    }

    // إضافة الرسوم للتكلفة
    costInOriginalCurrency += fees

    // التحويل للجنيه المصري
    let currentValueInEGP = currentValueInOriginalCurrency
    let costInEGP = costInOriginalCurrency
    let feesInEGP = fees

    if (originalCurrency === 'USD') {
      // القيمة الحالية بسعر الصرف الحالي
      currentValueInEGP = currentValueInOriginalCurrency * currentExchangeRate
      // التكلفة بسعر الصرف وقت الشراء
      costInEGP = costInOriginalCurrency * purchaseExchangeRate
      feesInEGP = fees * purchaseExchangeRate
    }

    const profitLoss = currentValueInEGP - costInEGP
    const returnPct = costInEGP > 0 ? (profitLoss / costInEGP) * 100 : 0

    return {
      currentValue: currentValueInEGP,
      currentValueInOriginalCurrency,
      cost: costInEGP,
      costInOriginalCurrency,
      fees: feesInEGP,
      feesInOriginalCurrency: fees,
      profitLoss,
      returnPct,
      currency: 'EGP',
      originalCurrency,
      currentExchangeRate,
      purchaseExchangeRate,
    }
  }

  // حساب بيانات الشهادة الخاصة
  const calculateCertificateDetails = (investment: Investment) => {
    const principal = investment.amount ?? 0
    const interestRate = investment.interestRate ?? 0
    const startDate = new Date(investment.startDate ?? investment.purchaseDate ?? new Date())
    const maturityDate = investment.maturityDate ? new Date(investment.maturityDate) : new Date()
    const now = new Date()

    // حساب إجمالي المدة بالأيام
    const totalDays = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, (maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // حساب الفائدة السنوية الكاملة
    const totalInterest = principal * (interestRate / 100)

    // حساب العائد الشهري
    const monthlyReturn = totalInterest / (totalDays / 30)

    // حساب الأرباح حتى الآن (نسبة من إجمالي الفائدة بناءً على الأيام المنقضية)
    const profitUntilNow = (daysElapsed / totalDays) * totalInterest

    // التحقق من الاستحقاق
    const isMatured = now >= maturityDate
    const isNearMaturity = daysRemaining <= 30 && daysRemaining > 0

    return {
      principal,
      interestRate,
      totalInterest,
      monthlyReturn,
      profitUntilNow,
      daysElapsed: Math.floor(daysElapsed),
      daysRemaining: Math.floor(daysRemaining),
      totalDays: Math.floor(totalDays),
      isMatured,
      isNearMaturity,
      maturityDate,
    }
  }

  // Get investment type label
  const getTypeLabel = (type: InvestmentType) => {
    switch (type) {
      case 'precious_metals': return 'معادن ثمينة'
      case 'cryptocurrency': return 'عملات رقمية'
      case 'certificate': return 'شهادات وودائع'
      case 'stock': return 'أسهم'
    }
  }

  // Get investment icon
  const getTypeIcon = (type: InvestmentType) => {
    switch (type) {
      case 'precious_metals': return <Coins className="h-4 w-4" />
      case 'cryptocurrency': return <Bitcoin className="h-4 w-4" />
      case 'certificate': return <FileText className="h-4 w-4" />
      case 'stock': return <BarChart3 className="h-4 w-4" />
    }
  }

  // Filter investments
  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = (inv.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || inv.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">إدارة الاستثمارات</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">تتبع وإدارة محفظتك الاستثمارية</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
          <Plus className="h-5 w-5 ml-2" />
          إضافة استثمار جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي قيمة المحفظة</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">القيمة الحالية للمحفظة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأرباح/الخسائر</CardTitle>
              <div className={`p-2 rounded-lg ${totalProfitLoss >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-white" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-white" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
              </div>
              <p className="text-xs text-muted-foreground">
                التكلفة: {formatCurrency(totalCost)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة العائد</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <Percent className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${returnPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">العائد على الاستثمار</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاستثمارات النشطة</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activeInvestments}</div>
              <p className="text-xs text-muted-foreground">عدد الاستثمارات</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>الاستثمارات</CardTitle>
            <CardDescription>عرض وإدارة جميع استثماراتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن استثمار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="precious_metals">معادن ثمينة</SelectItem>
                  <SelectItem value="cryptocurrency">عملات رقمية</SelectItem>
                  <SelectItem value="certificate">شهادات وودائع</SelectItem>
                  <SelectItem value="stock">أسهم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Investments Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInvestments.map((investment) => {
                const metrics = calculateInvestmentMetrics(investment)
                const priceChangeObj = investment.type !== 'certificate' ? getPriceChange(investment.id) : { direction: 'neutral', value: 0, percentage: 0 }
                const priceChange = priceChangeObj.value !== 0 ? {
                  direction: priceChangeObj.value > 0 ? 'up' : priceChangeObj.value < 0 ? 'down' : 'neutral',
                  value: priceChangeObj.value,
                  percentage: priceChangeObj.percentage
                } : null

                return (
                  <Card key={investment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{investment.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getTypeIcon(investment.type ?? 'stock')}
                              <span className="mr-1">{getTypeLabel(investment.type ?? 'stock')}</span>
                            </Badge>

                            {/* Price Change Indicator */}
                            {priceChange && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  priceChange.direction === 'up'
                                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                    : priceChange.direction === 'down'
                                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                {priceChange.direction === 'up' && <TrendingUp className="h-3 w-3 ml-1" />}
                                {priceChange.direction === 'down' && <TrendingDown className="h-3 w-3 ml-1" />}
                                {priceChange.direction === 'neutral' && <ArrowRight className="h-3 w-3 ml-1" />}
                                <span>
                                  {priceChange.direction === 'up' ? '+' : priceChange.direction === 'down' ? '' : ''}
                                  {priceChange.percentage.toFixed(2)}%
                                </span>
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا الاستثمار؟')) {
                                deleteInvestment(investment.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Investment Details */}
                      {investment.type === 'precious_metals' && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">النوع:</span>
                            <span className="font-medium">
                              {(investment.metalType ?? 'gold') === 'gold' ? 'ذهب' :
                               (investment.metalType ?? 'gold') === 'silver' ? 'فضة' :
                               (investment.metalType ?? 'gold') === 'platinum' ? 'بلاتين' : 'بلاديوم'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">الكمية:</span>
                            <span className="font-medium">
                              {investment.quantity ?? 0} {(investment.unit ?? 'gram') === 'gram' ? 'جرام' : 'أونصة'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">سعر الشراء:</span>
                            <span className="font-medium">{formatCurrency(investment.purchasePrice ?? 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">السعر الحالي:</span>
                            <span className="font-medium">{formatCurrency(investment.currentPrice ?? 0)}</span>
                          </div>
                        </div>
                      )}

                      {investment.type === 'cryptocurrency' && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">الرمز:</span>
                            <span className="font-medium">{investment.cryptoSymbol ?? 'BTC'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">الكمية:</span>
                            <span className="font-medium">{investment.quantity ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">سعر الشراء:</span>
                            <span className="font-medium">{formatCurrency(investment.purchasePrice ?? 0, 'USD')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">السعر الحالي:</span>
                            <span className="font-medium">{formatCurrency(investment.currentPrice ?? 0, 'USD')}</span>
                          </div>
                        </div>
                      )}

                      {investment.type === 'certificate' && (() => {
                        const certDetails = calculateCertificateDetails(investment)
                        return (
                          <div className="space-y-2 text-sm">
                            {/* تنبيه الاستحقاق */}
                            {certDetails.isMatured && (
                              <div className="bg-orange-100 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-700 rounded-lg p-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-orange-700 dark:text-orange-400 font-medium text-xs">
                                  الشهادة مستحقة! اختر التجديد أو السحب
                                </span>
                              </div>
                            )}
                            {certDetails.isNearMaturity && !certDetails.isMatured && (
                              <div className="bg-yellow-100 dark:bg-yellow-950/50 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-yellow-600" />
                                <span className="text-yellow-700 dark:text-yellow-400 font-medium text-xs">
                                  متبقي {certDetails.daysRemaining} يوم للاستحقاق
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">البنك:</span>
                              <span className="font-medium">{investment.bank ?? 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">المبلغ الأساسي:</span>
                              <span className="font-medium">{formatCurrency(certDetails.principal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">معدل الفائدة:</span>
                              <span className="font-medium">{certDetails.interestRate}%</span>
                            </div>

                            {/* العائد الشهري */}
                            <div className="flex justify-between bg-green-50 dark:bg-green-950/30 p-2 rounded">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                العائد الشهري:
                              </span>
                              <span className="font-bold text-green-600">{formatCurrency(certDetails.monthlyReturn)}</span>
                            </div>

                            {/* الأرباح حتى الآن */}
                            <div className="flex justify-between bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-blue-600" />
                                الأرباح حتى الآن:
                              </span>
                              <span className="font-bold text-blue-600">{formatCurrency(certDetails.profitUntilNow)}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                              <span className={`font-medium ${certDetails.isMatured ? 'text-orange-600' : ''}`}>
                                {certDetails.maturityDate.toLocaleDateString('ar-EG')}
                              </span>
                            </div>

                            {/* أزرار التجديد والسحب والتعديل */}
                            <div className="pt-2 grid grid-cols-3 gap-2">
                              {/* زر التجديد - يظهر عند الاستحقاق أو قربه */}
                              {(certDetails.isMatured || certDetails.isNearMaturity) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                                  onClick={() => {
                                    setSelectedInvestment(investment)
                                    setMaturityDialogAction('renew')
                                    setShowMaturityDialog(true)
                                  }}
                                >
                                  <RefreshCw className="h-3 w-3 ml-1" />
                                  تجديد
                                </Button>
                              )}

                              {/* زر السحب - متواجد دائماً */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                onClick={() => {
                                  setSelectedInvestment(investment)
                                  setMaturityDialogAction('withdraw')
                                  setShowMaturityDialog(true)
                                }}
                              >
                                <Wallet className="h-3 w-3 ml-1" />
                                سحب
                              </Button>

                              {/* زر التعديل - متواجد دائماً */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                onClick={() => {
                                  setSelectedInvestment(investment)
                                  setShowEditCertificateDialog(true)
                                }}
                              >
                                <Edit className="h-3 w-3 ml-1" />
                                تعديل
                              </Button>
                            </div>
                          </div>
                        )
                      })()}

                      {investment.type === 'stock' && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">الرمز:</span>
                            <span className="font-medium">{investment.tickerSymbol ?? 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">السوق:</span>
                            <span className="font-medium">{investment.market ?? 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">عدد الأسهم:</span>
                            <span className="font-medium">{investment.shares ?? 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">سعر الشراء:</span>
                            <span className="font-medium">{formatCurrency(investment.purchasePrice ?? 0, 'USD')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">السعر الحالي:</span>
                            <span className="font-medium">{formatCurrency(investment.currentPrice ?? 0, 'USD')}</span>
                          </div>
                        </div>
                      )}

                      {/* Profit/Loss Summary */}
                      <div className="pt-3 border-t space-y-2">
                        {/* سعر الصرف للعملات الأجنبية */}
                        {metrics.originalCurrency === 'USD' && (
                          <div className="flex justify-between text-xs text-muted-foreground bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <span>سعر الصرف:</span>
                            <span>
                              الشراء: {metrics.purchaseExchangeRate.toFixed(2)} | الحالي: {metrics.currentExchangeRate.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">القيمة الحالية:</span>
                          <div className="text-left">
                            <div className="font-bold">{formatCurrency(metrics.currentValue, 'EGP')}</div>
                            {metrics.originalCurrency === 'USD' && (
                              <div className="text-xs text-muted-foreground">
                                ({formatCurrency(metrics.currentValueInOriginalCurrency, 'USD')})
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">التكلفة:</span>
                          <div className="text-left">
                            <div className="font-medium">{formatCurrency(metrics.cost, 'EGP')}</div>
                            {metrics.originalCurrency === 'USD' && (
                              <div className="text-xs text-muted-foreground">
                                ({formatCurrency(metrics.costInOriginalCurrency, 'USD')})
                              </div>
                            )}
                          </div>
                        </div>
                        {/* عرض الرسوم إذا كانت موجودة */}
                        {metrics.fees > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">الرسوم:</span>
                            <div className="text-left">
                              <div className="font-medium text-orange-600">{formatCurrency(metrics.fees, 'EGP')}</div>
                              {metrics.originalCurrency === 'USD' && (
                                <div className="text-xs text-muted-foreground">
                                  ({formatCurrency(metrics.feesInOriginalCurrency, 'USD')})
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">الربح/الخسارة:</span>
                          <div className="text-left">
                            <div className={`font-bold ${metrics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {metrics.profitLoss >= 0 ? '+' : ''}{formatCurrency(metrics.profitLoss, 'EGP')}
                            </div>
                            <div className={`text-xs ${metrics.returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({metrics.returnPct >= 0 ? '+' : ''}{metrics.returnPct.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {investment.type !== 'certificate' && (
                        <div className="pt-3 border-t grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedInvestment(investment)
                              setShowUpdatePriceDialog(true)
                            }}
                          >
                            <RefreshCw className="h-3 w-3 ml-1" />
                            تحديث السعر
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedInvestment(investment)
                              setShowAddQuantityDialog(true)
                            }}
                          >
                            <Plus className="h-3 w-3 ml-1" />
                            شراء المزيد
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => {
                              setSelectedInvestment(investment)
                              setShowSellDialog(true)
                            }}
                          >
                            <Minus className="h-3 w-3 ml-1" />
                            بيع
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {filteredInvestments.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  لا توجد استثمارات
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddInvestmentDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
        <UpdatePriceDialog
          open={showUpdatePriceDialog}
          onOpenChange={setShowUpdatePriceDialog}
          investment={selectedInvestment}
        />
        <AddQuantityDialog
          open={showAddQuantityDialog}
          onOpenChange={setShowAddQuantityDialog}
          investment={selectedInvestment}
        />
        <SellInvestmentDialog
          open={showSellDialog}
          onOpenChange={setShowSellDialog}
          investment={selectedInvestment}
        />
        <CertificateMaturityDialog
          open={showMaturityDialog}
          onOpenChange={setShowMaturityDialog}
          investment={selectedInvestment}
          defaultAction={maturityDialogAction}
        />
        <EditCertificateDialog
          open={showEditCertificateDialog}
          onOpenChange={setShowEditCertificateDialog}
          investment={selectedInvestment}
        />
      </div>
      )
}

