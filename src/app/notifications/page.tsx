'use client'

import { NotificationsCenter } from '@/components/notifications/notifications-center'

export default function NotificationsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">الإشعارات</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          إدارة جميع الإشعارات والتنبيهات الخاصة بك
        </p>
      </div>

      <NotificationsCenter />
    </div>
  )
}

