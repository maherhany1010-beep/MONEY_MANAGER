'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface SearchFilter {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface AdvancedSearchProps {
  value: string
  onChange: (value: string) => void
  filters?: SearchFilter[]
  activeFilters?: Record<string, any>
  onFiltersChange?: (filters: Record<string, any>) => void
  placeholder?: string
  className?: string
}

export function AdvancedSearch({
  value,
  onChange,
  filters = [],
  activeFilters = {},
  onFiltersChange,
  placeholder = 'بحث...',
  className,
}: AdvancedSearchProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters)

  const activeFiltersCount = useMemo(() => {
    return Object.values(localFilters).filter(v => v !== '' && v !== null && v !== undefined).length
  }, [localFilters])

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...localFilters, [filterId]: value }
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilter = (filterId: string) => {
    const newFilters = { ...localFilters }
    delete newFilters[filterId]
    setLocalFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFiltersChange?.({})
  }

  const clearSearch = () => {
    onChange('')
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-10 pl-10"
            dir="rtl"
          />
          {value && (
            <button
              onClick={clearSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Button */}
        {filters.length > 0 && (
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 ml-2" />
                فلاتر
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -left-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end" dir="rtl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">الفلاتر</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-auto p-1 text-xs"
                    >
                      مسح الكل
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {filters.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <Label htmlFor={filter.id}>{filter.label}</Label>
                      {filter.type === 'text' && (
                        <Input
                          id={filter.id}
                          value={localFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          placeholder={filter.placeholder}
                          dir="rtl"
                        />
                      )}
                      {filter.type === 'number' && (
                        <Input
                          id={filter.id}
                          type="number"
                          value={localFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          placeholder={filter.placeholder}
                          dir="rtl"
                        />
                      )}
                      {filter.type === 'date' && (
                        <Input
                          id={filter.id}
                          type="date"
                          value={localFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          dir="rtl"
                        />
                      )}
                      {filter.type === 'select' && filter.options && (
                        <select
                          id={filter.id}
                          value={localFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          dir="rtl"
                        >
                          <option value="">الكل</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(localFilters).map(([filterId, value]) => {
            if (!value) return null
            const filter = filters.find(f => f.id === filterId)
            if (!filter) return null

            let displayValue = value
            if (filter.type === 'select' && filter.options) {
              const option = filter.options.find(o => o.value === value)
              displayValue = option?.label || value
            }

            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="gap-1 pr-2 pl-1"
              >
                <span className="text-xs">
                  {filter.label}: {displayValue}
                </span>
                <button
                  onClick={() => clearFilter(filterId)}
                  className="hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

