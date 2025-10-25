'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { formatCurrency } from '@/lib/utils'
import { Edit, Save, X, User, Vault as VaultIcon, Settings as SettingsIcon, MapPin } from 'lucide-react'

interface CashVaultSettingsProps {
  vault: any
  onUpdate: (vault: any) => void
}

export function CashVaultSettings({ vault, onUpdate }: CashVaultSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(vault)

  const vaultTypes = [
    { value: 'main', label: 'خزينة رئيسية' },
    { value: 'branch', label: 'خزينة فرع' },
    { value: 'personal', label: 'خزينة شخصية' },
    { value: 'emergency', label: 'خزينة طوارئ' }
  ]

  const accessLevels = [
    { value: 'public', label: 'عام' },
    { value: 'restricted', label: 'محدود' },
    { value: 'private', label: 'خاص' }
  ]

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(vault)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* معلومات الخزينة الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <VaultIcon className="h-5 w-5" />
                معلومات الخزينة
              </CardTitle>
              <CardDescription>المعلومات الأساسية للخزينة النقدية</CardDescription>
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
              <Label>اسم الخزينة</Label>
              {isEditing ? (
                <Input
                  value={formData.vaultName}
                  onChange={(e) => setFormData({ ...formData, vaultName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.vaultName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الموقع</Label>
              {isEditing ? (
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vault.location}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>نوع الخزينة</Label>
              {isEditing ? (
                <Select
                  value={formData.vaultType}
                  onValueChange={(value) => setFormData({ ...formData, vaultType: value })}
                >
                  <SelectTrigger>
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
              ) : (
                <p className="text-sm font-medium">
                  {vaultTypes.find(t => t.value === vault.vaultType)?.label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>مستوى الوصول</Label>
              {isEditing ? (
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value) => setFormData({ ...formData, accessLevel: value })}
                >
                  <SelectTrigger>
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
              ) : (
                <p className="text-sm font-medium">
                  {accessLevels.find(l => l.value === vault.accessLevel)?.label}
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
                <p className="text-sm font-medium text-green-600">{formatCurrency(vault.balance)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>العملة</Label>
              {isEditing ? (
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.currency}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label htmlFor="requiresApproval" className="cursor-pointer">
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
          )}
        </CardContent>
      </Card>

      {/* حدود الخزينة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            حدود الخزينة
          </CardTitle>
          <CardDescription>الحدود القصوى والدنيا للخزينة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>السعة القصوى</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.maxCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.maxCapacity ? formatCurrency(vault.maxCapacity) : '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الحد الأدنى للرصيد</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minBalance || ''}
                  onChange={(e) => setFormData({ ...formData, minBalance: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.minBalance !== undefined ? formatCurrency(vault.minBalance) : '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>حد السحب اليومي</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.dailyWithdrawalLimit || ''}
                  onChange={(e) => setFormData({ ...formData, dailyWithdrawalLimit: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.dailyWithdrawalLimit ? formatCurrency(vault.dailyWithdrawalLimit) : '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بيانات المسؤول */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            بيانات المسؤول
          </CardTitle>
          <CardDescription>المعلومات الشخصية للمسؤول عن الخزينة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>الاسم الكامل</Label>
              {isEditing ? (
                <Input
                  value={formData.managerName || ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.managerName || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              {isEditing ? (
                <Input
                  value={formData.managerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.managerPhone || '-'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>البريد الإلكتروني</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.managerEmail || ''}
                  onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{vault.managerEmail || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الوصف والملاحظات */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات إضافية</CardTitle>
          <CardDescription>الوصف والملاحظات الخاصة بالخزينة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>الوصف</Label>
            {isEditing ? (
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{vault.description || 'لا يوجد وصف'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            {isEditing ? (
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{vault.notes || 'لا توجد ملاحظات'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

