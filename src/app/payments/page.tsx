'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaymentsList } from '@/components/payments/payments-list'
import { AddPaymentDialog } from '@/components/payments/add-payment-dialog'
import { PaymentReminders } from '@/components/payments/payment-reminders'
import { PaymentCalendar } from '@/components/payments/payment-calendar'
import { 
  formatCurrency, 
  formatDate,
} from '@/lib/utils'
import { Plus, Calendar, Bell, CreditCard, AlertTriangle } from 'lucide-react'

// Mock data - will be replaced with real data from Supabase
const mockPayments = [
  {
    id: '1',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    amount: 1250.00,
    dueDate: '2024-02-15',
    status: 'pending',
    minimumAmount: 625.00,
    currentBalance: 12500.00,
    paymentMethod: 'auto',
    reminderSent: true,
  },
  {
    id: '2',
    cardId: '2',
    cardName: 'بطاقة الأهلي البلاتينية',
    amount: 875.00,
    dueDate: '2024-02-25',
    status: 'pending',
    minimumAmount: 437.50,
    currentBalance: 8750.00,
    paymentMethod: 'manual',
    reminderSent: false,
  },
  {
    id: '3',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    amount: 1500.00,
    dueDate: '2024-01-15',
    status: 'paid',
    minimumAmount: 750.00,
    currentBalance: 0.00,
    paymentMethod: 'auto',
    reminderSent: true,
    paidDate: '2024-01-14',
  },
  {
    id: '4',
    cardId: '3',
    cardName: 'بطاقة سامبا الكلاسيكية',
    amount: 320.00,
    dueDate: '2024-01-10',
    status: 'overdue',
    minimumAmount: 160.00,
    currentBalance: 3200.00,
    paymentMethod: 'manual',
    reminderSent: true,
    overdueBy: 5,
  },
]

export default function PaymentsPage() {
  const [payments] = useState(mockPayments)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('list')

  const pendingPayments = payments.filter(p => p.status === 'pending')
  const overduePayments = payments.filter(p => p.status === 'overdue')
  const upcomingPayments = payments.filter(p => {
    const dueDate = new Date(p.dueDate)
    const today = new Date()
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return p.status === 'pending' && daysDiff <= 7
  })

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0)

  const handleAddPayment = () => {
    setIsAddDialogOpen(true)
  }

  return (
    <AppLayout>
      <PageHeader
        title="إدارة السداد"
        description="تتبع وإدارة مدفوعات البطاقات الائتمانية"
        action={{
          label: 'إضافة دفعة جديدة',
          onClick: handleAddPayment,
          icon: Plus,
        }}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المعلقة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} دفعة معلقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوعات المتأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overduePayments.length} دفعة متأخرة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدفوعات الأسبوع</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {upcomingPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              دفعة خلال 7 أيام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التذكيرات النشطة</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {payments.filter(p => p.reminderSent && p.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              تذكير مرسل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts */}
      {overduePayments.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">تنبيه: مدفوعات متأخرة</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-3">
              لديك {overduePayments.length} دفعة متأخرة بإجمالي {formatCurrency(totalOverdue)}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive">
                سداد الآن
              </Button>
              <Button size="sm" variant="outline">
                عرض التفاصيل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">قائمة المدفوعات</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
          <TabsTrigger value="reminders">التذكيرات</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <PaymentsList
            payments={payments as any}
            onPaymentUpdate={(paymentId, updates) => {
              console.log('Update payment:', paymentId, updates)
            }}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <PaymentCalendar
            payments={payments as any}
            onDateSelect={(date) => {
              console.log('Selected date:', date)
            }}
          />
        </TabsContent>

        <TabsContent value="reminders">
          <PaymentReminders
            payments={payments as any}
            onReminderUpdate={(paymentId, enabled) => {
              console.log('Update reminder:', paymentId, enabled)
            }}
          />
        </TabsContent>
      </Tabs>

      <AddPaymentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={(newPayment) => {
          console.log('New payment added:', newPayment)
          setIsAddDialogOpen(false)
        }}
      />
    </AppLayout>
  )
}
