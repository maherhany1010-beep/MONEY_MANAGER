'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaymentMethod } from '@/types/customer'
import { useCustomers } from '@/contexts/customers-context'
import { DollarSign, AlertCircle, CheckCircle, CreditCard, Banknote, FileText, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  invoiceId?: string // إذا كانت الدفعة لفاتورة محددة
  maxAmount?: number // الحد الأقصى للدفع (المديونية الحالية أو رصيد الفاتورة)
}

export function PaymentDialog({ open, onOpenChange, customerId, invoiceId, maxAmount }: PaymentDialogProps) {
  const { addPayment, getCustomer, getCustomerInvoices } = useCustomers()
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash' as PaymentMethod,
    referenceNumber: '',
    notes: '',
    selectedInvoiceId: invoiceId || 'general',
  })
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const customer = useMemo(() => getCustomer(customerId), [customerId, getCustomer])
  const invoices = useMemo(() => getCustomerInvoices(customerId), [customerId, getCustomerInvoices])

  // الفواتير غير المدفوعة بالكامل
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((inv: any) => inv.status !== 'paid')
  }, [invoices])

  const invoice = useMemo(() => {
    const selectedId = formData.selectedInvoiceId || invoiceId
    if (!selectedId || selectedId === 'general') return null
    return invoices.find(inv => inv.id === selectedId)
  }, [formData.selectedInvoiceId, invoiceId, invoices])

  // حساب المبلغ المطلوب
  const requiredAmount = useMemo(() => {
    if (invoice) {
      return invoice.remainingAmount
    }
    return customer?.currentDebt || 0
  }, [invoice, customer])

  // إعادة تعيين النموذج عند الإغلاق
  useEffect(() => {
    if (!open) {
      setFormData({
        amount: '',
        paymentMethod: 'cash',
        referenceNumber: '',
        notes: '',
        selectedInvoiceId: invoiceId || '',
      })
      setPaymentType('partial')
      setError('')
      setSuccess(false)
      setLoading(false)
      setShowConfirm(false)
    }
  }, [open, invoiceId])

  // تحديث المبلغ عند تغيير نوع الدفع
  useEffect(() => {
    if (paymentType === 'full') {
      setFormData(prev => ({ ...prev, amount: requiredAmount.toString() }))
    }
  }, [paymentType, requiredAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // التحقق من المبلغ
    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح')
      return
    }

    if (amount > requiredAmount) {
      setError(`المبلغ أكبر من المطلوب (${formatCurrency(requiredAmount)})`)
      return
    }

    // التحقق من رقم المرجع للطرق التي تحتاجه
    if (['bank-transfer', 'check'].includes(formData.paymentMethod) && !formData.referenceNumber.trim()) {
      setError('يرجى إدخال رقم المرجع (رقم الشيك أو التحويل)')
      return
    }

    // عرض تأكيد
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // محاكاة التحميل

      addPayment(customerId, {
        invoiceId: formData.selectedInvoiceId || undefined,
        paymentDate: new Date().toISOString().split('T')[0],
        amount,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError('حدث خطأ أثناء حفظ الدفعة')
      console.error('Payment save error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md" aria-describedby="success-message">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">تم تسجيل الدفعة بنجاح!</h3>
            <p id="success-message" className="text-sm text-green-700">
              تم تسجيل دفعة بمبلغ {formatCurrency(parseFloat(formData.amount))}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-teal-100 dark:border-teal-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-teal-100 dark:border-teal-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            تسجيل دفعة {invoice ? 'للفاتورة' : 'من العميل'}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            {customer?.fullName} - {invoice ? `فاتورة رقم ${invoice.invoiceNumber}` : 'دفعة عامة'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* معلومات المديونية */}
          <div className="space-y-3 p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-orange-900">معلومات المديونية</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-white/60 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 font-medium">المبلغ المطلوب</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(requiredAmount)}</p>
              </div>
              {customer && !invoice && (
                <div className="p-3 bg-white/60 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">إجمالي المديونية</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(customer.currentDebt ?? 0)}</p>
                </div>
              )}
            </div>
          </div>

          {/* اختيار الفاتورة */}
          {!invoiceId && unpaidInvoices.length > 0 && (
            <div className="space-y-3 p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-purple-900">ربط بفاتورة (اختياري)</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selectedInvoice" className="text-purple-900">اختر فاتورة محددة</Label>
                <Select
                  value={formData.selectedInvoiceId}
                  onValueChange={(value) => setFormData({ ...formData, selectedInvoiceId: value })}
                >
                  <SelectTrigger id="selectedInvoice" className="border-2 border-purple-300">
                    <SelectValue placeholder="دفعة عامة (غير مرتبطة بفاتورة)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">دفعة عامة</SelectItem>
                    {unpaidInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {formatCurrency(inv.remainingAmount)} متبقي
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* نوع الدفع */}
          <div className="space-y-3">
            <Label className="text-gray-900 font-semibold">نوع الدفع</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('partial')}
                className={`p-4 rounded-xl border-2 transition-all shadow-sm ${
                  paymentType === 'partial'
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    paymentType === 'partial' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-200'
                  }`}>
                    <CreditCard className={`h-6 w-6 ${paymentType === 'partial' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`font-bold ${paymentType === 'partial' ? 'text-blue-900' : 'text-gray-700'}`}>
                    دفعة جزئية
                  </p>
                  <p className="text-xs text-gray-600 mt-1">دفع جزء من المبلغ</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('full')}
                className={`p-4 rounded-xl border-2 transition-all shadow-sm ${
                  paymentType === 'full'
                    ? 'border-green-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md'
                    : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    paymentType === 'full' ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gray-200'
                  }`}>
                    <Banknote className={`h-6 w-6 ${paymentType === 'full' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <p className={`font-bold ${paymentType === 'full' ? 'text-green-900' : 'text-gray-700'}`}>
                    دفعة كاملة
                  </p>
                  <p className="text-xs text-gray-600 mt-1">سداد كامل المبلغ</p>
                </div>
              </button>
            </div>
          </div>

          {/* تفاصيل الدفع */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-blue-900">تفاصيل الدفع</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-blue-900">المبلغ (جنيه) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  disabled={paymentType === 'full'}
                  required
                  className="border-2 border-blue-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-blue-900">طريقة الدفع *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}>
                  <SelectTrigger id="paymentMethod" className="border-2 border-blue-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 كاش</SelectItem>
                    <SelectItem value="bank-transfer">🏦 تحويل بنكي</SelectItem>
                    <SelectItem value="check">📝 شيك</SelectItem>
                    <SelectItem value="credit-card">💳 بطاقة ائتمان</SelectItem>
                    <SelectItem value="e-wallet">📱 محفظة إلكترونية</SelectItem>
                    <SelectItem value="other">➕ أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {['bank-transfer', 'check'].includes(formData.paymentMethod) && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="referenceNumber" className="text-blue-900">
                    {formData.paymentMethod === 'check' ? 'رقم الشيك' : 'رقم التحويل'} *
                  </Label>
                  <Input
                    id="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    placeholder={formData.paymentMethod === 'check' ? 'أدخل رقم الشيك' : 'أدخل رقم التحويل'}
                    required
                    className="border-2 border-blue-300 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* الملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="ملاحظات إضافية عن الدفعة..."
              rows={3}
              className="resize-none border-2 border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* رسالة التأكيد */}
          {showConfirm && !error && (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 mb-1">تأكيد الدفعة</p>
                  <p className="text-sm text-yellow-800">
                    هل أنت متأكد من تسجيل دفعة بمبلغ <span className="font-bold">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                    {invoice && ` للفاتورة رقم ${invoice.invoiceNumber}`}؟
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (showConfirm) {
                  setShowConfirm(false)
                } else {
                  onOpenChange(false)
                }
              }}
              disabled={loading}
            >
              {showConfirm ? 'تراجع' : 'إلغاء'}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`gap-2 ${
                showConfirm
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : showConfirm ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  تأكيد الدفعة
                </>
              ) : (
                'حفظ الدفعة'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

