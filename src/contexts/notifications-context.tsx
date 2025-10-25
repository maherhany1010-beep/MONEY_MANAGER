'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import {
  AppNotification,
  NotificationSettings,
  NotificationType,
  NotificationPriority,
  defaultNotificationSettings
} from '@/types/notification'
import { generateId } from '@/lib/utils'

interface NotificationsContextType {
  notifications: AppNotification[]
  unreadCount: number
  settings: NotificationSettings
  addNotification: (
    type: NotificationType,
    title: string,
    message: string,
    priority?: NotificationPriority,
    actionUrl?: string,
    actionLabel?: string,
    metadata?: Record<string, any>
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  updateSettings: (settings: Partial<NotificationSettings>) => void
  requestWebPushPermission: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings)

  // تحميل البيانات من localStorage عند بدء التطبيق
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedNotifications = localStorage.getItem('app-notifications')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    const savedSettings = localStorage.getItem('notificationSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }
    }
  }, [])

  // حفظ الإشعارات في localStorage عند التحديث
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('app-notifications', JSON.stringify(notifications))
  }, [notifications])

  // حفظ الإعدادات في localStorage عند التحديث
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('notificationSettings', JSON.stringify(settings))
  }, [settings])

  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter(n => !n.read).length

  // إضافة إشعار جديد
  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    actionUrl?: string,
    actionLabel?: string,
    metadata?: Record<string, any>
  ) => {
    // التحقق من تفعيل الإشعارات
    if (!settings.enabled) return

    const notification: AppNotification = {
      id: generateId(),
      type,
      priority,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl,
      actionLabel,
      metadata,
    }

    setNotifications(prev => [notification, ...prev])

    // تشغيل صوت الإشعار
    if (settings.sound.enabled) {
      playNotificationSound()
    }

    // إرسال Web Push Notification
    if (settings.webPush.enabled && settings.webPush.permission === 'granted') {
      sendWebPushNotification(title, message)
    }
  }, [settings])

  // تعليم إشعار كمقروء
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  // تعليم جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  // حذف إشعار
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // مسح جميع الإشعارات
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // تحديث الإعدادات
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // طلب إذن Web Push
  const requestWebPushPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setSettings(prev => ({
        ...prev,
        webPush: {
          ...prev.webPush,
          permission: permission as 'default' | 'granted' | 'denied',
          enabled: permission === 'granted',
        },
      }))
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }, [])

  // تشغيل صوت الإشعار
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.3
      audio.play().catch(err => console.log('Could not play notification sound:', err))
    } catch (error) {
      console.log('Notification sound not available')
    }
  }

  // إرسال Web Push Notification
  const sendWebPushNotification = (title: string, message: string) => {
    if (!('Notification' in window)) return

    try {
      new Notification(title, {
        body: message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        dir: 'rtl',
        lang: 'ar',
      })
    } catch (error) {
      console.error('Error sending web push notification:', error)
    }
  }

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
    requestWebPushPermission,
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

