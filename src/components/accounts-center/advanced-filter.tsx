'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

export interface FilterState {
  searchQuery: string
  accountType: string
  minBalance: string
  maxBalance: string
  sortBy: string
}

interface AdvancedFilterProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  accountTypes: Array<{ id: string; title: string }>
}

export function AdvancedFilter({ filters, onFiltersChange, accountTypes }: AdvancedFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, searchQuery: value })
  }, [filters, onFiltersChange])

  const handleTypeChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, accountType: value })
  }, [filters, onFiltersChange])

  const handleMinBalanceChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, minBalance: value })
  }, [filters, onFiltersChange])

  const handleMaxBalanceChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, maxBalance: value })
  }, [filters, onFiltersChange])

  const handleSortChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, sortBy: value })
  }, [filters, onFiltersChange])

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      searchQuery: '',
      accountType: 'all',
      minBalance: '',
      maxBalance: '',
      sortBy: 'balance-desc',
    })
  }, [onFiltersChange])

  // حساب عدد الفلاتر النشطة
  const activeFiltersCount = [
    filters.searchQuery,
    filters.accountType !== 'all' ? filters.accountType : '',
    filters.minBalance,
    filters.maxBalance,
  ].filter(Boolean).length

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* شريط البحث والترتيب */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* البحث */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الحسابات..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* الترتيب */}
            <div className="w-full md:w-48">
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance-desc">الرصيد (الأعلى أولاً)</SelectItem>
                  <SelectItem value="balance-asc">الرصيد (الأقل أولاً)</SelectItem>
                  <SelectItem value="name-asc">الاسم (أ-ي)</SelectItem>
                  <SelectItem value="name-desc">الاسم (ي-أ)</SelectItem>
                  <SelectItem value="count-desc">العدد (الأكثر أولاً)</SelectItem>
                  <SelectItem value="count-asc">العدد (الأقل أولاً)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زر الفلاتر المتقدمة */}
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                  فلاتر متقدمة
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 dark:bg-muted/20 rounded-lg border">
                  {/* نوع الحساب */}
                  <div className="space-y-2">
                    <Label>نوع الحساب</Label>
                    <Select value={filters.accountType} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* الحد الأدنى للرصيد */}
                  <div className="space-y-2">
                    <Label>الحد الأدنى للرصيد</Label>
                    <Input
                      type="number"
                      placeholder="مثال: 10000"
                      value={filters.minBalance}
                      onChange={(e) => handleMinBalanceChange(e.target.value)}
                      min="0"
                    />
                  </div>

                  {/* الحد الأقصى للرصيد */}
                  <div className="space-y-2">
                    <Label>الحد الأقصى للرصيد</Label>
                    <Input
                      type="number"
                      placeholder="مثال: 100000"
                      value={filters.maxBalance}
                      onChange={(e) => handleMaxBalanceChange(e.target.value)}
                      min="0"
                    />
                  </div>

                  {/* زر مسح الفلاتر */}
                  <div className="flex items-end md:col-span-3">
                    <Button
                      variant="ghost"
                      onClick={handleClearFilters}
                      className="w-full md:w-auto"
                      disabled={activeFiltersCount === 0}
                    >
                      <X className="h-4 w-4 ml-2" />
                      مسح جميع الفلاتر
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* عرض الفلاتر النشطة */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  بحث: {filters.searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
              {filters.accountType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  النوع: {accountTypes.find(t => t.id === filters.accountType)?.title}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleTypeChange('all')}
                  />
                </Badge>
              )}
              {filters.minBalance && (
                <Badge variant="secondary" className="gap-1">
                  من: {parseFloat(filters.minBalance).toLocaleString()} جنيه
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleMinBalanceChange('')}
                  />
                </Badge>
              )}
              {filters.maxBalance && (
                <Badge variant="secondary" className="gap-1">
                  إلى: {parseFloat(filters.maxBalance).toLocaleString()} جنيه
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleMaxBalanceChange('')}
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

