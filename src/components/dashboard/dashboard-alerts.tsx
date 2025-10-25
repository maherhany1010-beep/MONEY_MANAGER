'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X,
  Bell,
  BellOff,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface Alert {
  id: string
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  description: string
  date: string
  read: boolean
}

interface DashboardAlertsProps {
  alerts: Alert[]
}

export function DashboardAlerts({ alerts: initialAlerts }: DashboardAlertsProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [showRead, setShowRead] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'error':
        return <X className="h-5 w-5 text-red-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'warning':
        return 'تحذير'
      case 'error':
        return 'خطأ'
      case 'success':
        return 'نجح'
      case 'info':
      default:
        return 'معلومات'
    }
  }

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const markAsUnread = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: false } : alert
    ))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })))
  }

  const filteredAlerts = showRead ? alerts : alerts.filter(alert => !alert.read)
  const unreadCount = alerts.filter(alert => !alert.read).length

  return (
    <div className="space-y-6">
      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات التنبيهات
          </CardTitle>
          <CardDescription>
            تخصيص طريقة استلام التنبيهات والإشعارات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">تفعيل التنبيهات</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام تنبيهات داخل التطبيق
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email">إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام إشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms">إشعارات الرسائل النصية</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام إشعارات عبر الرسائل النصية
                  </p>
                </div>
                <Switch
                  id="sms"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">أنواع التنبيهات</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• اقتراب من الحد الائتماني</li>
                  <li>• مواعيد استحقاق المدفوعات</li>
                  <li>• معاملات غير عادية</li>
                  <li>• إضافة كاش باك جديد</li>
                  <li>• تحديثات الحساب</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                التنبيهات والإشعارات
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount} جديد
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                جميع التنبيهات والإشعارات المهمة
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRead(!showRead)}
              >
                {showRead ? (
                  <>
                    <EyeOff className="h-4 w-4 ml-2" />
                    إخفاء المقروءة
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 ml-2" />
                    عرض الكل
                  </>
                )}
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  تحديد الكل كمقروء
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد تنبيهات</h3>
                <p className="text-muted-foreground">
                  {showRead ? 'لا توجد تنبيهات حالياً' : 'لا توجد تنبيهات غير مقروءة'}
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    getAlertColor(alert.type)
                  } ${alert.read ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getAlertTypeLabel(alert.type)}
                          </Badge>
                          {!alert.read && (
                            <Badge variant="destructive" className="text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(alert.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {alert.read ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsUnread(alert.id)}
                          className="h-8 w-8 p-0"
                        >
                          <BellOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التنبيهات</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              تنبيه نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">غير مقروءة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              تحتاج انتباه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل القراءة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.length > 0 ? Math.round(((alerts.length - unreadCount) / alerts.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              تم قراءتها
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
