'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProducts } from '@/contexts/products-context'
import { X, Package, DollarSign, AlertCircle } from 'lucide-react'

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { addProduct } = useProducts()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    description: '',
    imageUrl: '',
    unitsPerBox: '1',
    unitType: 'قطعة',
    totalStock: '0',
    minStockAlert: '10',
    purchasePrice: '',
    sellingPrice: '',
    wholesalePrice: '',
    supplier: '',
    lastRestockDate: '',
    expiryDate: '',
    storageLocation: '',
    notes: '',
  })

  const categories = [
    'إلكترونيات',
    'أغذية ومشروبات',
    'ملابس وأحذية',
    'أدوات منزلية',
    'مستحضرات تجميل',
    'أدوية ومستلزمات طبية',
    'قرطاسية ومكتبية',
    'ألعاب وترفيه',
    'رياضة ولياقة',
    'أخرى',
  ]

  const unitTypes = [
    'قطعة',
    'كيلو',
    'جرام',
    'لتر',
    'مللتر',
    'متر',
    'سنتيمتر',
    'علبة',
    'كرتونة',
    'زجاجة',
    'عبوة',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name.trim()) {
      setError('الرجاء إدخال اسم المنتج')
      return
    }
    if (!formData.category) {
      setError('الرجاء اختيار الفئة')
      return
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      setError('الرجاء إدخال سعر شراء صحيح')
      return
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      setError('الرجاء إدخال سعر بيع صحيح')
      return
    }
    if (parseFloat(formData.sellingPrice) <= parseFloat(formData.purchasePrice)) {
      setError('سعر البيع يجب أن يكون أكبر من سعر الشراء')
      return
    }

    // Add product
    addProduct({
      name: formData.name.trim(),
      barcode: formData.barcode.trim() || undefined,
      category: formData.category,
      description: formData.description.trim() || null,
      imageUrl: formData.imageUrl.trim() || undefined,
      unitsPerBox: parseInt(formData.unitsPerBox) || 1,
      unitType: formData.unitType,
      totalStock: parseInt(formData.totalStock) || 0,
      minStockAlert: parseInt(formData.minStockAlert) || 10,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
      supplier: formData.supplier.trim() || undefined,
      lastRestockDate: formData.lastRestockDate || undefined,
      expiryDate: formData.expiryDate || undefined,
      storageLocation: formData.storageLocation.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    } as any)

    // Reset form
    setFormData({
      name: '',
      barcode: '',
      category: '',
      description: '',
      imageUrl: '',
      unitsPerBox: '1',
      unitType: 'قطعة',
      totalStock: '0',
      minStockAlert: '10',
      purchasePrice: '',
      sellingPrice: '',
      wholesalePrice: '',
      supplier: '',
      lastRestockDate: '',
      expiryDate: '',
      storageLocation: '',
      notes: '',
    })
    onOpenChange(false)
  }

  const profitMargin = formData.purchasePrice && formData.sellingPrice
    ? ((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice) * 100).toFixed(2)
    : '0'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-100 dark:border-blue-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">إغلاق</span>
        </button>

        <DialogHeader className="border-b-2 border-blue-100 dark:border-blue-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                إضافة منتج جديد
              </DialogTitle>
              <DialogDescription>
                أدخل معلومات المنتج الجديد
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

          {/* المعلومات الأساسية */}
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-900/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Package className="h-5 w-5" />
              المعلومات الأساسية
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: هاتف سامسونج جالاكسي"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">الباركود</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="مثال: 1234567890123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">المورد</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="مثال: شركة التوريدات المتحدة"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمنتج..."
                rows={2}
              />
            </div>
          </div>

          {/* معلومات التعبئة والمخزون */}
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-2 border-green-200 dark:border-green-900/50">
            <h3 className="font-semibold text-green-900 dark:text-green-100">معلومات التعبئة والمخزون</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="unitsPerBox">عدد الوحدات في العلبة</Label>
                <Input
                  id="unitsPerBox"
                  type="number"
                  min="1"
                  value={formData.unitsPerBox}
                  onChange={(e) => setFormData({ ...formData, unitsPerBox: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitType">نوع الوحدة</Label>
                <Select value={formData.unitType} onValueChange={(value) => setFormData({ ...formData, unitType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalStock">الكمية الإجمالية</Label>
                <Input
                  id="totalStock"
                  type="number"
                  min="0"
                  value={formData.totalStock}
                  onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minStockAlert">الحد الأدنى للمخزون</Label>
                <Input
                  id="minStockAlert"
                  type="number"
                  min="0"
                  value={formData.minStockAlert}
                  onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageLocation">موقع التخزين</Label>
                <Input
                  id="storageLocation"
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  placeholder="مثال: رف A - صف 3"
                />
              </div>
            </div>
          </div>

          {/* معلومات التسعير */}
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-2 border-purple-200 dark:border-purple-900/50">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              معلومات التسعير
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">سعر الشراء (للوحدة) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">سعر البيع (للوحدة) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wholesalePrice">سعر الجملة (للوحدة)</Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wholesalePrice}
                  onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {formData.purchasePrice && formData.sellingPrice && (
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  هامش الربح: <span className="text-lg font-bold">{profitMargin}%</span>
                </p>
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-2 border-orange-200 dark:border-orange-900/50">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">معلومات إضافية</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastRestockDate">تاريخ آخر توريد</Label>
                <Input
                  id="lastRestockDate"
                  type="date"
                  value={formData.lastRestockDate}
                  onChange={(e) => setFormData({ ...formData, lastRestockDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">تاريخ انتهاء الصلاحية</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
                rows={2}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Package className="h-4 w-4 ml-2" />
              إضافة المنتج
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

