'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInvestments, InvestmentType } from '@/contexts/investments-context'
import { X, TrendingUp, AlertCircle } from 'lucide-react'

interface AddInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddInvestmentDialog({ open, onOpenChange }: AddInvestmentDialogProps) {
  const { addInvestment } = useInvestments()
  const [error, setError] = useState('')
  const [investmentType, setInvestmentType] = useState<InvestmentType>('precious_metals')

  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    currency: 'EGP' as 'EGP' | 'USD' | 'EUR',
    exchangeRateAtPurchase: '',
    currentExchangeRate: '',

    // Precious Metals
    metalType: 'gold',
    quantity: '',
    unit: 'gram',
    purchasePrice: '',
    currentPrice: '',
    storageLocation: '',
    purchaseFee: '', // رسوم الشراء للمعادن

    // Cryptocurrency
    cryptoName: '',
    cryptoSymbol: '',
    wallet: '',
    cryptoPurchaseFee: '', // رسوم الشراء للعملات الرقمية

    // Certificate
    certificateType: 'investment',
    bank: '',
    amount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    interestPeriod: 'annual',
    certificateNumber: '',

    // Stock
    companyName: '',
    tickerSymbol: '',
    market: '',
    shares: '',
    commission: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Common validation
    if (!formData.name.trim()) {
      setError('الرجاء إدخال اسم الاستثمار')
      setIsSubmitting(false)
      return
    }

