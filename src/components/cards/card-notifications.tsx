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
  Bell,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  Gift,
  TrendingUp,
  FileText,
  Save,
  Edit
} from 'lucide-react'

interface CardNotificationsProps {
  card: any
  onSave?: (updatedCard: any) => void
}

export function CardNotifications({ card, onSave }: CardNotificationsProps) {
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

  const updateNotification = (key: string, value: boolean) => {
    setEditedCard({
      ...editedCard,
      notifications: {
        ...editedCard.notifications,
        [key]: value
      }
    })
  }

  const updateAlertLimit = (key: string, value: number) => {
    setEditedCard({
      ...editedCard,
      alertLimits: {
        ...editedCard.alertLimits,
        [key]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* إعدادات التنبيهات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>التنبيهات الذكية</CardTitle>
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
          <CardDescription>
            قم بتخصيص التنبيهات التي تريد استلامها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* أنواع التنبيهات */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">تنبيهات الشراء</p>
                  <p className="text-sm text-muted-foreground">
                    إشعار فوري عند كل عملية شراء
                  </p>
                </div>
              </div>
              <Switch
                checked={editedCard.notifications?.purchaseAlert ?? true}
                onCheckedChange={(checked) => updateNotification('purchaseAlert', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">تذكير السداد</p>
                  <p className="text-sm text-muted-foreground">
                    تذكير قبل موعد السداد بـ {editedCard.alertLimits?.daysBeforeDue || 3} أيام
                  </p>
                </div>
              </div>
              <Switch
                checked={editedCard.notifications?.paymentReminder ?? true}
                onCheckedChange={(checked) => updateNotification('paymentReminder', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">تنبيه الحد الائتماني</p>
                  <p className="text-sm text-muted-foreground">
                    تنبيه عند الوصول لـ {formatPercentage(editedCard.alertLimits?.utilizationWarning || 80)} من الحد
                  </p>
                </div>
              </div>
              <Switch
                checked={editedCard.notifications?.limitAlert ?? true}
                onCheckedChange={(checked) => updateNotification('limitAlert', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">تنبيهات الكاش باك</p>
                  <p className="text-sm text-muted-foreground">
                    إشعار عند اكتساب كاش باك جديد
                  </p>
                </div>
              </div>
              <Switch
                checked={editedCard.notifications?.cashbackAlert ?? true}
                onCheckedChange={(checked) => updateNotification('cashbackAlert', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">نشاط غير معتاد</p>
                  <p className="text-sm text-muted-foreground">
                    تنبيه عند اكتشاف نشاط مشبوه أو غير معتاد
                  </p>
                </div>
              </div>
              <Switch
                checked={editedCard.notifications?.unusualActivity ?? true}
                onCheckedChange={(checked) => updateNotification('unusualActivity', checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">كشف الحساب الشهري</p>
                  <p className="text-sm text-muted-foreground">
                    إرسال كشف الحساب الشهري عبر البريد الإلكتروني
                  </p>
                </div>
              </div>
              <Switch
                checked={editedCard.notifications?.monthlyStatement ?? true}
                onCheckedChange={(checked) => updateNotification('monthlyStatement', checked)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حدود التنبيهات */}
      <Card>
        <CardHeader>
          <CardTitle>حدود التنبيهات</CardTitle>
          <CardDescription>
            قم بتخصيص متى تريد استلام التنبيهات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>تنبيه المعاملات الكبيرة</Label>
              <Input
                type="number"
                value={editedCard.alertLimits?.largeTransaction || 5000}
                onChange={(e) => updateAlertLimit('largeTransaction', parseFloat(e.target.value))}
                disabled={!isEditing}
                placeholder="5000"
              />
              <p className="text-xs text-muted-foreground">
                تنبيه عند المعاملات أكبر من {formatCurrency(editedCard.alertLimits?.largeTransaction || 5000)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>تحذير نسبة الاستخدام (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editedCard.alertLimits?.utilizationWarning || 80}
                onChange={(e) => updateAlertLimit('utilizationWarning', parseFloat(e.target.value))}
                disabled={!isEditing}
                placeholder="80"
              />
              <p className="text-xs text-muted-foreground">
                تنبيه عند الوصول لـ {formatPercentage(editedCard.alertLimits?.utilizationWarning || 80)} من الحد
              </p>
            </div>

            <div className="space-y-2">
              <Label>أيام التذكير قبل السداد</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={editedCard.alertLimits?.daysBeforeDue || 3}
                onChange={(e) => updateAlertLimit('daysBeforeDue', parseInt(e.target.value))}
                disabled={!isEditing}
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">
                تذكير قبل {editedCard.alertLimits?.daysBeforeDue || 3} أيام من موعد السداد
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* التنبيهات النشطة */}
      <Card>
        <CardHeader>
          <CardTitle>التنبيهات الأخيرة</CardTitle>
          <CardDescription>
            آخر التنبيهات التي تم إرسالها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">عملية شراء جديدة</p>
                <p className="text-sm text-blue-700">
                  تم إجراء عملية شراء بقيمة {formatCurrency(850.50)} من كارفور مصر
                </p>
                <p className="text-xs text-blue-600 mt-1">منذ ساعتين</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">تذكير بالسداد</p>
                <p className="text-sm text-orange-700">
                  موعد السداد بعد 3 أيام - المبلغ المستحق: {formatCurrency(18500)}
                </p>
                <p className="text-xs text-orange-600 mt-1">اليوم</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Gift className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-purple-900">كاش باك جديد</p>
                <p className="text-sm text-purple-700">
                  تم إضافة {formatCurrency(21.25)} كاش باك من عملية الشراء الأخيرة
                </p>
                <p className="text-xs text-purple-600 mt-1">منذ 5 ساعات</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

