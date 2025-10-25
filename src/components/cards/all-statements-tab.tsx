'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaymentProgressIndicator } from '@/components/statements/payment-progress-indicator'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Download, Eye, Calendar, Filter } from 'lucide-react'

interface AllStatementsTabProps {
  cards: any[]
}

// بيانات وهمية لكشوف الحساب
const mockStatements = [
  {
    id: '1',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    month: 1,
    year: 2024,
    statementDate: '2024-01-31',
    dueDate: '2024-02-15',
    statementAmount: 12500.00,
    paidAmount: 500.00,
    minimumPayment: 625.00,
    totalSpent: 4250.00,
    cashbackEarned: 85.50,
    status: 'current' as const,
  },
  {
    id: '2',
    cardId: '2',
    cardName: 'بطاقة بنك مصر البلاتينية',
    month: 1,
    year: 2024,
    statementDate: '2024-01-25',
    dueDate: '2024-02-25',
    statementAmount: 8750.00,
    paidAmount: 8750.00,
    minimumPayment: 437.50,
    totalSpent: 2750.00,
    cashbackEarned: 82.50,
    status: 'paid' as const,
  },
  {
    id: '3',
    cardId: '3',
    cardName: 'بطاقة البنك التجاري الدولي الكلاسيكية',
    month: 1,
    year: 2024,
    statementDate: '2024-01-10',
    dueDate: '2024-02-10',
    statementAmount: 5200.00,
    paidAmount: 1000.00,
    minimumPayment: 260.00,
    totalSpent: 2500.00,
    cashbackEarned: 45.00,
    status: 'partial' as const,
  },
  {
    id: '4',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    month: 12,
    year: 2023,
    statementDate: '2023-12-31',
    dueDate: '2024-01-15',
    statementAmount: 8750.00,
    paidAmount: 8750.00,
    minimumPayment: 437.50,
    totalSpent: 3850.00,
    cashbackEarned: 77.00,
    status: 'paid' as const,
  },
]

export function AllStatementsTab({ cards }: AllStatementsTabProps) {
  const [statements] = useState(mockStatements)
  const [selectedCard, setSelectedCard] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('2024')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredStatements = statements.filter(statement => {
    const cardMatch = selectedCard === 'all' || statement.cardId === selectedCard
    const yearMatch = statement.year.toString() === selectedYear
    const statusMatch = selectedStatus === 'all' || statement.status === selectedStatus
    return cardMatch && yearMatch && statusMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700'
      case 'paid':
        return 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-700'
      case 'overdue':
        return 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-700'
      case 'partial':
        return 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
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
  }

  const handleView = (statementId: string) => {
    console.log('View statement:', statementId)
  }

  // إحصائيات
  const totalStatements = filteredStatements.length
  const paidStatements = filteredStatements.filter(s => s.status === 'paid').length
  const currentStatements = filteredStatements.filter(s => s.status === 'current').length
  const overdueStatements = filteredStatements.filter(s => (s as any).status === 'overdue').length
  const totalAmount = filteredStatements.reduce((sum, s) => sum + s.statementAmount, 0)
  const totalPaid = filteredStatements.reduce((sum, s) => sum + s.paidAmount, 0)
  const totalRemaining = totalAmount - totalPaid

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="dark:text-gray-100">كشوفات الحساب الشهرية</CardTitle>
              <CardDescription className="dark:text-gray-400">
                عرض وإدارة كشوفات حساب جميع البطاقات
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-200">البطاقة</label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر البطاقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البطاقات</SelectItem>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-200">السنة</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-200">الحالة</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="current">حالي</SelectItem>
                  <SelectItem value="paid">مسدد</SelectItem>
                  <SelectItem value="partial">سداد جزئي</SelectItem>
                  <SelectItem value="overdue">متأخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">إجمالي الكشوف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{totalStatements}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">كشف حساب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">إجمالي المبالغ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">مجموع الكشوف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">تم السداد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">المتبقي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalRemaining)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">متبقي للسداد</p>
          </CardContent>
        </Card>
      </div>

      {/* Statements List */}
      <div className="space-y-4">
        {filteredStatements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">لا توجد كشوف حساب</h3>
              <p className="text-gray-600 dark:text-gray-400">لم يتم العثور على كشوف حساب بالمعايير المحددة</p>
            </CardContent>
          </Card>
        ) : (
          filteredStatements.map((statement) => (
            <Card key={statement.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg dark:text-gray-100">
                        {statement.cardName}
                      </CardTitle>
                      <Badge className={getStatusColor(statement.status)} style={{
                        color: statement.status === 'current' ? '#2563eb' :
                               statement.status === 'paid' ? '#16a34a' :
                               (statement as any).status === 'overdue' ? '#dc2626' : '#d97706'
                      }}>
                        {getStatusLabel(statement.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>كشف {statement.month}/{statement.year}</span>
                      <span>•</span>
                      <span>تاريخ الاستحقاق: {formatDate(statement.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(statement.id)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(statement.id)} className="gap-2">
                      <Download className="h-4 w-4" />
                      تحميل
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PaymentProgressIndicator
                  statementAmount={statement.statementAmount}
                  paidAmount={statement.paidAmount}
                  minimumPayment={statement.minimumPayment}
                  dueDate={statement.dueDate}
                  showDetails={true}
                  compact={false}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

