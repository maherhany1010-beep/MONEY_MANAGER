'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SearchableSelect, type SearchableSelectOption } from '@/components/ui/searchable-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/design-system'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { TransferFormData, TransferStatus, TransferType, FeeBearer } from '@/stores/central-transfers-store'

export interface AccountOption {
  id: string
  name: string
  balance: number
  type: string
  isActive: boolean
  dailyLimit?: number
  dailyUsed?: number
}

interface TransferFormProps {
  accounts: AccountOption[]
  onSubmit: (data: TransferFormData, executionStatus: TransferStatus) => Promise<void>
  isLoading?: boolean
}

export function TransferForm({ accounts, onSubmit, isLoading = false }: TransferFormProps) {
  const [formData, setFormData] = useState<TransferFormData>({
    fromAccountId: '',
    toAccountId: '',
    baseAmount: 0,
    fees: 0,
    feeType: 'fixed',
    feeBearer: 'sender',
    transferType: 'instant',
    notes: '',
  })

  const [executionStatus, setExecutionStatus] = useState<TransferStatus>('successful')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSummary, setShowSummary] = useState(false)

  // Filter active accounts
  const activeAccounts = useMemo(() => accounts.filter(a => a.isActive), [accounts])

  // Get selected accounts
  const fromAccount = activeAccounts.find(a => a.id === formData.fromAccountId)
  const toAccount = activeAccounts.find(a => a.id === formData.toAccountId)

  // Calculate actual fees based on type
  const calculatedFees = formData.feeType === 'percentage'
    ? (formData.baseAmount * formData.fees) / 100
    : formData.fees

  // Calculate totals
  const totalDebit = formData.feeBearer === 'sender'
    ? formData.baseAmount + calculatedFees
    : formData.baseAmount

  const totalCredit = formData.feeBearer === 'receiver'
    ? formData.baseAmount - calculatedFees
    : formData.baseAmount

  const netProfit = formData.transferType === 'instant' && formData.actualPaidAmount
    ? formData.actualPaidAmount - calculatedFees - formData.baseAmount
    : 0

  // Check if recipient is a customer
  const isRecipientCustomer = toAccount?.type === 'customer'

  // Convert accounts to searchable options
  const fromAccountOptions: SearchableSelectOption[] = useMemo(() =>
    activeAccounts.map(acc => ({
      value: acc.id,
      label: acc.name,
      description: `${formatCurrency(acc.balance)} - ${acc.type}`,
    })),
    [activeAccounts]
  )

  const toAccountOptions: SearchableSelectOption[] = useMemo(() =>
    activeAccounts
      .filter(a => a.id !== formData.fromAccountId)
      .map(acc => ({
        value: acc.id,
        label: acc.name,
        description: `${formatCurrency(acc.balance)} - ${acc.type}`,
      })),
    [activeAccounts, formData.fromAccountId]
  )

  // Get receiving account options (all active accounts except source)
  const receivingAccountOptions: SearchableSelectOption[] = useMemo(() =>
    activeAccounts
      .filter(a => a.id !== formData.fromAccountId)
      .map(acc => ({
        value: acc.id,
        label: acc.name,
        description: `${formatCurrency(acc.balance)} - ${acc.type}`,
      })),
    [activeAccounts, formData.fromAccountId]
  )

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fromAccountId) newErrors.fromAccountId = 'اختر حساب المصدر'
    if (!formData.toAccountId) newErrors.toAccountId = 'اختر حساب المستقبل'
    if (formData.fromAccountId === formData.toAccountId) {
      newErrors.toAccountId = 'يجب أن يكون الحساب المستقبل مختلفاً عن المصدر'
    }
    if (formData.baseAmount <= 0) newErrors.baseAmount = 'أدخل مبلغاً موجباً'
    if (formData.fees < 0) newErrors.fees = 'الرسوم لا يمكن أن تكون سالبة'
    if (fromAccount && totalDebit > fromAccount.balance) {
      newErrors.baseAmount = 'الرصيد غير كافٍ'
    }

    // Validation for customer recipients
    if (isRecipientCustomer) {
      if (formData.transferType === 'instant' && !formData.actualPaidAmount) {
        newErrors.actualPaidAmount = 'أدخل المبلغ المدفوع فعلياً'
      }
      if (formData.transferType === 'instant' && !formData.receivingAccountForPayment) {
        newErrors.receivingAccountForPayment = 'اختر حساب التحصيل'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit(formData, executionStatus)
      // Reset form
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        baseAmount: 0,
        fees: 0,
        feeType: 'fixed',
        feeBearer: 'sender',
        transferType: 'instant',
        notes: '',
      })
      setShowSummary(false)
    } catch (err) {
      console.error('Error submitting transfer:', err)
    }
  }

  if (showSummary) {
    return (
      <Card className="border-2 border-slate-600/50">
        <CardHeader>
          <CardTitle>ملخص المعاملة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">من:</span>
              <span className="font-semibold">{fromAccount?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">إلى:</span>
              <span className="font-semibold">{toAccount?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">المبلغ الأساسي:</span>
              <span className="font-semibold">{formatCurrency(formData.baseAmount)}</span>
            </div>
            {formData.fees > 0 && (
              <>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">الرسوم ({formData.feeType === 'percentage' ? `${formData.fees}%` : 'ثابتة'}):</span>
                  <span className="font-semibold">{formatCurrency(calculatedFees)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">من يتحمل الرسوم:</span>
                  <span className="font-semibold">{formData.feeBearer === 'sender' ? 'المرسل' : 'المستقبل'}</span>
                </div>
              </>
            )}
            {formData.transferType === 'instant' && (
              <>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">المبلغ المدفوع:</span>
                  <span className="font-semibold">{formatCurrency(formData.actualPaidAmount || 0)}</span>
                </div>
                {netProfit > 0 && (
                  <div className="flex justify-between items-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-500/30">
                    <span className="text-sm text-green-700 dark:text-green-400">صافي الربح:</span>
                    <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(netProfit)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Execution Status Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">حالة التنفيذ</Label>
            <RadioGroup value={executionStatus} onValueChange={(value) => setExecutionStatus(value as TransferStatus)}>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="successful" id="successful" />
                <Label htmlFor="successful" className="cursor-pointer flex-1">
                  <div className="font-semibold">ناجحة</div>
                  <div className="text-xs text-muted-foreground">سيتم إضافة المبلغ للحساب المستقبل فوراً</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer flex-1">
                  <div className="font-semibold">معلقة</div>
                  <div className="text-xs text-muted-foreground">سيتم تسجيل المبلغ كمعلق ويمكن تحديثه لاحقاً</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSummary(false)}
              variant="outline"
              className="flex-1"
            >
              تعديل
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'جاري المعالجة...' : 'تأكيد التحويل'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-slate-600/50">
      <CardHeader>
        <CardTitle>إنشاء تحويل جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); validateForm() && setShowSummary(true) }} className="space-y-6">
          {/* From Account */}
          <div className="space-y-2">
            <Label htmlFor="from-account">الحساب المصدر</Label>
            <SearchableSelect
              options={fromAccountOptions}
              value={formData.fromAccountId}
              onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
              placeholder="اختر حساب المصدر"
              searchPlaceholder="ابحث عن الحساب..."
              className={errors.fromAccountId ? 'border-red-500' : ''}
            />
            {errors.fromAccountId && <p className="text-xs text-red-500">{errors.fromAccountId}</p>}
          </div>

          {/* To Account */}
          <div className="space-y-2">
            <Label htmlFor="to-account">الحساب المستقبل</Label>
            <SearchableSelect
              options={toAccountOptions}
              value={formData.toAccountId}
              onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
              placeholder="اختر حساب المستقبل"
              searchPlaceholder="ابحث عن الحساب..."
              className={errors.toAccountId ? 'border-red-500' : ''}
            />
            {errors.toAccountId && <p className="text-xs text-red-500">{errors.toAccountId}</p>}
          </div>

          {/* Base Amount */}
          <div className="space-y-2">
            <Label htmlFor="base-amount">المبلغ الأساسي</Label>
            <Input
              id="base-amount"
              type="number"
              placeholder="0.00"
              value={formData.baseAmount || ''}
              onChange={(e) => setFormData({ ...formData, baseAmount: parseFloat(e.target.value) || 0 })}
              className={errors.baseAmount ? 'border-red-500' : ''}
            />
            {errors.baseAmount && <p className="text-xs text-red-500">{errors.baseAmount}</p>}
          </div>

          {/* Fees */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fees">الرسوم</Label>
              <Input
                id="fees"
                type="number"
                placeholder="0.00"
                value={formData.fees || ''}
                onChange={(e) => setFormData({ ...formData, fees: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الرسوم</Label>
              <Select value={formData.feeType} onValueChange={(value) => setFormData({ ...formData, feeType: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">رقم ثابت</SelectItem>
                  <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>من يتحمل الرسوم</Label>
              <Select value={formData.feeBearer} onValueChange={(value) => setFormData({ ...formData, feeBearer: value as FeeBearer })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sender">المرسل</SelectItem>
                  <SelectItem value="receiver">المستقبل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transfer Type - Only show for customer recipients */}
          {isRecipientCustomer && (
            <div className="space-y-2">
              <Label>نوع التحويل</Label>
              <RadioGroup value={formData.transferType} onValueChange={(value) => setFormData({ ...formData, transferType: value as TransferType })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant" className="cursor-pointer">فوري</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deferred" id="deferred" />
                  <Label htmlFor="deferred" className="cursor-pointer">آجل</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Actual Paid Amount - Only show for customer recipients */}
          {isRecipientCustomer && (
            <div className="space-y-2">
              <Label htmlFor="actual-paid">المبلغ المدفوع فعلياً</Label>
              <Input
                id="actual-paid"
                type="number"
                placeholder="0.00"
                value={formData.actualPaidAmount || ''}
                onChange={(e) => setFormData({ ...formData, actualPaidAmount: parseFloat(e.target.value) || 0 })}
                className={errors.actualPaidAmount ? 'border-red-500' : ''}
              />
              {errors.actualPaidAmount && <p className="text-xs text-red-500">{errors.actualPaidAmount}</p>}
            </div>
          )}

          {/* Receiving Account for Payment - Only show for customer recipients with instant transfer */}
          {isRecipientCustomer && formData.transferType === 'instant' && (
            <div className="space-y-2">
              <Label htmlFor="receiving-account">حساب التحصيل</Label>
              <SearchableSelect
                options={receivingAccountOptions}
                value={formData.receivingAccountForPayment || ''}
                onValueChange={(value) => setFormData({ ...formData, receivingAccountForPayment: value })}
                placeholder="اختر حساب التحصيل"
                searchPlaceholder="ابحث عن الحساب..."
                className={errors.receivingAccountForPayment ? 'border-red-500' : ''}
              />
              {errors.receivingAccountForPayment && <p className="text-xs text-red-500">{errors.receivingAccountForPayment}</p>}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Input
              id="notes"
              placeholder="أضف ملاحظات اختيارية"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            عرض الملخص
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

