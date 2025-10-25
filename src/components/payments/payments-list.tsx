'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  MoreHorizontal
} from 'lucide-react'

interface Payment {
  id: string
  cardId: string
  cardName: string
  amount: number
  dueDate: string
  status: 'pending' | 'paid' | 'overdue'
  minimumAmount: number
  currentBalance: number
  paymentMethod: 'auto' | 'manual'
  reminderSent: boolean
  paidDate?: string
  overdueBy?: number
}

interface PaymentsListProps {
  payments: Payment[]
  onPaymentUpdate: (paymentId: string, updates: Partial<Payment>) => void
}

export function PaymentsList({ payments, onPaymentUpdate }: PaymentsListProps) {
  const [filteredPayments, setFilteredPayments] = useState(payments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('dueDate')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    filterAndSortPayments(term, statusFilter, sortBy)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterAndSortPayments(searchTerm, status, sortBy)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    filterAndSortPayments(searchTerm, statusFilter, sort)
  }

  const filterAndSortPayments = (search: string, status: string, sort: string) => {
    let filtered = payments

    // Apply search filter
    if (search) {
      filtered = filtered.filter(p => 
        p.cardName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'card':
          return a.cardName.localeCompare(b.cardName)
        default:
          return 0
      }
    })

    setFilteredPayments(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مسدد'
      case 'pending':
        return 'معلق'
      case 'overdue':
        return 'متأخر'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handlePayNow = (paymentId: string) => {
    onPaymentUpdate(paymentId, { status: 'paid', paidDate: new Date().toISOString() })
  }

  const handleMarkPaid = (paymentId: string) => {
    onPaymentUpdate(paymentId, { status: 'paid', paidDate: new Date().toISOString() })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في البطاقات..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="paid">مسدد</SelectItem>
                <SelectItem value="overdue">متأخر</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">تاريخ الاستحقاق</SelectItem>
                <SelectItem value="amount-desc">المبلغ (الأكبر أولاً)</SelectItem>
                <SelectItem value="amount-asc">المبلغ (الأصغر أولاً)</SelectItem>
                <SelectItem value="card">البطاقة</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              فلاتر متقدمة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المدفوعات</CardTitle>
          <CardDescription>
            {filteredPayments.length} دفعة معروضة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const daysUntilDue = getDaysUntilDue(payment.dueDate)
              const isUrgent = daysUntilDue <= 3 && payment.status === 'pending'
              
              return (
                <div 
                  key={payment.id} 
                  className={`p-4 border rounded-lg transition-colors hover:bg-accent/50 ${
                    isUrgent ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{payment.cardName}</h3>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="mr-1">{getStatusLabel(payment.status)}</span>
                        </Badge>
                        {payment.paymentMethod === 'auto' && (
                          <Badge variant="outline" className="text-xs">
                            سداد تلقائي
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">المبلغ المستحق</p>
                          <p className="font-medium text-lg">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">الحد الأدنى</p>
                          <p className="font-medium">
                            {formatCurrency(payment.minimumAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">تاريخ الاستحقاق</p>
                          <p className="font-medium">
                            {formatDate(payment.dueDate)}
                          </p>
                          {payment.status === 'pending' && (
                            <p className={`text-xs ${
                              daysUntilDue <= 3 ? 'text-red-600' : 
                              daysUntilDue <= 7 ? 'text-orange-600' : 'text-muted-foreground'
                            }`}>
                              {daysUntilDue > 0 ? `${daysUntilDue} يوم متبقي` : 
                               daysUntilDue === 0 ? 'مستحق اليوم' : 
                               `متأخر ${Math.abs(daysUntilDue)} يوم`}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">الرصيد الحالي</p>
                          <p className="font-medium">
                            {formatCurrency(payment.currentBalance)}
                          </p>
                        </div>
                      </div>

                      {payment.status === 'paid' && payment.paidDate && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                          تم السداد في {formatDate(payment.paidDate)}
                        </div>
                      )}

                      {payment.status === 'overdue' && payment.overdueBy && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                          متأخر {payment.overdueBy} يوم - قد تطبق رسوم إضافية
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mr-4">
                      {payment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handlePayNow(payment.id)}
                            className="min-w-[100px]"
                          >
                            <DollarSign className="h-4 w-4 ml-1" />
                            سداد الآن
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkPaid(payment.id)}
                          >
                            تم السداد
                          </Button>
                        </>
                      )}
                      
                      {payment.status === 'overdue' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handlePayNow(payment.id)}
                          className="min-w-[100px]"
                        >
                          <AlertTriangle className="h-4 w-4 ml-1" />
                          سداد عاجل
                        </Button>
                      )}

                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مدفوعات</h3>
                <p className="text-muted-foreground">
                  لم يتم العثور على مدفوعات تطابق معايير البحث المحددة
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
