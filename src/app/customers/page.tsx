'use client'

import { useState, useMemo } from 'react'
import { useCustomers } from '@/contexts/customers-context'
import { Customer, CustomerFilter, CustomerSortOptions } from '@/types/customer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import { AppLayout } from '@/components/layout/app-layout'
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  UserPlus,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Home,
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system'
import Link from 'next/link'

export default function CustomersPage() {
  const { customers, searchCustomers, exportCustomers } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [filter] = useState<CustomerFilter>({})
  const [sort] = useState<CustomerSortOptions>({
    field: 'fullName',
    direction: 'asc',
  })

  // البحث والتصفية
  const filteredCustomers = useMemo(() => {
    return searchCustomers({ ...filter, searchQuery })
  }, [searchCustomers, filter, searchQuery])

  // الإحصائيات العامة
  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const totalDebt = customers.reduce((sum, c) => sum + (c.currentDebt ?? 0), 0)
    const customersWithDebt = customers.filter(c => (c.currentDebt ?? 0) > 0).length

    return {
      totalCustomers,
      activeCustomers,
      totalDebt,
      customersWithDebt,
    }
  }, [customers])

  // تصدير CSV
  const handleExport = () => {
    const csv = exportCustomers()
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // الحصول على لون الحالة
  const getStatusColor = (status: Customer['status']) => {
    const baseClasses = 'border'
    const darkClasses = {
      active: 'dark:bg-green-950/30 dark:text-green-300 dark:border-green-700',
      inactive: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
      blocked: 'dark:bg-red-950/30 dark:text-red-300 dark:border-red-700'
    }
    const lightStyles = {
      active: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' },
      inactive: { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' },
      blocked: { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }
    }
    return { className: `${baseClasses} ${darkClasses[status]}`, style: lightStyles[status] }
  }

  // الحصول على لون التصنيف
  const getCategoryColor = (category: Customer['category']) => {
    const baseClasses = 'border'
    const darkClasses = {
      vip: 'dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-700',
      regular: 'dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-700',
      new: 'dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-700'
    }
    const lightStyles = {
      vip: { backgroundColor: '#f3e8ff', color: '#581c87', borderColor: '#e9d5ff' },
      regular: { backgroundColor: '#dbeafe', color: '#1e3a8a', borderColor: '#bfdbfe' },
      new: { backgroundColor: '#ffedd5', color: '#7c2d12', borderColor: '#fed7aa' }
    }
    return { className: `${baseClasses} ${darkClasses[category]}`, style: lightStyles[category] }
  }

  // الحصول على نص الحالة
  const getStatusText = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'blocked': return 'محظور'
    }
  }

  // الحصول على نص التصنيف
  const getCategoryText = (category: Customer['category']) => {
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
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-full">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
              <p className="text-sm text-gray-600">إدارة شاملة لجميع العملاء والمديونيات</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير Excel
            </Button>
            <Button
              onClick={() => setShowCustomerDialog(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <UserPlus className="h-4 w-4" />
              إضافة عميل جديد
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">إجمالي العملاء</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 shadow-sm border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">العملاء النشطون</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.activeCustomers}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 shadow-sm border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">إجمالي المديونيات</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">{formatCurrency(stats.totalDebt)}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 shadow-sm border-2 border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-700 font-medium">عملاء لديهم مديونيات</p>
                <p className="text-3xl font-bold text-rose-900 mt-1">{stats.customersWithDebt}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg shadow-md">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* البحث والتصفية */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 shadow-sm border-2 border-gray-200 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
              <Input
                placeholder="ابحث بالاسم، رقم الهاتف، البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-2 border-gray-300 focus:border-blue-500 bg-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Filter className="h-4 w-4" />
              فلاتر
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-300">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">الحالة</label>
                {/* سأضيف Select للحالة */}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">التصنيف</label>
                {/* سأضيف Select للتصنيف */}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">المديونية</label>
                {/* سأضيف Range للمديونية */}
              </div>
            </div>
          )}
        </div>

        {/* قائمة العملاء */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    معلومات الاتصال
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    التصنيف
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    المديونية
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">لا توجد عملاء</p>
                        <Button onClick={() => setShowCustomerDialog(true)} className="mt-4 gap-2">
                          <Plus className="h-4 w-4" />
                          إضافة أول عميل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {(customer.fullName ?? customer.name ?? 'C').charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{customer.fullName ?? customer.name}</div>
                            {customer.company && (
                              <div className="text-sm text-gray-500">{customer.company}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor((customer.status ?? 'active') as any).className}`}
                          style={getStatusColor((customer.status ?? 'active') as any).style}
                        >
                          {getStatusText((customer.status ?? 'active') as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor((customer.category ?? 'regular') as any).className}`}
                          style={getCategoryColor((customer.category ?? 'regular') as any).style}
                        >
                          {getCategoryText((customer.category ?? 'regular') as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`font-semibold ${(customer.currentDebt ?? 0) > 0 ? 'dark:text-red-400' : 'dark:text-green-400'}`}
                          style={{ color: (customer.currentDebt ?? 0) > 0 ? '#dc2626' : '#16a34a' }}
                        >
                          {formatCurrency(customer.currentDebt ?? 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="outline" size="sm">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* نافذة إضافة/تعديل عميل */}
        <CustomerDialog
          open={showCustomerDialog}
          onOpenChange={setShowCustomerDialog}
        />
      </div>
    </AppLayout>
  )
}

