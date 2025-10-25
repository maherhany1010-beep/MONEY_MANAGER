'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'

export interface SearchFilterState {
  searchQuery: string
  status: string
  cardType: string
  provider: string
  sortBy: string
}

interface SearchFilterProps {
  filters: SearchFilterState
  onFiltersChange: (filters: SearchFilterState) => void
  onReset: () => void
}

export function SearchFilter({ filters, onFiltersChange, onReset }: SearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (key: keyof SearchFilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.cardType !== 'all',
    filters.provider !== 'all',
    filters.sortBy !== 'balance-desc',
  ].filter(Boolean).length

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم، رقم البطاقة، أو المزود..."
                value={filters.searchQuery}
                onChange={(e) => handleChange('searchQuery', e.target.value)}
                className="pr-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {(filters.searchQuery || activeFiltersCount > 0) && (
              <Button variant="ghost" size="icon" onClick={onReset}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={filters.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="suspended">معلقة</SelectItem>
                    <SelectItem value="blocked">محظورة</SelectItem>
                    <SelectItem value="expired">منتهية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="cardType">نوع البطاقة</Label>
                <Select value={filters.cardType} onValueChange={(value) => handleChange('cardType', value)}>
                  <SelectTrigger id="cardType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="physical">فيزيائية</SelectItem>
                    <SelectItem value="virtual">افتراضية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Filter */}
              <div className="space-y-2">
                <Label htmlFor="provider">المزود</Label>
                <Select value={filters.provider} onValueChange={(value) => handleChange('provider', value)}>
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="فوري">فوري</SelectItem>
                    <SelectItem value="أمان">أمان</SelectItem>
                    <SelectItem value="ممكن">ممكن</SelectItem>
                    <SelectItem value="مصاري">مصاري</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sortBy">الترتيب حسب</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleChange('sortBy', value)}>
                  <SelectTrigger id="sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balance-desc">الرصيد (الأعلى أولاً)</SelectItem>
                    <SelectItem value="balance-asc">الرصيد (الأقل أولاً)</SelectItem>
                    <SelectItem value="usage-desc">الاستخدام (الأعلى أولاً)</SelectItem>
                    <SelectItem value="usage-asc">الاستخدام (الأقل أولاً)</SelectItem>
                    <SelectItem value="date-desc">التاريخ (الأحدث أولاً)</SelectItem>
                    <SelectItem value="date-asc">التاريخ (الأقدم أولاً)</SelectItem>
                    <SelectItem value="name-asc">الاسم (أ-ي)</SelectItem>
                    <SelectItem value="name-desc">الاسم (ي-أ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  الحالة: {filters.status === 'active' ? 'نشطة' : filters.status === 'suspended' ? 'معلقة' : filters.status === 'blocked' ? 'محظورة' : 'منتهية'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleChange('status', 'all')}
                  />
                </Badge>
              )}
              {filters.cardType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  النوع: {filters.cardType === 'physical' ? 'فيزيائية' : 'افتراضية'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleChange('cardType', 'all')}
                  />
                </Badge>
              )}
              {filters.provider !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  المزود: {filters.provider}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleChange('provider', 'all')}
                  />
                </Badge>
              )}
              {filters.sortBy !== 'balance-desc' && (
                <Badge variant="secondary" className="gap-1">
                  الترتيب: {
                    filters.sortBy === 'balance-asc' ? 'الرصيد (الأقل)' :
                    filters.sortBy === 'usage-desc' ? 'الاستخدام (الأعلى)' :
                    filters.sortBy === 'usage-asc' ? 'الاستخدام (الأقل)' :
                    filters.sortBy === 'date-desc' ? 'التاريخ (الأحدث)' :
                    filters.sortBy === 'date-asc' ? 'التاريخ (الأقدم)' :
                    filters.sortBy === 'name-asc' ? 'الاسم (أ-ي)' :
                    'الاسم (ي-أ)'
                  }
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleChange('sortBy', 'balance-desc')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

