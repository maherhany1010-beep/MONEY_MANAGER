'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

export interface ComboboxOption {
  value: string
  label: string
  searchText?: string
  icon?: React.ReactNode
  subtitle?: string
  disabled?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'اختر...',
  searchPlaceholder = 'ابحث...',
  emptyText = 'لا توجد نتائج',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const selectedOption = options.find((option) => option.value === value)

  // تصفية الخيارات بناءً على البحث
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options

    const query = searchQuery.toLowerCase()
    return options.filter((option) => {
      const searchText = option.searchText || option.label
      return searchText.toLowerCase().includes(query)
    })
  }, [options, searchQuery])

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue === value ? '' : optionValue)
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              {selectedOption?.subtitle && (
                <span className="text-xs text-muted-foreground truncate">
                  {selectedOption.subtitle}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          {/* حقل البحث */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* قائمة الخيارات */}
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <div className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      value === option.value && 'bg-accent text-accent-foreground',
                      option.disabled && 'pointer-events-none opacity-50',
                      'gap-2'
                    )}
                  >
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4 flex-shrink-0',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

