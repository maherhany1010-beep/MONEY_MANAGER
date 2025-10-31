'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProducts } from '@/contexts/products-context'
import { useSales, SaleItem } from '@/contexts/sales-context'
import { useCustomers } from '@/contexts/customers-context'
import { useCards } from '@/contexts/cards-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { formatCurrency } from '@/lib/utils'
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Receipt,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

export default function SalesPage() {
  const { products, adjustStock } = useProducts()
  const { addSale, getTodaySales, getTotalSales } = useSales()
  const { customers } = useCustomers()
  const { cards, addPurchase: addCardPurchase } = useCards()
  const { cards: prepaidCards, addPurchase: addPrepaidPurchase } = usePrepaidCards()
  const { machines, updateAccountBalance } = usePOSMachines()
  const { wallets, updateWalletBalance } = useEWallets()

  // Cart state
  const [cart, setCart] = useState<SaleItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Sale details
  const [customerId, setCustomerId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'bank_transfer' | 'e_wallet' | 'prepaid_card' | 'pos_machine' | 'deferred'>('cash')
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [selectedPrepaidCardId, setSelectedPrepaidCardId] = useState<string>('')
  const [selectedPOSMachineId, setSelectedPOSMachineId] = useState<string>('')
  const [selectedWalletId, setSelectedWalletId] = useState<string>('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [taxRate, setTaxRate] = useState('14') // Default VAT in Egypt
  const [amountPaid, setAmountPaid] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Statistics
  const todaySales = getTodaySales()
  const todayTotal = todaySales.reduce((sum, sale) => sum + (sale.total ?? sale.total_amount ?? 0), 0)
  const todayCount = todaySales.length

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.subtotal ?? item.total_price ?? 0), 0)
  const discountAmount = discountType === 'percentage'
    ? (subtotal * (parseFloat(discountValue) || 0)) / 100
    : parseFloat(discountValue) || 0
  const taxAmount = ((subtotal - discountAmount) * (parseFloat(taxRate) || 0)) / 100
  const total = subtotal - discountAmount + taxAmount
  const change = (parseFloat(amountPaid) || 0) - total

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    if ((product.totalStock ?? 0) <= 0) {
      setError('المنتج غير متوفر في المخزون')
      setTimeout(() => setError(''), 3000)
      return
    }

    const existingItem = cart.find(item => item.productId === productId)
    if (existingItem) {
      if (existingItem.quantity >= (product.totalStock ?? 0)) {
        setError('الكمية المطلوبة أكبر من المتوفر في المخزون')
        setTimeout(() => setError(''), 3000)
        return
      }
      updateQuantity(productId, existingItem.quantity + 1)
    } else {
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sellingPrice ?? product.price,
        total_price: product.sellingPrice ?? product.price,
        productId: product.id,
        productName: product.name,
        unitPrice: product.sellingPrice ?? product.price,
        subtotal: product.sellingPrice ?? product.price,
      }
      setCart([...cart, newItem])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    if (newQuantity > (product.totalStock ?? 0)) {
      setError('الكمية المطلوبة أكبر من المتوفر في المخزون')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, subtotal: (item.unitPrice ?? 0) * newQuantity, total_price: (item.unit_price ?? 0) * newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerId('')
    setPaymentMethod('cash')
    setSelectedCardId('')
    setSelectedPrepaidCardId('')
    setSelectedPOSMachineId('')
    setSelectedWalletId('')
    setDiscountValue('')
    setAmountPaid('')
    setNotes('')
    setError('')
  }

  const completeSale = async () => {
    setError('')
    setSuccess('')

    // Validation
    if (cart.length === 0) {
      setError('السلة فارغة. أضف منتجات أولاً')
      return
    }

    if (paymentMethod !== 'deferred' && parseFloat(amountPaid) < total) {
      setError('المبلغ المدفوع أقل من الإجمالي')
      return
    }

    if (paymentMethod === 'deferred' && !customerId) {
      setError('يجب اختيار عميل للدفع الآجل')
      return
    }

    // Validate payment method selections
    if (paymentMethod === 'credit_card' && !selectedCardId) {
      setError('يجب اختيار بطاقة ائتمانية')
      return
    }

    if (paymentMethod === 'prepaid_card' && !selectedPrepaidCardId) {
      setError('يجب اختيار بطاقة مسبقة الدفع')
      return
    }

    if (paymentMethod === 'pos_machine' && !selectedPOSMachineId) {
      setError('يجب اختيار ماكينة دفع')
      return
    }

    if (paymentMethod === 'e_wallet' && !selectedWalletId) {
      setError('يجب اختيار محفظة إلكترونية')
      return
    }

    // Check stock availability
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId)
      if (!product || (product.totalStock ?? 0) < item.quantity) {
        setError(`الكمية المتوفرة من ${item.productName} غير كافية`)
        return
      }
    }

    // Check balance for payment methods that require it
    if (paymentMethod === 'credit_card') {
      const card = cards.find((c: any) => c.id === selectedCardId) as any
      if (!card || (card?.balance || 0) < total) {
        setError(`الرصيد المتاح غير كافٍ. الرصيد المتاح: ${formatCurrency(card?.balance || 0)}`)
        return
      }
    }

    if (paymentMethod === 'prepaid_card') {
      const prepaidCard = prepaidCards.find(c => c.id === selectedPrepaidCardId)
      if (!prepaidCard || prepaidCard.balance < total) {
        setError(`الرصيد غير كافٍ. الرصيد المتاح: ${formatCurrency(prepaidCard?.balance || 0)}`)
        return
      }
    }

    if (paymentMethod === 'e_wallet') {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (!wallet || wallet.balance < total) {
        setError(`الرصيد غير كافٍ. الرصيد المتاح: ${formatCurrency(wallet?.balance || 0)}`)
        return
      }
    }

    // Create sale
    const customer = customers.find(c => c.id === customerId)
    const saleId = await addSale({
      customer_id: customerId || null,
      invoice_number: `INV-${Date.now()}`,
      invoice_date: new Date().toISOString(),
      total_amount: total,
      paid_amount: parseFloat(amountPaid) || 0,
      status: 'paid',
      notes: null,
      customerId: customerId || undefined,
      customerName: customer?.fullName ?? customer?.name ?? 'مبيعات نقدية',
      items: cart,
      subtotal,
      discount: discountAmount,
      discountType,
      tax: taxAmount,
      taxRate: parseFloat(taxRate) || 0,
      total,
      paymentMethod: paymentMethod as 'cash' | 'deferred' | 'credit_card' | 'bank_transfer' | 'e_wallet',
      amountPaid: parseFloat(amountPaid) || total,
      change: Math.max(0, change),
      date: new Date().toISOString(),
    }, cart)

    // Process payment based on method
    if (paymentMethod === 'credit_card') {
      const card = cards.find(c => c.id === selectedCardId)
      if (card) {
        addCardPurchase({
          cardId: selectedCardId,
          amount: total,
          description: `شراء من المبيعات - فاتورة: ${saleId}`,
          date: new Date().toISOString(),
          merchantName: 'نقطة البيع',
          category: 'مبيعات',
          cashbackEarned: 0,
        })
      }
    }

    if (paymentMethod === 'prepaid_card') {
      const prepaidCard = prepaidCards.find(c => c.id === selectedPrepaidCardId)
      if (prepaidCard) {
        addPrepaidPurchase(selectedPrepaidCardId, total, 'نقطة البيع', 'مبيعات')
      }
    }

    if (paymentMethod === 'e_wallet') {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet) {
        updateWalletBalance(selectedWalletId, wallet.balance - total, -total)
      }
    }

    if (paymentMethod === 'pos_machine') {
      const machine = machines.find(m => m.id === selectedPOSMachineId)
      if (machine && machine.accounts && machine.accounts.length > 0) {
        const primaryAccount = machine.accounts.find(a => a.isPrimary) || machine.accounts[0]
        updateAccountBalance(selectedPOSMachineId, primaryAccount.id, primaryAccount.balance + total)
      }
    }

    // Update stock
    cart.forEach(item => {
      if (item.productId) {
        adjustStock(item.productId, -item.quantity)
      }
    })

    setSuccess('تمت عملية البيع بنجاح!')
    setTimeout(() => {
      setSuccess('')
      clearCart()
      // Reset payment method selections
      setSelectedCardId('')
      setSelectedPrepaidCardId('')
      setSelectedPOSMachineId('')
      setSelectedWalletId('')
    }, 2000)
  }

  return (
    <AppLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">نقطة البيع (POS)</h1>
            <p className="text-muted-foreground">
              إدارة المبيعات والفواتير
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">مبيعات اليوم</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(todayTotal)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {todayCount} فاتورة
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">الفاتورة الحالية</CardTitle>
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(total)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                {cart.length} منتج
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">الباقي</CardTitle>
              <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {formatCurrency(Math.max(0, change))}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                للعميل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات المتاحة</CardTitle>
              <CardDescription>ابحث وأضف المنتجات إلى السلة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منتج (الاسم أو الباركود)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => addToCart(product.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>{formatCurrency(product.sellingPrice ?? 0)}</span>
                        <span>•</span>
                        <span>متوفر: {product.totalStock ?? 0} {product.unitType ?? 'قطعة'}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد منتجات
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>سلة المبيعات</CardTitle>
                  <CardDescription>{cart.length} منتج</CardDescription>
                </div>
                {cart.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCart}>
                    <X className="h-4 w-4 ml-1" />
                    مسح الكل
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName ?? item.product_name ?? 'منتج'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice ?? item.unit_price ?? 0)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId ?? '', item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.productId ?? '', item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => removeFromCart(item.productId ?? '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="font-bold">
                      {formatCurrency(item.subtotal ?? item.total_price ?? 0)}
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    السلة فارغة
                  </p>
                )}
              </div>

              {/* Sale Details */}
              {cart.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>العميل (اختياري)</Label>
                      <Select value={customerId} onValueChange={setCustomerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="مبيعات نقدية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">مبيعات نقدية</SelectItem>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>طريقة الدفع</Label>
                      <Select value={paymentMethod} onValueChange={(value: any) => {
                        setPaymentMethod(value)
                        // Reset payment method selections when changing
                        setSelectedCardId('')
                        setSelectedPrepaidCardId('')
                        setSelectedPOSMachineId('')
                        setSelectedWalletId('')
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">نقدي</SelectItem>
                          <SelectItem value="credit_card">بطاقة ائتمانية</SelectItem>
                          <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                          <SelectItem value="e_wallet">محفظة إلكترونية</SelectItem>
                          <SelectItem value="prepaid_card">بطاقة مسبقة الدفع</SelectItem>
                          <SelectItem value="pos_machine">ماكينة دفع</SelectItem>
                          <SelectItem value="deferred">آجل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Method Specific Selections */}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-2">
                      <Label>اختر البطاقة الائتمانية</Label>
                      <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر بطاقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((card: any) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.name} - {formatCurrency(card.creditLimit - card.currentBalance)} متاح
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {paymentMethod === 'prepaid_card' && (
                    <div className="space-y-2">
                      <Label>اختر البطاقة مسبقة الدفع</Label>
                      <Select value={selectedPrepaidCardId} onValueChange={setSelectedPrepaidCardId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر بطاقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {prepaidCards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.cardName} - {formatCurrency(card.balance)} متاح
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {paymentMethod === 'e_wallet' && (
                    <div className="space-y-2">
                      <Label>اختر المحفظة الإلكترونية</Label>
                      <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر محفظة" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.map((wallet) => (
                            <SelectItem key={wallet.id} value={wallet.id}>
                              {wallet.walletName} - {formatCurrency(wallet.balance)} متاح
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {paymentMethod === 'pos_machine' && (
                    <div className="space-y-2">
                      <Label>اختر ماكينة الدفع</Label>
                      <Select value={selectedPOSMachineId} onValueChange={setSelectedPOSMachineId}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر ماكينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {machines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.id}>
                              {machine.machineName} - {machine.provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الخصم</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder="0"
                        />
                        <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">EGP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>الضريبة (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        placeholder="14"
                      />
                    </div>
                  </div>

                  {paymentMethod !== 'deferred' && (
                    <div className="space-y-2">
                      <Label>المبلغ المدفوع</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>الخصم:</span>
                        <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>الضريبة ({taxRate}%):</span>
                        <span className="font-medium">{formatCurrency(taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>الإجمالي:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    {paymentMethod !== 'deferred' && amountPaid && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>الباقي:</span>
                        <span className="font-medium">{formatCurrency(Math.max(0, change))}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={completeSale}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Receipt className="h-5 w-5 ml-2" />
                    إتمام البيع
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

