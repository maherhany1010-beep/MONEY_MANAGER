'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { LoginForm } from '@/components/auth/login-form'
import { CommandPalette } from '@/components/command-palette'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'
import { useKeyboardShortcutsSafe } from '@/hooks/use-keyboard-shortcuts'
import { useTheme } from '@/contexts/theme-context'
import { Loader2 } from 'lucide-react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface LayoutProviderProps {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // عند تسجيل الدخول بنجاح، نعرض شاشة الانتقال
  useEffect(() => {
    if (user && !isReady && !loading) {
      setShowTransition(true)
      // بعد 2 ثانية نخفي شاشة الانتقال ونعرض المحتوى
      const timer = setTimeout(() => {
        setShowTransition(false)
        setIsReady(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [user, isReady, loading])

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

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
    { key: 'm', ctrl: true, callback: toggleSidebar, description: 'فتح/إغلاق القائمة' },
    { key: 'k', ctrl: true, callback: () => setCommandPaletteOpen(true), description: 'فتح لوحة الأوامر' },
  ])

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p style={{ color: 'var(--muted-foreground)' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />
  }

  // Show transition screen when user just logged in
  if (showTransition) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
          initial={{ scale: 0, opacity: 0, borderRadius: '100%' }}
          animate={{ scale: 3, opacity: 1, borderRadius: '0%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            {/* اللوجو الرئيسي في المنتصف */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 100 }}
              className="relative flex items-center justify-center"
            >
              {/* دائرة التحميل الدوارة حول اللوجو */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Loader2 className="w-40 h-40 text-white/80" strokeWidth={1.5} />
              </motion.div>

              {/* اللوجو */}
              <Image
                src="/logos/LOGO MONEY MANGER.png"
                alt="CFM Logo"
                width={130}
                height={130}
                className="object-contain relative z-10"
                style={{
                  filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.5))',
                }}
                priority
              />
            </motion.div>

            {/* النص المتدرج تحت اللوجو مباشرة */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center mt-2"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-yellow-200 to-green-200 bg-clip-text text-transparent">
                من هنا تبدأ حياتك المالية
              </h2>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsDialog />

      {/* الهيدر */}
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* السايد بار */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* المحتوى الرئيسي */}
      <main className="pt-24 sm:pt-28 lg:pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}

