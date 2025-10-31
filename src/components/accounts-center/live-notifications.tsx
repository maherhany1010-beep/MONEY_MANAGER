'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Trash2,
  Check,
  Bell,
} from 'lucide-react'

interface Notification {
  id: string
  type: 'account-added' | 'balance-updated' | 'low-balance' | 'goal-achieved' | 'large-transaction'
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  icon: React.ReactNode
  color: string
}

export function LiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // بيانات وهمية للإشعارات
  const mockNotifications = useMemo<Notification[]>(() => {
    const now = new Date()
    return [
      {
        id: '1',
        type: 'account-added',
        title: 'تم إضافة حساب جديد',
        description: 'تم إضافة حساب بنكي جديد: البنك الأهلي - حساب التوفير',
        timestamp: new Date(now.getTime() - 5 * 60000),
        isRead: false,
        icon: <Plus className="h-4 w-4" />,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      },
      {
        id: '2',
        type: 'balance-updated',
        title: 'تم تحديث الرصيد',
        description: 'تم تحديث رصيد البطاقة الذهبية: +5,000 جنيه',
        timestamp: new Date(now.getTime() - 15 * 60000),
        isRead: false,
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      },
      {
        id: '3',
        type: 'low-balance',
        title: 'تحذير: رصيد منخفض',
        description: 'رصيد محفظة الهاتف المحمول أقل من 1,000 جنيه',
        timestamp: new Date(now.getTime() - 30 * 60000),
        isRead: false,
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      },
      {
        id: '4',
        type: 'goal-achieved',
        title: 'تم تحقيق هدف مالي',
        description: 'تم تحقيق هدف التوفير الشهري: 50,000 جنيه',
        timestamp: new Date(now.getTime() - 1 * 3600000),
        isRead: true,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      },
      {
        id: '5',
        type: 'large-transaction',
        title: 'عملية كبيرة',
        description: 'تم تحويل 25,000 جنيه من الحساب الرئيسي',
        timestamp: new Date(now.getTime() - 2 * 3600000),
        isRead: true,
        icon: <Zap className="h-4 w-4" />,
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      },
      {
        id: '6',
        type: 'balance-updated',
        title: 'تم تحديث الرصيد',
        description: 'تم تحديث رصيد الحساب البنكي: +10,000 جنيه',
        timestamp: new Date(now.getTime() - 3 * 3600000),
        isRead: true,
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      },
      {
        id: '7',
        type: 'account-added',
        title: 'تم إضافة حساب جديد',
        description: 'تم إضافة محفظة إلكترونية جديدة: Google Pay',
        timestamp: new Date(now.getTime() - 5 * 3600000),
        isRead: true,
        icon: <Plus className="h-4 w-4" />,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      },
      {
        id: '8',
        type: 'low-balance',
        title: 'تحذير: رصيد منخفض',
        description: 'رصيد خزينة النقد أقل من 5,000 جنيه',
        timestamp: new Date(now.getTime() - 8 * 3600000),
        isRead: true,
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      },
      {
        id: '9',
        type: 'goal-achieved',
        title: 'تم تحقيق هدف مالي',
        description: 'تم تحقيق هدف الاستثمار الربع سنوي',
        timestamp: new Date(now.getTime() - 12 * 3600000),
        isRead: true,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      },
      {
        id: '10',
        type: 'large-transaction',
        title: 'عملية كبيرة',
        description: 'تم سحب 15,000 جنيه من الحساب الرئيسي',
        timestamp: new Date(now.getTime() - 24 * 3600000),
        isRead: true,
        icon: <Zap className="h-4 w-4" />,
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      },
    ]
  }, [])

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    return date.toLocaleDateString('ar-EG')
  }

  const handleMarkAllAsRead = () => {
    // في التطبيق الحقيقي، سيتم تحديث الحالة
  }

  const handleClearAll = () => {
    // في التطبيق الحقيقي، سيتم حذف جميع الإشعارات
  }

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">الإشعارات</CardTitle>
                <CardDescription>
                  {unreadCount} إشعارات جديدة من {mockNotifications.length}
                </CardDescription>
              </div>
              <Badge variant="secondary">{unreadCount}</Badge>
            </div>
          </CardHeader>

          <div className="border-t" />

          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {mockNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="space-y-0">
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${notification.color}`}
                      >
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <div className="border-t" />

          <CardContent className="pt-3 pb-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 ml-1" />
              تحديد الكل
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleClearAll}
            >
              <Trash2 className="h-3 w-3 ml-1" />
              مسح الكل
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

