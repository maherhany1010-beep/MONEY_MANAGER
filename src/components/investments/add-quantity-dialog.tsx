'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInvestments, Investment } from '@/contexts/investments-context'
import { X, Plus, AlertCircle, ShoppingCart } from 'lucide-react'

interface AddQuantityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment: Investment | null
}

export function AddQuantityDialog({ open, onOpenChange, investment }: AddQuantityDialogProps) {
  const { addQuantity } = useInvestments()
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('الرجاء إدخال كمية صحيحة')
      return
    }

    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      setError('الرجاء إدخال سعر شراء صحيح')
      return
    }

    addQuantity(investment.id, parseFloat(quantity), parseFloat(purchasePrice), 0)
    setSuccess(true)
    
    setTimeout(() => {
      onOpenChange(false)
      setSuccess(false)
      setError('')
      setQuantity('')
      setPurchasePrice('')
    }, 1500)
  }

  // Calculate new average price
  let currentQuantity = 0
  let currentAvgPrice = 0

  if (investment.type === 'precious_metals') {
    currentQuantity = investment.quantity ?? 0
    currentAvgPrice = investment.purchasePrice ?? 0
  } else if (investment.type === 'cryptocurrency') {
    currentQuantity = investment.quantity ?? 0
    currentAvgPrice = investment.purchasePrice ?? 0
  } else if (investment.type === 'stock') {
    currentQuantity = investment.shares ?? 0
    currentAvgPrice = investment.purchasePrice ?? 0
  }

  const newQuantity = quantity ? parseFloat(quantity) : 0
  const newPrice = purchasePrice ? parseFloat(purchasePrice) : 0
  const oldCost = currentQuantity * currentAvgPrice
  const newCost = newQuantity * newPrice
  const totalQuantity = currentQuantity + newQuantity
  const newAvgPrice = totalQuantity > 0 ? (oldCost + newCost) / totalQuantity : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-green-100 dark:border-green-900/30"
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
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
                شراء كمية إضافية
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
              <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">تمت إضافة الكمية بنجاح!</p>
            </div>
          )}

          {/* Current Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-900/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">المعلومات الحالية</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الكمية الحالية:</span>
                <span className="font-medium">{currentQuantity} {quantityLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">متوسط سعر الشراء:</span>
                <span className="font-medium">{currentAvgPrice.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التكلفة الإجمالية:</span>
                <span className="font-medium">{oldCost.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>

          {/* New Purchase */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-2 border-green-200 dark:border-green-900/50">
            <h3 className="font-semibold text-green-900 dark:text-green-100">الشراء الجديد</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية الإضافية *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step={investment.type === 'cryptocurrency' ? '0.00000001' : investment.type === 'stock' ? '1' : '0.01'}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">سعر الشراء (للوحدة) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {newQuantity > 0 && newPrice > 0 && (
              <div className="pt-3 border-t border-green-200 dark:border-green-800">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">تكلفة الشراء الجديد:</span>
                  <span className="font-bold">{newCost.toFixed(2)} {currency}</span>
                </div>
              </div>
            )}
          </div>

          {/* New Average */}
          {newQuantity > 0 && newPrice > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-900/50">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">بعد الشراء</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الكمية الإجمالية:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {totalQuantity.toFixed(investment.type === 'cryptocurrency' ? 8 : 2)} {quantityLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">متوسط السعر الجديد:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {newAvgPrice.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التكلفة الإجمالية:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {(oldCost + newCost).toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={success}
            >
              <Plus className="h-5 w-5 ml-2" />
              إضافة الكمية
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

