'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { useTheme } from '@/contexts/theme-context'
import { NotificationsBell } from '@/components/notifications/notifications-bell'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CreditCard,
  Landmark,
  Vault,
  ArrowUpDown,
  FileText,
  DollarSign,
  Gift,
  Settings,
  LogOut,
  User,
  Wallet,
  ArrowRightLeft,
  Users,
  Sun,
  Moon,
  CircleDollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  LayoutGrid
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  {
    title: 'لوحة التحكم',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'مركز الحسابات',
    href: '/accounts-center',
    icon: LayoutGrid,
  },
  {
    title: 'التحويلات المركزية',
    href: '/transfers',
    icon: ArrowRightLeft,
  },
  {
    title: 'إدارة العملاء',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'إدارة الجمعيات',
    href: '/savings-circles',
    icon: CircleDollarSign,
  },
  {
    title: 'إدارة المخازن',
    href: '/inventory',
    icon: Package,
  },
  {
    title: 'نقطة البيع',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    title: 'إدارة الاستثمارات',
    href: '/investments',
    icon: TrendingUp,
  },
  {
    title: 'التقارير',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
]

interface NavigationProps {
  onLinkClick?: () => void
}

export function Navigation({ onLinkClick }: NavigationProps = {}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-l border-border transition-colors duration-300">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <h1 className="text-xl font-bold text-primary">الإدارة المالية الشاملة</h1>

        <div className="flex items-center gap-2">
          {/* أيقونة الإشعارات */}
          <NotificationsBell />

          {/* زر تبديل الثيم */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors duration-300"
            aria-label={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition-colors" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-105",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">المستخدم</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <nav className="flex items-center justify-around py-2">
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
