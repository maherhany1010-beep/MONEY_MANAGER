'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { NotificationsCenter } from '@/components/notifications/notifications-center'

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">الإشعارات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة جميع الإشعارات والتنبيهات الخاصة بك
          </p>
        </div>

        <NotificationsCenter />
      </div>
    </AppLayout>
  )
}

