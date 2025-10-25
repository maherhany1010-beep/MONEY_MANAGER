'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  CreditCard,
  CircleDollarSign,
  Landmark,
  Vault,
  Wallet,
  Smartphone,
  LayoutGrid,
  Settings,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  Search,
  Plus,
  Home,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [search, setSearch] = useState('')

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  const navigate = useCallback((path: string) => {
    runCommand(() => router.push(path))
  }, [router, runCommand])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <Command
          className="rounded-lg border bg-card shadow-2xl animate-in zoom-in-95"
          dir="rtl"
          shouldFilter={true}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="ابحث عن صفحة أو أمر... (اضغط Esc للإغلاق)"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              لا توجد نتائج
            </Command.Empty>

            {/* Navigation Commands */}
            <Command.Group heading="التنقل" className="mb-2">
              <CommandItem
                icon={Home}
                onSelect={() => navigate('/')}
              >
                لوحة التحكم
              </CommandItem>
              <CommandItem
                icon={LayoutGrid}
                onSelect={() => navigate('/accounts-center')}
              >
                مركز الحسابات
              </CommandItem>
              <CommandItem
                icon={CreditCard}
                onSelect={() => navigate('/cards')}
              >
                البطاقات الائتمانية
              </CommandItem>
              <CommandItem
                icon={CircleDollarSign}
                onSelect={() => navigate('/prepaid-cards')}
              >
                البطاقات مسبقة الدفع
              </CommandItem>
              <CommandItem
                icon={Landmark}
                onSelect={() => navigate('/bank-accounts')}
              >
                الحسابات البنكية
              </CommandItem>
              <CommandItem
                icon={Vault}
                onSelect={() => navigate('/cash-vaults')}
              >
                الخزائن النقدية
              </CommandItem>
              <CommandItem
                icon={Wallet}
                onSelect={() => navigate('/e-wallets')}
              >
                المحافظ الإلكترونية
              </CommandItem>
              <CommandItem
                icon={Smartphone}
                onSelect={() => navigate('/pos-machines')}
              >
                ماكينات الدفع الإلكتروني
              </CommandItem>
            </Command.Group>

            {/* Management Commands */}
            <Command.Group heading="الإدارة" className="mb-2">
              <CommandItem
                icon={Users}
                onSelect={() => navigate('/customers')}
              >
                إدارة العملاء
              </CommandItem>
              <CommandItem
                icon={TrendingUp}
                onSelect={() => navigate('/associations')}
              >
                إدارة الجمعيات
              </CommandItem>
              <CommandItem
                icon={Package}
                onSelect={() => navigate('/inventory')}
              >
                إدارة المخازن
              </CommandItem>
              <CommandItem
                icon={ShoppingCart}
                onSelect={() => navigate('/pos')}
              >
                نقطة البيع
              </CommandItem>
              <CommandItem
                icon={BarChart3}
                onSelect={() => navigate('/investments')}
              >
                إدارة الاستثمارات
              </CommandItem>
            </Command.Group>

            {/* Reports & Settings */}
            <Command.Group heading="التقارير والإعدادات" className="mb-2">
              <CommandItem
                icon={FileText}
                onSelect={() => navigate('/reports')}
              >
                التقارير
              </CommandItem>
              <CommandItem
                icon={Settings}
                onSelect={() => navigate('/settings')}
              >
                الإعدادات
              </CommandItem>
            </Command.Group>

            {/* Actions */}
            <Command.Group heading="الإجراءات" className="mb-2">
              <CommandItem
                icon={Plus}
                onSelect={() => navigate('/cards')}
                shortcut="Ctrl+N"
              >
                إضافة بطاقة جديدة
              </CommandItem>
              <CommandItem
                icon={theme === 'dark' ? Sun : Moon}
                onSelect={() => runCommand(toggleTheme)}
                shortcut="Ctrl+T"
              >
                {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
              </CommandItem>
            </Command.Group>
          </Command.List>

          <div className="border-t p-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>استخدم ↑ ↓ للتنقل</span>
              <span>Enter للاختيار</span>
              <span>Esc للإغلاق</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  )
}

interface CommandItemProps {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onSelect: () => void
  shortcut?: string
}

function CommandItem({ icon: Icon, children, onSelect, shortcut }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        "transition-colors"
      )}
    >
      <Icon className="ml-2 h-4 w-4" />
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}

