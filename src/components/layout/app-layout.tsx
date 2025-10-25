'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Navigation, MobileNavigation } from '@/components/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { CommandPalette } from '@/components/command-palette'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { useKeyboardShortcutsSafe } from '@/hooks/use-keyboard-shortcuts'
import { useTheme } from '@/contexts/theme-context'
import { Loader2, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toggleTheme } = useTheme()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      const burgerButton = document.getElementById('burger-menu-button')

      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        burgerButton &&
        !burgerButton.contains(event.target as Node)
      ) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [router])

  // Global keyboard shortcuts
  useKeyboardShortcutsSafe([
    { key: 'h', ctrl: true, callback: () => router.push('/'), description: 'لوحة التحكم' },
    { key: 'a', ctrl: true, shift: true, callback: () => router.push('/accounts-center'), description: 'مركز الحسابات' },
    { key: '1', ctrl: true, callback: () => router.push('/cards'), description: 'البطاقات الائتمانية' },
    { key: '2', ctrl: true, callback: () => router.push('/prepaid-cards'), description: 'البطاقات مسبقة الدفع' },
    { key: '3', ctrl: true, callback: () => router.push('/bank-accounts'), description: 'الحسابات البنكية' },
    { key: '4', ctrl: true, callback: () => router.push('/cash-vaults'), description: 'الخزائن النقدية' },
    { key: '5', ctrl: true, callback: () => router.push('/e-wallets'), description: 'المحافظ الإلكترونية' },
    { key: '6', ctrl: true, callback: () => router.push('/pos-machines'), description: 'ماكينات الدفع' },
    { key: ',', ctrl: true, callback: () => router.push('/settings'), description: 'الإعدادات' },
    { key: 'r', ctrl: true, shift: true, callback: () => router.push('/reports'), description: 'التقارير' },
    { key: 't', ctrl: true, callback: toggleTheme, description: 'تبديل الوضع' },
    { key: 'm', ctrl: true, callback: () => setSidebarOpen(!sidebarOpen), description: 'فتح/إغلاق القائمة' },
  ])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsDialog />

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Layout with Enhanced Sidebar */}
      <div className="md:hidden">
        {/* Burger Menu Button - Always Visible */}
        <Button
          id="burger-menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`
            fixed top-4 left-4 z-50
            h-14 w-14 rounded-full
            shadow-lg hover:shadow-xl
            transition-all duration-300 ease-in-out
            ${sidebarOpen
              ? 'bg-destructive hover:bg-destructive/90 rotate-90'
              : 'bg-primary hover:bg-primary/90 hover:scale-110'
            }
          `}
          size="icon"
          aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        >
          <div className="relative w-6 h-6">
            {/* Animated Icon */}
            <Menu
              className={`
                absolute inset-0 h-6 w-6 text-primary-foreground
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
              `}
            />
            <X
              className={`
                absolute inset-0 h-6 w-6 text-primary-foreground
                transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
              `}
            />
          </div>
        </Button>

        {/* Backdrop/Overlay */}
        <div
          className={`
            fixed inset-0 bg-black/50 backdrop-blur-sm z-40
            transition-opacity duration-300 ease-in-out
            ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <div
          id="mobile-sidebar"
          className={`
            fixed top-0 left-0 h-full w-80 max-w-[85vw] z-40
            bg-card border-l border-border shadow-2xl
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Navigation onLinkClick={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="pb-16 pt-4">
          <div className="container mx-auto p-4">
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        <MobileNavigation />
      </div>
    </div>
  )
}
