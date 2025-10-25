'use client'

import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'

interface ViewToggleProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">شبكة</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">قائمة</span>
      </Button>
    </div>
  )
}

