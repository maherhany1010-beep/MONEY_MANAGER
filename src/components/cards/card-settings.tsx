'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  Settings,
  DollarSign,
  Percent,
  Bell,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Save,
  Edit
} from 'lucide-react'

interface CardSettingsProps {
  card: any
  onSave?: (updatedCard: any) => void
}

export function CardSettings({ card, onSave }: CardSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCard, setEditedCard] = useState(card)

  const handleSave = () => {
    if (onSave) {
      onSave(editedCard)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCard(card)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* معلومات البطاقة الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>معلومات البطاقة</CardTitle>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  إلغاء
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>اسم البطاقة</Label>
              <Input
                value={editedCard.name}
                onChange={(e) => setEditedCard({ ...editedCard, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>اسم البنك</Label>
              <Input
                value={editedCard.bankName}
                onChange={(e) => setEditedCard({ ...editedCard, bankName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الائتماني</Label>
              <Input
                type="number"
                value={editedCard.creditLimit}
                onChange={(e) => setEditedCard({ ...editedCard, creditLimit: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>معدل الكاش باك (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedCard.cashbackRate}
                onChange={(e) => setEditedCard({ ...editedCard, cashbackRate: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ السداد (يوم من الشهر)</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={editedCard.dueDate}
                onChange={(e) => setEditedCard({ ...editedCard, dueDate: parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الرسوم والمصاريف */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>الرسوم والمصاريف</CardTitle>
          </div>
          <CardDescription>
            الرسوم الشهرية والسنوية ورسوم المعاملات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>الرسوم السنوية</Label>
              <Input
                type="number"
                value={editedCard.annualFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, annualFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(editedCard.annualFee || 0)} سنوياً
              </p>
            </div>
            <div className="space-y-2">
              <Label>الرسوم الشهرية</Label>
              <Input
                type="number"
                value={editedCard.monthlyFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, monthlyFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(editedCard.monthlyFee || 0)} شهرياً
              </p>
            </div>
            <div className="space-y-2">
              <Label>رسوم التأمين (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedCard.insuranceFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, insuranceFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.0"
              />
              <p className="text-xs text-muted-foreground">
                نسبة رسوم التأمين من المعاملات
              </p>
            </div>
            <div className="space-y-2">
              <Label>رسوم التأمين الثابتة</Label>
              <Input
                type="number"
                value={editedCard.insuranceFeeFixed || 0}
                onChange={(e) => setEditedCard({ ...editedCard, insuranceFeeFixed: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(editedCard.insuranceFeeFixed || 0)} رسوم ثابتة
              </p>
            </div>
            <div className="space-y-2">
              <Label>رسوم كشف الحساب الشهري</Label>
              <Input
                type="number"
                value={editedCard.monthlyStatementFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, monthlyStatementFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(editedCard.monthlyStatementFee || 0)} شهرياً
              </p>
            </div>
            <div className="space-y-2">
              <Label>رسوم كشف الحساب الربع سنوي</Label>
              <Input
                type="number"
                value={editedCard.quarterlyStatementFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, quarterlyStatementFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(editedCard.quarterlyStatementFee || 0)} كل 3 أشهر
              </p>
            </div>
            <div className="space-y-2">
              <Label>رسوم السحب النقدي (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={editedCard.cashWithdrawalFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, cashWithdrawalFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label>رسوم السحب النقدي الثابتة</Label>
              <Input
                type="number"
                value={editedCard.cashWithdrawalFeeFixed || 0}
                onChange={(e) => setEditedCard({ ...editedCard, cashWithdrawalFeeFixed: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>رسوم التأخير</Label>
              <Input
                type="number"
                value={editedCard.lateFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, lateFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>رسوم تجاوز الحد</Label>
              <Input
                type="number"
                value={editedCard.overLimitFee || 0}
                onChange={(e) => setEditedCard({ ...editedCard, overLimitFee: parseFloat(e.target.value) })}
                disabled={!isEditing}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* ملخص الرسوم */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-3">ملخص الرسوم المتوقعة</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرسوم السنوية:</span>
                <span className="font-medium">{formatCurrency(editedCard.annualFee || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرسوم الشهرية:</span>
                <span className="font-medium">{formatCurrency((editedCard.monthlyFee || 0) * 12)} / سنة</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">إجمالي الرسوم السنوية:</span>
                <span className="font-bold text-primary">
                  {formatCurrency((editedCard.annualFee || 0) + ((editedCard.monthlyFee || 0) * 12))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بيانات صاحب البطاقة */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>بيانات صاحب البطاقة</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                الاسم الكامل
              </Label>
              <Input
                value={editedCard.cardHolder?.name || ''}
                onChange={(e) => setEditedCard({
                  ...editedCard,
                  cardHolder: { ...editedCard.cardHolder, name: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="الاسم الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                رقم الهاتف
              </Label>
              <Input
                value={editedCard.cardHolder?.phone || ''}
                onChange={(e) => setEditedCard({
                  ...editedCard,
                  cardHolder: { ...editedCard.cardHolder, phone: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="+20 100 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </Label>
              <Input
                type="email"
                value={editedCard.cardHolder?.email || ''}
                onChange={(e) => setEditedCard({
                  ...editedCard,
                  cardHolder: { ...editedCard.cardHolder, email: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                الرقم القومي
              </Label>
              <Input
                value={editedCard.cardHolder?.nationalId || ''}
                onChange={(e) => setEditedCard({
                  ...editedCard,
                  cardHolder: { ...editedCard.cardHolder, nationalId: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="29012011234567"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                العنوان
              </Label>
              <Input
                value={editedCard.cardHolder?.address || ''}
                onChange={(e) => setEditedCard({
                  ...editedCard,
                  cardHolder: { ...editedCard.cardHolder, address: e.target.value }
                })}
                disabled={!isEditing}
                placeholder="العنوان الكامل"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

