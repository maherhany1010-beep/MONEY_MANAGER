'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCashback } from '@/contexts/cashback-context'
import { RedemptionType, RedemptionMode } from '@/types/cashback'
import { Gift, AlertCircle, CheckCircle, Loader2, DollarSign, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'

interface RedeemCashbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cashbackId: string
  cardId: string
}

export function RedeemCashbackDialog({ open, onOpenChange, cashbackId, cardId }: RedeemCashbackDialogProps) {
  const { getCashbackRecord, redeemCashback } = useCashback()

  const cashbackRecord = useMemo(() => getCashbackRecord(cashbackId), [cashbackId, getCashbackRecord])

  const [redemptionMode, setRedemptionMode] = useState<RedemptionMode>('full')
  const [redemptionType, setRedemptionType] = useState<RedemptionType>('balance')
  const [formData, setFormData] = useState({
    amount: '',
    storeName: '',
    voucherCode: '',
    expiryDate: '',
    notes: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const availableAmount = cashbackRecord?.remainingAmount || 0
  const redemptionAmount = redemptionMode === 'full' ? availableAmount : parseFloat(formData.amount) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // التحقق من البيانات
      if (!cashbackRecord) {
        throw new Error('سجل الكاش باك غير موجود')
      }

      if (redemptionMode === 'partial' && !formData.amount) {
        throw new Error('يرجى إدخال المبلغ المراد استرداده')
      }

      if (redemptionAmount <= 0) {
        throw new Error('المبلغ يجب أن يكون أكبر من صفر')
      }

      if (redemptionAmount > availableAmount) {
        throw new Error('المبلغ المطلوب أكبر من الرصيد المتاح')
      }

      if (redemptionType === 'voucher' && !formData.storeName.trim()) {
        throw new Error('يرجى إدخال اسم المكان للقسيمة')
      }

      // إنشاء عملية الاسترداد
      redeemCashback(cashbackId, redemptionAmount)

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setFormData({
          amount: '',
          storeName: '',
          voucherCode: '',
          expiryDate: '',
          notes: '',
        })
        setRedemptionMode('full')
        setRedemptionType('balance')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء استرداد الكاش باك')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      amount: '',
      storeName: '',
      voucherCode: '',
      expiryDate: '',
      notes: '',
    })
    setRedemptionMode('full')
    setRedemptionType('balance')
    setError('')
    setSuccess(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-pink-100 dark:border-pink-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-pink-100 dark:border-pink-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Gift className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            استرداد الكاش باك
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            استرد الكاش باك المتاح إلى رصيد البطاقة أو كقسيمة مشتريات
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">
              تم استرداد الكاش باك بنجاح!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* معلومات الكاش باك */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-sm font-bold text-purple-700 dark:text-purple-100 mb-3">
                معلومات الكاش باك
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">المبلغ الإجمالي</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(cashbackRecord?.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">المبلغ المتاح</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(availableAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">المصدر</p>
                  <p className="font-medium">{cashbackRecord?.source || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">تاريخ الحصول</p>
                  <p className="font-medium">{cashbackRecord?.earnedDate || '-'}</p>
                </div>
              </div>
            </div>

            {/* نوع الاسترداد (كلي أو جزئي) */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <Label className="text-sm font-bold dark:text-blue-100 mb-3 block" style={{ color: '#1d4ed8' }}>
                نوع الاسترداد *
              </Label>
              <RadioGroup value={redemptionMode} onValueChange={(value: RedemptionMode) => setRedemptionMode(value)}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="cursor-pointer">
                    استرداد كلي ({formatCurrency(availableAmount)})
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial" className="cursor-pointer">استرداد جزئي</Label>
                </div>
              </RadioGroup>

              {redemptionMode === 'partial' && (
                <div className="mt-4">
                  <Label htmlFor="amount" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                    المبلغ المراد استرداده (جنيه) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    max={availableAmount}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder={`الحد الأقصى: ${formatCurrency(availableAmount)}`}
                    required={redemptionMode === 'partial'}
                  />
                </div>
              )}
            </div>

            {/* طريقة الاسترداد */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <Label className="text-sm font-bold dark:text-emerald-100 mb-3 block" style={{ color: '#047857' }}>
                طريقة الاسترداد *
              </Label>
              <RadioGroup value={redemptionType} onValueChange={(value: RedemptionType) => setRedemptionType(value)}>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="balance" id="balance" />
                  <Label htmlFor="balance" className="cursor-pointer flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    إضافة لرصيد البطاقة
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="voucher" id="voucher" />
                  <Label htmlFor="voucher" className="cursor-pointer flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    قسيمة مشتريات
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* تفاصيل القسيمة */}
            {redemptionType === 'voucher' && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-700">
                <h3 className="text-sm font-bold dark:text-orange-100 mb-3" style={{ color: '#c2410c' }}>
                  تفاصيل القسيمة
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storeName" className="dark:text-orange-100 font-medium" style={{ color: '#c2410c' }}>
                      اسم المكان *
                    </Label>
                    <Input
                      id="storeName"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      placeholder="مثال: كارفور، سبينيس، هايبر وان"
                      required={redemptionType === 'voucher'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="voucherCode" className="dark:text-orange-100 font-medium" style={{ color: '#c2410c' }}>
                      كود القسيمة (اختياري)
                    </Label>
                    <Input
                      id="voucherCode"
                      value={formData.voucherCode}
                      onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value })}
                      placeholder="مثال: VOUCHER123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate" className="dark:text-orange-100 font-medium" style={{ color: '#c2410c' }}>
                      تاريخ انتهاء القسيمة (اختياري)
                    </Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
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
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            {/* ملخص الاسترداد */}
            {redemptionAmount > 0 && (
              <div className="p-4 bg-muted rounded-lg border">
                <h3 className="text-sm font-bold mb-3">ملخص الاسترداد</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ المسترد:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(redemptionAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">طريقة الاسترداد:</span>
                    <span className="font-medium">
                      {redemptionType === 'balance' ? '💰 رصيد البطاقة' : '🎫 قسيمة مشتريات'}
                    </span>
                  </div>
                  {redemptionType === 'voucher' && formData.storeName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المكان:</span>
                      <span className="font-medium">{formData.storeName}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">المتبقي بعد الاسترداد:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(availableAmount - redemptionAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* رسالة الخطأ */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded text-sm dark:text-red-300" style={{ color: '#dc2626' }}>
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* الأزرار */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الاسترداد...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    استرداد الكاش باك
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                إعادة تعيين
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

