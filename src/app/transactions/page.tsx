'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { 
  formatCurrency, 
  formatDate, 
  getTransactionTypeLabel, 
  getTransactionTypeColor 
} from '@/lib/utils'
import { ArrowUpDown, Plus, Search, Filter } from 'lucide-react'

// Mock data - will be replaced with real data from Supabase
const mockTransactions = [
  {
    id: '1',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    type: 'withdrawal',
    amount: 245.50,
    description: 'سوبر ماركت العثيم',
    category: 'طعام ومشروبات',
    transactionDate: '2024-01-10T10:30:00Z',
  },
  {
    id: '2',
    cardId: '2',
    cardName: 'بطاقة الأهلي البلاتينية',
    type: 'withdrawal',
    amount: 180.00,
    description: 'محطة أرامكو',
    category: 'وقود',
    transactionDate: '2024-01-09T15:45:00Z',
  },
  {
    id: '3',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    type: 'payment',
    amount: 1500.00,
    description: 'سداد فاتورة',
    category: 'سداد',
    transactionDate: '2024-01-08T09:00:00Z',
  },
  {
    id: '4',
    cardId: '3',
    cardName: 'بطاقة سامبا الكلاسيكية',
    type: 'withdrawal',
    amount: 95.75,
    description: 'مطعم البيك',
    category: 'طعام ومشروبات',
    transactionDate: '2024-01-07T20:15:00Z',
  },
  {
    id: '5',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    type: 'cashback',
    amount: 25.30,
    description: 'كاش باك شهري',
    category: 'مكافآت',
    transactionDate: '2024-01-01T00:00:00Z',
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCard, setSelectedCard] = useState<string>('all')

  const handleAddTransaction = () => {
    setIsAddDialogOpen(true)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterTransactions(term, selectedType, selectedCard)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    filterTransactions(searchTerm, type, selectedCard)
  }

  const handleCardFilter = (cardId: string) => {
    setSelectedCard(cardId)
    filterTransactions(searchTerm, selectedType, cardId)
  }

  const filterTransactions = (search: string, type: string, cardId: string) => {
    let filtered = transactions

    if (search) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type)
    }

    if (cardId !== 'all') {
      filtered = filtered.filter(t => t.cardId === cardId)
    }

    setFilteredTransactions(filtered)
  }

  const totalSpent = filteredTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalReceived = filteredTransactions
    .filter(t => t.type === 'payment' || t.type === 'cashback')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <>
      <PageHeader
        title="العمليات المالية"
        description="تتبع جميع معاملاتك المالية على البطاقات الائتمانية"
        action={{
          label: 'إضافة معاملة جديدة',
          onClick: handleAddTransaction,
          icon: Plus,
        }}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              من المعاملات المعروضة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              سداد وكاش باك
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المعاملات</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              معاملة معروضة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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

            <Select value={selectedCard} onValueChange={handleCardFilter}>
              <SelectTrigger>
                <SelectValue placeholder="البطاقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع البطاقات</SelectItem>
                <SelectItem value="1">بطاقة الراجحي الذهبية</SelectItem>
                <SelectItem value="2">بطاقة الأهلي البلاتينية</SelectItem>
                <SelectItem value="3">بطاقة سامبا الكلاسيكية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="لا توجد معاملات"
          description="لم يتم العثور على معاملات تطابق معايير البحث المحددة"
          action={{
            label: 'إضافة معاملة جديدة',
            onClick: handleAddTransaction,
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات</CardTitle>
            <CardDescription>
              جميع معاملاتك المالية مرتبة حسب التاريخ
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
                    <p className="text-sm text-muted-foreground mb-1">
                      {transaction.cardName} • {transaction.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
            </div>
          </CardContent>
        </Card>
      )}

      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={(newTransaction) => {
          setTransactions([newTransaction, ...transactions])
          setFilteredTransactions([newTransaction, ...filteredTransactions])
          setIsAddDialogOpen(false)
        }}
      />
    </>
  )
}
