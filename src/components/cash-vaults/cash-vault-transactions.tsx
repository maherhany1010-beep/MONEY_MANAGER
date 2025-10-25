'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, TrendingUp, TrendingDown, ArrowUpDown, Plus, Minus, Filter } from 'lucide-react'

interface CashVaultTransactionsProps {
  vault: any
}

// بيانات وهمية للمعاملات
const mockTransactions = [
  {
    id: '1',
    type: 'deposit',
    amount: 50000,
    description: 'إيداع من الإيرادات اليومية',
    category: 'revenue',
    date: '2025-10-08',
    time: '14:30',
    balance: 150000,
    performedBy: 'أحمد محمد علي',
    approved: true,
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 15000,
    description: 'سحب لسداد فواتير',
    category: 'bills',
    date: '2025-10-08',
    time: '11:15',
    balance: 100000,
    performedBy: 'محمد أحمد حسن',
    approved: true,
  },
  {
    id: '3',
    type: 'deposit',
    amount: 30000,
    description: 'إيداع نقدي من العملاء',
    category: 'revenue',
    date: '2025-10-07',
    time: '16:45',
    balance: 115000,
    performedBy: 'أحمد محمد علي',
    approved: true,
  },
  {
    id: '4',
    type: 'withdrawal',
    amount: 8000,
    description: 'سحب للمصروفات الإدارية',
    category: 'expenses',
    date: '2025-10-07',
    time: '10:20',
    balance: 85000,
    performedBy: 'محمد أحمد حسن',
    approved: true,
  },
  {
    id: '5',
    type: 'deposit',
    amount: 100000,
    description: 'إيداع من البنك',
    category: 'transfer',
    date: '2025-10-06',
    time: '09:00',
    balance: 93000,
    performedBy: 'أحمد محمد علي',
    approved: true,
  },
  {
    id: '6',
    type: 'withdrawal',
    amount: 25000,
    description: 'سحب لسداد رواتب',
    category: 'salaries',
    date: '2025-10-05',
    time: '13:30',
    balance: -7000,
    performedBy: 'محمد أحمد حسن',
    approved: true,
  },
  {
    id: '7',
    type: 'deposit',
    amount: 45000,
    description: 'إيداع من المبيعات',
    category: 'revenue',
    date: '2025-10-04',
    time: '17:00',
    balance: 18000,
    performedBy: 'أحمد محمد علي',
    approved: true,
  },
  {
    id: '8',
    type: 'withdrawal',
    amount: 5000,
    description: 'سحب للصيانة',
    category: 'maintenance',
    date: '2025-10-03',
    time: '12:00',
    balance: -27000,
    performedBy: 'محمد أحمد حسن',
    approved: false,
  },
]

export function CashVaultTransactions({ vault }: CashVaultTransactionsProps) {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all')

  const filteredTransactions = filter === 'all' 
    ? mockTransactions 
    : mockTransactions.filter(t => t.type === filter)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4" />
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <ArrowUpDown className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'withdrawal':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'deposit':
        return 'default'
      case 'withdrawal':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع'
      case 'withdrawal':
        return 'سحب'
      default:
        return 'معاملة'
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      revenue: 'إيرادات',
      bills: 'فواتير',
      expenses: 'مصروفات',
      transfer: 'تحويل',
      salaries: 'رواتب',
      maintenance: 'صيانة',
    }
    return categories[category] || category
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              سجل المعاملات
            </CardTitle>
            <CardDescription>
              جميع المعاملات على الخزينة {vault.vaultName}
            </CardDescription>
          </div>
          
          {/* فلتر المعاملات */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              <Filter className="h-4 w-4 ml-2" />
              الكل
            </Button>
            <Button
              variant={filter === 'deposit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('deposit')}
              className={filter === 'deposit' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <Plus className="h-4 w-4 ml-2" />
              إيداعات
            </Button>
            <Button
              variant={filter === 'withdrawal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('withdrawal')}
              className={filter === 'withdrawal' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Minus className="h-4 w-4 ml-2" />
              سحوبات
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className={getTransactionColor(transaction.type)}>
                    {getTransactionIcon(transaction.type)}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{transaction.description}</p>
                    <Badge variant={getTransactionBadgeVariant(transaction.type)} className="text-xs">
                      {getTransactionLabel(transaction.type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(transaction.category)}
                    </Badge>
                    {!transaction.approved && (
                      <Badge variant="destructive" className="text-xs">
                        بانتظار الموافقة
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDate(transaction.date)} - {transaction.time}</span>
                    <span>•</span>
                    <span>بواسطة: {transaction.performedBy}</span>
                    <span>•</span>
                    <span>الرصيد بعد المعاملة: {formatCurrency(transaction.balance)}</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'deposit' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">لا توجد معاملات</p>
              <p className="text-sm">لم يتم تسجيل أي معاملات من هذا النوع</p>
            </div>
          )}
        </div>

        {/* ملخص المعاملات */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">إجمالي المعاملات</p>
                <p className="text-2xl font-bold text-blue-900">{filteredTransactions.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">إجمالي الإيداعات</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(
                    filteredTransactions
                      .filter(t => t.type === 'deposit')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 mb-1">إجمالي السحوبات</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(
                    filteredTransactions
                      .filter(t => t.type === 'withdrawal')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

