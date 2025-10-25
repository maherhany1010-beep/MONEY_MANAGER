'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'

interface BankAccountTransactionsProps {
  account: any
}

// بيانات وهمية للمعاملات
const mockTransactions = [
  {
    id: '1',
    type: 'withdrawal',
    amount: 5000,
    description: 'سداد بطاقة ائتمانية',
    date: '2025-10-08',
    balance: 45000,
  },
  {
    id: '2',
    type: 'deposit',
    amount: 10000,
    description: 'إيداع نقدي',
    date: '2025-10-07',
    balance: 50000,
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 2500,
    description: 'سحب من ATM',
    date: '2025-10-06',
    balance: 40000,
  },
  {
    id: '4',
    type: 'withdrawal',
    amount: 3000,
    description: 'تحويل بنكي',
    date: '2025-10-05',
    balance: 42500,
  },
  {
    id: '5',
    type: 'deposit',
    amount: 15000,
    description: 'راتب شهري',
    date: '2025-10-01',
    balance: 45500,
  },
  {
    id: '6',
    type: 'withdrawal',
    amount: 1200,
    description: 'فاتورة كهرباء',
    date: '2025-09-30',
    balance: 30500,
  },
  {
    id: '7',
    type: 'withdrawal',
    amount: 800,
    description: 'فاتورة مياه',
    date: '2025-09-29',
    balance: 31700,
  },
  {
    id: '8',
    type: 'deposit',
    amount: 5000,
    description: 'تحويل من حساب آخر',
    date: '2025-09-28',
    balance: 32500,
  },
]

export function BankAccountTransactions({ account }: BankAccountTransactionsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          سجل المعاملات
        </CardTitle>
        <CardDescription>
          جميع المعاملات على الحساب {account.accountName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
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
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDate(transaction.date)}</span>
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

          {mockTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">لا توجد معاملات</p>
              <p className="text-sm">لم يتم تسجيل أي معاملات على هذا الحساب بعد</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

