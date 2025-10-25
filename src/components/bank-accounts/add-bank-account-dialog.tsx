'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Landmark, Plus } from 'lucide-react'

interface AddBankAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (account: any) => void
}

export function AddBankAccountDialog({ open, onOpenChange, onAdd }: AddBankAccountDialogProps) {
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    balance: '',
    dailyLimit: '',
    monthlyLimit: '',
    transactionLimit: '',
    holderName: '',
    holderPhone: '',
    holderEmail: '',
    holderAddress: '',
    iban: '',
    swiftCode: '',
    branchName: '',
    branchCode: '',
  })

  const accountTypes = [
    { value: 'checking', label: 'حساب جاري' },
    { value: 'savings', label: 'حساب توفير' },
    { value: 'current', label: 'حساب تجاري' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const account = {
      accountName: formData.accountName,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountType: formData.accountType,
      balance: parseFloat(formData.balance) || 0,
      dailyLimit: parseFloat(formData.dailyLimit) || undefined,
      monthlyLimit: parseFloat(formData.monthlyLimit) || undefined,
      transactionLimit: parseFloat(formData.transactionLimit) || undefined,
      holderName: formData.holderName || undefined,
      holderPhone: formData.holderPhone || undefined,
      holderEmail: formData.holderEmail || undefined,
      holderAddress: formData.holderAddress || undefined,
      currency: 'EGP',
      iban: formData.iban || undefined,
      swiftCode: formData.swiftCode || undefined,
      branchName: formData.branchName || undefined,
      branchCode: formData.branchCode || undefined,
      openDate: new Date().toISOString().split('T')[0],
      totalDeposits: 0,
      totalWithdrawals: 0,
      monthlySpending: 0,
    }

    if (onAdd) {
      onAdd(account)
    }

    // Reset form
    setFormData({
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: 'checking',
      balance: '',
      dailyLimit: '',
      monthlyLimit: '',
      transactionLimit: '',
      holderName: '',
      holderPhone: '',
      holderEmail: '',
      holderAddress: '',
      iban: '',
      swiftCode: '',
      branchName: '',
      branchCode: '',
    })

    onOpenChange(false)
  }

  const isFormValid = formData.accountName && formData.bankName && formData.accountNumber

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 border-cyan-100 dark:border-cyan-900/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b pb-4 border-cyan-100 dark:border-cyan-900/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Landmark className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            إضافة حساب بنكي جديد
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            أدخل معلومات الحساب البنكي الجديد
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* المعلومات الأساسية */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">المعلومات الأساسية</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountName">اسم الحساب *</Label>
                  <Input
                    id="accountName"
                    placeholder="مثال: حسابي الجاري الرئيسي"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">اسم البنك *</Label>
                  <Input
                    id="bankName"
                    placeholder="مثال: البنك الأهلي المصري"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">رقم الحساب *</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">نوع الحساب *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">الرصيد الحالي</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* الحدود */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">حدود الحساب</h4>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dailyLimit">الحد اليومي</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.dailyLimit}
                    onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">الحد الشهري</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionLimit">حد المعاملة</Label>
                  <Input
                    id="transactionLimit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.transactionLimit}
                    onChange={(e) => setFormData({ ...formData, transactionLimit: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* بيانات صاحب الحساب */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">بيانات صاحب الحساب</h4>
              
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
                  <Label htmlFor="holderPhone">رقم الهاتف</Label>
                  <Input
                    id="holderPhone"
                    placeholder="01012345678"
                    value={formData.holderPhone}
                    onChange={(e) => setFormData({ ...formData, holderPhone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderEmail">البريد الإلكتروني</Label>
                  <Input
                    id="holderEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.holderEmail}
                    onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderAddress">العنوان</Label>
                  <Input
                    id="holderAddress"
                    placeholder="العنوان"
                    value={formData.holderAddress}
                    onChange={(e) => setFormData({ ...formData, holderAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* معلومات البنك */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm">معلومات البنك</h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="iban">رقم IBAN</Label>
                  <Input
                    id="iban"
                    placeholder="EG380019000100123456789012345"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swiftCode">كود SWIFT</Label>
                  <Input
                    id="swiftCode"
                    placeholder="NBEGEGCXXXX"
                    value={formData.swiftCode}
                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchName">اسم الفرع</Label>
                  <Input
                    id="branchName"
                    placeholder="فرع المعادي"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchCode">كود الفرع</Label>
                  <Input
                    id="branchCode"
                    placeholder="001"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
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
              إضافة الحساب
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

