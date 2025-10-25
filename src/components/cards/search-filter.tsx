'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface SearchFilterState {
  searchQuery: string
  status: string
  cardType: string
  bankName: string
  sortBy: string
}

interface SearchFilterProps {
  filters: SearchFilterState
  onFiltersChange: (filters: SearchFilterState) => void
  banks: string[] // List of unique bank names
}

export function SearchFilter({ filters, onFiltersChange, banks }: SearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleReset = () => {
    onFiltersChange({
      searchQuery: '',
      status: 'all',
      cardType: 'all',
      bankName: 'all',
      sortBy: 'name-asc',
    })
  }

  const activeFiltersCount = [
    filters.searchQuery,
    filters.status !== 'all',
    filters.cardType !== 'all',
    filters.bankName !== 'all',
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن بطاقة..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="pr-10"
          />
        </div>
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
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
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">فلاتر متقدمة</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="inactive">غير نشطة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card Type Filter */}
            <div className="space-y-2">
              <Label>نوع البطاقة</Label>
              <Select
                value={filters.cardType}
                onValueChange={(value) => onFiltersChange({ ...filters, cardType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="discover">Discover</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Filter */}
            <div className="space-y-2">
              <Label>البنك</Label>
              <Select
                value={filters.bankName}
                onValueChange={(value) => onFiltersChange({ ...filters, bankName: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {banks.map(bank => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>الترتيب حسب</Label>
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
                  <SelectItem value="limit-desc">الحد الائتماني (الأعلى)</SelectItem>
                  <SelectItem value="limit-asc">الحد الائتماني (الأقل)</SelectItem>
                  <SelectItem value="balance-desc">الرصيد المستخدم (الأعلى)</SelectItem>
                  <SelectItem value="balance-asc">الرصيد المستخدم (الأقل)</SelectItem>
                  <SelectItem value="available-desc">الرصيد المتاح (الأعلى)</SelectItem>
                  <SelectItem value="available-asc">الرصيد المتاح (الأقل)</SelectItem>
                  <SelectItem value="utilization-desc">نسبة الاستخدام (الأعلى)</SelectItem>
                  <SelectItem value="utilization-asc">نسبة الاستخدام (الأقل)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  بحث: {filters.searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
                  />
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  الحالة: {filters.status === 'active' ? 'نشطة' : 'غير نشطة'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                  />
                </Badge>
              )}
              {filters.cardType !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  النوع: {filters.cardType}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, cardType: 'all' })}
                  />
                </Badge>
              )}
              {filters.bankName !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  البنك: {filters.bankName}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, bankName: 'all' })}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

