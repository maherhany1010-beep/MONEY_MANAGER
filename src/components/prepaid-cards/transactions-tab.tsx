'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PrepaidTransaction, TransactionType } from '@/contexts/prepaid-cards-context'
import { formatCurrency } from '@/lib/utils'
import { Search, Filter, Download, TrendingUp, TrendingDown, ShoppingCart, ArrowRightLeft, DollarSign } from 'lucide-react'

interface TransactionsTabProps {
  transactions: PrepaidTransaction[]
  cardName?: string
}

export function TransactionsTab({ transactions, cardName }: TransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        (transaction.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.merchantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.sourceName?.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter

      // Date filter
      let matchesDate = true
      if (dateFilter !== 'all') {
        const transactionDate = new Date(transaction.date)
        const now = new Date()

        switch (dateFilter) {
          case 'today':
            matchesDate = transactionDate.toDateString() === now.toDateString()
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = transactionDate >= weekAgo
            break
          case 'month':
            matchesDate =
              transactionDate.getMonth() === now.getMonth() &&
              transactionDate.getFullYear() === now.getFullYear()
            break
          case 'year':
            matchesDate = transactionDate.getFullYear() === now.getFullYear()
            break
        }
      }

      return matchesSearch && matchesType && matchesDate
    })
  }, [transactions, searchQuery, typeFilter, dateFilter])

  // Calculate totals
  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'deposit') {
          acc.deposits += t.amount
        } else if (t.type === 'withdrawal' || t.type === 'purchase' || t.type === 'transfer_out') {
          acc.withdrawals += t.amount
        }
        acc.fees += (t.fee ?? 0)
        return acc
      },
      { deposits: 0, withdrawals: 0, fees: 0 }
    )
  }, [filteredTransactions])

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'purchase':
        return <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'transfer_in':
        return <ArrowRightLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case 'transfer_out':
        return <ArrowRightLeft className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case 'fee':
        return <DollarSign className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return 'شحن'
      case 'withdrawal':
        return 'سحب'
      case 'purchase':
        return 'شراء'
      case 'transfer_in':
        return 'تحويل وارد'
      case 'transfer_out':
        return 'تحويل صادر'
      case 'fee':
        return 'رسوم'
    }
  }

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
        return 'text-green-600'
      case 'withdrawal':
      case 'purchase':
      case 'transfer_out':
      case 'fee':
        return 'text-red-600'
    }
  }

  const exportToCSV = () => {
    const headers = ['التاريخ', 'النوع', 'الوصف', 'المبلغ', 'الرسوم', 'الإجمالي', 'الرصيد بعد']
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleString('ar-EG'),
      getTransactionLabel(t.type),
      t.description ?? '',
      t.amount.toFixed(2),
      (t.fee ?? 0).toFixed(2),
      (t.totalAmount ?? 0).toFixed(2),
      (t.balanceAfter ?? 0).toFixed(2),
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transactions_${cardName || 'all'}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ابحث في الوصف، التاجر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type">نوع المعاملة</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="deposit">شحن</SelectItem>
                  <SelectItem value="withdrawal">سحب</SelectItem>
                  <SelectItem value="purchase">شراء</SelectItem>
                  <SelectItem value="transfer_in">تحويل وارد</SelectItem>
                  <SelectItem value="transfer_out">تحويل صادر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="date">الفترة الزمنية</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر 7 أيام</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              عرض {filteredTransactions.length} من {transactions.length} معاملة
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 ml-2" />
              تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الشحن</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.deposits)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السحب والشراء</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.withdrawals)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الرسوم</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.fees)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
          <CardDescription>
            {cardName ? `معاملات ${cardName}` : 'جميع المعاملات'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد معاملات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getTransactionIcon(transaction.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{getTransactionLabel(transaction.type)}</Badge>
                        {transaction.category && (
                          <Badge variant="secondary">{transaction.category}</Badge>
                        )}
                      </div>
                      <p className="font-medium truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleString('ar-EG')}
                      </p>
                      {(transaction.fee ?? 0) > 0 && (
                        <p className="text-xs text-orange-600">
                          رسوم: {formatCurrency(transaction.fee ?? 0)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'deposit' || transaction.type === 'transfer_in' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      الرصيد: {formatCurrency(transaction.balanceAfter ?? 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

