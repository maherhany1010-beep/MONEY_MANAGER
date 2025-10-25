'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentProgressIndicator } from '@/components/statements/payment-progress-indicator'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Download, Eye, Calendar, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface StatementsTabProps {
  cardId: string
}

// بيانات وهمية لكشوف الحساب
const mockStatements = [
  {
    id: '1',
    month: 1,
    year: 2024,
    statementDate: '2024-01-31',
    dueDate: '2024-02-15',
    previousBalance: 8750.00,
    currentBalance: 12500.00,
    statementAmount: 12500.00,
    paidAmount: 500.00,
    minimumPayment: 625.00,
    totalSpent: 4250.00,
    totalPayments: 500.00,
    cashbackEarned: 85.50,
    interestCharges: 0.00,
    fees: 0.00,
    status: 'current' as const,
  },
  {
    id: '2',
    month: 12,
    year: 2023,
    statementDate: '2023-12-31',
    dueDate: '2024-01-15',
    previousBalance: 5200.00,
    currentBalance: 8750.00,
    statementAmount: 8750.00,
    paidAmount: 8750.00,
    minimumPayment: 437.50,
    totalSpent: 3850.00,
    totalPayments: 300.00,
    cashbackEarned: 77.00,
    interestCharges: 0.00,
    fees: 0.00,
    status: 'paid' as const,
  },
  {
    id: '3',
    month: 11,
    year: 2023,
    statementDate: '2023-11-30',
    dueDate: '2023-12-15',
    previousBalance: 3200.00,
    currentBalance: 5200.00,
    statementAmount: 5200.00,
    paidAmount: 5200.00,
    minimumPayment: 260.00,
    totalSpent: 2500.00,
    totalPayments: 500.00,
    cashbackEarned: 62.50,
    interestCharges: 0.00,
    fees: 0.00,
    status: 'paid' as const,
  },
]

export function StatementsTab({ cardId }: StatementsTabProps) {
  const [statements] = useState(mockStatements)
  const [selectedStatement, setSelectedStatement] = useState(mockStatements[0])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 dark:text-blue-300'
      case 'paid':
        return 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-700 dark:text-green-300'
      case 'overdue':
        return 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-700 dark:text-red-300'
      case 'partial':
        return 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700 dark:text-amber-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 dark:text-gray-300'
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
      case 'partial':
        return 'سداد جزئي'
      default:
        return 'غير محدد'
    }
  }

  const handleDownload = (statementId: string) => {
    console.log('Download statement:', statementId)
    // TODO: Implement download functionality
  }

  const handleView = (statementId: string) => {
    console.log('View statement:', statementId)
    // TODO: Navigate to statement details page
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold dark:text-gray-100">كشوفات الحساب الشهرية</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            عرض وإدارة كشوفات حساب البطاقة
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          تصدير الكل
        </Button>
      </div>

      {/* Current Statement Progress */}
      <PaymentProgressIndicator
        statementAmount={selectedStatement.statementAmount}
        paidAmount={selectedStatement.paidAmount}
        minimumPayment={selectedStatement.minimumPayment}
        dueDate={selectedStatement.dueDate}
        showDetails={true}
      />

      {/* Statements List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-gray-100">قائمة الكشوف</CardTitle>
              <CardDescription className="dark:text-gray-400">
                {statements.length} كشف حساب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statements.map((statement) => (
                  <div
                    key={statement.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 dark:hover:bg-accent/20 ${
                      selectedStatement.id === statement.id 
                        ? 'bg-accent border-primary dark:bg-accent/30' 
                        : 'dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedStatement(statement)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium dark:text-gray-100">
                          {statement.month}/{statement.year}
                        </span>
                      </div>
                      <Badge className={getStatusColor((statement as any).status)} style={{
                        color: (statement as any).status === 'current' ? '#2563eb' :
                               (statement as any).status === 'paid' ? '#16a34a' :
                               (statement as any).status === 'overdue' ? '#dc2626' : '#d97706'
                      }}>
                        {getStatusLabel(statement.status)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium dark:text-gray-200">
                      الرصيد: {formatCurrency(statement.currentBalance)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      الاستحقاق: {formatDate(statement.dueDate)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-gray-100">
                    كشف حساب {selectedStatement.month}/{selectedStatement.year}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    تاريخ الإصدار: {formatDate(selectedStatement.statementDate)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(selectedStatement.id)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedStatement.id)} className="gap-2">
                    <Download className="h-4 w-4" />
                    تحميل
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الرصيد السابق</p>
                  <p className="text-2xl font-bold dark:text-gray-100">
                    {formatCurrency(selectedStatement.previousBalance)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الرصيد الحالي</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(selectedStatement.currentBalance)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الحد الأدنى للسداد</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(selectedStatement.minimumPayment)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الكاش باك المكتسب</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(selectedStatement.cashbackEarned)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-gray-100">نشاط الحساب</CardTitle>
              <CardDescription className="dark:text-gray-400">
                ملخص المعاملات لهذا الشهر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium dark:text-gray-200">إجمالي المصروفات</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(selectedStatement.totalSpent)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium dark:text-gray-200">إجمالي المدفوعات</span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(selectedStatement.totalPayments)}
                </span>
              </div>

              {selectedStatement.interestCharges > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium dark:text-gray-200">رسوم الفوائد</span>
                  </div>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(selectedStatement.interestCharges)}
                  </span>
                </div>
              )}

              {selectedStatement.fees > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium dark:text-gray-200">رسوم أخرى</span>
                  </div>
                  <span className="font-bold text-gray-600 dark:text-gray-400">
                    {formatCurrency(selectedStatement.fees)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

