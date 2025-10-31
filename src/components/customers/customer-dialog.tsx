'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Customer, CustomerStatus, CustomerCategory } from '@/types/customer'
import { useCustomers } from '@/contexts/customers-context'
import { User, Building, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer // للتعديل
}

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const { addCustomer, updateCustomer } = useCustomers()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    profession: '',
    commercialRegister: '',
    status: 'active' as CustomerStatus,
    category: 'regular' as CustomerCategory,
    notes: '',
    debtAlertThreshold: '',
    initialDebt: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // تحميل بيانات العميل للتعديل
  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        company: customer.company || '',
        profession: customer.profession || '',
        commercialRegister: customer.commercialRegister || '',
        status: customer.status,
        category: customer.category,
        notes: customer.notes || '',
        debtAlertThreshold: customer.debtAlertThreshold?.toString() || '',
        initialDebt: customer.currentDebt?.toString() || '',
      })
    }
  }, [customer])

  // إعادة تعيين النموذج عند الإغلاق
  useEffect(() => {
    if (!open) {
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        profession: '',
        commercialRegister: '',
        status: 'active',
        category: 'regular',
        notes: '',
        debtAlertThreshold: '',
        initialDebt: '',
      })
      setError('')
      setSuccess(false)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // التحقق من الحقول المطلوبة
    if (!formData.fullName.trim()) {
      setError('يرجى إدخال اسم العميل')
      return
    }

    if (!formData.phone.trim()) {
      setError('يرجى إدخال رقم الهاتف')
      return
    }

    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^[0-9]{11}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('يرجى إدخال رقم هاتف صحيح (11 رقم)')
      return
    }

    // التحقق من البريد الإلكتروني إذا تم إدخاله
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('يرجى إدخال بريد إلكتروني صحيح')
        return
      }
    }

    try {
      if (customer) {
        // تحديث عميل موجود
        updateCustomer(customer.id, {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          company: formData.company.trim() || undefined,
          profession: formData.profession.trim() || undefined,
          commercialRegister: formData.commercialRegister.trim() || undefined,
          status: formData.status,
          category: formData.category,
          notes: formData.notes.trim() || undefined,
          debtAlertThreshold: formData.debtAlertThreshold ? parseFloat(formData.debtAlertThreshold) : undefined,
        })
      } else {
        // إضافة عميل جديد
        const initialDebt = formData.initialDebt ? parseFloat(formData.initialDebt) : 0
        addCustomer({
          name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          notes: formData.notes.trim() || null,
          fullName: formData.fullName.trim(),
          company: formData.company.trim() || undefined,
        })
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      setError('حدث خطأ أثناء حفظ البيانات')
      console.error('Customer save error:', err)
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
            <h3 className="text-xl font-bold text-green-900 mb-2">
              {customer ? 'تم التحديث بنجاح!' : 'تم الإضافة بنجاح!'}
            </h3>
            <p id="success-message" className="text-sm text-green-700">
              {customer ? 'تم تحديث بيانات العميل' : 'تم إضافة العميل الجديد'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-sky-100 dark:border-sky-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-sky-100 dark:border-sky-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <User className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            {customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            {customer ? 'تحديث معلومات العميل' : 'إضافة عميل جديد إلى النظام'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المعلومات الشخصية */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              المعلومات الشخصية
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01234567890"
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                    className="pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="المدينة، الشارع"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* معلومات العمل */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <h3 className="text-sm font-bold text-green-900 flex items-center gap-2">
              <Building className="h-4 w-4" />
              معلومات العمل
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">الشركة</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="اسم الشركة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">المهنة</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="المهنة أو التخصص"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="commercialRegister">رقم السجل التجاري</Label>
                <Input
                  id="commercialRegister"
                  value={formData.commercialRegister}
                  onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                  placeholder="رقم السجل التجاري (اختياري)"
                />
              </div>
            </div>
          </div>

          {/* الإعدادات */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
            <h3 className="text-sm font-bold text-purple-900">الإعدادات</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as CustomerStatus })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="blocked">محظور</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as CustomerCategory })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="regular">عادي</SelectItem>
                    <SelectItem value="new">جديد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debtAlertThreshold">حد التنبيه (جنيه)</Label>
                <Input
                  id="debtAlertThreshold"
                  type="number"
                  step="0.01"
                  value={formData.debtAlertThreshold}
                  onChange={(e) => setFormData({ ...formData, debtAlertThreshold: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {!customer && (
                <div className="space-y-2">
                  <Label htmlFor="initialDebt">الرصيد المبدئي للمديونية (جنيه)</Label>
                  <Input
                    id="initialDebt"
                    type="number"
                    step="0.01"
                    value={formData.initialDebt}
                    onChange={(e) => setFormData({ ...formData, initialDebt: e.target.value })}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">إذا كان العميل لديه مديونية سابقة</p>
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
              placeholder="ملاحظات إضافية عن العميل..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {customer ? 'تحديث البيانات' : 'إضافة العميل'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

