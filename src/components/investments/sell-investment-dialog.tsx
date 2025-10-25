'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInvestments, Investment } from '@/contexts/investments-context'
import { X, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface SellInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
}

export function SellInvestmentDialog({ open, onOpenChange, investment }: SellInvestmentDialogProps) {
  const { sellInvestment } = useInvestments()
  const [quantity, setQuantity] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [commission, setCommission] = useState('')
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!investment || investment.type === 'certificate') {
    return null
  }

  const currency = investment.type === 'cryptocurrency' || investment.type === 'stock' ? 'USD' : 'EGP'
  const quantityLabel = 
    investment.type === 'precious_metals' ? (investment.unit === 'gram' ? 'جرام' : 'أونصة') :
    investment.type === 'cryptocurrency' ? 'عملة' :
    'سهم'

  let currentQuantity = 0
  let avgPurchasePrice = 0

  if (investment.type === 'precious_metals') {
    currentQuantity = investment.quantity
    avgPurchasePrice = investment.purchasePrice
  } else if (investment.type === 'cryptocurrency') {
    currentQuantity = investment.quantity
    avgPurchasePrice = investment.purchasePrice
  } else if (investment.type === 'stock') {
    currentQuantity = investment.shares
    avgPurchasePrice = investment.purchasePrice
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('الرجاء إدخال كمية صحيحة')
      return
    }

    if (parseFloat(quantity) > currentQuantity) {
      setError('الكمية المطلوب بيعها أكبر من الكمية المتاحة')
      return
    }

    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      setError('الرجاء إدخال سعر بيع صحيح')
      return
    }

    const commissionValue = commission ? parseFloat(commission) : 0

    sellInvestment(
      investment.id, 
      parseFloat(quantity), 
      parseFloat(sellPrice), 
      commissionValue, 
      commissionType
    )
    
    setSuccess(true)
    
    setTimeout(() => {
      onOpenChange(false)
      setSuccess(false)
      setError('')
      setQuantity('')
      setSellPrice('')
      setCommission('')
    }, 2000)
  }

  // Calculate sale details
  const sellQuantity = quantity ? parseFloat(quantity) : 0
  const sellPriceValue = sellPrice ? parseFloat(sellPrice) : 0
  const commissionValue = commission ? parseFloat(commission) : 0

  const grossProceeds = sellQuantity * sellPriceValue
  const commissionAmount = commissionType === 'percentage' 
    ? (grossProceeds * commissionValue) / 100 
    : commissionValue
  const netProceeds = grossProceeds - commissionAmount
  const cost = sellQuantity * avgPurchasePrice
  const profitLoss = netProceeds - cost
  const profitLossPercentage = cost > 0 ? (profitLoss / cost) * 100 : 0

  const remainingQuantity = currentQuantity - sellQuantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-orange-100 dark:border-orange-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">إغلاق</span>
        </button>

        <DialogHeader className="border-b-2 border-orange-100 dark:border-orange-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                بيع استثمار
              </DialogTitle>
              <DialogDescription>
                {investment.name}
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

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">تم البيع بنجاح!</p>
            </div>
          )}

          {/* Current Holdings */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-900/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">الكمية المتاحة</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الكمية الحالية:</span>
                <span className="font-medium">{currentQuantity} {quantityLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">متوسط سعر الشراء:</span>
                <span className="font-medium">{avgPurchasePrice.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>

          {/* Sale Details */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-2 border-orange-200 dark:border-orange-900/50">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">تفاصيل البيع</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية المراد بيعها *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step={investment.type === 'cryptocurrency' ? '0.00000001' : investment.type === 'stock' ? '1' : '0.01'}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  max={currentQuantity}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  الحد الأقصى: {currentQuantity} {quantityLabel}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellPrice">سعر البيع (للوحدة) *</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commission">العمولة/تكلفة البيع</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>نوع العمولة</Label>
                <Select value={commissionType} onValueChange={(value: 'percentage' | 'fixed') => setCommissionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت ({currency})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sale Summary */}
          {sellQuantity > 0 && sellPriceValue > 0 && (
            <>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-900/50">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">ملخص البيع</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">قيمة البيع الإجمالية:</span>
                    <span className="font-medium">{grossProceeds.toFixed(2)} {currency}</span>
                  </div>
                  {commissionAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>العمولة:</span>
                      <span className="font-medium">-{commissionAmount.toFixed(2)} {currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-purple-200 dark:border-purple-800">
                    <span>صافي البيع:</span>
                    <span>{netProceeds.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>التكلفة الأصلية:</span>
                    <span>{cost.toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Profit/Loss */}
              <div className={`p-4 rounded-lg border-2 ${
                profitLoss >= 0 
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50' 
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {profitLoss >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                    <span className="font-semibold">
                      {profitLoss >= 0 ? 'الربح المتوقع' : 'الخسارة المتوقعة'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className={`text-xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} {currency}
                    </p>
                    <p className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Remaining */}
              {remainingQuantity > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الكمية المتبقية بعد البيع:</span>
                    <span className="font-bold">{remainingQuantity.toFixed(investment.type === 'cryptocurrency' ? 8 : 2)} {quantityLabel}</span>
                  </div>
                </div>
              )}

              {remainingQuantity === 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-2 border-yellow-200 dark:border-yellow-900/50">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    ⚠️ سيتم حذف هذا الاستثمار بالكامل بعد البيع
                  </p>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={success}
            >
              <DollarSign className="h-5 w-5 ml-2" />
              تأكيد البيع
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

