'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface SearchFilterState {
  searchQuery: string
  status: 'all' | 'active' | 'inactive' | 'maintenance'
  provider: string
  location: string
  sortBy: string
}

interface SearchFilterProps {
  filters: SearchFilterState
  onFiltersChange: (filters: SearchFilterState) => void
  providers: string[]
  locations: string[]
}

export function SearchFilter({ filters, onFiltersChange, providers, locations }: SearchFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.provider !== 'all',
    filters.location !== 'all',
    filters.sortBy !== 'name-asc',
  ].filter(Boolean).length

  const handleReset = () => {
    onFiltersChange({
      searchQuery: '',
      status: 'all',
      provider: 'all',
      location: 'all',
      sortBy: 'name-asc',
    })
  }

  const removeFilter = (key: keyof SearchFilterState) => {
    const defaultValues: SearchFilterState = {
      searchQuery: '',
      status: 'all',
      provider: 'all',
      location: 'all',
      sortBy: 'name-asc',
    }
    onFiltersChange({
      ...filters,
      [key]: defaultValues[key],
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة'
      case 'inactive': return 'غير نشطة'
      case 'maintenance': return 'صيانة'
      default: return status
    }
  }

  return (
    <div className="space-y-4">
      {/* شريط البحث */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن ماكينة..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="pr-10"
          />
        </div>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              فلاتر متقدمة
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="mr-2 px-1.5 py-0.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* الفلاتر المتقدمة */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid gap-4 md:grid-cols-4">
              {/* الحالة */}
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value: any) => onFiltersChange({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="inactive">غير نشطة</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* المزود */}
              <div className="space-y-2">
                <Label>المزود</Label>
                <Select
                  value={filters.provider}
                  onValueChange={(value) => onFiltersChange({ ...filters, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {providers.map(provider => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* الموقع */}
              <div className="space-y-2">
                <Label>الموقع</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => onFiltersChange({ ...filters, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* الترتيب */}
              <div className="space-y-2">
                <Label>الترتيب</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">الاسم (أ-ي)</SelectItem>
                    <SelectItem value="name-desc">الاسم (ي-أ)</SelectItem>
                    <SelectItem value="revenue-desc">المبيعات (الأعلى)</SelectItem>
                    <SelectItem value="revenue-asc">المبيعات (الأقل)</SelectItem>
                    <SelectItem value="transactions-desc">المعاملات (الأكثر)</SelectItem>
                    <SelectItem value="transactions-asc">المعاملات (الأقل)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* زر إعادة التعيين */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full"
              >
                <X className="h-4 w-4 ml-2" />
                إعادة تعيين الفلاتر
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* الفلاتر النشطة */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              الحالة: {getStatusLabel(filters.status)}
              <button
                onClick={() => removeFilter('status')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.provider !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              المزود: {filters.provider}
              <button
                onClick={() => removeFilter('provider')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.location !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              الموقع: {filters.location}
              <button
                onClick={() => removeFilter('location')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sortBy !== 'name-asc' && (
            <Badge variant="secondary" className="gap-1">
              مرتب حسب: {
                filters.sortBy === 'name-desc' ? 'الاسم (ي-أ)' :
                filters.sortBy === 'revenue-desc' ? 'المبيعات (الأعلى)' :
                filters.sortBy === 'revenue-asc' ? 'المبيعات (الأقل)' :
                filters.sortBy === 'transactions-desc' ? 'المعاملات (الأكثر)' :
                filters.sortBy === 'transactions-asc' ? 'المعاملات (الأقل)' :
                'الاسم (أ-ي)'
              }
              <button
                onClick={() => removeFilter('sortBy')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

