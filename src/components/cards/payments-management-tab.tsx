'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Wallet
} from 'lucide-react'

interface PaymentsManagementTabProps {
  cards: any[]
}

// بيانات وهمية للمدفوعات
const mockPayments = [
  {
    id: '1',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    amount: 5000.00,
    paymentDate: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'completed' as const,
    paymentMethod: 'bank-transfer',
    referenceNumber: 'PAY-2024-001',
  },
  {
    id: '2',
    cardId: '2',
    cardName: 'بطاقة بنك مصر البلاتينية',
    amount: 8750.00,
    paymentDate: '2024-01-20',
    dueDate: '2024-02-25',
    status: 'completed' as const,
    paymentMethod: 'cash',
    referenceNumber: 'PAY-2024-002',
  },
  {
    id: '3',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    amount: 625.00,
    paymentDate: null,
    dueDate: '2024-02-15',
    status: 'pending' as const,
    paymentMethod: null,
    referenceNumber: null,
  },
  {
    id: '4',
    cardId: '3',
    cardName: 'بطاقة البنك التجاري الدولي الكلاسيكية',
    amount: 260.00,
    paymentDate: null,
    dueDate: '2024-02-10',
    status: 'pending' as const,
    paymentMethod: null,
    referenceNumber: null,
  },
]

// بيانات وهمية للمدفوعات المجدولة
const mockScheduledPayments = [
  {
    id: 's1',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    amount: 12500.00,
    scheduledDate: '2024-02-15',
    frequency: 'monthly' as const,
    autoPayment: true,
    paymentType: 'full' as const,
  },
  {
    id: 's2',
    cardId: '2',
    cardName: 'بطاقة بنك مصر البلاتينية',
    amount: 437.50,
    scheduledDate: '2024-02-25',
    frequency: 'monthly' as const,
    autoPayment: true,
    paymentType: 'minimum' as const,
  },
]

export function PaymentsManagementTab({ cards }: PaymentsManagementTabProps) {
  const [payments] = useState(mockPayments)
  const [scheduledPayments] = useState(mockScheduledPayments)
  const [selectedCard, setSelectedCard] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredPayments = payments.filter(payment => {
    const cardMatch = selectedCard === 'all' || payment.cardId === selectedCard
    const statusMatch = selectedStatus === 'all' || payment.status === selectedStatus
    return cardMatch && statusMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-700'
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700'
      case 'failed':
        return 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-700'
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل'
      case 'pending':
        return 'قيد الانتظار'
      case 'failed':
        return 'فشل'
      case 'scheduled':
        return 'مجدول'
      default:
        return 'غير محدد'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" style={{ color: '#16a34a' }} />
      case 'pending':
        return <Clock className="h-4 w-4" style={{ color: '#d97706' }} />
      case 'failed':
        return <AlertCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
      case 'scheduled':
        return <Calendar className="h-4 w-4" style={{ color: '#2563eb' }} />
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return '-'
    switch (method) {
      case 'bank-transfer':
        return 'تحويل بنكي'
      case 'cash':
        return 'نقدي'
      case 'check':
        return 'شيك'
      case 'auto':
        return 'سداد تلقائي'
      default:
        return method
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'full':
        return 'سداد كامل'
      case 'minimum':
        return 'الحد الأدنى'
      case 'custom':
        return 'مبلغ مخصص'
      default:
        return type
    }
  }

  // إحصائيات
  const totalPayments = filteredPayments.length
  const completedPayments = filteredPayments.filter(p => p.status === 'completed').length
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').length
  const totalPaid = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-gray-100">إدارة السداد والمدفوعات</CardTitle>
          <CardDescription className="dark:text-gray-400">
            متابعة وإدارة جميع عمليات السداد للبطاقات الائتمانية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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
              <label className="text-sm font-medium dark:text-gray-200">الحالة</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
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
            <CardTitle className="text-sm font-medium dark:text-gray-200">إجمالي المدفوعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">{totalPayments}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">عملية سداد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">المدفوعات المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedPayments}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">قيد الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingPayments}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">المدفوعات المجدولة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {scheduledPayments.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">سداد تلقائي</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="dark:text-gray-100">المدفوعات المجدولة</CardTitle>
              <CardDescription className="dark:text-gray-400">
                عمليات السداد التلقائي المجدولة
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              إضافة جدولة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border rounded-lg dark:border-gray-700 hover:bg-accent/50 dark:hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium dark:text-gray-100">{payment.cardName}</span>
                      {payment.autoPayment && (
                        <Badge className="bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700" style={{ color: '#2563eb' }}>
                          تلقائي
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">المبلغ</p>
                        <p className="font-medium dark:text-gray-200">{formatCurrency(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">التاريخ المجدول</p>
                        <p className="font-medium dark:text-gray-200">{formatDate(payment.scheduledDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">نوع السداد</p>
                        <p className="font-medium dark:text-gray-200">{getPaymentTypeLabel(payment.paymentType)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">تعديل</Button>
                    <Button variant="outline" size="sm" style={{ color: '#dc2626' }}>إلغاء</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-gray-100">سجل المدفوعات</CardTitle>
          <CardDescription className="dark:text-gray-400">
            جميع عمليات السداد السابقة والحالية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.length === 0 ? (
              <div className="py-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">لا توجد مدفوعات</h3>
                <p className="text-gray-600 dark:text-gray-400">لم يتم العثور على مدفوعات بالمعايير المحددة</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border rounded-lg dark:border-gray-700 hover:bg-accent/50 dark:hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(payment.status)}
                        <span className="font-medium dark:text-gray-100">{payment.cardName}</span>
                        <Badge className={getStatusColor((payment as any).status)} style={{
                          color: (payment as any).status === 'completed' ? '#16a34a' :
                                 (payment as any).status === 'pending' ? '#d97706' :
                                 (payment as any).status === 'failed' ? '#dc2626' : '#2563eb'
                        }}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">المبلغ</p>
                          <p className="font-medium dark:text-gray-200">{formatCurrency(payment.amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">تاريخ السداد</p>
                          <p className="font-medium dark:text-gray-200">
                            {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">طريقة الدفع</p>
                          <p className="font-medium dark:text-gray-200">
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">رقم المرجع</p>
                          <p className="font-medium dark:text-gray-200">
                            {payment.referenceNumber || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

