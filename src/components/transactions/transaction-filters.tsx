'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { CalendarIcon, X, Filter } from 'lucide-react'

interface TransactionFiltersProps {
  onFiltersChange: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  type: string
  cardId: string
  category: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  amountMin: number | undefined
  amountMax: number | undefined
}

const initialFilters: FilterState = {
  search: '',
  type: 'all',
  cardId: 'all',
  category: 'all',
  dateFrom: undefined,
  dateTo: undefined,
  amountMin: undefined,
  amountMax: undefined,
}

// Mock data
const mockCards = [
  { id: '1', name: 'بطاقة الراجحي الذهبية' },
  { id: '2', name: 'بطاقة الأهلي البلاتينية' },
  { id: '3', name: 'بطاقة سامبا الكلاسيكية' },
]

const categories = [
  'طعام ومشروبات',
  'وقود',
  'تسوق',
  'ترفيه',
  'صحة',
  'تعليم',
  'مواصلات',
  'فواتير',
  'سداد',
  'أخرى',
]

export function TransactionFilters({ onFiltersChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    onFiltersChange(initialFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== 'all') count++
    if (filters.cardId !== 'all') count++
    if (filters.category !== 'all') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.amountMin !== undefined) count++
    if (filters.amountMax !== undefined) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">البحث والفلترة</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} فلتر نشط</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 ml-1" />
                مسح الفلاتر
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 ml-1" />
              {isExpanded ? 'إخفاء' : 'إظهار'} الفلاتر
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Basic Filters - Always Visible */}
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="space-y-2">
            <Label htmlFor="search">البحث</Label>
            <Input
              id="search"
              placeholder="البحث في الوصف أو الفئة..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع المعاملة</Label>
            <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="withdrawal">سحب</SelectItem>
                <SelectItem value="payment">سداد</SelectItem>
                <SelectItem value="deposit">إيداع</SelectItem>
                <SelectItem value="cashback">كاش باك</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">البطاقة</Label>
            <Select value={filters.cardId} onValueChange={(value) => updateFilters({ cardId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="جميع البطاقات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع البطاقات</SelectItem>
                {mockCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="category">الفئة</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {filters.dateFrom ? formatDate(filters.dateFrom) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilters({ dateFrom: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {filters.dateTo ? formatDate(filters.dateTo) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilters({ dateTo: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountMin">أقل مبلغ</Label>
              <Input
                id="amountMin"
                type="number"
                placeholder="0"
                value={filters.amountMin || ''}
                onChange={(e) => updateFilters({ 
                  amountMin: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountMax">أكبر مبلغ</Label>
              <Input
                id="amountMax"
                type="number"
                placeholder="1000"
                value={filters.amountMax || ''}
                onChange={(e) => updateFilters({ 
                  amountMax: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
