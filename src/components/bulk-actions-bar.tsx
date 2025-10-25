'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Trash2,
  Edit,
  Copy,
  Archive,
  Download,
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface BulkAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick: () => void
  disabled?: boolean
}

interface BulkActionsBarProps {
  selectedCount: number
  onClear: () => void
  actions?: BulkAction[]
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  onClear,
  actions = [],
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  // Split actions into primary and secondary
  const primaryActions = actions.slice(0, 3)
  const secondaryActions = actions.slice(3)

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-card border shadow-lg rounded-lg',
        'animate-in slide-in-from-bottom-5',
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="font-medium">
            {selectedCount} محدد
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Primary Actions */}
        {primaryActions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {Icon && <Icon className="h-4 w-4 ml-2" />}
              {action.label}
            </Button>
          )
        })}

        {/* More Actions */}
        {secondaryActions.length > 0 && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondaryActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <div key={action.id}>
                      {index > 0 && action.variant === 'destructive' && (
                        <DropdownMenuSeparator />
                      )}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          action.variant === 'destructive' && 'text-destructive'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 ml-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <div className="h-6 w-px bg-border" />

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 ml-2" />
          إلغاء
        </Button>
      </div>
    </div>
  )
}

/**
 * Compact Bulk Actions Bar (for mobile)
 */
interface CompactBulkActionsBarProps {
  selectedCount: number
  onClear: () => void
  actions?: BulkAction[]
  className?: string
}

export function CompactBulkActionsBar({
  selectedCount,
  onClear,
  actions = [],
  className,
}: CompactBulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50',
        'bg-card border shadow-lg rounded-lg',
        'animate-in slide-in-from-bottom-5',
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">{selectedCount} محدد</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  إجراءات
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <div key={action.id}>
                      {index > 0 && action.variant === 'destructive' && (
                        <DropdownMenuSeparator />
                      )}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          action.variant === 'destructive' && 'text-destructive'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 ml-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Default bulk actions
 */
export const defaultBulkActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'حذف',
    icon: Trash2,
    variant: 'destructive',
    onClick: () => {},
  },
  {
    id: 'edit',
    label: 'تعديل',
    icon: Edit,
    onClick: () => {},
  },
  {
    id: 'duplicate',
    label: 'نسخ',
    icon: Copy,
    onClick: () => {},
  },
  {
    id: 'archive',
    label: 'أرشفة',
    icon: Archive,
    onClick: () => {},
  },
  {
    id: 'export',
    label: 'تصدير',
    icon: Download,
    onClick: () => {},
  },
]

