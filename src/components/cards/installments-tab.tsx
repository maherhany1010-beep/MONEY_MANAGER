'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Edit
} from 'lucide-react'
import { AddInstallmentDialog } from './add-installment-dialog'
import { InstallmentDetailsDialog } from './installment-details-dialog'
import { EditInstallmentDialog } from './edit-installment-dialog'

interface InstallmentsTabProps {
  cardId: string
}

// بيانات وهمية للتقسيط
const mockInstallments = [
  {
    id: '1',
    merchantName: 'كارفور',
    totalAmount: 15000,
    monthlyPayment: 1500,
    totalMonths: 10,
    paidMonths: 4,
    remainingMonths: 6,
    startDate: '2024-06-15',
    endDate: '2025-04-15',
    interestRate: 0,
    status: 'active' as const,
    nextPaymentDate: '2025-02-15',
    nextPaymentAmount: 1500,
  },
  {
    id: '2',
    merchantName: 'نون',
    totalAmount: 8000,
    monthlyPayment: 800,
    totalMonths: 10,
    paidMonths: 7,
    remainingMonths: 3,
    startDate: '2024-03-20',
    endDate: '2025-01-20',
    interestRate: 0,
    status: 'active' as const,
    nextPaymentDate: '2025-01-20',
    nextPaymentAmount: 800,
  },
  {
    id: '3',
    merchantName: 'أمازون',
    totalAmount: 12000,
    monthlyPayment: 1000,
    totalMonths: 12,
    paidMonths: 12,
    remainingMonths: 0,
    startDate: '2023-10-10',
    endDate: '2024-10-10',
    interestRate: 0,
    status: 'completed' as const,
    nextPaymentDate: null,
    nextPaymentAmount: 0,
  },
  {
    id: '4',
    merchantName: 'جوميا',
    totalAmount: 6000,
    monthlyPayment: 600,
    totalMonths: 10,
    paidMonths: 2,
    remainingMonths: 8,
    startDate: '2024-08-25',
    endDate: '2025-06-25',
    interestRate: 0,
    status: 'active' as const,
    nextPaymentDate: '2025-02-25',
    nextPaymentAmount: 600,
  },
]

