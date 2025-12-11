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
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
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
  const { accounts: bankAccounts } = useBankAccounts()
  const { wallets: eWallets } = useEWallets()
  const { machines: posMachines } = usePOSMachines()
  const { vaults: cashVaults } = useCashVaults()
  const { cards: prepaidCards } = usePrepaidCards()

  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash' as PaymentMethod,
    referenceNumber: '',
    notes: '',
    selectedInvoiceId: invoiceId || 'general',
  })

  // بيانات حساب التحصيل
  const [receivingAccount, setReceivingAccount] = useState({
    accountType: 'bank' as 'bank' | 'e-wallet' | 'pos' | 'cash-vault' | 'prepaid-card',
    accountId: '',
  })

  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [invoices, setInvoices] = useState<any[]>([])

  const customer = useMemo(() => getCustomer(customerId), [customerId, getCustomer])

  // Load invoices
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const inv = await getCustomerInvoices(customerId)
        setInvoices(inv || [])
      } catch (err) {
        console.error('خطأ في تحميل الفواتير:', err)
        setInvoices([])
      }
    }
    loadInvoices()
  }, [customerId, getCustomerInvoices])

  // الحسابات المتاحة حسب النوع
  const getAccountsByType = (type: string) => {
    switch (type) {
      case 'bank':
        return (bankAccounts || []).map(acc => ({ id: acc.id, name: `${acc.bankName} - ${acc.accountNumber}` }))
      case 'e-wallet':
        return (eWallets || []).map(wallet => ({ id: wallet.id, name: `${wallet.provider} - ${wallet.phoneNumber}` }))
      case 'pos':
        return (posMachines || []).map(pos => ({ id: pos.id, name: `${pos.provider} - ${pos.machineId}` }))
      case 'cash-vault':
        return (cashVaults || []).map(vault => ({ id: vault.id, name: vault.vaultName }))
      case 'prepaid-card':
        return (prepaidCards || []).map(card => ({ id: card.id, name: `${card.provider} - ${card.cardNumber}` }))
      default:
        return []
    }
  }

  const receivingAccounts = useMemo(() => getAccountsByType(receivingAccount.accountType), [receivingAccount.accountType, bankAccounts, eWallets, posMachines, cashVaults, prepaidCards])

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

    // التحقق من حساب التحصيل
    if (!receivingAccount.accountId) {
      setError('يرجى اختيار حساب التحصيل')
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
        receivingAccount: {
          accountType: receivingAccount.accountType,
          accountId: receivingAccount.accountId,
        },
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
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-2 border-border"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-border">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            تسجيل دفعة {invoice ? 'للفاتورة' : 'من العميل'}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            {customer?.fullName} - {invoice ? `فاتورة رقم ${invoice.invoiceNumber}` : 'دفعة عامة'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* معلومات المديونية */}
          <div className="space-y-3 p-5 bg-muted/50 border-2 border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500 dark:bg-orange-600 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-foreground">معلومات المديونية</h3>
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
            <div className="space-y-3 p-5 bg-muted/50 border-2 border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-foreground">ربط بفاتورة (اختياري)</h3>
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
            <Label className="text-foreground font-semibold">نوع الدفع</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('partial')}
                className={`p-4 rounded-xl border-2 transition-all shadow-sm ${
                  paymentType === 'partial'
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    paymentType === 'partial' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    <CreditCard className={`h-6 w-6 ${paymentType === 'partial' ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <p className={`font-bold ${paymentType === 'partial' ? 'text-foreground' : 'text-foreground'}`}>
                    دفعة جزئية
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">دفع جزء من المبلغ</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('full')}
                className={`p-4 rounded-xl border-2 transition-all shadow-sm ${
                  paymentType === 'full'
                    ? 'border-green-500 dark:border-green-600 bg-green-100 dark:bg-green-900/30 shadow-md'
                    : 'border-border hover:border-green-400 dark:hover:border-green-700 hover:bg-muted'
                }`}
              >
                <div className="text-center">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    paymentType === 'full' ? 'bg-green-500 dark:bg-green-600' : 'bg-muted'
                  }`}>
                    <Banknote className={`h-6 w-6 ${paymentType === 'full' ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <p className={`font-bold ${paymentType === 'full' ? 'text-foreground' : 'text-foreground'}`}>
                    دفعة كاملة
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">سداد كامل المبلغ</p>
                </div>
              </button>
            </div>
          </div>

          {/* تفاصيل الدفع */}
          <div className="space-y-4 p-5 bg-muted/50 border-2 border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <CreditCard className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">تفاصيل الدفع</h3>
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

          {/* حساب التحصيل */}
          <div className="space-y-4 p-5 bg-muted/50 border-2 border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 dark:bg-green-600 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-foreground">حساب التحصيل</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="receivingAccountType" className="text-emerald-900">نوع الحساب *</Label>
                <Select
                  value={receivingAccount.accountType}
                  onValueChange={(value: any) => setReceivingAccount({ ...receivingAccount, accountType: value, accountId: '' })}
                >
                  <SelectTrigger id="receivingAccountType" className="border-2 border-emerald-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">حساب بنكي</SelectItem>
                    <SelectItem value="e-wallet">محفظة إلكترونية</SelectItem>
                    <SelectItem value="pos">ماكينة POS</SelectItem>
                    <SelectItem value="cash-vault">خزينة نقدية</SelectItem>
                    <SelectItem value="prepaid-card">بطاقة مدفوعة مسبقاً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivingAccountId" className="text-emerald-900">الحساب *</Label>
                <Select
                  value={receivingAccount.accountId}
                  onValueChange={(value) => setReceivingAccount({ ...receivingAccount, accountId: value })}
                >
                  <SelectTrigger id="receivingAccountId" className="border-2 border-emerald-300">
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {receivingAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

          {/* ملخص الدفعة */}
          {showConfirm && !error && (
            <div className="space-y-4 p-5 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-500 dark:bg-green-600 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-green-900 dark:text-green-100">ملخص الدفعة</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* المبلغ المستلم */}
                <div className="p-3 bg-white/70 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium mb-1">المبلغ المستلم من العميل</p>
                  <p className="text-xl font-bold text-emerald-900">{formatCurrency(parseFloat(formData.amount) || 0)}</p>
                </div>

                {/* حساب التحصيل */}
                <div className="p-3 bg-white/70 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium mb-1">حساب التحصيل</p>
                  <p className="text-sm font-bold text-emerald-900">
                    {receivingAccounts.find(acc => acc.id === receivingAccount.accountId)?.name || 'غير محدد'}
                  </p>
                </div>

                {/* المديونية الحالية */}
                <div className="p-3 bg-white/70 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-700 font-medium mb-1">المديونية الحالية</p>
                  <p className="text-xl font-bold text-orange-900">{formatCurrency(requiredAmount)}</p>
                </div>

                {/* المديونية بعد الدفع */}
                <div className="p-3 bg-white/70 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">المديونية بعد الدفع</p>
                  <p className={`text-xl font-bold ${requiredAmount - (parseFloat(formData.amount) || 0) <= 0 ? 'text-green-900' : 'text-blue-900'}`}>
                    {formatCurrency(Math.max(0, requiredAmount - (parseFloat(formData.amount) || 0)))}
                  </p>
                </div>
              </div>

              {/* حالة المديونية */}
              {requiredAmount - (parseFloat(formData.amount) || 0) <= 0 && (
                <div className="p-3 bg-green-100 border-2 border-green-400 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-bold text-green-900">✅ سيتم تسديد المديونية بالكامل</p>
                </div>
              )}
            </div>
          )}

          {/* رسالة التأكيد */}
          {showConfirm && !error && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">تأكيد الدفعة</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    هل أنت متأكد من تسجيل هذه الدفعة؟
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
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-primary hover:bg-primary/90'
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

