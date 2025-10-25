'use client'

import { useState } from 'react'
import { useNotifications } from '@/contexts/notifications-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDate } from '@/lib/utils'
import {
  Bell,
  BellOff,
  Check,
  Trash2,
  Settings,
  Calendar,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Gift,
  CreditCard,
  TrendingUp,
  Package,
  Users,
  CircleDollarSign,
  Info,
} from 'lucide-react'
import { AppNotification, NotificationType } from '@/types/notification'
import Link from 'next/link'

// أيقونة حسب نوع الإشعار
const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "h-4 w-4"
  switch (type) {
    case 'payment_due':
      return <Calendar className={`${iconClass} text-blue-500`} />
    case 'low_balance':
      return <TrendingDown className={`${iconClass} text-red-500`} />
    case 'credit_limit':
      return <AlertTriangle className={`${iconClass} text-orange-500`} />
    case 'large_transaction':
      return <DollarSign className={`${iconClass} text-purple-500`} />
    case 'cashback_earned':
      return <Gift className={`${iconClass} text-green-500`} />
    case 'installment_due':
      return <CreditCard className={`${iconClass} text-blue-500`} />
    case 'investment_change':
      return <TrendingUp className={`${iconClass} text-indigo-500`} />
    case 'inventory_low':
      return <Package className={`${iconClass} text-yellow-500`} />
    case 'customer_payment':
      return <Users className={`${iconClass} text-green-500`} />
    case 'savings_circle':
      return <CircleDollarSign className={`${iconClass} text-teal-500`} />
    default:
      return <Info className={`${iconClass} text-gray-500`} />
  }
}

interface NotificationItemProps {
  notification: AppNotification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete, onClose }: NotificationItemProps) {
  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        notification.read 
          ? 'bg-background border-border opacity-70' 
          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-xs leading-tight">{notification.title}</h4>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">
              {formatDate(notification.timestamp, 'dd/MM HH:mm')}
            </span>
            
            <div className="flex items-center gap-1">
              {notification.actionUrl && (
                <Link href={notification.actionUrl} onClick={onClose}>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
                    {notification.actionLabel || 'عرض'}
                  </Button>
                </Link>
              )}
              
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="تعليم كمقروء"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                onClick={() => onDelete(notification.id)}
                title="حذف"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationsBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotifications()

  const [open, setOpen] = useState(false)

  // عرض آخر 5 إشعارات فقط
  const recentNotifications = notifications.slice(0, 5)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0"
          title="الإشعارات"
        >
          {unreadCount > 0 ? (
            <Bell className="h-5 w-5 text-blue-500" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/settings" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <Settings className="h-3 w-3" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                لا توجد إشعارات
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {recentNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>

        {notifications.length > 5 && (
          <div className="p-3 border-t">
            <Link href="/notifications" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="w-full text-xs">
                عرض جميع الإشعارات ({notifications.length})
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

