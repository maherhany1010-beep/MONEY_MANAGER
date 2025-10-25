'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Edit, Save, X, User, Landmark, Settings as SettingsIcon } from 'lucide-react'

interface BankAccountSettingsProps {
  account: any
  onUpdate: (account: any) => void
}

export function BankAccountSettings({ account, onUpdate }: BankAccountSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(account)

  const accountTypes = [
    { value: 'checking', label: 'حساب جاري' },
    { value: 'savings', label: 'حساب توفير' },
    { value: 'current', label: 'حساب تجاري' }
  ]

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(account)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* معلومات الحساب الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                معلومات الحساب
              </CardTitle>
              <CardDescription>المعلومات الأساسية للحساب البنكي</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 ml-2" />
                  إلغاء
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>اسم الحساب</Label>
              {isEditing ? (
                <Input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.accountName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>اسم البنك</Label>
              {isEditing ? (
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.bankName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رقم الحساب</Label>
              {isEditing ? (
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium font-mono">{account.accountNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>نوع الحساب</Label>
              {isEditing ? (
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
              ) : (
                <p className="text-sm font-medium">
                  {accountTypes.find(t => t.value === account.accountType)?.label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الرصيد الحالي</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                />
              ) : (
                <p className="text-sm font-medium text-green-600">{formatCurrency(account.balance)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رقم IBAN</Label>
              {isEditing ? (
                <Input
                  value={formData.iban || ''}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium font-mono">{account.iban || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>كود SWIFT</Label>
              {isEditing ? (
                <Input
                  value={formData.swiftCode || ''}
                  onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.swiftCode || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>اسم الفرع</Label>
              {isEditing ? (
                <Input
                  value={formData.branchName || ''}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.branchName || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حدود الحساب */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            حدود الحساب
          </CardTitle>
          <CardDescription>الحدود اليومية والشهرية للمعاملات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>الحد اليومي</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.dailyLimit || ''}
                  onChange={(e) => setFormData({ ...formData, dailyLimit: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{account.dailyLimit ? formatCurrency(account.dailyLimit) : '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الحد الشهري</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthlyLimit || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyLimit: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{account.monthlyLimit ? formatCurrency(account.monthlyLimit) : '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>حد المعاملة الواحدة</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.transactionLimit || ''}
                  onChange={(e) => setFormData({ ...formData, transactionLimit: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{account.transactionLimit ? formatCurrency(account.transactionLimit) : '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بيانات صاحب الحساب */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            بيانات صاحب الحساب
          </CardTitle>
          <CardDescription>المعلومات الشخصية لصاحب الحساب</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              {isEditing ? (
                <Input
                  value={formData.holderName || ''}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.holderName || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              {isEditing ? (
                <Input
                  value={formData.holderPhone || ''}
                  onChange={(e) => setFormData({ ...formData, holderPhone: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.holderPhone || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.holderEmail || ''}
                  onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.holderEmail || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>العنوان</Label>
              {isEditing ? (
                <Input
                  value={formData.holderAddress || ''}
                  onChange={(e) => setFormData({ ...formData, holderAddress: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{account.holderAddress || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

