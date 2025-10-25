'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard
} from 'lucide-react'

interface Payment {
  id: string
  cardId: string
  cardName: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  minimumAmount: number
}

interface PaymentCalendarProps {
  payments: Payment[]
  onDateSelect: (date: Date) => void
}

export function PaymentCalendar({ payments, onDateSelect }: PaymentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get payments for the selected date
  const getPaymentsForDate = (date: Date) => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.dueDate)
      return (
        paymentDate.getDate() === date.getDate() &&
        paymentDate.getMonth() === date.getMonth() &&
        paymentDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Get payments for the current month
  const getPaymentsForMonth = (month: Date) => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.dueDate)
      return (
        paymentDate.getMonth() === month.getMonth() &&
        paymentDate.getFullYear() === month.getFullYear()
      )
    })
  }

  // Check if a date has payments
  const hasPayments = (date: Date) => {
    return getPaymentsForDate(date).length > 0
  }

  // Get the status color for a date
  const getDateStatus = (date: Date) => {
    const paymentsForDate = getPaymentsForDate(date)
    if (paymentsForDate.length === 0) return null

    const hasOverdue = paymentsForDate.some(p => p.status === 'overdue')
    const hasPending = paymentsForDate.some(p => p.status === 'pending')
    const allPaid = paymentsForDate.every(p => p.status === 'paid')

    if (hasOverdue) return 'overdue'
    if (hasPending) return 'pending'
    if (allPaid) return 'paid'
    return null
  }

  const selectedDatePayments = selectedDate ? getPaymentsForDate(selectedDate) : []
  const monthPayments = getPaymentsForMonth(currentMonth)

  const monthStats = {
    total: monthPayments.length,
    pending: monthPayments.filter(p => p.status === 'pending').length,
    paid: monthPayments.filter(p => p.status === 'paid').length,
    overdue: monthPayments.filter(p => p.status === 'overdue').length,
    totalAmount: monthPayments.reduce((sum, p) => sum + p.amount, 0),
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onDateSelect(date)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  return (
    <div className="space-y-6">
      {/* Month Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(monthStats.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معلقة</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monthStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              دفعة معلقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مسددة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monthStats.paid}</div>
            <p className="text-xs text-muted-foreground">
              دفعة مسددة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monthStats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              دفعة متأخرة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">تقويم المدفوعات</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString('ar-SA', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              انقر على التاريخ لعرض المدفوعات المستحقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasPayments: (date) => hasPayments(date),
                overdue: (date) => getDateStatus(date) === 'overdue',
                pending: (date) => getDateStatus(date) === 'pending',
                paid: (date) => getDateStatus(date) === 'paid',
              }}
              modifiersStyles={{
                hasPayments: { fontWeight: 'bold' },
                overdue: { backgroundColor: '#fee2e2', color: '#dc2626' },
                pending: { backgroundColor: '#fef3c7', color: '#d97706' },
                paid: { backgroundColor: '#dcfce7', color: '#16a34a' },
              }}
              className="rounded-md border"
            />
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 rounded"></div>
                <span>متأخرة</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-200 rounded"></div>
                <span>معلقة</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span>مسددة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? formatDate(selectedDate.toISOString()) : 'اختر تاريخاً'}
            </CardTitle>
            <CardDescription>
              {selectedDatePayments.length > 0 
                ? `${selectedDatePayments.length} دفعة مستحقة`
                : 'لا توجد مدفوعات في هذا التاريخ'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDatePayments.length > 0 ? (
              <div className="space-y-3">
                {selectedDatePayments.map((payment) => (
                  <div key={payment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{payment.cardName}</span>
                      </div>
                      <Badge 
                        className={
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }
                      >
                        {payment.status === 'paid' ? 'مسدد' :
                         payment.status === 'overdue' ? 'متأخر' : 'معلق'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">المبلغ المستحق</p>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">الحد الأدنى</p>
                        <p className="font-medium">{formatCurrency(payment.minimumAmount)}</p>
                      </div>
                    </div>
                    {payment.status === 'pending' && (
                      <Button size="sm" className="w-full mt-2">
                        سداد الآن
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedDate 
                    ? 'لا توجد مدفوعات مستحقة في هذا التاريخ'
                    : 'اختر تاريخاً من التقويم لعرض المدفوعات المستحقة'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
