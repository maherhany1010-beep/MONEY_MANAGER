'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  Download, 
  Gift, 
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowUpDown
} from 'lucide-react'

interface CashbackHistory {
  id: string
  cardId: string
  cardName: string
  amount: number
  category: string
  transactionAmount: number
  cashbackRate: number
  earnedDate: string
  status: 'earned' | 'redeemed' | 'pending'
}

interface CashbackHistoryProps {
  history: CashbackHistory[]
  onExport: () => void
}

export function CashbackHistory({ history, onExport }: CashbackHistoryProps) {
  const [filteredHistory, setFilteredHistory] = useState(history)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cardFilter, setCardFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterAndSortHistory(term, statusFilter, cardFilter, sortBy)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterAndSortHistory(searchTerm, status, cardFilter, sortBy)
  }

  const handleCardFilter = (cardId: string) => {
    setCardFilter(cardId)
    filterAndSortHistory(searchTerm, statusFilter, cardId, sortBy)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    filterAndSortHistory(searchTerm, statusFilter, cardFilter, sort)
  }

  const filterAndSortHistory = (search: string, status: string, cardId: string, sort: string) => {
    let filtered = history

    // Apply search filter
    if (search) {
      filtered = filtered.filter(h => 
        h.category.toLowerCase().includes(search.toLowerCase()) ||
        h.cardName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(h => h.status === status)
    }

    // Apply card filter
    if (cardId !== 'all') {
      filtered = filtered.filter(h => h.cardId === cardId)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime()
        case 'date-asc':
          return new Date(a.earnedDate).getTime() - new Date(b.earnedDate).getTime()
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    setFilteredHistory(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'earned':
        return <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'redeemed':
        return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'pending':
        return <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      default:
        return <Gift className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'earned':
        return 'مكتسب'
      case 'redeemed':
        return 'مسترد'
      case 'pending':
        return 'معلق'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'earned':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
      case 'redeemed':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const totalAmount = filteredHistory.reduce((sum, h) => sum + h.amount, 0)
  const earnedAmount = filteredHistory.filter(h => h.status === 'earned').reduce((sum, h) => sum + h.amount, 0)
  const redeemedAmount = filteredHistory.filter(h => h.status === 'redeemed').reduce((sum, h) => sum + h.amount, 0)

  // Get unique cards for filter
  const uniqueCards = Array.from(new Set(history.map(h => h.cardId)))
    .map(cardId => history.find(h => h.cardId === cardId)!)
    .filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المعروض</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredHistory.length} معاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتسب</CardTitle>
            <Gift className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earnedAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              كاش باك مكتسب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسترد</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(redeemedAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              تم استرداده
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">البحث والفلترة</CardTitle>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في السجل..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الكاش باك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="earned">مكتسب</SelectItem>
                <SelectItem value="redeemed">مسترد</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cardFilter} onValueChange={handleCardFilter}>
              <SelectTrigger>
                <SelectValue placeholder="البطاقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع البطاقات</SelectItem>
                {uniqueCards.map((card) => (
                  <SelectItem key={card.cardId} value={card.cardId}>
                    {card.cardName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">التاريخ (الأحدث أولاً)</SelectItem>
                <SelectItem value="date-asc">التاريخ (الأقدم أولاً)</SelectItem>
                <SelectItem value="amount-desc">المبلغ (الأكبر أولاً)</SelectItem>
                <SelectItem value="amount-asc">المبلغ (الأصغر أولاً)</SelectItem>
                <SelectItem value="category">الفئة (أبجدياً)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الكاش باك</CardTitle>
          <CardDescription>
            جميع معاملات الكاش باك مرتبة حسب التاريخ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(transaction.status)}
                    <span className="font-medium">{transaction.category}</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span>{transaction.cardName}</span>
                    </div>
                    {transaction.transactionAmount > 0 && (
                      <span>
                        معاملة: {formatCurrency(transaction.transactionAmount)} 
                        ({transaction.cashbackRate}%)
                      </span>
                    )}
                    <span>{formatDate(transaction.earnedDate)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-lg ${
                    transaction.status === 'redeemed' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {transaction.status === 'redeemed' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد معاملات</h3>
                <p className="text-muted-foreground">
                  لم يتم العثور على معاملات كاش باك تطابق معايير البحث المحددة
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
