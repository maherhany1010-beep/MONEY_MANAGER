'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCustomers } from '@/contexts/customers-context'
import { AppLayout } from '@/components/layout/app-layout'
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
  CreditCard,
  ArrowRight,
  Edit,
  Trash2,
  Plus,
  Receipt,
} from 'lucide-react'
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

  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  const customer = useMemo(() => getCustomer(customerId), [customerId, getCustomer])
  const invoices = useMemo(() => getCustomerInvoices(customerId), [customerId, getCustomerInvoices])
  const payments = useMemo(() => getCustomerPayments(customerId), [customerId, getCustomerPayments])
  const transactions = useMemo(() => getCustomerTransactions(customerId), [customerId, getCustomerTransactions])

  if (!customer) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">العميل غير موجود</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على العميل المطلوب</p>
          <Link href="/customers">
            <Button>العودة إلى قائمة العملاء</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف العميل "${customer.fullName}"؟`)) {
      deleteCustomer(customerId)
      router.push('/customers')
    }
  }

  // الحصول على لون الحالة
  const getStatusColor = (status: typeof customer.status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200'
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
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'regular': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'new': return 'bg-orange-100 text-orange-800 border-orange-200'
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
    <AppLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customers">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                  {getStatusText(customer.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(customer.category)}`}>
                  {getCategoryText(customer.category)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEditDialog(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              تعديل
            </Button>
            <Button variant="outline" onClick={handleDelete} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
            <Button onClick={() => setShowPaymentDialog(true)} className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Plus className="h-4 w-4" />
              تسجيل دفعة
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">إجمالي المشتريات</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(customer.totalPurchases)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 shadow-sm border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">إجمالي المدفوعات</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{formatCurrency(customer.totalPayments)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-md">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-xl p-6 shadow-sm border-2 ${
            customer.currentDebt > 0
              ? 'from-rose-50 to-red-50 border-rose-200'
              : 'from-emerald-50 to-green-50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${customer.currentDebt > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  المديونية الحالية
                </p>
                <p className={`text-3xl font-bold mt-1 ${customer.currentDebt > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {formatCurrency(customer.currentDebt)}
                </p>
              </div>
              <div className={`p-3 rounded-lg shadow-md ${
                customer.currentDebt > 0
                  ? 'bg-gradient-to-br from-red-600 to-rose-600'
                  : 'bg-gradient-to-br from-green-600 to-emerald-600'
              }`}>
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* المعلومات الشخصية */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 shadow-md border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            المعلومات الشخصية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
              </div>
            </div>

            {customer.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
            )}

            {customer.address && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">العنوان</p>
                  <p className="font-medium text-gray-900">{customer.address}</p>
                </div>
              </div>
            )}

            {customer.company && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">الشركة</p>
                  <p className="font-medium text-gray-900">{customer.company}</p>
                </div>
              </div>
            )}

            {customer.profession && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">المهنة</p>
                  <p className="font-medium text-gray-900">{customer.profession}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Calendar className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                <p className="font-medium text-gray-900">{customer.registrationDate}</p>
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
              <p className="text-gray-900">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* الفواتير */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-blue-900">الفواتير ({invoices.length})</h2>
            </div>
            <Button
              onClick={() => setShowInvoiceDialog(true)}
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">رقم الفاتورة</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">النوع</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">التاريخ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">المبلغ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">المدفوع</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">المتبقي</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      لا توجد فواتير
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    // تحديد نوع الفاتورة ومصدرها
                    let invoiceTypeLabel = 'بيع عادية'
                    let invoiceTypeColor = 'bg-blue-100 text-blue-800'

                    if (invoice.invoiceType === 'transfer' && invoice.transferDetails) {
                      const { debitAccountType, creditAccountType } = invoice.transferDetails
                      if (debitAccountType === 'customer') {
                        invoiceTypeLabel = 'دفعة من العميل'
                        invoiceTypeColor = 'bg-green-100 text-green-800'
                      } else if (creditAccountType === 'customer') {
                        invoiceTypeLabel = 'تحويل للعميل'
                        invoiceTypeColor = 'bg-purple-100 text-purple-800'
                      } else {
                        invoiceTypeLabel = 'تحويل'
                        invoiceTypeColor = 'bg-orange-100 text-orange-800'
                      }
                    }

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoiceTypeColor}`}>
                            {invoiceTypeLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{invoice.invoiceDate}</td>
                        <td className="px-6 py-4 font-semibold">{formatCurrency(invoice.amount)}</td>
                        <td className="px-6 py-4 text-green-600">{formatCurrency(invoice.paidAmount)}</td>
                        <td className="px-6 py-4 text-red-600">{formatCurrency(invoice.remainingAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
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
          customer={customer}
        />

        <InvoiceDialog
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          customerId={customerId}
        />
      </div>
    </AppLayout>
  )
}

