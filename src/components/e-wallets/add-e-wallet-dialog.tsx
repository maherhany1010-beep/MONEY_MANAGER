'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Wallet, Plus } from 'lucide-react'

interface AddEWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (wallet: any) => void
}

export function AddEWalletDialog({ open, onOpenChange, onAdd }: AddEWalletDialogProps) {
  const [formData, setFormData] = useState({
    walletName: '',
    provider: 'Vodafone Cash',
    phoneNumber: '',
    balance: '',
    dailyLimit: '',
    monthlyLimit: '',
    transactionLimit: '',
    holderName: '',
    holderNationalId: '',
    holderEmail: '',
    walletType: 'personal',
    status: 'active',
    isVerified: false,
    kycLevel: '1',
    depositFee: '',
    withdrawalFee: '',
    transferFee: '',
    description: '',
    notes: '',
  })

  const providers = [
    { value: 'Vodafone Cash', label: 'فودافون كاش' },
    { value: 'Etisalat Cash', label: 'اتصالات كاش' },
    { value: 'Orange Cash', label: 'أورانج كاش' },
    { value: 'WE Pay', label: 'WE Pay' },
    { value: 'InstaPay', label: 'InstaPay' },
    { value: 'Other', label: 'أخرى' }
  ]

  const walletTypes = [
    { value: 'personal', label: 'محفظة شخصية' },
    { value: 'business', label: 'محفظة تجارية' },
    { value: 'savings', label: 'محفظة توفير' }
  ]

  const statuses = [
    { value: 'active', label: 'نشطة' },
    { value: 'suspended', label: 'معلقة' },
    { value: 'blocked', label: 'محظورة' }
  ]

  const kycLevels = [
    { value: '1', label: 'مستوى 1 - أساسي' },
    { value: '2', label: 'مستوى 2 - متوسط' },
    { value: '3', label: 'مستوى 3 - متقدم' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من الحقول الإجبارية
    if (!formData.phoneNumber.trim()) {
      alert('الرجاء إدخال رقم المحفظة')
      return
    }

    if (!formData.balance) {
      alert('الرجاء إدخال الرصيد')
      return
    }

    if (!formData.dailyLimit) {
      alert('الرجاء إدخال الحد اليومي')
      return
    }

    if (!formData.monthlyLimit) {
      alert('الرجاء إدخال الحد الشهري')
      return
    }

    if (!formData.transactionLimit) {
      alert('الرجاء إدخال حد المعاملة الواحدة')
      return
    }

    const wallet = {
      walletName: formData.walletName || formData.provider,
      provider: formData.provider,
      phoneNumber: formData.phoneNumber,
      balance: parseFloat(formData.balance) || 0,
      dailyLimit: parseFloat(formData.dailyLimit) || 0,
      monthlyLimit: parseFloat(formData.monthlyLimit) || 0,
      transactionLimit: parseFloat(formData.transactionLimit) || 0,
      holderName: formData.holderName || undefined,
      holderNationalId: formData.holderNationalId || undefined,
      holderEmail: formData.holderEmail || undefined,
      walletType: formData.walletType,
      status: formData.status,
      isVerified: formData.isVerified,
      kycLevel: parseInt(formData.kycLevel) as 1 | 2 | 3,
      depositFee: parseFloat(formData.depositFee) || undefined,
      withdrawalFee: parseFloat(formData.withdrawalFee) || undefined,
      transferFee: parseFloat(formData.transferFee) || undefined,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    }

    if (onAdd) {
      onAdd(wallet)
    }

    // Reset form
    setFormData({
      walletName: '',
      provider: 'Vodafone Cash',
      phoneNumber: '',
      balance: '',
      dailyLimit: '',
      monthlyLimit: '',
      transactionLimit: '',
      holderName: '',
      holderNationalId: '',
      holderEmail: '',
      walletType: 'personal',
      status: 'active',
      isVerified: false,
      kycLevel: '1',
      depositFee: '',
      withdrawalFee: '',
      transferFee: '',
      description: '',
      notes: '',
    })

    onOpenChange(false)
  }

  const isFormValid = formData.phoneNumber && formData.balance && formData.dailyLimit && formData.monthlyLimit && formData.transactionLimit

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-violet-100 dark:border-violet-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-violet-100 dark:border-violet-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <Wallet className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            إضافة محفظة إلكترونية جديدة
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            أدخل معلومات المحفظة الإلكترونية الجديدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* المعلومات الأساسية */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">المعلومات الأساسية</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">رقم المحفظة *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="01012345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">مزود الخدمة</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletName">اسم المحفظة</Label>
                  <Input
                    id="walletName"
                    placeholder="مثال: فودافون كاش الرئيسية"
                    value={formData.walletName}
                    onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletType">نوع المحفظة</Label>
                  <Select
                    value={formData.walletType}
                    onValueChange={(value) => setFormData({ ...formData, walletType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {walletTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>

            {/* الرصيد والحدود الإجبارية */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">الرصيد والحدود *</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="balance">الرصيد الأولي (جنيه) *</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
                    placeholder="2000"
                    value={formData.transactionLimit}
                    onChange={(e) => setFormData({ ...formData, transactionLimit: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* بيانات صاحب المحفظة */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">بيانات صاحب المحفظة</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="holderName">الاسم الكامل</Label>
                  <Input
                    id="holderName"
                    placeholder="الاسم الكامل"
                    value={formData.holderName}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="holderEmail">البريد الإلكتروني</Label>
                  <Input
                    id="holderEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.holderEmail}
                    onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* مستوى التحقق والرسوم */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">مستوى التحقق والرسوم</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kycLevel">مستوى التحقق (KYC)</Label>
                  <Select
                    value={formData.kycLevel}
                    onValueChange={(value) => setFormData({ ...formData, kycLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kycLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    مستوى التحقق من هوية صاحب المحفظة
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-sm">الرسوم (نسبة مئوية)</h5>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="depositFee">رسوم الإيداع %</Label>
                    <Input
                      id="depositFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.depositFee}
                      onChange={(e) => setFormData({ ...formData, depositFee: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="withdrawalFee">رسوم السحب %</Label>
                    <Input
                      id="withdrawalFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.withdrawalFee}
                      onChange={(e) => setFormData({ ...formData, withdrawalFee: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transferFee">رسوم التحويل %</Label>
                    <Input
                      id="transferFee"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.transferFee}
                      onChange={(e) => setFormData({ ...formData, transferFee: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* الوصف والملاحظات */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">معلومات إضافية</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف مختصر للمحفظة واستخدامها"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    placeholder="ملاحظات إضافية"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة المحفظة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

