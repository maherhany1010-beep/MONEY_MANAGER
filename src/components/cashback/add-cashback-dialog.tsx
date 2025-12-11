'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCashback } from '@/contexts/cashback-context'
import { Plus, AlertCircle, CheckCircle, Loader2, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'

interface AddCashbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: string
}

export function AddCashbackDialog({ open, onOpenChange, cardId }: AddCashbackDialogProps) {
  const { addCashbackRecord } = useCashback()

  const [formData, setFormData] = useState({
    amount: '',
    earnedDate: new Date().toISOString().split('T')[0],
    source: '',
    description: '',
    autoRedeemEnabled: false,
    autoRedeemDays: '30',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // حساب تاريخ الاسترداد التلقائي المتوقع
  const calculateAutoRedeemDate = () => {
    if (!formData.autoRedeemEnabled || !formData.autoRedeemDays) return null
    const date = new Date(formData.earnedDate)
    date.setDate(date.getDate() + parseInt(formData.autoRedeemDays))
    return date.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // التحقق من البيانات
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('يرجى إدخال مبلغ صحيح')
      }

      if (!formData.source.trim()) {
        throw new Error('يرجى إدخال مصدر الكاش باك')
      }

      if (formData.autoRedeemEnabled && (!formData.autoRedeemDays || parseInt(formData.autoRedeemDays) <= 0)) {
        throw new Error('يرجى إدخال عدد أيام صحيح للاسترداد التلقائي')
      }

      // إضافة سجل الكاش باك
      addCashbackRecord({
        cardId,
        amount: parseFloat(formData.amount),
        earnedDate: formData.earnedDate,
        source: formData.source,
        description: formData.description || undefined,
        autoRedeemEnabled: formData.autoRedeemEnabled,
        autoRedeemDays: formData.autoRedeemEnabled ? parseInt(formData.autoRedeemDays) : 0,
      })

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setFormData({
          amount: '',
          earnedDate: new Date().toISOString().split('T')[0],
          source: '',
          description: '',
          autoRedeemEnabled: false,
          autoRedeemDays: '30',
        })
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة الكاش باك')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      amount: '',
      earnedDate: new Date().toISOString().split('T')[0],
      source: '',
      description: '',
      autoRedeemEnabled: false,
      autoRedeemDays: '30',
    })
    setError('')
    setSuccess(false)
  }

  const autoRedeemDate = calculateAutoRedeemDate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-purple-100 dark:border-purple-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-purple-100 dark:border-purple-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            إضافة كاش باك جديد
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            سجل كاش باك جديد تم الحصول عليه من عملية شراء
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            <p className="text-lg font-semibold text-green-700 dark:text-green-400">
              تم إضافة الكاش باك بنجاح!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* معلومات الكاش باك الأساسية */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-sm font-bold dark:text-purple-100 mb-4" style={{ color: '#7e22ce' }}>
                معلومات الكاش باك
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="dark:text-purple-100 font-medium" style={{ color: '#7e22ce' }}>
                      المبلغ (جنيه) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="مثال: 50.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="earnedDate" className="dark:text-purple-100 font-medium" style={{ color: '#7e22ce' }}>
                      تاريخ الحصول *
                    </Label>
                    <Input
                      id="earnedDate"
                      type="date"
                      value={formData.earnedDate}
                      onChange={(e) => setFormData({ ...formData, earnedDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="source" className="dark:text-purple-100 font-medium" style={{ color: '#7e22ce' }}>
                    المصدر *
                  </Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="مثال: عملية شراء من كارفور، تسوق أونلاين، إلخ"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="dark:text-purple-100 font-medium" style={{ color: '#7e22ce' }}>
                    الوصف (اختياري)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="تفاصيل إضافية عن الكاش باك..."
                  />
                </div>
              </div>
            </div>

            {/* إعدادات الاسترداد التلقائي */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-100">
                    الاسترداد التلقائي
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    استرداد الكاش باك تلقائياً بعد عدد أيام محدد
                  </p>
                </div>
                <Switch
                  checked={formData.autoRedeemEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoRedeemEnabled: checked })}
                />
              </div>

              {formData.autoRedeemEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="autoRedeemDays" className="text-blue-700 dark:text-blue-100 font-medium mb-2 block">
                      عدد الأيام للاسترداد التلقائي *
                    </Label>
                    <Input
                      id="autoRedeemDays"
                      type="number"
                      min="1"
                      value={formData.autoRedeemDays}
                      onChange={(e) => setFormData({ ...formData, autoRedeemDays: e.target.value })}
                      required={formData.autoRedeemEnabled}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      اختيارات سريعة:
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '1' })}
                        className="text-xs"
                      >
                        يوم
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '2' })}
                        className="text-xs"
                      >
                        يومين
                      </Button>
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
                        onClick={() => setFormData({ ...formData, autoRedeemDays: '90' })}
                        className="text-xs"
                      >
                        3 أشهر
                      </Button>
                    </div>
                  </div>

                  {autoRedeemDate && (
                    <div className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-300 dark:border-blue-600">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">تاريخ الاسترداد التلقائي المتوقع: </span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">
                          {autoRedeemDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ملخص */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="p-4 bg-muted rounded-lg border">
                <h3 className="text-sm font-bold mb-3">ملخص الكاش باك</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(parseFloat(formData.amount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المصدر:</span>
                    <span className="font-medium">{formData.source || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الحصول:</span>
                    <span className="font-medium">{formData.earnedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسترداد التلقائي:</span>
                    <span className="font-medium">
                      {formData.autoRedeemEnabled ? `✅ بعد ${formData.autoRedeemDays} يوم` : '❌ معطل'}
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
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    إضافة الكاش باك
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

