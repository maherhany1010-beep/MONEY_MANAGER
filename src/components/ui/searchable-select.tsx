'use client'

import * as React from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'اختر خياراً',
  searchPlaceholder = 'ابحث...',
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    
    const term = searchTerm.toLowerCase()
    return options.filter(
      option =>
        option.label.toLowerCase().includes(term) ||
        option.description?.toLowerCase().includes(term)
    )
  }, [options, searchTerm])

  const selectedOption = options.find(opt => opt.value === value)

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
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col gap-2 p-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                لم يتم العثور على نتائج
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value)
                    setOpen(false)
                    setSearchTerm('')
                  }}
                  className={cn(
                    'w-full text-right px-2 py-2 rounded-md text-sm flex items-center justify-between hover:bg-accent transition-colors',
                    value === option.value && 'bg-accent'
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Clear Button */}
          {value && (
            <button
              onClick={() => {
                onValueChange('')
                setSearchTerm('')
              }}
              className="w-full px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              مسح الاختيار
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

