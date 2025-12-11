'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { POSMachine, POSAccount } from '@/contexts/pos-machines-context'
import { CreditCard, Plus } from 'lucide-react'

interface AddPOSMachineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (machine: POSMachine) => void
}

export function AddPOSMachineDialog({ open, onOpenChange, onAdd }: AddPOSMachineDialogProps) {
  const [formData, setFormData] = useState({
    machineName: '',
    machineId: '',
    provider: 'فوري',
    location: '',
    serialNumber: '',
    model: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    // الأهداف والغرامات
    monthlyTarget: '',
    penaltyAmount: '',
    penaltyThreshold: '80',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // إنشاء حساب رئيسي افتراضي
    const primaryAccount: POSAccount = {
      id: `acc-${Date.now()}-1`,
      name: 'الحساب الرئيسي',
      accountName: 'الحساب الرئيسي',
      accountNumber: `${formData.provider.substring(0, 3).toUpperCase()}-${formData.machineId}-001`,
      balance: 0,
      isPrimary: true,
      currency: 'EGP',
      totalDeposits: 0,
      totalWithdrawals: 0,
    }

    // حساب الأهداف والغرامات
    const monthlyTarget = parseFloat(formData.monthlyTarget) || 0
    const penaltyAmount = parseFloat(formData.penaltyAmount) || 0
    const penaltyThreshold = parseFloat(formData.penaltyThreshold) || 80

    const newMachine: POSMachine = {
      id: Date.now().toString(),
      machine_name: formData.machineName,
      machine_number: formData.machineId,
      provider: formData.provider,
      commission_rate: 0,
      status: 'active',
      // Legacy fields
      machineName: formData.machineName,
      machineId: formData.machineId,
      location: formData.location,
      serialNumber: formData.serialNumber,
      model: formData.model,
      installationDate: new Date().toISOString().split('T')[0],
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      totalTransactions: 0,
      monthlyRevenue: 0,
      dailyRevenue: 0,
      accounts: [primaryAccount],
      // الأهداف والغرامات
      monthlyTarget: monthlyTarget > 0 ? monthlyTarget : undefined,
      targetAchieved: 0,
      targetPercentage: 0,
      penaltyAmount: penaltyAmount > 0 ? penaltyAmount : undefined,
      hasPenalty: false,
      penaltyThreshold: penaltyThreshold,
    }

    onAdd(newMachine)
    onOpenChange(false)
    
    // إعادة تعيين النموذج
    setFormData({
      machineName: '',
      machineId: '',
      provider: 'فوري',
      location: '',
      serialNumber: '',
      model: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      monthlyTarget: '',
      penaltyAmount: '',
      penaltyThreshold: '80',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-slate-100 dark:border-slate-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-slate-100 dark:border-slate-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
              <CreditCard className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            إضافة ماكينة دفع جديدة
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            أدخل معلومات ماكينة الدفع الإلكتروني. سيتم إنشاء حساب رئيسي تلقائياً.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">المعلومات الأساسية</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="machineName">اسم الماكينة *</Label>
                <Input
                  id="machineName"
                  value={formData.machineName}
                  onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                  placeholder="مثال: ماكينة الفرع الرئيسي"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="machineId">رقم الماكينة *</Label>
                <Input
                  id="machineId"
                  value={formData.machineId}
                  onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                  placeholder="مثال: POS-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">مزود الخدمة *</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="فوري">فوري</SelectItem>
                    <SelectItem value="أمان">أمان</SelectItem>
                    <SelectItem value="ممكن">ممكن</SelectItem>
                    <SelectItem value="البنك الأهلي">البنك الأهلي</SelectItem>
                    <SelectItem value="بنك مصر">بنك مصر</SelectItem>
                    <SelectItem value="CIB">CIB</SelectItem>
                    <SelectItem value="QNB">QNB</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">الموقع *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="مثال: القاهرة - المعادي"
                  required
                />
              </div>
            </div>
          </div>

          {/* معلومات الجهاز */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">معلومات الجهاز</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">الرقم التسلسلي</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="مثال: FWR-2024-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">الموديل</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="مثال: Fawry POS Pro"
                />
              </div>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">معلومات الاتصال</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">المسؤول</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">رقم الهاتف</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="مثال: 01012345678"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="مثال: contact@example.com"
                />
              </div>
            </div>
          </div>

          {/* الأهداف والغرامات */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">الأهداف والغرامات</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyTarget">الهدف الشهري (جنيه)</Label>
                <Input
                  id="monthlyTarget"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.monthlyTarget}
                  onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
                  placeholder="مثال: 150000"
                />
                <p className="text-xs text-muted-foreground">
                  الهدف المطلوب تحقيقه شهرياً
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="penaltyAmount">قيمة الغرامة (جنيه)</Label>
                <Input
                  id="penaltyAmount"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.penaltyAmount}
                  onChange={(e) => setFormData({ ...formData, penaltyAmount: e.target.value })}
                  placeholder="مثال: 5000"
                />
                <p className="text-xs text-muted-foreground">
                  الغرامة عند عدم تحقيق الهدف
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="penaltyThreshold">الحد الأدنى لتجنب الغرامة (%)</Label>
                <Input
                  id="penaltyThreshold"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.penaltyThreshold}
                  onChange={(e) => setFormData({ ...formData, penaltyThreshold: e.target.value })}
                  placeholder="مثال: 80"
                />
                <p className="text-xs text-muted-foreground">
                  النسبة المطلوبة لتجنب الغرامة
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>ملاحظة:</strong> إذا لم يتم تحديد هدف شهري، لن يتم تطبيق نظام الأهداف والغرامات على هذه الماكينة.
              </p>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 ml-2" />
              إضافة الماكينة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

