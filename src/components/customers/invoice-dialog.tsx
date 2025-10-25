'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCustomers } from '@/contexts/customers-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePOSMachines } from '@/contexts/pos-machines-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { FileText, AlertCircle, CheckCircle, Loader2, DollarSign, Calendar, ArrowRight, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
}

export function InvoiceDialog({ open, onOpenChange, customerId }: InvoiceDialogProps) {
  const { addInvoice, getCustomer } = useCustomers()
  const { accounts: bankAccounts } = useBankAccounts()
  const { wallets: eWallets } = useEWallets()
  const { machines: posMachines } = usePOSMachines()
  const { vaults: cashVaults } = useCashVaults()
  const { cards: prepaidCards } = usePrepaidCards()

  const [invoiceType, setInvoiceType] = useState<'sale' | 'transfer'>('sale')
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    description: '',
    notes: '',
  })

  // بيانات التحويل
  const [transferData, setTransferData] = useState({
    debitAccountType: 'customer' as 'bank' | 'e-wallet' | 'pos' | 'cash-vault' | 'prepaid-card' | 'customer',
    debitAccountId: customerId, // العميل هو المصدر افتراضياً (دفعة من العميل)
    fees: '',
    feesBearer: 'sender' as 'sender' | 'receiver' | 'none',
    collectionType: 'immediate' as 'immediate' | 'deferred',
    creditAccountType: 'bank' as 'bank' | 'e-wallet' | 'pos' | 'cash-vault' | 'prepaid-card' | 'customer',
    creditAccountId: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const customer = useMemo(() => getCustomer(customerId), [customerId, getCustomer])

  // الحسابات المتاحة حسب النوع
  const getAccountsByType = (type: string) => {
    switch (type) {
      case 'customer':
        return customer ? [{ id: customer.id, name: `${customer.fullName} (العميل)` }] : []
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

  const debitAccounts = useMemo(() => getAccountsByType(transferData.debitAccountType), [transferData.debitAccountType, bankAccounts, eWallets, posMachines, cashVaults, prepaidCards])
  const creditAccounts = useMemo(() => getAccountsByType(transferData.creditAccountType), [transferData.creditAccountType, bankAccounts, eWallets, posMachines, cashVaults, prepaidCards])

  // حساب المبالغ
  const amount = parseFloat(formData.amount) || 0
  const fees = parseFloat(transferData.fees) || 0
  const debitAmount = transferData.feesBearer === 'sender' ? amount + fees : amount
  const collectionAmount = transferData.feesBearer === 'receiver' ? amount - fees : amount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // التحقق من البيانات
      if (!formData.invoiceNumber || !formData.invoiceDate || !formData.amount) {
        throw new Error('يرجى ملء جميع الحقول المطلوبة')
      }

      if (amount <= 0) {
        throw new Error('المبلغ يجب أن يكون أكبر من صفر')
      }

      // التحقق من بيانات التحويل إذا كان النوع تحويل
      if (invoiceType === 'transfer') {
        if (!transferData.debitAccountId || !transferData.creditAccountId) {
          throw new Error('يرجى اختيار حسابات التحويل')
        }
        if (transferData.debitAccountId === transferData.creditAccountId && transferData.debitAccountType === transferData.creditAccountType) {
          throw new Error('لا يمكن التحويل من وإلى نفس الحساب')
        }
      }

      // إنشاء الفاتورة
      const invoiceData: any = {
        customerId,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate || undefined,
        amount,
        description: formData.description,
        notes: formData.notes,
        invoiceType,
      }

      // إضافة بيانات التحويل إذا كان النوع تحويل
      if (invoiceType === 'transfer') {
        invoiceData.transferDetails = {
          debitAccountType: transferData.debitAccountType,
          debitAccountId: transferData.debitAccountId,
          debitAmount,
          fees,
          feesBearer: transferData.feesBearer,
          collectionAmount,
          collectionType: transferData.collectionType,
          creditAccountType: transferData.creditAccountType,
          creditAccountId: transferData.creditAccountId,
        }
      }

      addInvoice(invoiceData)

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      amount: '',
      description: '',
      notes: '',
    })
    setTransferData({
      debitAccountType: 'customer',
      debitAccountId: customerId,
      fees: '',
      feesBearer: 'sender',
      collectionType: 'immediate',
      creditAccountType: 'bank',
      creditAccountId: '',
    })
    setInvoiceType('sale')
    setError('')
    setSuccess(false)
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-orange-100 dark:border-orange-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-orange-100 dark:border-orange-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            فاتورة جديدة - {customer.fullName}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            إنشاء فاتورة جديدة للعميل
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle className="h-16 w-16 dark:text-green-400" style={{ color: '#16a34a' }} />
            <p className="text-lg font-semibold dark:text-green-400" style={{ color: '#15803d' }}>تم إنشاء الفاتورة بنجاح!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* نوع الفاتورة */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <Label className="text-sm font-bold dark:text-purple-100 mb-3 block" style={{ color: '#7e22ce' }}>
                نوع الفاتورة *
              </Label>
              <RadioGroup value={invoiceType} onValueChange={(value: 'sale' | 'transfer') => setInvoiceType(value)}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="sale" id="sale" />
                  <Label htmlFor="sale" className="cursor-pointer">فاتورة بيع عادية</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="cursor-pointer">فاتورة تحويل (مع ربط بالحسابات)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* معلومات الفاتورة الأساسية */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="text-sm font-bold dark:text-blue-100 mb-3" style={{ color: '#1d4ed8' }}>
                معلومات الفاتورة
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                    رقم الفاتورة *
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                    تاريخ الفاتورة *
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                    المبلغ (جنيه) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                    تاريخ الاستحقاق
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                  الوصف
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* تفاصيل التحويل (إذا كان النوع تحويل) */}
            {invoiceType === 'transfer' && (
              <>
                {/* حساب الخصم (المصدر) */}
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-700">
                  <h3 className="text-sm font-bold dark:text-rose-100 mb-3" style={{ color: '#be123c' }}>
                    من الحساب (المصدر)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="debitAccountType" className="dark:text-rose-100 font-medium" style={{ color: '#be123c' }}>
                        نوع الحساب *
                      </Label>
                      <Select
                        value={transferData.debitAccountType}
                        onValueChange={(value: any) => setTransferData({ ...transferData, debitAccountType: value, debitAccountId: '' })}
                      >
                        <SelectTrigger id="debitAccountType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">العميل (دفعة من العميل)</SelectItem>
                          <SelectItem value="bank">حساب بنكي</SelectItem>
                          <SelectItem value="e-wallet">محفظة إلكترونية</SelectItem>
                          <SelectItem value="pos">ماكينة POS</SelectItem>
                          <SelectItem value="cash-vault">خزينة نقدية</SelectItem>
                          <SelectItem value="prepaid-card">بطاقة مدفوعة مسبقاً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="debitAccountId" className="dark:text-rose-100 font-medium" style={{ color: '#be123c' }}>
                        الحساب *
                      </Label>
                      <Select
                        value={transferData.debitAccountId}
                        onValueChange={(value) => setTransferData({ ...transferData, debitAccountId: value })}
                      >
                        <SelectTrigger id="debitAccountId">
                          <SelectValue placeholder="اختر الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {debitAccounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* حساب الإضافة (الوجهة) */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <h3 className="text-sm font-bold dark:text-emerald-100 mb-3" style={{ color: '#047857' }}>
                    إلى الحساب (الوجهة)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="creditAccountType" className="dark:text-emerald-100 font-medium" style={{ color: '#047857' }}>
                        نوع الحساب *
                      </Label>
                      <Select
                        value={transferData.creditAccountType}
                        onValueChange={(value: any) => setTransferData({ ...transferData, creditAccountType: value, creditAccountId: '' })}
                      >
                        <SelectTrigger id="creditAccountType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">العميل (تحويل للعميل)</SelectItem>
                          <SelectItem value="bank">حساب بنكي</SelectItem>
                          <SelectItem value="e-wallet">محفظة إلكترونية</SelectItem>
                          <SelectItem value="pos">ماكينة POS</SelectItem>
                          <SelectItem value="cash-vault">خزينة نقدية</SelectItem>
                          <SelectItem value="prepaid-card">بطاقة مدفوعة مسبقاً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="creditAccountId" className="dark:text-emerald-100 font-medium" style={{ color: '#047857' }}>
                        الحساب *
                      </Label>
                      <Select
                        value={transferData.creditAccountId}
                        onValueChange={(value) => setTransferData({ ...transferData, creditAccountId: value })}
                      >
                        <SelectTrigger id="creditAccountId">
                          <SelectValue placeholder="اختر الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {creditAccounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* الرسوم والتحصيل */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-700">
                  <h3 className="text-sm font-bold dark:text-amber-100 mb-3" style={{ color: '#d97706' }}>
                    الرسوم والتحصيل
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fees" className="dark:text-amber-100 font-medium" style={{ color: '#d97706' }}>
                        الرسوم (جنيه)
                      </Label>
                      <Input
                        id="fees"
                        type="number"
                        step="0.01"
                        value={transferData.fees}
                        onChange={(e) => setTransferData({ ...transferData, fees: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="feesBearer" className="dark:text-amber-100 font-medium" style={{ color: '#d97706' }}>
                        من يتحمل الرسوم
                      </Label>
                      <Select
                        value={transferData.feesBearer}
                        onValueChange={(value: any) => setTransferData({ ...transferData, feesBearer: value })}
                      >
                        <SelectTrigger id="feesBearer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sender">المرسل</SelectItem>
                          <SelectItem value="receiver">المستقبل</SelectItem>
                          <SelectItem value="none">لا أحد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="collectionType" className="dark:text-amber-100 font-medium" style={{ color: '#d97706' }}>
                        نوع التحصيل
                      </Label>
                      <Select
                        value={transferData.collectionType}
                        onValueChange={(value: any) => setTransferData({ ...transferData, collectionType: value })}
                      >
                        <SelectTrigger id="collectionType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">فوري (يتم الدفع الآن)</SelectItem>
                          <SelectItem value="deferred">آجل (يتم الدفع لاحقاً)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* تاريخ التحصيل الآجل */}
                  {transferData.collectionType === 'deferred' && (
                    <div className="mt-4">
                      <Label htmlFor="deferredDate" className="dark:text-amber-100 font-medium mb-2 block" style={{ color: '#d97706' }}>
                        تاريخ التحصيل المتوقع
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Input
                            id="deferredDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="border-2 border-amber-300"
                          />
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">اختيارات سريعة:</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date()
                                date.setDate(date.getDate() + 1)
                                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                              }}
                              className="text-xs"
                            >
                              يوم
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date()
                                date.setDate(date.getDate() + 2)
                                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                              }}
                              className="text-xs"
                            >
                              يومين
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date()
                                date.setDate(date.getDate() + 7)
                                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                              }}
                              className="text-xs"
                            >
                              أسبوع
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date()
                                date.setDate(date.getDate() + 14)
                                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                              }}
                              className="text-xs"
                            >
                              أسبوعين
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date()
                                date.setMonth(date.getMonth() + 1)
                                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                              }}
                              className="text-xs"
                            >
                              شهر
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const date = new Date()
                                date.setMonth(date.getMonth() + 3)
                                setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                              }}
                              className="text-xs"
                            >
                              3 أشهر
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ملخص المبالغ */}
                  {amount > 0 && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">المبلغ المخصوم</p>
                          <p className="font-bold dark:text-rose-400" style={{ color: '#be123c' }}>
                            {formatCurrency(debitAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">الرسوم</p>
                          <p className="font-bold dark:text-amber-400" style={{ color: '#d97706' }}>
                            {formatCurrency(fees)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">المبلغ المحصل</p>
                          <p className="font-bold dark:text-emerald-400" style={{ color: '#047857' }}>
                            {formatCurrency(collectionAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ملاحظات */}
            <div>
              <Label htmlFor="notes" className="font-medium">
                ملاحظات إضافية
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded text-sm dark:text-red-300" style={{ color: '#dc2626' }}>
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* الأزرار */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FileText className="ml-2 h-4 w-4" />
                    إنشاء الفاتورة
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