    try {
      let result = null

      switch (investmentType) {
        case 'precious_metals':
          if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            setError('الرجاء إدخال كمية صحيحة')
            setIsSubmitting(false)
            setIsSubmitting(false)
            return
          }
          if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
            setError('الرجاء إدخال سعر شراء صحيح')
            setIsSubmitting(false)
            return
          }
          if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
            setError('الرجاء إدخال السعر الحالي')
            setIsSubmitting(false)
            return
          }

          // Get exchange rate from localStorage
          const savedExchangeRate = localStorage.getItem('currentExchangeRate')
          const exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : undefined

          result = await addInvestment({
            type: 'precious_metals',
            name: formData.name.trim(),
            metalType: formData.metalType as any,
            quantity: parseFloat(formData.quantity),
            unit: formData.unit as any,
            purchasePrice: parseFloat(formData.purchasePrice),
            currentPrice: parseFloat(formData.currentPrice),
            purchaseDate: formData.purchaseDate,
            storageLocation: formData.storageLocation.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            purchaseFee: formData.purchaseFee ? parseFloat(formData.purchaseFee) : undefined,
            currency: formData.currency,
            exchangeRateAtPurchase: formData.currency === 'USD' ? exchangeRate : undefined,
            currentExchangeRate: formData.currency === 'USD' ? exchangeRate : undefined,
          } as any)
          break

        case 'cryptocurrency':
          if (!formData.cryptoSymbol.trim()) {
            setError('الرجاء إدخال رمز العملة')
            setIsSubmitting(false)
            return
          }
          if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            setError('الرجاء إدخال كمية صحيحة')
            setIsSubmitting(false)
            return
          }
          if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
            setError('الرجاء إدخال سعر شراء صحيح')
            setIsSubmitting(false)
            return
          }
          if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
            setError('الرجاء إدخال السعر الحالي')
            setIsSubmitting(false)
            return
          }
          
          // Get exchange rate from localStorage
          const cryptoExchangeRate = localStorage.getItem('currentExchangeRate')
          const cryptoRate = cryptoExchangeRate ? parseFloat(cryptoExchangeRate) : undefined

          result = await addInvestment({
            type: 'cryptocurrency',
            name: formData.name.trim(),
            cryptoName: formData.cryptoName.trim() || formData.name.trim(),
            cryptoSymbol: formData.cryptoSymbol.trim().toUpperCase(),
            quantity: parseFloat(formData.quantity),
            purchasePrice: parseFloat(formData.purchasePrice),
            currentPrice: parseFloat(formData.currentPrice),
            purchaseDate: formData.purchaseDate,
            wallet: formData.wallet.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            cryptoPurchaseFee: formData.cryptoPurchaseFee ? parseFloat(formData.cryptoPurchaseFee) : undefined,
            currency: 'USD', // العملات الرقمية دائماً بالدولار
            exchangeRateAtPurchase: cryptoRate,
            currentExchangeRate: cryptoRate,
          } as any)
          break

        case 'certificate':
          if (!formData.bank.trim()) {
            setError('الرجاء إدخال اسم البنك')
            setIsSubmitting(false)
            return
          }
          if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('الرجاء إدخال مبلغ صحيح')
            setIsSubmitting(false)
            return
          }
          if (!formData.interestRate || parseFloat(formData.interestRate) <= 0) {
            setError('الرجاء إدخال معدل فائدة صحيح')
            setIsSubmitting(false)
            return
          }
          if (!formData.maturityDate) {
            setError('الرجاء إدخال تاريخ الاستحقاق')
            setIsSubmitting(false)
            return
          }
          
          result = await addInvestment({
            type: 'certificate',
            name: formData.name.trim(),
            certificateType: formData.certificateType as any,
            bank: formData.bank.trim(),
            amount: parseFloat(formData.amount),
            interestRate: parseFloat(formData.interestRate),
            startDate: formData.startDate,
            maturityDate: formData.maturityDate,
            interestPeriod: formData.interestPeriod as any,
            purchaseDate: formData.startDate,
            certificateNumber: formData.certificateNumber.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            currency: 'EGP', // الشهادات دائماً بالجنيه
          } as any)
          break

        case 'stock':
          if (!formData.tickerSymbol.trim()) {
            setError('الرجاء إدخال رمز السهم')
            setIsSubmitting(false)
            return
          }
          if (!formData.market.trim()) {
            setError('الرجاء إدخال اسم السوق/البورصة')
            setIsSubmitting(false)
            return
          }
          if (!formData.shares || parseFloat(formData.shares) <= 0) {
            setError('الرجاء إدخال عدد أسهم صحيح')
            setIsSubmitting(false)
            return
          }
          if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
            setError('الرجاء إدخال سعر شراء صحيح')
            setIsSubmitting(false)
            return
          }
          if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
            setError('الرجاء إدخال السعر الحالي')
            setIsSubmitting(false)
            return
          }
          
          // Get exchange rate from localStorage
          const stockExchangeRate = localStorage.getItem('currentExchangeRate')
          const stockRate = stockExchangeRate ? parseFloat(stockExchangeRate) : undefined

          result = await addInvestment({
            type: 'stock',
            name: formData.name.trim(),
            companyName: formData.companyName.trim() || formData.name.trim(),
            tickerSymbol: formData.tickerSymbol.trim().toUpperCase(),
            market: formData.market.trim(),
            shares: parseFloat(formData.shares),
            purchasePrice: parseFloat(formData.purchasePrice),
            currentPrice: parseFloat(formData.currentPrice),
            purchaseDate: formData.purchaseDate,
            commission: formData.commission ? parseFloat(formData.commission) : undefined,
            notes: formData.notes.trim() || undefined,
            currency: 'USD', // الأسهم دائماً بالدولار
            exchangeRateAtPurchase: stockRate,
            currentExchangeRate: stockRate,
          } as any)
          break
      }

      // التحقق من نجاح الإضافة
      if (!result) {
        setError('فشل في إضافة الاستثمار. تحقق من الاتصال بقاعدة البيانات.')
        setIsSubmitting(false)
        return
      }

      // Reset form
      setFormData({
        name: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
        currency: 'EGP' as 'EGP' | 'USD' | 'EUR',
        exchangeRateAtPurchase: '',
        currentExchangeRate: '',
        metalType: 'gold',
        quantity: '',
        unit: 'gram',
        purchasePrice: '',
        currentPrice: '',
        storageLocation: '',
        purchaseFee: '',
        cryptoName: '',
        cryptoSymbol: '',
        wallet: '',
        cryptoPurchaseFee: '',
        certificateType: 'investment',
        bank: '',
        amount: '',
        interestRate: '',
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
        interestPeriod: 'annual',
        certificateNumber: '',
        companyName: '',
        tickerSymbol: '',
        market: '',
        shares: '',
        commission: '',
      })
      setIsSubmitting(false)
      onOpenChange(false)
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError('حدث خطأ أثناء إضافة الاستثمار')
      setIsSubmitting(false)
    }
  }

  // Calculate profit/loss including purchase fees and exchange rates
  const calculateProfitLoss = () => {
    if (!formData.quantity || !formData.purchasePrice || !formData.currentPrice) return 0

    const quantity = parseFloat(formData.quantity)
    const purchasePrice = parseFloat(formData.purchasePrice)
    const currentPrice = parseFloat(formData.currentPrice)

    // Get purchase fee based on investment type
    let purchaseFee = 0
    if (investmentType === 'precious_metals' && formData.purchaseFee) {
      purchaseFee = parseFloat(formData.purchaseFee)
    } else if (investmentType === 'cryptocurrency' && formData.cryptoPurchaseFee) {
      purchaseFee = parseFloat(formData.cryptoPurchaseFee)
    } else if (investmentType === 'stock' && formData.commission) {
      purchaseFee = parseFloat(formData.commission)
    }

    // Get exchange rate from localStorage (for USD investments)
    const savedExchangeRate = localStorage.getItem('currentExchangeRate')
    const exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : 1

    // Determine if we need to convert to EGP
    let needsConversion = false
    if (investmentType === 'cryptocurrency' || investmentType === 'stock') {
      needsConversion = true // Always USD
    } else if (investmentType === 'precious_metals' && formData.currency === 'USD') {
      needsConversion = true
    }

    // Calculate values
    const currentValueInOriginalCurrency = quantity * currentPrice
    const totalCostInOriginalCurrency = (quantity * purchasePrice) + purchaseFee

    // Convert to EGP if needed
    if (needsConversion) {
      const currentValueInEGP = currentValueInOriginalCurrency * exchangeRate
      const totalCostInEGP = totalCostInOriginalCurrency * exchangeRate
      return currentValueInEGP - totalCostInEGP
    } else {
      // Already in EGP
      return currentValueInOriginalCurrency - totalCostInOriginalCurrency
    }
  }

  const profitLoss = calculateProfitLoss()

  const returnPercentage = formData.quantity && formData.purchasePrice && formData.currentPrice
    ? (() => {
        const quantity = parseFloat(formData.quantity)
        const purchasePrice = parseFloat(formData.purchasePrice)

        let purchaseFee = 0
        if (investmentType === 'precious_metals' && formData.purchaseFee) {
          purchaseFee = parseFloat(formData.purchaseFee)
        } else if (investmentType === 'cryptocurrency' && formData.cryptoPurchaseFee) {
          purchaseFee = parseFloat(formData.cryptoPurchaseFee)
        } else if (investmentType === 'stock' && formData.commission) {
          purchaseFee = parseFloat(formData.commission)
        }

        const totalCostInOriginalCurrency = (quantity * purchasePrice) + purchaseFee

        // Get exchange rate from localStorage
        const savedExchangeRate = localStorage.getItem('currentExchangeRate')
        const exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : 1

        // Determine if we need to convert
        let needsConversion = false
        if (investmentType === 'cryptocurrency' || investmentType === 'stock') {
          needsConversion = true
        } else if (investmentType === 'precious_metals' && formData.currency === 'USD') {
          needsConversion = true
        }

        const totalCost = needsConversion ? totalCostInOriginalCurrency * exchangeRate : totalCostInOriginalCurrency

        return totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : '0'
      })()
    : '0'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-green-100 dark:border-green-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">إغلاق</span>
        </button>

        <DialogHeader className="border-b-2 border-green-100 dark:border-green-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
                إضافة استثمار جديد
              </DialogTitle>
              <DialogDescription>
                أدخل معلومات الاستثمار الجديد
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* نوع الاستثمار */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-900/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">نوع الاستثمار</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="investmentType">اختر نوع الاستثمار *</Label>
                <Select value={investmentType} onValueChange={(value: InvestmentType) => setInvestmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="precious_metals">المعادن الثمينة</SelectItem>
                    <SelectItem value="cryptocurrency">العملات الرقمية</SelectItem>
                    <SelectItem value="certificate">الشهادات والودائع</SelectItem>
                    <SelectItem value="stock">الأسهم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">اسم الاستثمار *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: ذهب عيار 21"
                  required
                />
              </div>
            </div>

            {/* حقل العملة للمعادن الثمينة فقط */}
            {investmentType === 'precious_metals' && (
              <div className="mt-4 space-y-2">
                <Label>العملة</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: 'EGP' | 'USD') => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.currency === 'USD' && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    💡 سيتم استخدام سعر الصرف العام من الصفحة الرئيسية
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Precious Metals Fields */}
          {investmentType === 'precious_metals' && (
            <>
              <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-2 border-yellow-200 dark:border-yellow-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">معلومات المعدن</h3>
                  {formData.currency && (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      💰 جميع الأسعار بـ {formData.currency === 'USD' ? 'الدولار (USD)' : 'الجنيه (EGP)'}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>نوع المعدن *</Label>
                    <Select value={formData.metalType} onValueChange={(value) => setFormData({ ...formData, metalType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">ذهب</SelectItem>
                        <SelectItem value="silver">فضة</SelectItem>
                        <SelectItem value="platinum">بلاتين</SelectItem>
                        <SelectItem value="palladium">بلاديوم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>الكمية *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الوحدة *</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gram">جرام</SelectItem>
                        <SelectItem value="ounce">أونصة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>سعر الشراء (للوحدة) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder={formData.currency === 'USD' ? '50.00' : '2500.00'}
                    />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      {formData.currency === 'USD' ? '💵 أدخل السعر بالدولار' : '💰 أدخل السعر بالجنيه'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>السعر الحالي (للوحدة) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      placeholder={formData.currency === 'USD' ? '55.00' : '2700.00'}
                    />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      {formData.currency === 'USD' ? '💵 أدخل السعر بالدولار' : '💰 أدخل السعر بالجنيه'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>رسوم الشراء (اختياري)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchaseFee}
                      onChange={(e) => setFormData({ ...formData, purchaseFee: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      {formData.currency === 'USD' ? '💵 بالدولار' : '💰 بالجنيه'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>تاريخ الشراء *</Label>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>مكان التخزين (اختياري)</Label>
                    <Input
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                      placeholder="مثال: خزنة المنزل، البنك، إلخ"
                    />
                  </div>
                </div>
              </div>

              {/* Profit/Loss Display */}
              {formData.quantity && formData.purchasePrice && formData.currentPrice && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border-2 border-green-200 dark:border-green-900/50">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">التكلفة الإجمالية</p>
                      <p className="text-lg font-bold">
                        {((parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)) + (parseFloat(formData.purchaseFee) || 0)).toFixed(2)} EGP
                      </p>
                      {formData.purchaseFee && parseFloat(formData.purchaseFee) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          (شامل رسوم {parseFloat(formData.purchaseFee).toFixed(2)} EGP)
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">القيمة الحالية</p>
                      <p className="text-lg font-bold">
                        {(parseFloat(formData.quantity) * parseFloat(formData.currentPrice)).toFixed(2)} EGP
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الربح/الخسارة</p>
                      <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} EGP ({returnPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cryptocurrency Fields */}
          {investmentType === 'cryptocurrency' && (
            <>
              <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">معلومات العملة الرقمية</h3>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    💵 جميع الأسعار بالدولار (USD)
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>رمز العملة *</Label>
                    <Input
                      value={formData.cryptoSymbol}
                      onChange={(e) => setFormData({ ...formData, cryptoSymbol: e.target.value })}
                      placeholder="مثال: BTC, ETH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>اسم العملة (اختياري)</Label>
                    <Input
                      value={formData.cryptoName}
                      onChange={(e) => setFormData({ ...formData, cryptoName: e.target.value })}
                      placeholder="مثال: Bitcoin, Ethereum"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الكمية *</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0.00000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>رسوم الشراء (اختياري)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cryptoPurchaseFee}
                      onChange={(e) => setFormData({ ...formData, cryptoPurchaseFee: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      💵 بالدولار الأمريكي
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>سعر الشراء (للوحدة) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="مثال: 50000.00"
                    />
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      💵 أدخل السعر بالدولار الأمريكي
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>السعر الحالي (للوحدة) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      placeholder="مثال: 55000.00"
                    />
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      💵 أدخل السعر بالدولار الأمريكي
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>تاريخ الشراء *</Label>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المحفظة/المنصة (اختياري)</Label>
                    <Input
                      value={formData.wallet}
                      onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                      placeholder="مثال: Binance, Coinbase"
                    />
                  </div>
                </div>
              </div>

              {/* Profit/Loss Display */}
              {formData.quantity && formData.purchasePrice && formData.currentPrice && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border-2 border-green-200 dark:border-green-900/50">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">التكلفة الإجمالية</p>
                      <p className="text-lg font-bold">
                        {((parseFloat(formData.quantity) * parseFloat(formData.purchasePrice)) + (parseFloat(formData.cryptoPurchaseFee) || 0)).toFixed(2)} USD
                      </p>
                      {formData.cryptoPurchaseFee && parseFloat(formData.cryptoPurchaseFee) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          (شامل رسوم {parseFloat(formData.cryptoPurchaseFee).toFixed(2)} USD)
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">القيمة الحالية</p>
                      <p className="text-lg font-bold">
                        {(parseFloat(formData.quantity) * parseFloat(formData.currentPrice)).toFixed(2)} USD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الربح/الخسارة</p>
                      <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USD ({returnPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Certificate Fields */}
          {investmentType === 'certificate' && (
            <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-2 border-green-200 dark:border-green-900/50">
              <h3 className="font-semibold text-green-900 dark:text-green-100">معلومات الشهادة/الوديعة</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>نوع الشهادة/الوديعة *</Label>
                  <Select value={formData.certificateType} onValueChange={(value) => setFormData({ ...formData, certificateType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investment">شهادة استثمار</SelectItem>
                      <SelectItem value="fixed_deposit">وديعة ثابتة</SelectItem>
                      <SelectItem value="savings">شهادة ادخار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>البنك/الجهة المصدرة *</Label>
                  <Input
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    placeholder="مثال: البنك الأهلي المصري"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>المبلغ المستثمر *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>معدل الفائدة (%) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="14.00"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>تاريخ البداية *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الاستحقاق *</Label>
                  <Input
                    type="date"
                    value={formData.maturityDate}
                    onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>دورية الفائدة *</Label>
                  <Select value={formData.interestPeriod} onValueChange={(value) => setFormData({ ...formData, interestPeriod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">شهري</SelectItem>
                      <SelectItem value="quarterly">ربع سنوي</SelectItem>
                      <SelectItem value="semi_annual">نصف سنوي</SelectItem>
                      <SelectItem value="annual">سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>رقم الشهادة/الوديعة (اختياري)</Label>
                <Input
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  placeholder="رقم الشهادة"
                />
              </div>
            </div>
          )}

          {/* Stock Fields */}
          {investmentType === 'stock' && (
            <>
              <div className="space-y-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border-2 border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">معلومات السهم</h3>
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    💵 جميع الأسعار بالدولار (USD)
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>اسم الشركة (اختياري)</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="مثال: Apple Inc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>رمز السهم *</Label>
                    <Input
                      value={formData.tickerSymbol}
                      onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
                      placeholder="مثال: AAPL"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>السوق/البورصة *</Label>
                    <Input
                      value={formData.market}
                      onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                      placeholder="مثال: NYSE, NASDAQ, EGX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>عدد الأسهم *</Label>
                    <Input
                      type="number"
                      step="1"
                      value={formData.shares}
                      onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>سعر الشراء (للسهم) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="مثال: 150.00"
                    />
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      💵 أدخل السعر بالدولار الأمريكي
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>السعر الحالي (للسهم) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      placeholder="مثال: 175.00"
                    />
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      💵 أدخل السعر بالدولار الأمريكي
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>عمولة الشراء (اختياري)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      💵 بالدولار الأمريكي
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>تاريخ الشراء *</Label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Profit/Loss Display */}
              {formData.shares && formData.purchasePrice && formData.currentPrice && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border-2 border-green-200 dark:border-green-900/50">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">التكلفة الإجمالية</p>
                      <p className="text-lg font-bold">
                        {((parseFloat(formData.shares) * parseFloat(formData.purchasePrice)) + (parseFloat(formData.commission) || 0)).toFixed(2)} USD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">القيمة الحالية</p>
                      <p className="text-lg font-bold">
                        {(parseFloat(formData.shares) * parseFloat(formData.currentPrice)).toFixed(2)} USD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الربح/الخسارة</p>
                      <p className={`text-lg font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USD ({returnPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-2 border-orange-200 dark:border-orange-900/50">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">معلومات إضافية</h3>

            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              <TrendingUp className="h-5 w-5 ml-2" />
              إضافة الاستثمار
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

