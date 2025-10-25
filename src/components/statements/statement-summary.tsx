'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gift,
  AlertTriangle
} from 'lucide-react'
import { PaymentProgressIndicator } from './payment-progress-indicator'

interface StatementSummaryProps {
  statement: {
    id: string
    cardName: string
    month: number
    year: number
    statementDate: string
    dueDate: string
    previousBalance: number
    currentBalance: number
    minimumPayment: number
    totalSpent: number
    totalPayments: number
    cashbackEarned: number
    interestCharges: number
    fees: number
    status: string
  }
}

export function StatementSummary({ statement }: StatementSummaryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return 'حالي'
      case 'paid':
        return 'مسدد'
      case 'overdue':
        return 'متأخر'
      default:
        return 'غير محدد'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                كشف حساب {statement.month}/{statement.year}
              </CardTitle>
              <CardDescription className="mt-1">
                {statement.cardName}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(statement.status)}>
              {getStatusLabel(statement.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">تاريخ الكشف</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(statement.statementDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">تاريخ الاستحقاق</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(statement.dueDate)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد السابق</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statement.previousBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              من الكشف السابق
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(statement.currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              المبلغ المستحق
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحد الأدنى للسداد</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(statement.minimumPayment)}
            </div>
            <p className="text-xs text-muted-foreground">
              مطلوب السداد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الكاش باك</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(statement.cashbackEarned)}
            </div>
            <p className="text-xs text-muted-foreground">
              مكتسب هذا الشهر
            </p>
          </CardContent>
        </Card>
      </div>

      {/* مؤشر السداد المرئي */}
      <PaymentProgressIndicator
        statementAmount={statement.currentBalance}
        paidAmount={statement.totalPayments}
        minimumPayment={statement.minimumPayment}
        dueDate={statement.dueDate}
        showDetails={true}
      />

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">نشاط الحساب</CardTitle>
          <CardDescription>
            ملخص المعاملات لهذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">إجمالي المصروفات</span>
            </div>
            <span className="font-bold text-red-600 dark:text-red-400">
              {formatCurrency(statement.totalSpent)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">إجمالي المدفوعات</span>
            </div>
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatCurrency(statement.totalPayments)}
            </span>
          </div>

          {statement.interestCharges > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">رسوم الفوائد</span>
              </div>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(statement.interestCharges)}
              </span>
            </div>
          )}

          {statement.fees > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">رسوم أخرى</span>
              </div>
              <span className="font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(statement.fees)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
