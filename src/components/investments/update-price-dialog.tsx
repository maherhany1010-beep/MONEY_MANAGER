'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInvestments, Investment } from '@/contexts/investments-context'
import { X, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'

interface UpdatePriceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
}

export function UpdatePriceDialog({ open, onOpenChange, investment }: UpdatePriceDialogProps) {
  const { updatePrice } = useInvestments()
  const [newPrice, setNewPrice] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (investment && investment.type !== 'certificate') {
      setNewPrice((investment.currentPrice ?? 0).toString())
    }
  }, [investment])

  if (!investment || investment.type === 'certificate') {
    return null
  }

  const currentPrice = investment.currentPrice ?? 0
  const currency = investment.type === 'cryptocurrency' || investment.type === 'stock' ? 'USD' : 'EGP'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!newPrice || parseFloat(newPrice) <= 0) {
      setError('الرجاء إدخال سعر صحيح')
      return
    }

    const price = parseFloat(newPrice)

    if (price === currentPrice) {
      setError('السعر الجديد مطابق للسعر الحالي')
      return
    }

    try {
      await updatePrice(investment.id, price)
      setSuccess(true)

      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setError('')
      }, 1500)
    } catch (err) {
      console.error('Error updating price:', err)
      setError('فشل في تحديث السعر')
    }
  }

  const priceChange = newPrice ? parseFloat(newPrice) - currentPrice : 0
  const priceChangePercentage = currentPrice > 0 ? (priceChange / currentPrice) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">إغلاق</span>
        </button>

        <DialogHeader className="border-b-2 border-blue-100 dark:border-blue-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                تحديث السعر
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
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">تم تحديث السعر بنجاح!</p>
            </div>
          )}

          {/* Current Price */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">السعر الحالي</p>
              <p className="text-2xl font-bold">
                {(currentPrice ?? 0).toFixed(2)} {currency}
              </p>
            </div>
          </div>

          {/* New Price */}
          <div className="space-y-2">
            <Label htmlFor="newPrice">السعر الجديد *</Label>
            <Input
              id="newPrice"
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Price Change Preview */}
          {newPrice && parseFloat(newPrice) !== currentPrice && (
            <div className={`p-4 rounded-lg border-2 ${
              priceChange >= 0 
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50' 
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {priceChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="text-sm font-medium">التغير في السعر</span>
                </div>
                <div className="text-left">
                  <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} {currency}
                  </p>
                  <p className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({priceChange >= 0 ? '+' : ''}{priceChangePercentage.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={success}
            >
              <RefreshCw className="h-5 w-5 ml-2" />
              تحديث السعر
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

