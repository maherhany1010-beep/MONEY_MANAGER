'use client'

import { useState, useMemo } from 'react'
import { useCustomers } from '@/contexts/customers-context'
import { Customer, CustomerFilter } from '@/types/customer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  UserPlus,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Home,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Minus,
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'
import Link from 'next/link'
import { toast } from '@/lib/toast'

export default function CustomersPage() {
  const { customers, searchCustomers, exportCustomers, updateCustomer, addPayment } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [filter] = useState<CustomerFilter>({})

  // State للـ Dialogs - استخدام any للتوافق مع البيانات من الـ context
  const [debtDialog, setDebtDialog] = useState<{ open: boolean; customer: any }>({ open: false, customer: null })
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; customer: any }>({ open: false, customer: null })
  const [debtAmount, setDebtAmount] = useState('')
  const [debtNotes, setDebtNotes] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // البحث والتصفية
  const filteredCustomers = useMemo(() => {
    return searchCustomers({ ...filter, searchQuery })
  }, [searchCustomers, filter, searchQuery])

  // دالة مساعدة للحصول على المديونية (تدعم كلا الصيغتين)
  const getCustomerDebt = (customer: Customer | null) => {
    if (!customer) return 0
    return customer.currentDebt ?? (customer as any).current_debt ?? 0
  }

  // دالة لتحديد لون الصف حسب المديونية - تدعم الوضع الداكن
  const getRowBackgroundColor = (debt: number, creditLimit?: number) => {
    if (debt === 0) return 'bg-green-50/50 dark:bg-green-900/20 hover:bg-green-100/50 dark:hover:bg-green-900/30'
    if (creditLimit && debt > creditLimit) return 'bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100/50 dark:hover:bg-red-900/30'
    if (debt > 10000) return 'bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100/50 dark:hover:bg-red-900/30'
    if (debt > 5000) return 'bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-100/50 dark:hover:bg-orange-900/30'
    if (debt > 1000) return 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30'
    return 'hover:bg-muted/50'
  }

  // دالة لتحديد لون المديونية - تدعم الوضع الداكن
  const getDebtColor = (debt: number, creditLimit?: number) => {
    if (debt === 0) return 'text-green-600 dark:text-green-400 font-semibold'
    if (creditLimit && debt > creditLimit) return 'text-red-600 dark:text-red-400 font-semibold'
    if (debt > 10000) return 'text-red-600 dark:text-red-400 font-semibold'
    if (debt > 5000) return 'text-orange-600 dark:text-orange-400 font-semibold'
    if (debt > 1000) return 'text-blue-600 dark:text-blue-400 font-semibold'
    return 'text-foreground font-medium'
  }

  // الإحصائيات العامة
  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const totalDebt = customers.reduce((sum, c) => sum + (c.currentDebt ?? 0), 0)
    const customersWithDebt = customers.filter(c => (c.currentDebt ?? 0) > 0).length

    return {
      totalCustomers,
      activeCustomers,
      totalDebt,
      customersWithDebt,
    }
  }, [customers])

  // تصدير CSV
  const handleExport = () => {
    const csv = exportCustomers()
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // الحصول على لون الحالة - ألوان عصرية وناعمة
  const getStatusColor = (status: Customer['status']) => {
    const classes = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50',
      inactive: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/50',
      blocked: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/50'
    }
    return { className: `border font-semibold ${classes[status]}`, style: {} }
  }

  // الحصول على لون التصنيف - ألوان متناسقة
  const getCategoryColor = (category: Customer['category']) => {
    const classes = {
      vip: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/50',
      regular: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/50',
      new: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50'
    }
    return { className: `border font-semibold ${classes[category]}`, style: {} }
  }

  // الحصول على نص الحالة
  const getStatusText = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'blocked': return 'محظور'
    }
  }

  // الحصول على نص التصنيف
  const getCategoryText = (category: Customer['category']) => {
    switch (category) {
      case 'vip': return 'VIP'
      case 'regular': return 'عادي'
      case 'new': return 'جديد'
    }
  }

  // معالجة إضافة مديونية
  const handleAddDebt = async () => {
    if (!debtDialog.customer || !debtAmount) return

    const amount = parseFloat(debtAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    setIsLoading(true)
    try {
      // دعم كلا الصيغتين: camelCase و snake_case
      const currentDebt = debtDialog.customer.currentDebt ?? (debtDialog.customer as any).current_debt ?? 0
      // تحديث الملاحظات إذا وجدت
      const existingNotes = debtDialog.customer.notes || ''
      const newNote = debtNotes ? `[${new Date().toLocaleDateString('ar-EG')}] مديونية: ${formatCurrency(amount)} - ${debtNotes}` : ''
      const updatedNotes = newNote ? (existingNotes ? `${existingNotes}\n${newNote}` : newNote) : existingNotes

      await updateCustomer(debtDialog.customer.id, {
        currentDebt: currentDebt + amount,
        notes: updatedNotes
      })
      toast.success(`تم إضافة ${formatCurrency(amount)} للمديونية`)
      setDebtDialog({ open: false, customer: null })
      setDebtAmount('')
      setDebtNotes('')
    } catch (error: any) {
      console.error('Error adding debt:', error)
      toast.error(error?.message || 'حدث خطأ أثناء إضافة المديونية')
    } finally {
      setIsLoading(false)
    }
  }

  // معالجة السداد
  const handlePayment = async () => {
    if (!paymentDialog.customer || !paymentAmount) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    // دعم كلا الصيغتين: camelCase و snake_case
    const currentDebt = paymentDialog.customer.currentDebt ?? (paymentDialog.customer as any).current_debt ?? 0
    if (amount > currentDebt) {
      toast.error('مبلغ السداد أكبر من المديونية الحالية')
      return
    }

    setIsLoading(true)
    try {
      await addPayment(paymentDialog.customer.id, {
        amount,
        date: new Date().toISOString(),
        method: 'cash',
        notes: paymentNotes || 'سداد من صفحة العملاء'
      })
      toast.success(`تم سداد ${formatCurrency(amount)} بنجاح`)
      setPaymentDialog({ open: false, customer: null })
      setPaymentAmount('')
      setPaymentNotes('')
    } catch (error: any) {
      console.error('Error processing payment:', error)
      toast.error(error?.message || 'حدث خطأ أثناء السداد')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
        {/* العنوان */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-xl">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <Users className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                إدارة العملاء
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">إدارة شاملة لجميع العملاء والمديونيات</p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2 flex-1 sm:flex-none rounded-xl"
            >
              <Download className="h-4 w-4" />
              <span>تصدير</span>
            </Button>
            <Button
              onClick={() => setShowCustomerDialog(true)}
              className="gap-2 flex-1 sm:flex-none bg-primary hover:bg-primary/90 rounded-xl shadow-lg"
            >
              <UserPlus className="h-4 w-4" />
              إضافة عميل
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">العملاء النشطون</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.activeCustomers}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">إجمالي المديونيات</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(stats.totalDebt)}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">لديهم مديونيات</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.customersWithDebt}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* البحث والتصفية */}
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، رقم الهاتف، البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-11 rounded-xl h-11"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 rounded-xl h-11 px-5"
            >
              <Filter className="h-4 w-4" />
              <span>فلاتر</span>
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 pt-4 mt-4 border-t border-border">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">المديونية</label>
              </div>
            </div>
          )}
        </div>

        {/* قائمة العملاء */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    العميل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    معلومات الاتصال
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    المديونية
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-muted rounded-full">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">لا توجد عملاء بعد</p>
                        <Button
                          onClick={() => setShowCustomerDialog(true)}
                          className="mt-2 gap-2 bg-primary hover:bg-primary/90 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                          إضافة أول عميل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    // دعم كلا الصيغتين: camelCase و snake_case
                    const debt = customer.currentDebt ?? (customer as any).current_debt ?? 0
                    const creditLimit = customer.creditLimit ?? (customer as any).credit_limit ?? 0
                    const isOverLimit = creditLimit > 0 && debt > creditLimit

                    return (
                      <tr
                        key={customer.id}
                        className={`transition-all duration-200 ${getRowBackgroundColor(debt, creditLimit)}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-base font-bold text-foreground flex items-center gap-2">
                              {customer.fullName ?? customer.name}
                              {isOverLimit && (
                                <span title="تجاوز الحد الائتماني">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                </span>
                              )}
                            </div>
                            {customer.company && (
                              <div className="text-xs text-muted-foreground mt-0.5">{customer.company}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {customer.phone || '-'}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {customer.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={getDebtColor(debt, creditLimit)}>
                              {formatCurrency(debt)}
                            </div>
                            {debt === 0 && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          {creditLimit > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              الحد: {formatCurrency(creditLimit)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-500/50 dark:hover:bg-orange-500/20"
                              onClick={() => {
                                setDebtDialog({ open: true, customer })
                                setDebtAmount('')
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              مديونية
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-500/50 dark:hover:bg-green-500/20"
                              onClick={() => {
                                setPaymentDialog({ open: true, customer })
                                setPaymentAmount('')
                              }}
                              disabled={debt === 0}
                            >
                              <Minus className="h-3.5 w-3.5" />
                              سداد
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* نافذة إضافة/تعديل عميل */}
        <CustomerDialog
          open={showCustomerDialog}
          onOpenChange={setShowCustomerDialog}
        />

        {/* نافذة إضافة مديونية */}
        <Dialog open={debtDialog.open} onOpenChange={(open) => setDebtDialog({ open, customer: open ? debtDialog.customer : null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Plus className="h-5 w-5" />
                إضافة مديونية
              </DialogTitle>
              <DialogDescription>
                إضافة مبلغ جديد لمديونية العميل: <strong>{debtDialog.customer?.fullName ?? debtDialog.customer?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="debtAmount">المبلغ (ج.م)</Label>
                <Input
                  id="debtAmount"
                  type="number"
                  placeholder="أدخل المبلغ..."
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  className="text-lg"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debtNotes">سبب المديونية (اختياري)</Label>
                <Textarea
                  id="debtNotes"
                  placeholder="مثال: بضاعة بالآجل، فاتورة رقم..."
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المديونية الحالية:</span>
                  <span className="font-semibold">{formatCurrency(getCustomerDebt(debtDialog.customer))}</span>
                </div>
                {debtAmount && parseFloat(debtAmount) > 0 && (
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground">المديونية الجديدة:</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(getCustomerDebt(debtDialog.customer) + parseFloat(debtAmount))}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setDebtDialog({ open: false, customer: null })
                  setDebtNotes('')
                }}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddDebt}
                disabled={isLoading || !debtAmount || parseFloat(debtAmount) <= 0}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? 'جاري الإضافة...' : 'إضافة المديونية'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* نافذة السداد */}
        <Dialog open={paymentDialog.open} onOpenChange={(open) => {
          setPaymentDialog({ open, customer: open ? paymentDialog.customer : null })
          if (!open) setPaymentNotes('')
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <DollarSign className="h-5 w-5" />
                سداد مديونية
              </DialogTitle>
              <DialogDescription>
                سداد جزء أو كل مديونية العميل: <strong>{paymentDialog.customer?.fullName ?? paymentDialog.customer?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">مبلغ السداد (ج.م)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  placeholder="أدخل المبلغ..."
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="text-lg"
                  min="0"
                  max={getCustomerDebt(paymentDialog.customer)}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentNotes">ملاحظات السداد (اختياري)</Label>
                <Textarea
                  id="paymentNotes"
                  placeholder="مثال: سداد نقدي، تحويل بنكي، شيك رقم..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المديونية الحالية:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(getCustomerDebt(paymentDialog.customer))}</span>
                </div>
                {paymentAmount && parseFloat(paymentAmount) > 0 && (
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground">المتبقي بعد السداد:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Math.max(0, getCustomerDebt(paymentDialog.customer) - parseFloat(paymentAmount)))}
                    </span>
                  </div>
                )}
              </div>
              {/* زر السداد الكامل */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPaymentAmount(getCustomerDebt(paymentDialog.customer).toString())}
              >
                سداد كامل المبلغ
              </Button>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentDialog({ open: false, customer: null })
                  setPaymentNotes('')
                }}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? 'جاري السداد...' : 'تأكيد السداد'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      )
}

