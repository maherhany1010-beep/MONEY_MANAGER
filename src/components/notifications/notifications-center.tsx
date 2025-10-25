'use client'

import { useState } from 'react'
import { useNotifications } from '@/contexts/notifications-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  DollarSign,
  CreditCard,
  TrendingDown,
  Gift,
  Calendar,
  Users,
  Package,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react'
import { AppNotification, NotificationType } from '@/types/notification'
import Link from 'next/link'

// أيقونة حسب نوع الإشعار
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'payment_due':
      return <Calendar className="h-5 w-5 text-blue-500" />
    case 'low_balance':
      return <TrendingDown className="h-5 w-5 text-red-500" />
    case 'credit_limit':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case 'large_transaction':
      return <DollarSign className="h-5 w-5 text-purple-500" />
    case 'cashback_earned':
      return <Gift className="h-5 w-5 text-green-500" />
    case 'installment_due':
      return <CreditCard className="h-5 w-5 text-blue-500" />
    case 'investment_change':
      return <TrendingUp className="h-5 w-5 text-indigo-500" />
    case 'inventory_low':
      return <Package className="h-5 w-5 text-yellow-500" />
    case 'customer_payment':
      return <Users className="h-5 w-5 text-green-500" />
    case 'savings_circle':
      return <CircleDollarSign className="h-5 w-5 text-teal-500" />
    default:
      return <Info className="h-5 w-5 text-gray-500" />
  }
}

// لون الخلفية حسب الأولوية
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
    case 'high':
      return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'
    case 'medium':
      return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
    default:
      return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
  }
}

interface NotificationItemProps {
  notification: AppNotification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        notification.read 
          ? 'bg-background border-border opacity-60' 
          : getPriorityColor(notification.priority)
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDate(notification.timestamp, 'dd/MM/yyyy HH:mm')}
            </span>
            
            <div className="flex items-center gap-1">
              {notification.actionUrl && (
                <Link href={notification.actionUrl}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    {notification.actionLabel || 'عرض'}
                  </Button>
                </Link>
              )}
              
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="تعليم كمقروء"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                onClick={() => onDelete(notification.id)}
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              مركز الإشعارات
              {unreadCount > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              إدارة جميع الإشعارات والتنبيهات
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                تعليم الكل كمقروء
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="gap-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                مسح الكل
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">
              الكل ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              غير المقروءة ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

