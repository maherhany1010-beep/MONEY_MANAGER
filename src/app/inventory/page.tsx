'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useProducts } from '@/contexts/products-context'
import { AddProductDialog } from '@/components/inventory/add-product-dialog'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  DollarSign,
  Archive,
  Edit,
  Trash2
} from 'lucide-react'

export default function InventoryPage() {
  const { products, getLowStockProducts, deleteProduct } = useProducts()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Statistics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + ((p.totalStock ?? 0) * (p.sellingPrice ?? 0)), 0)
  const lowStockCount = getLowStockProducts().length
  const totalStock = products.reduce((sum, p) => sum + (p.totalStock ?? 0), 0)

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">إدارة المخازن والمنتجات</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            إدارة شاملة للمخزون والمنتجات
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">إجمالي المنتجات</CardTitle>
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {totalProducts}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                منتج مختلف
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">قيمة المخزون</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalValue)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                القيمة الإجمالية
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">إجمالي الوحدات</CardTitle>
              <Archive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {totalStock}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                وحدة في المخزون
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">تنبيهات المخزون</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {lowStockCount}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                منتج قليل المخزون
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>البحث والفلترة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منتج (الاسم أو الباركود)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background"
              >
                <option value="all">جميع الفئات</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat ?? 'unknown'} value={cat ?? ''}>{cat}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isLowStock = (product.totalStock ?? 0) <= (product.minStockAlert ?? 0)
            const profitMargin = (((product.sellingPrice ?? 0) - (product.purchasePrice ?? 0)) / (product.purchasePrice ?? 1) * 100).toFixed(1)

            return (
              <Card key={product.id} className={`hover:shadow-lg transition-shadow ${isLowStock ? 'border-red-300 dark:border-red-800' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    {isLowStock && (
                      <Badge variant="destructive" className="mr-2">
                        <AlertTriangle className="h-3 w-3 ml-1" />
                        قليل
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الكمية المتاحة</span>
                      <span className="font-bold">{product.totalStock ?? 0} {product.unitType ?? 'قطعة'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">سعر البيع</span>
                      <span className="font-bold text-green-600">{formatCurrency(product.sellingPrice ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">هامش الربح</span>
                      <span className="font-bold text-purple-600">{profitMargin}%</span>
                    </div>
                    {product.barcode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">الباركود</span>
                        <span className="font-mono text-xs">{product.barcode}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'لا توجد منتجات تطابق البحث'
                  : 'لا توجد منتجات. ابدأ بإضافة منتج جديد!'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Product Dialog */}
        <AddProductDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      </div>
      )
}

