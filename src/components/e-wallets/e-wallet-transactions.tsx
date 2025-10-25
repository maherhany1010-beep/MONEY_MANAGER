'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, TrendingUp, TrendingDown, ArrowLeftRight, Filter, Plus, Minus, ArrowRightLeft } from 'lucide-react'

interface EWalletTransactionsProps {
  wallet: any
}

// بيانات وهمية للمعاملات
const mockTransactions = [
  {
    id: '1',
    type: 'deposit',
    amount: 5000,
    description: 'إيداع من البنك',
    category: 'bank_transfer',
    date: '2025-10-08',
    time: '14:30',
    balance: 15000,
    fee: 0,
    reference: 'DEP-2025-001',
  },
  {
    id: '2',
    type: 'withdrawal',
    amount: 1500,
    description: 'سحب نقدي',
    category: 'cash_withdrawal',
    date: '2025-10-08',
    time: '11:15',
    balance: 10000,
    fee: 7.5,
    reference: 'WTH-2025-001',
  },
  {
    id: '3',
    type: 'transfer',
    amount: 2000,
    description: 'تحويل لمحفظة أخرى',
    category: 'wallet_transfer',
    date: '2025-10-07',
    time: '16:45',
    balance: 11500,
    fee: 0,
    reference: 'TRF-2025-001',
  },
  {
    id: '4',
    type: 'deposit',
    amount: 3000,
    description: 'إيداع نقدي',
    category: 'cash_deposit',
    date: '2025-10-07',
    time: '10:20',
    balance: 13500,
    fee: 0,
    reference: 'DEP-2025-002',
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: 800,
    description: 'دفع فاتورة كهرباء',
    category: 'bill_payment',
    date: '2025-10-06',
    time: '09:00',
    balance: 10500,
    fee: 4,
    reference: 'WTH-2025-002',
  },
  {
    id: '6',
    type: 'transfer',
    amount: 1200,
    description: 'تحويل لصديق',
    category: 'p2p_transfer',
    date: '2025-10-05',
    time: '13:30',
    balance: 11300,
    fee: 6,
    reference: 'TRF-2025-002',
  },
]

export function EWalletTransactions({ wallet }: EWalletTransactionsProps) {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all')

  const filteredTransactions = filter === 'all' 
    ? mockTransactions 
    : mockTransactions.filter(t => t.type === filter)

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="h-4 w-4" />
      case 'withdrawal':
        return <TrendingDown className="h-4 w-4" />
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600'
      case 'withdrawal':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
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
      case 'transfer':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع'
      case 'withdrawal':
        return 'سحب'
      case 'transfer':
        return 'تحويل'
      default:
        return 'معاملة'
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      bank_transfer: 'تحويل بنكي',
      cash_withdrawal: 'سحب نقدي',
      cash_deposit: 'إيداع نقدي',
      wallet_transfer: 'تحويل محفظة',
      p2p_transfer: 'تحويل شخصي',
      bill_payment: 'دفع فاتورة',
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
              جميع المعاملات على المحفظة {wallet.walletName}
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
            <Button
              variant={filter === 'transfer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('transfer')}
              className={filter === 'transfer' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <ArrowRightLeft className="h-4 w-4 ml-2" />
              تحويلات
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
                  transaction.type === 'deposit' ? 'bg-green-100' : 
                  transaction.type === 'withdrawal' ? 'bg-red-100' : 
                  'bg-blue-100'
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
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDate(transaction.date)} - {transaction.time}</span>
                    <span>•</span>
                    <span>المرجع: {transaction.reference}</span>
                    {transaction.fee > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600">رسوم: {formatCurrency(transaction.fee)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>الرصيد: {formatCurrency(transaction.balance)}</span>
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
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">إجمالي المعاملات</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
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
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">إجمالي التحويلات</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(
                    filteredTransactions
                      .filter(t => t.type === 'transfer')
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

