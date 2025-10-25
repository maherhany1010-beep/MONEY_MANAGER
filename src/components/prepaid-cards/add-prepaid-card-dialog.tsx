'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, CreditCard } from 'lucide-react'
import { toast } from '@/lib/toast'

interface AddPrepaidCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (card: any) => void
}

export function AddPrepaidCardDialog({ open, onOpenChange, onAdd }: AddPrepaidCardDialogProps) {
  const [formData, setFormData] = useState({
    cardName: '',
    provider: 'فوري',
    cardNumber: '',
    balance: '',
    dailyLimit: '',
    monthlyLimit: '',
    transactionLimit: '',
    holderName: '',
    holderNationalId: '',
    holderPhone: '',
    holderEmail: '',
    cardType: 'physical',
    expiryDate: '',
    notes: '',
  })

  const providers = [
    { value: 'فوري', label: 'فوري' },
    { value: 'أمان', label: 'أمان' },
    { value: 'ممكن', label: 'ممكن' },
    { value: 'أخرى', label: 'أخرى' }
  ]

  const cardTypes = [
    { value: 'physical', label: 'بطاقة فيزيائية' },
    { value: 'virtual', label: 'بطاقة افتراضية' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من الحقول الإجبارية
    if (!formData.cardName.trim()) {
      toast.error('الرجاء إدخال اسم البطاقة')
      return
    }

    if (!formData.cardNumber.trim()) {
      toast.error('الرجاء إدخال رقم البطاقة')
      return
    }

    if (!formData.balance) {
      toast.error('الرجاء إدخال الرصيد')
      return
    }

    if (!formData.dailyLimit) {
      toast.error('الرجاء إدخال الحد اليومي')
      return
    }

    if (!formData.monthlyLimit) {
      toast.error('الرجاء إدخال الحد الشهري')
      return
    }

    if (!formData.transactionLimit) {
      toast.error('الرجاء إدخال حد المعاملة الواحدة')
      return
    }

    const card = {
      cardName: formData.cardName,
      provider: formData.provider,
      cardNumber: formData.cardNumber,
      balance: parseFloat(formData.balance) || 0,
      dailyLimit: parseFloat(formData.dailyLimit) || 0,
      monthlyLimit: parseFloat(formData.monthlyLimit) || 0,
      transactionLimit: parseFloat(formData.transactionLimit) || 0,
      holderName: formData.holderName || undefined,
      holderNationalId: formData.holderNationalId || undefined,
      holderPhone: formData.holderPhone || undefined,
      holderEmail: formData.holderEmail || undefined,
      cardType: formData.cardType,
      expiryDate: formData.expiryDate || undefined,
      notes: formData.notes || undefined,
    }

    if (onAdd) {
      onAdd(card)
    }

    toast.success('تم إضافة البطاقة بنجاح')

    // Reset form
    setFormData({
      cardName: '',
      provider: 'فوري',
      cardNumber: '',
      balance: '',
      dailyLimit: '',
      monthlyLimit: '',
      transactionLimit: '',
      holderName: '',
      holderNationalId: '',
      holderPhone: '',
      holderEmail: '',
      cardType: 'physical',
      expiryDate: '',
      notes: '',
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            إضافة بطاقة مسبقة دفع جديدة
          </DialogTitle>
          <DialogDescription>
            أضف بطاقة مسبقة دفع جديدة (فوري، أمان، ممكن)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* البيانات الأساسية */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">البيانات الأساسية *</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardName">اسم البطاقة *</Label>
                <Input
                  id="cardName"
                  placeholder="مثال: فوري الرئيسية"
                  value={formData.cardName}
                  onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">المزود *</Label>
                <Select value={formData.provider} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">رقم البطاقة *</Label>
                <Input
                  id="cardNumber"
                  placeholder="6221234567890123"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardType">نوع البطاقة</Label>
                <Select value={formData.cardType} onValueChange={(value) => setFormData({ ...formData, cardType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* الرصيد والحدود */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">الرصيد والحدود *</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="balance">الرصيد الأولي (جنيه) *</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="5000"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyLimit">الحد اليومي (جنيه) *</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  placeholder="5000"
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">الحد الشهري (جنيه) *</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  placeholder="50000"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionLimit">حد المعاملة الواحدة (جنيه) *</Label>
                <Input
                  id="transactionLimit"
                  type="number"
                  placeholder="2000"
                  value={formData.transactionLimit}
                  onChange={(e) => setFormData({ ...formData, transactionLimit: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* بيانات صاحب البطاقة (اختيارية) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">بيانات صاحب البطاقة</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="holderName">الاسم الكامل</Label>
                <Input
                  id="holderName"
                  placeholder="أحمد محمد علي"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderPhone">رقم الهاتف</Label>
                <Input
                  id="holderPhone"
                  placeholder="01012345678"
                  value={formData.holderPhone}
                  onChange={(e) => setFormData({ ...formData, holderPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderNationalId">الرقم القومي</Label>
                <Input
                  id="holderNationalId"
                  placeholder="29012011234567"
                  value={formData.holderNationalId}
                  onChange={(e) => setFormData({ ...formData, holderNationalId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="holderEmail">البريد الإلكتروني</Label>
                <Input
                  id="holderEmail"
                  type="email"
                  placeholder="ahmed@example.com"
                  value={formData.holderEmail}
                  onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              placeholder="ملاحظات إضافية عن البطاقة"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 ml-2" />
              إضافة البطاقة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

