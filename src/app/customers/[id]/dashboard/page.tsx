'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomers } from '@/contexts/customers-context'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerStatsCard } from '@/components/customers/customer-stats-card'
import { CustomerCharts } from '@/components/customers/customer-charts'
import {
  User,
  ArrowRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'
import Link from 'next/link'

export default function CustomerDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const {
    getCustomer,
    getCustomerInvoices,
    getCustomerPayments,
  } = useCustomers()

  const customer = useMemo(() => getCustomer(customerId), [customerId, getCustomer])

  // استخدام useState و useEffect لتحميل البيانات غير المتزامنة
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [invoicesData, paymentsData] = await Promise.all([
          getCustomerInvoices(customerId),
          getCustomerPayments(customerId)
        ])
        setInvoices(invoicesData || [])
        setPayments(paymentsData || [])
      } catch (error) {
        console.error('Error loading customer data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (customerId) {
      loadData()
    }
  }, [customerId, getCustomerInvoices, getCustomerPayments])

  if (!customer) {
    return (
      <div className="text-center py-12 container mx-auto p-6">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">العميل غير موجود</h2>
        <p className="text-muted-foreground mb-6">لم يتم العثور على العميل المطلوب</p>
        <Link href="/customers">
          <Button>العودة إلى قائمة العملاء</Button>
        </Link>
      </div>
    )
  }

  // حساب الإحصائيات
  const totalInvoices = invoices?.length || 0
  const paidInvoices = invoices?.filter((inv: any) => inv.status === 'paid').length || 0
  const pendingInvoices = invoices?.filter((inv: any) => inv.status === 'pending').length || 0
  const overdueInvoices = invoices?.filter((inv: any) => {
    if (!inv.dueDate) return false
    return new Date(inv.dueDate) < new Date() && inv.status !== 'paid'
  }).length || 0

  const totalPayments = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
  const averageInvoiceValue = totalInvoices > 0 
    ? (customer.totalPurchases || 0) / totalInvoices 
    : 0

  // بيانات الرسوم البيانية (نموذج)
  const paymentRatio = {
    paid: paidInvoices,
    pending: pendingInvoices,
  }

  return (
    <div className="space-y-6 container mx-auto p-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/customers/${customerId}`}>
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة معلومات العميل</h1>
            <p className="text-muted-foreground mt-1">{customer.fullName ?? customer.name}</p>
          </div>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CustomerStatsCard
          title="الرصيد الحالي"
          value={formatCurrency(customer.currentDebt ?? 0)}
          icon={<DollarSign className="h-6 w-6" />}
          color="red"
          description="المديونية الحالية"
        />

        <CustomerStatsCard
          title="إجمالي المشتريات"
          value={formatCurrency(customer.totalPurchases ?? 0)}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
          description="جميع المشتريات"
        />

        <CustomerStatsCard
          title="إجمالي المدفوعات"
          value={formatCurrency(customer.totalPayments ?? 0)}
          icon={<TrendingDown className="h-6 w-6" />}
          color="green"
          description="جميع الدفعات"
        />

        <CustomerStatsCard
          title="الفواتير المعلقة"
          value={pendingInvoices}
          icon={<FileText className="h-6 w-6" />}
          color="orange"
          description={`من أصل ${totalInvoices} فاتورة`}
        />
      </div>

      {/* التفاصيل والرسوم البيانية */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="payments">الدفعات</TabsTrigger>
        </TabsList>

        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-6">
          <CustomerCharts paymentRatio={paymentRatio} />

          {/* معلومات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">متوسط قيمة الفاتورة</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {formatCurrency(averageInvoiceValue)}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">الفواتير المتأخرة</p>
              <p className="text-2xl font-bold text-orange-900 mt-2">{overdueInvoices}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">معدل الدفع</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0}%
              </p>
            </div>
          </div>
        </TabsContent>

        {/* الفواتير */}
        <TabsContent value="invoices">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">الفواتير ({totalInvoices})</h3>
            {invoices && invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{invoice.invoiceDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(invoice.totalAmount)}</p>
                      <p className={`text-xs font-medium ${
                        invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {invoice.status === 'paid' ? 'مدفوع' : 'معلق'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">لا توجد فواتير</p>
            )}
          </div>
        </TabsContent>

        {/* الدفعات */}
        <TabsContent value="payments">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">الدفعات ({payments?.length || 0})</h3>
            {payments && payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{payment.description || 'دفعة'}</p>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                    <p className="font-bold text-green-600 dark:text-green-400">+{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">لا توجد دفعات</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

