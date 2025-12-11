'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, Sun, Moon, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { useSettings } from '@/contexts/settings-context'
import { UserMenu } from './user-menu'

interface HeaderProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { updateSettings } = useSettings()
  const [notificationCount] = useState(3) // عدد الإشعارات (يمكن جلبه من API)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-40 bg-background border-b-2 border-border shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* الجانب الأيسر: زر الهامبورجر + اللوجو */}
        <div className="flex items-center gap-4">
          {/* زر الهامبورجر */}
          <motion.button
            onClick={onMenuToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50 transition-all duration-200"
            aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* اللوجو الرئيسي مع النص */}
          <Link href="/" className="block">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-4"
            >
              {/* اللوجو مع تأثيرات بصرية محسّنة */}
              <motion.div
                whileHover={{ rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-30" />
                <Image
                  src="/logos/LOGO MONEY MANGER.png"
                  alt="CFM - Money Manager"
                  width={100}
                  height={100}
                  className="object-contain relative z-10"
                  style={{
                    filter: 'drop-shadow(0 8px 24px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))',
                  }}
                  priority
                />
              </motion.div>

              {/* النص مع gradient محسّن */}
              <div className="hidden sm:flex flex-col gap-1">
                <span className="text-lg font-bold text-primary drop-shadow-lg">
                  الإدارة المالية
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  الشاملة
                </span>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* المنتصف: صندوق البحث */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن حسابات، عملاء، تحويلات..."
                className="w-full h-11 pl-12 pr-4 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-background transition-all duration-200 backdrop-blur-sm"
                dir="rtl"
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 -z-10 blur-xl"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* الجانب الأيمن: الإشعارات + تبديل الثيم */}
        <div className="flex items-center gap-3">
          {/* جرس الإشعارات */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-lg bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-lg hover:shadow-amber-500/50 transition-all duration-200"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>

          {/* تبديل الثيم */}
          <motion.button
            onClick={() => {
              const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
              setTheme(newTheme)
              // مزامنة مع الإعدادات
              updateSettings({ theme: newTheme })
            }}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50 transition-all duration-200"
            aria-label="تبديل الثيم"
          >
            <AnimatePresence mode="wait">
              {resolvedTheme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* قائمة المستخدم */}
          <UserMenu />
        </div>
      </div>
    </motion.header>
  )
}

