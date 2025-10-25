'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCashback } from '@/contexts/cashback-context'
import { RedemptionType } from '@/types/cashback'
import { Settings, AlertCircle, CheckCircle, Loader2, DollarSign, Ticket } from 'lucide-react'

interface CashbackSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: string
}

export function CashbackSettingsDialog({ open, onOpenChange, cardId }: CashbackSettingsDialogProps) {
  const { getCardSettings, updateCardSettings } = useCashback()

  const [formData, setFormData] = useState({
    cashbackEnabled: true,
    cashbackRate: '1',
    autoRedeemEnabled: false,
    autoRedeemDays: '30',
    autoRedeemType: 'balance' as RedemptionType,
    autoRedeemStoreName: '',
    minRedemptionAmount: '10',
    maxCashbackPerTransaction: '1000',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // تحميل الإعدادات الحالية
  useEffect(() => {
    const settings = getCardSettings(cardId)
    if (settings) {
      setFormData({
        cashbackEnabled: settings.cashbackEnabled,
        cashbackRate: settings.cashbackRate.toString(),
        autoRedeemEnabled: settings.autoRedeemEnabled,
        autoRedeemDays: settings.autoRedeemDays.toString(),
        autoRedeemType: settings.autoRedeemType,
        autoRedeemStoreName: settings.autoRedeemStoreName || '',
        minRedemptionAmount: settings.minRedemptionAmount.toString(),
        maxCashbackPerTransaction: settings.maxCashbackPerTransaction.toString(),
      })
    }
  }, [cardId, getCardSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // التحقق من البيانات
      if (parseFloat(formData.cashbackRate) < 0 || parseFloat(formData.cashbackRate) > 100) {
        throw new Error('نسبة الكاش باك يجب أن تكون بين 0 و 100')
      }

      if (formData.autoRedeemEnabled && parseInt(formData.autoRedeemDays) <= 0) {
        throw new Error('عدد الأيام يجب أن يكون أكبر من صفر')
      }

      if (formData.autoRedeemEnabled && formData.autoRedeemType === 'voucher' && !formData.autoRedeemStoreName.trim()) {
        throw new Error('يرجى إدخال اسم المكان للقسيمة')
      }

      if (parseFloat(formData.minRedemptionAmount) < 0) {
        throw new Error('الحد الأدنى للاسترداد يجب أن يكون أكبر من أو يساوي صفر')
      }

      if (parseFloat(formData.maxCashbackPerTransaction) <= 0) {
        throw new Error('الحد الأقصى للكاش باك يجب أن يكون أكبر من صفر')
      }

      // حفظ الإعدادات
      updateCardSettings(cardId, {
        cashbackEnabled: formData.cashbackEnabled,
        cashbackRate: parseFloat(formData.cashbackRate),
        autoRedeemEnabled: formData.autoRedeemEnabled,
        autoRedeemDays: parseInt(formData.autoRedeemDays),
        autoRedeemType: formData.autoRedeemType,
        autoRedeemStoreName: formData.autoRedeemType === 'voucher' ? formData.autoRedeemStoreName : undefined,
        minRedemptionAmount: parseFloat(formData.minRedemptionAmount),
        maxCashbackPerTransaction: parseFloat(formData.maxCashbackPerTransaction),
      })

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-indigo-100 dark:border-indigo-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-indigo-100 dark:border-indigo-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            إعدادات الكاش باك
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            تخصيص إعدادات الكاش باك والاسترداد التلقائي للبطاقة
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle className="h-16 w-16 dark:text-green-400" style={{ color: '#16a34a' }} />
            <p className="text-lg font-semibold dark:text-green-400" style={{ color: '#15803d' }}>
              تم حفظ الإعدادات بنجاح!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* الإعدادات العامة */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-sm font-bold dark:text-purple-100 mb-4" style={{ color: '#7e22ce' }}>
                الإعدادات العامة
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">تفعيل الكاش باك</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      تفعيل أو تعطيل نظام الكاش باك للبطاقة
                    </p>
                  </div>
                  <Switch
                    checked={formData.cashbackEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, cashbackEnabled: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="cashbackRate" className="dark:text-purple-100 font-medium" style={{ color: '#7e22ce' }}>
                    نسبة الكاش باك (%)
                  </Label>
                  <Input
                    id="cashbackRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.cashbackRate}
                    onChange={(e) => setFormData({ ...formData, cashbackRate: e.target.value })}
                    disabled={!formData.cashbackEnabled}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    النسبة المئوية للكاش باك من كل عملية شراء
                  </p>
                </div>
              </div>
            </div>

            {/* إعدادات الاسترداد التلقائي */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold dark:text-blue-100" style={{ color: '#1d4ed8' }}>
                    الاسترداد التلقائي
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    استرداد الكاش باك تلقائياً بعد عدد أيام محدد
                  </p>
                </div>
                <Switch
                  checked={formData.autoRedeemEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoRedeemEnabled: checked })}
                  disabled={!formData.cashbackEnabled}
                />
              </div>

              {formData.autoRedeemEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="autoRedeemDays" className="dark:text-blue-100 font-medium mb-2 block" style={{ color: '#1d4ed8' }}>
                      عدد الأيام للاسترداد التلقائي
                    </Label>
                    <Input
                      id="autoRedeemDays"
                      type="number"
                      min="1"
                      value={formData.autoRedeemDays}
                      onChange={(e) => setFormData({ ...formData, autoRedeemDays: e.target.value })}
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      اختيارات سريعة:
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '7' })}
                        className="text-xs"
                      >
                        أسبوع
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '14' })}
                        className="text-xs"
                      >
                        أسبوعين
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '30' })}
                        className="text-xs"
                      >
                        شهر
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '60' })}
                        className="text-xs"
                      >
                        شهرين
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '90' })}
                        className="text-xs"
                      >
                        3 أشهر
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '180' })}
                        className="text-xs"
                      >
                        6 أشهر
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="dark:text-blue-100 font-medium mb-3 block" style={{ color: '#1d4ed8' }}>
                      نوع الاسترداد التلقائي
                    </Label>
                    <RadioGroup
                      value={formData.autoRedeemType}
                      onValueChange={(value: RedemptionType) => setFormData({ ...formData, autoRedeemType: value })}
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="balance" id="auto-balance" />
                        <Label htmlFor="auto-balance" className="cursor-pointer flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          إضافة لرصيد البطاقة
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="voucher" id="auto-voucher" />
                        <Label htmlFor="auto-voucher" className="cursor-pointer flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          قسيمة مشتريات
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.autoRedeemType === 'voucher' && (
                    <div>
                      <Label htmlFor="autoRedeemStoreName" className="dark:text-blue-100 font-medium" style={{ color: '#1d4ed8' }}>
                        اسم المكان للقسيمة
                      </Label>
                      <Input
                        id="autoRedeemStoreName"
                        value={formData.autoRedeemStoreName}
                        onChange={(e) => setFormData({ ...formData, autoRedeemStoreName: e.target.value })}
                        placeholder="مثال: كارفور، سبينيس، هايبر وان"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* الحدود */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h3 className="text-sm font-bold dark:text-emerald-100 mb-4" style={{ color: '#047857' }}>
                الحدود
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="minRedemptionAmount" className="dark:text-emerald-100 font-medium" style={{ color: '#047857' }}>
                    الحد الأدنى للاسترداد (جنيه)
                  </Label>
                  <Input
                    id="minRedemptionAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minRedemptionAmount}
                    onChange={(e) => setFormData({ ...formData, minRedemptionAmount: e.target.value })}
                    disabled={!formData.cashbackEnabled}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    الحد الأدنى للمبلغ المطلوب لاسترداد الكاش باك
                  </p>
                </div>

                <div>
                  <Label htmlFor="maxCashbackPerTransaction" className="dark:text-emerald-100 font-medium" style={{ color: '#047857' }}>
                    الحد الأقصى للكاش باك لكل عملية (جنيه)
                  </Label>
                  <Input
                    id="maxCashbackPerTransaction"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxCashbackPerTransaction}
                    onChange={(e) => setFormData({ ...formData, maxCashbackPerTransaction: e.target.value })}
                    disabled={!formData.cashbackEnabled}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    الحد الأقصى للكاش باك الذي يمكن الحصول عليه من عملية واحدة
                  </p>
                </div>
              </div>
            </div>

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
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    حفظ الإعدادات
                  </>
                )}
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

