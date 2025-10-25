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
import { Edit, Save, X, User, Wallet as WalletIcon, Settings as SettingsIcon, DollarSign, Shield } from 'lucide-react'

interface EWalletSettingsProps {
  wallet: any
  onUpdate: (wallet: any) => void
}

export function EWalletSettings({ wallet, onUpdate }: EWalletSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(wallet)

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
    { value: 1, label: 'مستوى 1 - أساسي' },
    { value: 2, label: 'مستوى 2 - متوسط' },
    { value: 3, label: 'مستوى 3 - متقدم' }
  ]

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(wallet)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* معلومات المحفظة الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5" />
                معلومات المحفظة
              </CardTitle>
              <CardDescription>المعلومات الأساسية للمحفظة الإلكترونية</CardDescription>
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
              <Label>اسم المحفظة</Label>
              {isEditing ? (
                <Input
                  value={formData.walletName}
                  onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{wallet.walletName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>مزود الخدمة</Label>
              {isEditing ? (
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
              ) : (
                <p className="text-sm font-medium">{wallet.provider}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              {isEditing ? (
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium font-mono">{wallet.phoneNumber}</p>
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
                <p className="text-sm font-medium text-green-600">{formatCurrency(wallet.balance)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>نوع المحفظة</Label>
              {isEditing ? (
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
              ) : (
                <p className="text-sm font-medium">
                  {walletTypes.find(t => t.value === wallet.walletType)?.label}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">
                  {statuses.find(s => s.value === wallet.status)?.label}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="isVerified" className="cursor-pointer">
                    محفظة موثقة
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    هل تم التحقق من هوية صاحب المحفظة؟
                  </p>
                </div>
                <Switch
                  id="isVerified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVerified: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kycLevel">مستوى التحقق (KYC)</Label>
                <Select
                  value={formData.kycLevel?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, kycLevel: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kycLevels.map(level => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* حدود المحفظة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            حدود المحفظة
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
                <p className="text-sm font-medium">{wallet.dailyLimit ? formatCurrency(wallet.dailyLimit) : '-'}</p>
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
                <p className="text-sm font-medium">{wallet.monthlyLimit ? formatCurrency(wallet.monthlyLimit) : '-'}</p>
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
                <p className="text-sm font-medium">{wallet.transactionLimit ? formatCurrency(wallet.transactionLimit) : '-'}</p>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">المستخدم اليوم</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(wallet.dailyUsed || 0)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 mb-1">المستخدم هذا الشهر</p>
                <p className="text-lg font-bold text-purple-900">{formatCurrency(wallet.monthlyUsed || 0)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* الرسوم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            الرسوم
          </CardTitle>
          <CardDescription>رسوم المعاملات (نسبة مئوية)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>رسوم الإيداع %</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.depositFee || ''}
                  onChange={(e) => setFormData({ ...formData, depositFee: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{wallet.depositFee !== undefined ? `${wallet.depositFee}%` : '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رسوم السحب %</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.withdrawalFee || ''}
                  onChange={(e) => setFormData({ ...formData, withdrawalFee: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{wallet.withdrawalFee !== undefined ? `${wallet.withdrawalFee}%` : '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>رسوم التحويل %</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={formData.transferFee || ''}
                  onChange={(e) => setFormData({ ...formData, transferFee: parseFloat(e.target.value) || undefined })}
                />
              ) : (
                <p className="text-sm font-medium">{wallet.transferFee !== undefined ? `${wallet.transferFee}%` : '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بيانات صاحب المحفظة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            بيانات صاحب المحفظة
          </CardTitle>
          <CardDescription>المعلومات الشخصية لصاحب المحفظة</CardDescription>
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
                <p className="text-sm font-medium">{wallet.holderName || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>الرقم القومي</Label>
              {isEditing ? (
                <Input
                  value={formData.holderNationalId || ''}
                  onChange={(e) => setFormData({ ...formData, holderNationalId: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium font-mono">{wallet.holderNationalId || '-'}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>البريد الإلكتروني</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.holderEmail || ''}
                  onChange={(e) => setFormData({ ...formData, holderEmail: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{wallet.holderEmail || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الوصف والملاحظات */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات إضافية</CardTitle>
          <CardDescription>الوصف والملاحظات الخاصة بالمحفظة</CardDescription>
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
              <p className="text-sm text-muted-foreground">{wallet.description || 'لا يوجد وصف'}</p>
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
              <p className="text-sm text-muted-foreground">{wallet.notes || 'لا توجد ملاحظات'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

