'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  ArrowRightLeft,
  Users,
  PiggyBank,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    title: 'لوحة التحكم',
    icon: LayoutDashboard,
    href: '/',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'مركز الحسابات',
    icon: Building2,
    href: '/accounts-center',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'التحويلات المركزية',
    icon: ArrowRightLeft,
    href: '/transfers',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'إدارة العملاء',
    icon: Users,
    href: '/customers',
    color: 'from-pink-500 to-pink-600',
  },
  {
    title: 'إدارة الجمعيات',
    icon: PiggyBank,
    href: '/savings-circles',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'إدارة المخازن',
    icon: Package,
    href: '/inventory',
    color: 'from-teal-500 to-teal-600',
  },
  {
    title: 'نقطة البيع',
    icon: ShoppingCart,
    href: '/sales',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    title: 'إدارة الاستثمارات',
    icon: TrendingUp,
    href: '/investments',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'التقارير',
    icon: FileText,
    href: '/reports',
    color: 'from-amber-500 to-amber-600',
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay - يظهر عند فتح السايد بار ويُغلقه عند الضغط في أي مكان */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
        )}
      </AnimatePresence>

      {/* السايد بار */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-16 right-0 bottom-0 w-64 z-50 overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* قائمة العناصر */}
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm
                            ${
                              isActive
                                ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                : 'bg-slate-200/80 dark:bg-slate-800/50 hover:bg-slate-300/80 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-sm">
                            {item.title}
                          </span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}

