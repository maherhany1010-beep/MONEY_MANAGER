'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Wallet, Plus, Phone, DollarSign, User, CreditCard, Mail, FileText, Info } from 'lucide-react'

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
        className="max-w-4xl max-h-[85vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-5">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              إضافة محفظة إلكترونية جديدة
            </span>
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-400 mt-2 mr-12">
            أدخل معلومات المحفظة الإلكترونية الجديدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-2">
            {/* المعلومات الأساسية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  المعلومات الأساسية
                </h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="font-medium flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-violet-600" />
                    رقم المحفظة *
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="01012345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider" className="font-medium flex items-center gap-2 text-foreground">
                    <Wallet className="h-4 w-4 text-violet-600" />
                    مزود الخدمة
                  </Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                  >
                    <SelectTrigger className="text-foreground">
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
                  <Label htmlFor="walletName" className="font-medium flex items-center gap-2 text-foreground">
                    <Wallet className="h-4 w-4 text-violet-600" />
                    اسم المحفظة
                  </Label>
                  <Input
                    id="walletName"
                    placeholder="مثال: فودافون كاش الرئيسية"
                    value={formData.walletName}
                    onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="walletType" className="font-medium flex items-center gap-2 text-foreground">
                    <Wallet className="h-4 w-4 text-violet-600" />
                    نوع المحفظة
                  </Label>
                  <Select
                    value={formData.walletType}
                    onValueChange={(value) => setFormData({ ...formData, walletType: value })}
                  >
                    <SelectTrigger className="text-foreground">
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
            <div className="space-y-5 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  الرصيد والحدود *
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="balance" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                    الرصيد الأولي (جنيه) *
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyLimit" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                    الحد اليومي (جنيه) *
                  </Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={formData.dailyLimit}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                    الحد الشهري (جنيه) *
                  </Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionLimit" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-violet-600" />
                    حد المعاملة الواحدة (جنيه) *
                  </Label>
                  <Input
                    id="transactionLimit"
                    type="number"
                    step="0.01"
                    placeholder="2000"
                    value={formData.transactionLimit}
                    onChange={(e) => setFormData({ ...formData, transactionLimit: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* بيانات صاحب المحفظة */}
            <div className="space-y-5 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  بيانات صاحب المحفظة
                </h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="holderName" className="font-medium flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-violet-600" />
                    الاسم الكامل
                  </Label>
                  <Input
                    id="holderName"
                    placeholder="الاسم الكامل"
                    value={formData.holderName}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderNationalId" className="font-medium flex items-center gap-2 text-foreground">
                    <CreditCard className="h-4 w-4 text-violet-600" />
                    الرقم القومي
                  </Label>
                  <Input
                    id="holderNationalId"
                    placeholder="29012011234567"
                    value={formData.holderNationalId}
                    onChange={(e) => setFormData({ ...formData, holderNationalId: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="holderEmail" className="font-medium flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4 text-violet-600" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="holderEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.holderEmail}
                    onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* مستوى التحقق والرسوم */}
            <div className="space-y-5 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  مستوى التحقق والرسوم
                </h3>
              </div>

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
                  <p className="text-xs text-muted-foreground">
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

