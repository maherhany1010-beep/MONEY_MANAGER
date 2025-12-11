'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomers } from '@/contexts/customers-context'
import { useNotifications } from '@/contexts/notifications-context'
import { Button } from '@/components/ui/button'
import { PaymentDialog } from '@/components/customers/payment-dialog'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import { InvoiceDialog } from '@/components/customers/invoice-dialog'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  ArrowRight,
  Edit,
  Trash2,
  Plus,
  Bell,
  MessageSquare,
  Mail as MailIcon,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/design-system'
import Link from 'next/link'

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const {
    getCustomer,
    getCustomerInvoices,
    getCustomerPayments,
    getCustomerTransactions,
    deleteCustomer,
  } = useCustomers()

  const { addNotification } = useNotifications()

  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(false)

  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  const customer = useMemo(() => getCustomer(customerId), [customerId, getCustomer])

  // Load invoices, payments, and transactions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [inv, pay, trans] = await Promise.all([
          getCustomerInvoices(customerId),
          getCustomerPayments(customerId),
          getCustomerTransactions(customerId),
        ])
        setInvoices(inv || [])
        setPayments(pay || [])
        setTransactions(trans || [])
      } catch (err) {
        console.error('خطأ في تحميل البيانات:', err)
        setInvoices([])
        setPayments([])
        setTransactions([])
      }
    }
    loadData()
  }, [customerId, getCustomerInvoices, getCustomerPayments, getCustomerTransactions])

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

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف العميل "${customer.fullName}"؟`)) {
      deleteCustomer(customerId)
      router.push('/customers')
    }
  }

  const handleSendReminder = async (reminderType: 'sms' | 'whatsapp' | 'email') => {
    setSendingReminder(true)
    try {
      // تحديد نوع الإشعار حسب نوع التذكير
      const notificationTypeMap = {
        'sms': 'customer_invoice_due_soon',
        'whatsapp': 'customer_invoice_due_soon',
        'email': 'customer_invoice_due_soon',
      }

      const messageMap = {
        'sms': `تذكير دفع عبر رسالة نصية - ${customer?.fullName}`,
        'whatsapp': `تذكير دفع عبر واتساب - ${customer?.fullName}`,
        'email': `تذكير دفع عبر بريد إلكتروني - ${customer?.fullName}`,
      }

      const descriptionMap = {
        'sms': `تم إرسال رسالة نصية تذكير للعميل ${customer?.fullName} على الرقم ${customer?.phone}. المديونية: ${formatCurrency(customer?.currentDebt ?? 0)}`,
        'whatsapp': `تم إرسال رسالة واتساب تذكير للعميل ${customer?.fullName}. المديونية: ${formatCurrency(customer?.currentDebt ?? 0)}`,
        'email': `تم إرسال بريد إلكتروني تذكير للعميل ${customer?.fullName} على ${customer?.email}. المديونية: ${formatCurrency(customer?.currentDebt ?? 0)}`,
      }

      // إرسال إشعار تذكير
      addNotification(
        notificationTypeMap[reminderType] as any,
        messageMap[reminderType],
        descriptionMap[reminderType],
        'high',
        `/customers/${customerId}`,
        'عرض التفاصيل',
        { customerId, customerName: customer?.fullName, reminderType }
      )

      // إظهار رسالة نجاح
      setTimeout(() => {
        setSendingReminder(false)
      }, 1000)
    } catch (err) {
      console.error('Error sending reminder:', err)
      setSendingReminder(false)
    }
  }

  // الحصول على لون الحالة
  const getStatusColor = (status: typeof customer.status) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      case 'inactive': return 'bg-muted text-muted-foreground border-border'
      case 'blocked': return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
    }
  }

  const getStatusText = (status: typeof customer.status) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'blocked': return 'محظور'
    }
  }

  const getCategoryColor = (category: typeof customer.category) => {
    switch (category) {
      case 'vip': return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800'
      case 'regular': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      case 'new': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800'
    }
  }

  const getCategoryText = (category: typeof customer.category) => {
    switch (category) {
      case 'vip': return 'VIP'
      case 'regular': return 'عادي'
      case 'new': return 'جديد'
    }
  }

  return (
    <div className="space-y-6 container mx-auto p-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customers">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
              {(customer.fullName ?? customer.name ?? 'C').charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{customer.fullName ?? customer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status ?? 'active')}`}>
                  {getStatusText(customer.status ?? 'active')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(customer.category ?? 'regular')}`}>
                  {getCategoryText(customer.category ?? 'regular')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/customers/${customerId}/dashboard`}>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                لوحة المعلومات
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={sendingReminder}
                  className="gap-2"
                >
                  <Bell className="h-4 w-4" />
                  {sendingReminder ? 'جاري الإرسال...' : 'إرسال تذكير'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleSendReminder('sms')}
                  className="gap-2 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>رسالة نصية (SMS)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSendReminder('whatsapp')}
                  className="gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>واتساب (WhatsApp)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSendReminder('email')}
                  className="gap-2 cursor-pointer"
                >
                  <MailIcon className="h-4 w-4" />
                  <span>بريد إلكتروني (Email)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => setShowEditDialog(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              تعديل
            </Button>
            <Button variant="outline" onClick={handleDelete} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
            <Button onClick={() => setShowPaymentDialog(true)} className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
              <Plus className="h-4 w-4" />
              تسجيل دفعة
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-6 shadow-sm border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">إجمالي المشتريات</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{formatCurrency(customer.totalPurchases ?? 0)}</p>
              </div>
              <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-xl p-6 shadow-sm border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">إجمالي المدفوعات</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(customer.totalPayments ?? 0)}</p>
              </div>
              <div className="p-3 bg-green-500 dark:bg-green-600 rounded-lg shadow-md">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-xl p-6 shadow-sm border-2 ${
            (customer.currentDebt ?? 0) > 0
              ? 'from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-950/50 border-rose-200 dark:border-rose-800'
              : 'from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${(customer.currentDebt ?? 0) > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                  المديونية الحالية
                </p>
                <p className={`text-3xl font-bold mt-1 ${(customer.currentDebt ?? 0) > 0 ? 'text-rose-900 dark:text-rose-100' : 'text-emerald-900 dark:text-emerald-100'}`}>
                  {formatCurrency(customer.currentDebt ?? 0)}
                </p>
              </div>
              <div className={`p-3 rounded-lg shadow-md ${
                (customer.currentDebt ?? 0) > 0
                  ? 'bg-red-500 dark:bg-red-600'
                  : 'bg-green-500 dark:bg-green-600'
              }`}>
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* المعلومات الشخصية */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-6 shadow-md border-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            المعلومات الشخصية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p className="font-medium text-foreground">{customer.phone}</p>
              </div>
            </div>

            {customer.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium text-foreground">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium text-foreground">{customer.address}</p>
                </div>
              </div>
            )}

            {customer.company && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <Building className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الشركة</p>
                  <p className="font-medium text-foreground">{customer.company}</p>
                </div>
              </div>
            )}

            {customer.profession && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المهنة</p>
                  <p className="font-medium text-foreground">{customer.profession}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
                <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                <p className="font-medium text-foreground">{customer.registrationDate}</p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
              <p className="text-foreground">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* الفواتير */}
        <div className="bg-card rounded-xl shadow-md border-2 border-border overflow-hidden">
          <div className="p-6 bg-muted/50 border-b-2 border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">الفواتير ({invoices.length})</h2>
            </div>
            <Button
              onClick={() => setShowInvoiceDialog(true)}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 dark:bg-muted/30 border-b-2 border-border">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">رقم الفاتورة</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">النوع</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">التاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">المبلغ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">المدفوع</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">المتبقي</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      لا توجد فواتير
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    // تحديد نوع الفاتورة ومصدرها
                    let invoiceTypeLabel = 'بيع عادية'
                    let invoiceTypeColor = 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'

                    if (invoice.invoiceType === 'transfer' && invoice.transferDetails) {
                      const { debitAccountType, creditAccountType } = invoice.transferDetails
                      if (debitAccountType === 'customer') {
                        invoiceTypeLabel = 'دفعة من العميل'
                        invoiceTypeColor = 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                      } else if (creditAccountType === 'customer') {
                        invoiceTypeLabel = 'تحويل للعميل'
                        invoiceTypeColor = 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                      } else {
                        invoiceTypeLabel = 'تحويل'
                        invoiceTypeColor = 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
                      }
                    }

                    return (
                      <tr key={invoice.id} className="hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoiceTypeColor}`}>
                            {invoiceTypeLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{invoice.invoiceDate}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">{formatCurrency(invoice.amount)}</td>
                        <td className="px-6 py-4 text-green-600 dark:text-green-400">{formatCurrency(invoice.paidAmount)}</td>
                        <td className="px-6 py-4 text-red-600 dark:text-red-400">{formatCurrency(invoice.remainingAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                            invoice.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                            invoice.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {invoice.status === 'paid' ? 'مدفوعة' :
                             invoice.status === 'partial' ? 'جزئية' :
                             invoice.status === 'overdue' ? 'متأخرة' : 'غير مدفوعة'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* النوافذ */}
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          customerId={customerId}
        />

        <CustomerDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          customer={customer as any}
        />

        <InvoiceDialog
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          customerId={customerId}
        />
    </div>
  )
}

