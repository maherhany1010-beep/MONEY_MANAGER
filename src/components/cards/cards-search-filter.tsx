'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X, SortAsc } from 'lucide-react'
import { CreditCard } from '@/contexts/cards-context'

interface CardsSearchFilterProps {
  cards: CreditCard[]
  onFilteredCardsChange: (cards: CreditCard[]) => void
}

type SortOption = 'name' | 'balance' | 'limit' | 'utilization' | 'cashback'
type FilterType = 'all' | 'visa' | 'mastercard' | 'amex' | 'other'
type StatusFilter = 'all' | 'active' | 'inactive'

export function CardsSearchFilter({ cards, onFilteredCardsChange }: CardsSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [bankFilter, setBankFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Get unique banks
  const banks = useMemo(() => {
    const uniqueBanks = Array.from(new Set(cards.map(c => c.bankName)))
    return uniqueBanks.sort()
  }, [cards])

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = [...cards]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(card =>
        card.name.toLowerCase().includes(query) ||
        card.bankName.toLowerCase().includes(query) ||
        card.cardNumberLastFour.includes(query)
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(card => card.cardType === typeFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(card =>
        statusFilter === 'active' ? card.isActive : !card.isActive
      )
    }

    // Bank filter
    if (bankFilter !== 'all') {
      result = result.filter(card => card.bankName === bankFilter)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ar')
          break
        case 'balance':
          comparison = a.currentBalance - b.currentBalance
          break
        case 'limit':
          comparison = a.creditLimit - b.creditLimit
          break
        case 'utilization':
          const utilizationA = (a.currentBalance / a.creditLimit) * 100
          const utilizationB = (b.currentBalance / b.creditLimit) * 100
          comparison = utilizationA - utilizationB
          break
        case 'cashback':
          comparison = a.cashbackRate - b.cashbackRate
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [cards, searchQuery, typeFilter, statusFilter, bankFilter, sortBy, sortOrder])

  // Update parent component
  useEffect(() => {
    onFilteredCardsChange(filteredCards)
  }, [filteredCards, onFilteredCardsChange])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (typeFilter !== 'all') count++
    if (statusFilter !== 'all') count++
    if (bankFilter !== 'all') count++
    return count
  }, [searchQuery, typeFilter, statusFilter, bankFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
    setBankFilter('all')
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن بطاقة (الاسم، البنك، رقم البطاقة)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="name">الاسم</SelectItem>
              <SelectItem value="balance">الرصيد</SelectItem>
              <SelectItem value="limit">الحد الائتماني</SelectItem>
              <SelectItem value="utilization">نسبة الاستخدام</SelectItem>
              <SelectItem value="cashback">الكاش باك</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
          >
            <SortAsc className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as FilterType)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="نوع البطاقة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">Mastercard</SelectItem>
            <SelectItem value="amex">American Express</SelectItem>
            <SelectItem value="other">أخرى</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشطة</SelectItem>
            <SelectItem value="inactive">معطلة</SelectItem>
          </SelectContent>
        </Select>

        {/* Bank Filter */}
        <Select value={bankFilter} onValueChange={setBankFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="البنك" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">جميع البنوك</SelectItem>
            {banks.map(bank => (
              <SelectItem key={bank} value={bank}>{bank}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            مسح الفلاتر ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              بحث: {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              النوع: {typeFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setTypeFilter('all')}
              />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              الحالة: {statusFilter === 'active' ? 'نشطة' : 'معطلة'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setStatusFilter('all')}
              />
            </Badge>
          )}
          {bankFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              البنك: {bankFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setBankFilter('all')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        عرض {filteredCards.length} من {cards.length} بطاقة
      </div>
    </div>
  )
}

