'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
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
  ShoppingCart,
  Minus,
  ArrowRight
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

    // Get exchange rate from localStorage
    const savedExchangeRate = localStorage.getItem('currentExchangeRate')
    const exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : 1

    switch (investment.type) {
      case 'precious_metals':
        currentValueInOriginalCurrency = (investment.quantity ?? 0) * (investment.currentPrice ?? 0)
        costInOriginalCurrency = ((investment.quantity ?? 0) * (investment.purchasePrice ?? 0)) + (investment.purchaseFee ?? 0)
        break
      case 'cryptocurrency':
        currentValueInOriginalCurrency = (investment.quantity ?? 0) * (investment.currentPrice ?? 0)
        costInOriginalCurrency = ((investment.quantity ?? 0) * (investment.purchasePrice ?? 0)) + (investment.cryptoPurchaseFee ?? 0)
        originalCurrency = 'USD'
        break
      case 'certificate':
        currentValueInOriginalCurrency = investment.amount ?? 0
        costInOriginalCurrency = investment.amount ?? 0
        originalCurrency = 'EGP'
        break
      case 'stock':
        currentValueInOriginalCurrency = (investment.shares ?? 0) * (investment.currentPrice ?? 0)
        costInOriginalCurrency = ((investment.shares ?? 0) * (investment.purchasePrice ?? 0)) + (investment.commission ?? 0)
        originalCurrency = 'USD'
        break
    }

    // Convert to EGP if needed
    let currentValueInEGP = currentValueInOriginalCurrency
    let costInEGP = costInOriginalCurrency

    if (originalCurrency === 'USD') {
      currentValueInEGP = currentValueInOriginalCurrency * exchangeRate
      costInEGP = costInOriginalCurrency * exchangeRate
    }

    const profitLoss = currentValueInEGP - costInEGP
    const returnPct = costInEGP > 0 ? (profitLoss / costInEGP) * 100 : 0

    return {
      currentValue: currentValueInEGP,
      currentValueInOriginalCurrency,
      cost: costInEGP,
      costInOriginalCurrency,
      profitLoss,
      returnPct,
      currency: 'EGP',
      originalCurrency,
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
    <AppLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الاستثمارات</h1>
            <p className="text-muted-foreground">تتبع وإدارة محفظتك الاستثمارية</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-5 w-5 ml-2" />
            إضافة استثمار جديد
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي قيمة المحفظة</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">القيمة الحالية للمحفظة</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${totalProfitLoss >= 0 ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800' : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأرباح/الخسائر</CardTitle>
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
              </div>
              <p className="text-xs text-muted-foreground">
                التكلفة: {formatCurrency(totalCost)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة العائد</CardTitle>
              <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">العائد على الاستثمار</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاستثمارات النشطة</CardTitle>
              <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInvestments}</div>
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

                      {investment.type === 'certificate' && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">البنك:</span>
                            <span className="font-medium">{investment.bank ?? 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">المبلغ:</span>
                            <span className="font-medium">{formatCurrency(investment.amount ?? 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">معدل الفائدة:</span>
                            <span className="font-medium">{investment.interestRate ?? 0}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                            <span className="font-medium">
                              {new Date(investment.maturityDate ?? '').toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>
                      )}

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
      </div>
    </AppLayout>
  )
}

