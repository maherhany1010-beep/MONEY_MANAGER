'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Vault, Plus, MapPin, DollarSign, Shield, User, Phone, Mail, Info, FileText } from 'lucide-react'

interface AddCashVaultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (vault: any) => void
}

export function AddCashVaultDialog({ open, onOpenChange, onAdd }: AddCashVaultDialogProps) {
  const [formData, setFormData] = useState({
    vaultName: '',
    location: '',
    currency: 'EGP',
    balance: '',
    maxCapacity: '',
    minBalance: '',
    dailyWithdrawalLimit: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    vaultType: 'main',
    accessLevel: 'restricted',
    requiresApproval: true,
    description: '',
    notes: '',
  })

  const vaultTypes = [
    { value: 'main', label: 'خزينة رئيسية' },
    { value: 'branch', label: 'خزينة فرع' },
    { value: 'personal', label: 'خزينة شخصية' },
    { value: 'emergency', label: 'خزينة طوارئ' }
  ]

  const accessLevels = [
    { value: 'public', label: 'عام - يمكن للجميع الوصول' },
    { value: 'restricted', label: 'محدود - يتطلب صلاحيات' },
    { value: 'private', label: 'خاص - مقيد للغاية' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const vault = {
      vaultName: formData.vaultName,
      location: formData.location,
      currency: formData.currency,
      balance: parseFloat(formData.balance) || 0,
      maxCapacity: parseFloat(formData.maxCapacity) || undefined,
      minBalance: parseFloat(formData.minBalance) || undefined,
      dailyWithdrawalLimit: parseFloat(formData.dailyWithdrawalLimit) || undefined,
      managerName: formData.managerName || undefined,
      managerPhone: formData.managerPhone || undefined,
      managerEmail: formData.managerEmail || undefined,
      vaultType: formData.vaultType,
      accessLevel: formData.accessLevel,
      requiresApproval: formData.requiresApproval,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    }

    if (onAdd) {
      onAdd(vault)
    }

    // Reset form
    setFormData({
      vaultName: '',
      location: '',
      currency: 'EGP',
      balance: '',
      maxCapacity: '',
      minBalance: '',
      dailyWithdrawalLimit: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      vaultType: 'main',
      accessLevel: 'restricted',
      requiresApproval: true,
      description: '',
      notes: '',
    })

    onOpenChange(false)
  }

  const isFormValid = formData.vaultName && formData.location

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-emerald-100 dark:border-emerald-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-emerald-100 dark:border-emerald-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Vault className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            إضافة خزينة نقدية جديدة
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            أدخل معلومات الخزينة النقدية الجديدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* المعلومات الأساسية */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  المعلومات الأساسية
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vaultName" className="font-medium flex items-center gap-2 text-foreground">
                    <Vault className="h-4 w-4 text-emerald-600" />
                    اسم الخزينة *
                  </Label>
                  <Input
                    id="vaultName"
                    placeholder="مثال: الخزينة الرئيسية"
                    value={formData.vaultName}
                    onChange={(e) => setFormData({ ...formData, vaultName: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-medium flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    الموقع *
                  </Label>
                  <Input
                    id="location"
                    placeholder="مثال: المكتب الرئيسي - الطابق الأول"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaultType" className="font-medium flex items-center gap-2 text-foreground">
                    <Vault className="h-4 w-4 text-emerald-600" />
                    نوع الخزينة *
                  </Label>
                  <Select
                    value={formData.vaultType}
                    onValueChange={(value) => setFormData({ ...formData, vaultType: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vaultTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessLevel" className="font-medium flex items-center gap-2 text-foreground">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    مستوى الوصول *
                  </Label>
                  <Select
                    value={formData.accessLevel}
                    onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accessLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    الرصيد الحالي
                  </Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    العملة
                  </Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div>
                  <Label htmlFor="requiresApproval" className="cursor-pointer font-medium text-foreground">
                    يتطلب موافقة للسحب
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    تفعيل هذا الخيار يتطلب موافقة قبل أي عملية سحب
                  </p>
                </div>
                <Switch
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
                />
              </div>
            </div>

            {/* الحدود */}
            <div className="space-y-5 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  حدود الخزينة
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    السعة القصوى
                  </Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minBalance" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    الحد الأدنى للرصيد
                  </Label>
                  <Input
                    id="minBalance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.minBalance}
                    onChange={(e) => setFormData({ ...formData, minBalance: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyWithdrawalLimit" className="font-medium flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    حد السحب اليومي
                  </Label>
                  <Input
                    id="dailyWithdrawalLimit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.dailyWithdrawalLimit}
                    onChange={(e) => setFormData({ ...formData, dailyWithdrawalLimit: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* بيانات المسؤول */}
            <div className="space-y-5 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  بيانات المسؤول
                </h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="managerName" className="font-medium flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-emerald-600" />
                    اسم المسؤول
                  </Label>
                  <Input
                    id="managerName"
                    placeholder="الاسم الكامل"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerPhone" className="font-medium flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    رقم الهاتف
                  </Label>
                  <Input
                    id="managerPhone"
                    placeholder="01012345678"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="managerEmail" className="font-medium flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="managerEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.managerEmail}
                    onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                    className="text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* الوصف والملاحظات */}
            <div className="space-y-5 pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
                <h3 className="text-lg font-semibold text-foreground">
                  معلومات إضافية
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium flex items-center gap-2 text-foreground">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    الوصف
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="وصف مختصر للخزينة واستخدامها"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-medium flex items-center gap-2 text-foreground">
                    <Info className="h-4 w-4 text-emerald-600" />
                    ملاحظات
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="ملاحظات إضافية"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="text-foreground"
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
              إضافة الخزينة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