export function InstallmentsTab({ cardId }: InstallmentsTabProps) {
  const [installments, setInstallments] = useState(mockInstallments)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null)

  // تحميل التقسيطات من localStorage
  useEffect(() => {
    const savedInstallments = localStorage.getItem(`installments_${cardId}`)
    if (savedInstallments) {
      setInstallments(JSON.parse(savedInstallments))
    }
  }, [cardId])

  // حفظ التقسيطات في localStorage
  useEffect(() => {
    if (installments.length > 0) {
      localStorage.setItem(`installments_${cardId}`, JSON.stringify(installments))
    }
  }, [installments, cardId])

  // إضافة تقسيط جديد
  const handleAddInstallment = (newInstallment: any) => {
    setInstallments([...installments, newInstallment])
  }

  // فتح نافذة التفاصيل
  const handleViewDetails = (installment: any) => {
    setSelectedInstallment(installment)
    setShowDetailsDialog(true)
  }

  // فتح نافذة التعديل
  const handleEditInstallment = (installment: any) => {
    setSelectedInstallment(installment)
    setShowEditDialog(true)
  }

  // حفظ التعديلات
  const handleSaveEdit = (updatedInstallment: any) => {
    const updatedInstallments = installments.map(inst =>
      inst.id === updatedInstallment.id ? updatedInstallment : inst
    )
    setInstallments(updatedInstallments)
    localStorage.setItem(`installments_${cardId}`, JSON.stringify(updatedInstallments))
  }

  // تصفية التقسيطات
  const filteredInstallments = installments.filter(inst => {
    if (selectedFilter === 'all') return true
    return inst.status === selectedFilter
  })

  // الإحصائيات
  const activeInstallments = installments.filter(i => i.status === 'active')
  const totalActiveAmount = activeInstallments.reduce((sum, i) => sum + (i.monthlyPayment * i.remainingMonths), 0)
  const totalMonthlyPayment = activeInstallments.reduce((sum, i) => sum + i.monthlyPayment, 0)
  const completedInstallments = installments.filter(i => i.status === 'completed').length

  // دالة للحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2563eb' // أزرق
      case 'completed':
        return '#16a34a' // أخضر
      default:
        return '#6b7280' // رمادي
    }
  }

  // دالة للحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط'
      case 'completed':
        return 'مكتمل'
      default:
        return 'غير معروف'
    }
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقسيطات النشطة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInstallments.length}</div>
            <p className="text-xs text-muted-foreground">
              تقسيط جاري
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المتبقي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>
              {formatCurrency(totalActiveAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              من جميع التقسيطات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القسط الشهري</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#d97706' }}>
              {formatCurrency(totalMonthlyPayment)}
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي الأقساط الشهرية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقسيطات المكتملة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#16a34a' }}>
              {completedInstallments}
            </div>
            <p className="text-xs text-muted-foreground">
              تم السداد بالكامل
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>التقسيطات</CardTitle>
              <CardDescription>
                إدارة ومتابعة جميع التقسيطات
              </CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              إضافة تقسيط
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              الكل ({installments.length})
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('active')}
            >
              النشطة ({activeInstallments.length})
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('completed')}
            >
              المكتملة ({completedInstallments})
            </Button>
          </div>

          {/* قائمة التقسيطات */}
          <div className="space-y-4">
            {filteredInstallments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد تقسيطات</p>
              </div>
            ) : (
              filteredInstallments.map((installment) => {
                const progress = (installment.paidMonths / installment.totalMonths) * 100

                return (
                  <Card key={installment.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <CreditCard className="h-5 w-5" style={{ color: '#2563eb' }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{installment.merchantName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {installment.totalMonths} أشهر • {formatCurrency(installment.monthlyPayment)} شهرياً
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary"
                          style={{ 
                            backgroundColor: `${getStatusColor(installment.status)}20`,
                            color: getStatusColor(installment.status),
                            borderColor: getStatusColor(installment.status)
                          }}
                        >
                          {getStatusText(installment.status)}
                        </Badge>
                      </div>

                      {/* شريط التقدم */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">
                            {installment.paidMonths} من {installment.totalMonths} شهر
                          </span>
                          <span className="text-sm font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                          indicatorClassName={installment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}
                        />
                      </div>

                      {/* التفاصيل */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">إجمالي المبلغ</p>
                          <p className="font-semibold">{formatCurrency(installment.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">المدفوع</p>
                          <p className="font-semibold" style={{ color: '#16a34a' }}>
                            {formatCurrency(installment.monthlyPayment * installment.paidMonths)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">المتبقي</p>
                          <p className="font-semibold" style={{ color: '#dc2626' }}>
                            {formatCurrency(installment.monthlyPayment * installment.remainingMonths)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">نسبة الفائدة</p>
                          <p className="font-semibold">{installment.interestRate}%</p>
                        </div>
                      </div>

                      {/* القسط القادم */}
                      {installment.status === 'active' && installment.nextPaymentDate && (
                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" style={{ color: '#d97706' }} />
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#d97706' }}>
                                القسط القادم
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(installment.nextPaymentDate)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold" style={{ color: '#d97706' }}>
                            {formatCurrency(installment.nextPaymentAmount)}
                          </p>
                        </div>
                      )}

                      {/* الأزرار */}
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1"
                          onClick={() => handleViewDetails(installment)}
                        >
                          <Eye className="h-4 w-4" />
                          التفاصيل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1"
                          onClick={() => handleEditInstallment(installment)}
                        >
                          <Edit className="h-4 w-4" />
                          تعديل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* نوافذ الحوار */}
      <AddInstallmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        cardId={cardId}
        onAdd={handleAddInstallment}
      />

      <InstallmentDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        installment={selectedInstallment}
      />

      <EditInstallmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        installment={selectedInstallment}
        onSave={handleSaveEdit}
      />
    </div>
  )
}

