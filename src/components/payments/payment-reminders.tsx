'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface Payment {
  id: string
  cardId: string
  cardName: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  reminderSent: boolean
}

interface PaymentRemindersProps {
  payments: Payment[]
  onReminderUpdate: (paymentId: string, enabled: boolean) => void
}

export function PaymentReminders({ payments, onReminderUpdate }: PaymentRemindersProps) {
  const [globalReminders, setGlobalReminders] = useState(true)
  const [reminderMethod, setReminderMethod] = useState('email')
  const [reminderDays, setReminderDays] = useState('3')

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const upcomingPayments = pendingPayments.filter(p => {
    const dueDate = new Date(p.dueDate)
    const today = new Date()
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return daysDiff <= 7
  })

  const handleGlobalToggle = (enabled: boolean) => {
    setGlobalReminders(enabled)
    // Update all payments
    payments.forEach(payment => {
      if (payment.status === 'pending') {
        onReminderUpdate(payment.id, enabled)
      }
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getReminderStatus = (payment: Payment) => {
    const daysUntilDue = getDaysUntilDue(payment.dueDate)
    
    if (payment.reminderSent) {
      return { status: 'sent', label: 'تم الإرسال', color: 'bg-green-100 text-green-800' }
    } else if (daysUntilDue <= 3) {
      return { status: 'pending', label: 'معلق', color: 'bg-orange-100 text-orange-800' }
    } else {
      return { status: 'scheduled', label: 'مجدول', color: 'bg-blue-100 text-blue-800' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات التذكيرات العامة
          </CardTitle>
          <CardDescription>
            تحكم في إعدادات التذكيرات لجميع المدفوعات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="global-reminders" className="text-base">
                تفعيل التذكيرات
              </Label>
              <p className="text-sm text-muted-foreground">
                تفعيل أو إلغاء جميع التذكيرات
              </p>
            </div>
            <Switch
              id="global-reminders"
              checked={globalReminders}
              onCheckedChange={handleGlobalToggle}
            />
          </div>

          {globalReminders && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reminder-method">طريقة التذكير</Label>
                <Select value={reminderMethod} onValueChange={setReminderMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة التذكير" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        البريد الإلكتروني
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        رسائل نصية
                      </div>
                    </SelectItem>
                    <SelectItem value="push">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        إشعارات التطبيق
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-days">التذكير قبل</Label>
                <Select value={reminderDays} onValueChange={setReminderDays}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عدد الأيام" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">يوم واحد</SelectItem>
                    <SelectItem value="3">3 أيام</SelectItem>
                    <SelectItem value="7">أسبوع</SelectItem>
                    <SelectItem value="14">أسبوعين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              التذكيرات القادمة
            </CardTitle>
            <CardDescription>
              المدفوعات التي تحتاج تذكيرات خلال الأسبوع القادم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments.map((payment) => {
                const daysUntilDue = getDaysUntilDue(payment.dueDate)
                const reminderStatus = getReminderStatus(payment)
                
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{payment.cardName}</h4>
                        <Badge className={reminderStatus.color}>
                          {reminderStatus.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(payment.amount)} • مستحق في {formatDate(payment.dueDate)}
                      </p>
                      <p className={`text-xs ${
                        daysUntilDue <= 1 ? 'text-red-600' : 
                        daysUntilDue <= 3 ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {daysUntilDue === 0 ? 'مستحق اليوم' : 
                         daysUntilDue === 1 ? 'مستحق غداً' : 
                         `${daysUntilDue} أيام متبقية`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.reminderSent ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Button size="sm" variant="outline">
                          إرسال تذكير
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Payment Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تذكيرات المدفوعات الفردية</CardTitle>
          <CardDescription>
            إدارة التذكيرات لكل دفعة على حدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingPayments.map((payment) => {
              const daysUntilDue = getDaysUntilDue(payment.dueDate)
              const reminderStatus = getReminderStatus(payment)
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{payment.cardName}</h4>
                      <Badge className={reminderStatus.color}>
                        {reminderStatus.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <p>المبلغ: {formatCurrency(payment.amount)}</p>
                      <p>الاستحقاق: {formatDate(payment.dueDate)}</p>
                      <p className={
                        daysUntilDue <= 3 ? 'text-red-600' : 
                        daysUntilDue <= 7 ? 'text-orange-600' : 'text-blue-600'
                      }>
                        {daysUntilDue === 0 ? 'مستحق اليوم' : 
                         daysUntilDue > 0 ? `${daysUntilDue} يوم متبقي` : 
                         `متأخر ${Math.abs(daysUntilDue)} يوم`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {payment.reminderSent ? (
                        <Bell className="h-4 w-4 text-green-600" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={payment.reminderSent}
                        onCheckedChange={(checked) => onReminderUpdate(payment.id, checked)}
                        disabled={!globalReminders}
                      />
                    </div>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}

            {pendingPayments.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مدفوعات معلقة</h3>
                <p className="text-muted-foreground">
                  جميع المدفوعات مسددة أو لا توجد مدفوعات مستحقة
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reminder History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل التذكيرات</CardTitle>
          <CardDescription>
            آخر التذكيرات المرسلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              سيتم عرض سجل التذكيرات المرسلة هنا عند تفعيل النظام
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
