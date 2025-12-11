'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/contexts/theme-context'
import { SettingsProvider } from '@/contexts/settings-context'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { BalanceVisibilityProvider } from '@/contexts/balance-visibility-context'
import { AuthProvider } from '@/components/auth/auth-provider'

/**
 * CoreProvider
 * 
 * Groups core/foundational providers:
 * - Settings (must be first)
 * - Theme
 * - Notifications
 * - Auth
 * - Balance Visibility
 */
export function CoreProvider({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <AuthProvider>
            <BalanceVisibilityProvider>
              {children}
            </BalanceVisibilityProvider>
          </AuthProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </SettingsProvider>
  )
}

