'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    // محاكاة إنشاء نسخة احتياطية
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // تسجيل الخروج
    await signOut()
    
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    router.push('/login')
  }

  const handleCancelLogout = () => {
    setShowLogoutDialog(false)
  }

  const userAvatar = user?.user_metadata?.avatar_url || null
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'مستخدم'
  const userEmail = user?.email || ''

  return (
    <>
      {/* زر صورة المستخدم */}
      <div className="relative">
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 rounded-full bg-primary p-0.5 shadow-lg hover:shadow-primary/50 transition-all duration-200"
          aria-label="قائمة المستخدم"
        >
          <div className="w-full h-full rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
        </motion.button>

        {/* القائمة المنسدلة */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay للإغلاق عند الضغط خارج القائمة */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-40"
              />

              {/* القائمة */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
              >
                {/* معلومات المستخدم */}
                <div className="p-4 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary p-0.5">
                      <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {userAvatar ? (
                          <Image
                            src={userAvatar}
                            alt={userName}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-semibold text-sm truncate">
                        {userName}
                      </p>
                      <p className="text-muted-foreground text-xs truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* عناصر القائمة */}
                <div className="p-2">
                  {/* الإعدادات */}
                  <Link
                    href="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-all duration-200">
                        <Settings className="w-4 h-4 text-foreground" />
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        الإعدادات
                      </span>
                    </motion.div>
                  </Link>

                  {/* تسجيل الخروج */}
                  <motion.div
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowLogoutDialog(true)
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors duration-200 cursor-pointer group mt-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500 dark:bg-red-600 flex items-center justify-center group-hover:bg-red-600 dark:group-hover:bg-red-500 transition-all duration-200">
                      <LogOut className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium group-hover:text-red-500 dark:group-hover:text-red-300">
                      تسجيل الخروج
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* نافذة تأكيد تسجيل الخروج */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-500" />
              هل تريد تسجيل الخروج؟
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base">
              سيتم إنشاء نسخة احتياطية من بياناتك قبل الخروج
            </DialogDescription>
          </DialogHeader>

          {isLoggingOut ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-muted-foreground text-sm">
                جاري إنشاء النسخة الاحتياطية...
              </p>
            </div>
          ) : (
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={handleCancelLogout}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              >
                <LogOut className="w-4 h-4 ml-2" />
                نعم، تسجيل الخروج
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

