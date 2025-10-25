'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Share2,
  Archive,
  Star,
  StarOff,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuickAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'destructive'
  shortcut?: string
  disabled?: boolean
  hidden?: boolean
}

interface QuickActionsMenuProps {
  actions: QuickAction[]
  trigger?: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function QuickActionsMenu({
  actions,
  trigger,
  align = 'end',
  className,
}: QuickActionsMenuProps) {
  const [open, setOpen] = useState(false)

  // Filter out hidden actions
  const visibleActions = actions.filter(action => !action.hidden)

  // Group actions by variant
  const defaultActions = visibleActions.filter(a => a.variant !== 'destructive')
  const destructiveActions = visibleActions.filter(a => a.variant === 'destructive')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className={className}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>الإجراءات السريعة</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Default Actions */}
        {defaultActions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={() => {
                action.onClick()
                setOpen(false)
              }}
              disabled={action.disabled}
            >
              {Icon && <Icon className="h-4 w-4 ml-2" />}
              {action.label}
              {action.shortcut && (
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          )
        })}

        {/* Destructive Actions */}
        {destructiveActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {destructiveActions.map((action) => {
              const Icon = action.icon
              return (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => {
                    action.onClick()
                    setOpen(false)
                  }}
                  disabled={action.disabled}
                  className="text-destructive focus:text-destructive"
                >
                  {Icon && <Icon className="h-4 w-4 ml-2" />}
                  {action.label}
                  {action.shortcut && (
                    <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Floating Action Button with Quick Actions
 */
interface FloatingActionButtonProps {
  actions: QuickAction[]
  className?: string
}

export function FloatingActionButton({
  actions,
  className,
}: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('fixed bottom-6 left-6 z-50', className)}>
      <div className="relative">
        {/* Action Buttons */}
        {open && (
          <div className="absolute bottom-16 left-0 flex flex-col gap-2 animate-in slide-in-from-bottom-5">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}
                  size="icon"
                  onClick={() => {
                    action.onClick()
                    setOpen(false)
                  }}
                  disabled={action.disabled}
                  className={cn(
                    'h-12 w-12 rounded-full shadow-lg',
                    'animate-in zoom-in-50',
                    `animation-delay-${index * 50}`
                  )}
                  title={action.label}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                </Button>
              )
            })}
          </div>
        )}

        {/* Main FAB */}
        <Button
          variant="default"
          size="icon"
          onClick={() => setOpen(!open)}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <MoreVertical
            className={cn(
              'h-6 w-6 transition-transform',
              open && 'rotate-90'
            )}
          />
        </Button>
      </div>
    </div>
  )
}

/**
 * Context Menu (Right-click menu)
 */
interface ContextMenuProps {
  actions: QuickAction[]
  children: React.ReactNode
  className?: string
}

export function ContextMenu({
  actions,
  children,
  className,
}: ContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
  }

  const handleClose = () => {
    setPosition(null)
  }

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      {position && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            onClick={handleClose}
          />

          {/* Menu */}
          <div
            className="fixed z-50 min-w-[200px] rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
            style={{
              top: position.y,
              left: position.x,
            }}
            dir="rtl"
          >
            {actions.map((action, index) => {
              const Icon = action.icon
              const isDestructive = action.variant === 'destructive'

              return (
                <div key={action.id}>
                  {index > 0 && isDestructive && actions[index - 1].variant !== 'destructive' && (
                    <div className="my-1 h-px bg-border" />
                  )}
                  <button
                    onClick={() => {
                      action.onClick()
                      handleClose()
                    }}
                    disabled={action.disabled}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      'disabled:pointer-events-none disabled:opacity-50',
                      isDestructive && 'text-destructive hover:text-destructive'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 ml-2" />}
                    {action.label}
                    {action.shortcut && (
                      <span className="mr-auto text-xs text-muted-foreground">
                        {action.shortcut}
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

/**
 * Common quick actions templates
 */
export const commonQuickActions = {
  view: (onClick: () => void): QuickAction => ({
    id: 'view',
    label: 'عرض',
    icon: Eye,
    onClick,
  }),
  edit: (onClick: () => void): QuickAction => ({
    id: 'edit',
    label: 'تعديل',
    icon: Edit,
    onClick,
    shortcut: 'Ctrl+E',
  }),
  duplicate: (onClick: () => void): QuickAction => ({
    id: 'duplicate',
    label: 'نسخ',
    icon: Copy,
    onClick,
    shortcut: 'Ctrl+D',
  }),
  download: (onClick: () => void): QuickAction => ({
    id: 'download',
    label: 'تحميل',
    icon: Download,
    onClick,
  }),
  share: (onClick: () => void): QuickAction => ({
    id: 'share',
    label: 'مشاركة',
    icon: Share2,
    onClick,
  }),
  archive: (onClick: () => void): QuickAction => ({
    id: 'archive',
    label: 'أرشفة',
    icon: Archive,
    onClick,
  }),
  favorite: (onClick: () => void, isFavorite: boolean = false): QuickAction => ({
    id: 'favorite',
    label: isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة',
    icon: isFavorite ? StarOff : Star,
    onClick,
  }),
  lock: (onClick: () => void, isLocked: boolean = false): QuickAction => ({
    id: 'lock',
    label: isLocked ? 'إلغاء القفل' : 'قفل',
    icon: isLocked ? Unlock : Lock,
    onClick,
  }),
  refresh: (onClick: () => void): QuickAction => ({
    id: 'refresh',
    label: 'تحديث',
    icon: RefreshCw,
    onClick,
    shortcut: 'Ctrl+R',
  }),
  delete: (onClick: () => void): QuickAction => ({
    id: 'delete',
    label: 'حذف',
    icon: Trash2,
    onClick,
    variant: 'destructive',
    shortcut: 'Del',
  }),
}

