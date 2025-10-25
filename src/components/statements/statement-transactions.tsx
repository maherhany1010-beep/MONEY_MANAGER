'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  formatCurrency, 
  formatDate, 
  getTransactionTypeLabel, 
  getTransactionTypeColor 
} from '@/lib/utils'
import { Search, Filter, ArrowUpDown } from 'lucide-react'

interface StatementTransactionsProps {
  statementId: string
}

// Mock transactions data for the statement
const mockTransactions = [
  {
    id: '1',
    type: 'withdrawal',
    amount: 245.50,
    description: 'سوبر ماركت العثيم',
    category: 'طعام ومشروبات',
    transactionDate: '2024-01-10T10:30:00Z',
    merchant: 'العثيم',
    location: 'الرياض',
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 180.00,
    description: 'محطة أرامكو',
    category: 'وقود',
    transactionDate: '2024-01-09T15:45:00Z',
    merchant: 'أرامكو',
    location: 'الرياض',
  },
  {
    id: '3',
    type: 'payment',
    amount: 1500.00,
    description: 'سداد فاتورة',
    category: 'سداد',
    transactionDate: '2024-01-08T09:00:00Z',
    merchant: 'تحويل بنكي',
    location: 'أونلاين',
  },
  {
    id: '4',
    type: 'withdrawal',
    amount: 95.75,
    description: 'مطعم البيك',
    category: 'طعام ومشروبات',
    transactionDate: '2024-01-07T20:15:00Z',
    merchant: 'البيك',
    location: 'الرياض',
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: 320.00,
    description: 'صيدلية النهدي',
    category: 'صحة',
    transactionDate: '2024-01-06T14:20:00Z',
    merchant: 'النهدي',
    location: 'الرياض',
  },
  {
    id: '6',
    type: 'cashback',
    amount: 25.30,
    description: 'كاش باك شهري',
    category: 'مكافآت',
    transactionDate: '2024-01-01T00:00:00Z',
    merchant: 'البنك',
    location: 'تلقائي',
  },
]

export function StatementTransactions({ statementId }: StatementTransactionsProps) {
  const [transactions] = useState(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')

  const categories = Array.from(new Set(transactions.map(t => t.category)))

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterAndSortTransactions(term, selectedType, selectedCategory, sortBy)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    filterAndSortTransactions(searchTerm, type, selectedCategory, sortBy)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterAndSortTransactions(searchTerm, selectedType, category, sortBy)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    filterAndSortTransactions(searchTerm, selectedType, selectedCategory, sort)
  }

  const filterAndSortTransactions = (search: string, type: string, category: string, sort: string) => {
    let filtered = transactions

    // Apply filters
    if (search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type)
    }

    if (category !== 'all') {
      filtered = filtered.filter(t => t.category === category)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        case 'date-asc':
          return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'merchant':
          return a.merchant.localeCompare(b.merchant)
        default:
          return 0
      }
    })

    setFilteredTransactions(filtered)
  }

  const totalAmount = filteredTransactions.reduce((sum, t) => {
    return t.type === 'withdrawal' ? sum + t.amount : sum - t.amount
  }, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ملخص المعاملات</CardTitle>
          <CardDescription>
            {filteredTransactions.length} معاملة • إجمالي: {formatCurrency(Math.abs(totalAmount))}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المعاملات..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={selectedType} onValueChange={handleTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="withdrawal">سحب</SelectItem>
                <SelectItem value="payment">سداد</SelectItem>
                <SelectItem value="cashback">كاش باك</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
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

            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">التاريخ (الأحدث أولاً)</SelectItem>
                <SelectItem value="date-asc">التاريخ (الأقدم أولاً)</SelectItem>
                <SelectItem value="amount-desc">المبلغ (الأكبر أولاً)</SelectItem>
                <SelectItem value="amount-asc">المبلغ (الأصغر أولاً)</SelectItem>
                <SelectItem value="merchant">التاجر (أبجدياً)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المعاملات</CardTitle>
          <CardDescription>
            جميع المعاملات في هذا الكشف
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{transaction.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {getTransactionTypeLabel(transaction.type)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-sm text-muted-foreground">
                    <p>{transaction.merchant}</p>
                    <p>{transaction.location}</p>
                    <p>{transaction.category}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>
                <div className="text-left">
                  <p className={`font-medium text-lg ${getTransactionTypeColor(transaction.type)}`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد معاملات</h3>
                <p className="text-muted-foreground">
                  لم يتم العثور على معاملات تطابق معايير البحث المحددة
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
