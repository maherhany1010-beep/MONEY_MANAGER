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
  status: 'all' | 'active' | 'inactive'
  bank: string
  accountType: string
  sortBy: string
}

interface SearchFilterProps {
  filters: SearchFilterState
  onFiltersChange: (filters: SearchFilterState) => void
  banks: string[]
  accountTypes: string[]
}

export function SearchFilter({ filters, onFiltersChange, banks, accountTypes }: SearchFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.bank !== 'all',
    filters.accountType !== 'all',
    filters.sortBy !== 'name-asc',
  ].filter(Boolean).length

  const handleReset = () => {
    onFiltersChange({
      searchQuery: '',
      status: 'all',
      bank: 'all',
      accountType: 'all',
      sortBy: 'name-asc',
    })
  }

  const removeFilter = (key: keyof SearchFilterState) => {
    const defaultValues: SearchFilterState = {
      searchQuery: '',
      status: 'all',
      bank: 'all',
      accountType: 'all',
      sortBy: 'name-asc',
    }
    onFiltersChange({
      ...filters,
      [key]: defaultValues[key],
    })
  }

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'جاري'
      case 'savings': return 'توفير'
      case 'business': return 'تجاري'
      case 'investment': return 'استثماري'
      default: return type
    }
  }

  return (
    <div className="space-y-4">
      {/* شريط البحث */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن حساب..."
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
                  </SelectContent>
                </Select>
              </div>

              {/* البنك */}
              <div className="space-y-2">
                <Label>البنك</Label>
                <Select
                  value={filters.bank}
                  onValueChange={(value) => onFiltersChange({ ...filters, bank: value })}
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

              {/* نوع الحساب */}
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <Select
                  value={filters.accountType}
                  onValueChange={(value) => onFiltersChange({ ...filters, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {accountTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getAccountTypeLabel(type)}
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
                    <SelectItem value="balance-desc">الرصيد (الأعلى)</SelectItem>
                    <SelectItem value="balance-asc">الرصيد (الأقل)</SelectItem>
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
              الحالة: {filters.status === 'active' ? 'نشطة' : 'غير نشطة'}
              <button
                onClick={() => removeFilter('status')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.bank !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              البنك: {filters.bank}
              <button
                onClick={() => removeFilter('bank')}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.accountType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              النوع: {getAccountTypeLabel(filters.accountType)}
              <button
                onClick={() => removeFilter('accountType')}
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
                filters.sortBy === 'balance-desc' ? 'الرصيد (الأعلى)' :
                filters.sortBy === 'balance-asc' ? 'الرصيد (الأقل)' :
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

