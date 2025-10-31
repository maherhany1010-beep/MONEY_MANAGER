'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { CentralTransferDialog } from '@/components/transfers/central-transfer-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useCentralTransfers, AccountType } from '@/contexts/central-transfers-context'
import { formatCurrency, formatNumber } from '@/lib/design-system'
import { 
  ArrowRightLeft, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Landmark,
  Vault,
  Wallet,
  CreditCard,
  Filter
} from 'lucide-react'

export default function TransfersPage() {
  const { transfers, addTransfer, getTodayTransfers, getMonthTransfers } = useCentralTransfers()
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<AccountType | 'all'>('all')

  const todayTransfers = getTodayTransfers()
  const monthTransfers = getMonthTransfers()

  // حساب الإحصائيات
  const totalTransferred = transfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const todayTotal = todayTransfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthTotal = monthTransfers
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const completedCount = transfers.filter(t => t.status === 'completed').length

  // تصفية التحويلات
  const filteredTransfers = filterType === 'all'
    ? transfers
    : transfers.filter(t => {
        const fromType = typeof t.fromAccount === 'object' ? t.fromAccount?.type : undefined
        const toType = typeof t.toAccount === 'object' ? t.toAccount?.type : undefined
        return fromType === filterType || toType === filterType
      })

  const getTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'bank-account': return <Landmark className="h-4 w-4" />
      case 'cash-vault': return <Vault className="h-4 w-4" />
      case 'e-wallet': return <Wallet className="h-4 w-4" />
      case 'prepaid-card': return <CreditCard className="h-4 w-4" />
      case 'pos-machine': return <CreditCard className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'bank-account': return 'حساب بنكي'
      case 'cash-vault': return 'خزينة نقدية'
      case 'e-wallet': return 'محفظة إلكترونية'
      case 'prepaid-card': return 'بطاقة مسبقة'
      case 'pos-machine': return 'ماكينة دفع'
    }
  }

  const getTypeBadgeColor = (type: AccountType) => {
    switch (type) {
      case 'bank-account': return 'bg-blue-100 text-blue-800'
      case 'cash-vault': return 'bg-green-100 text-green-800'
      case 'e-wallet': return 'bg-purple-100 text-purple-800'
      case 'prepaid-card': return 'bg-orange-100 text-orange-800'
      case 'pos-machine': return 'bg-indigo-100 text-indigo-800'
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="التحويلات المركزية"
        description="إدارة التحويلات بين جميع أنواع الحسابات (البنوك، الخزائن، المحافظ، البطاقات، الماكينات)"
        action={{
          label: 'تحويل جديد',
          icon: Plus,
          onClick: () => setIsTransferDialogOpen(true),
        }}
      />

      {/* الإحصائيات */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="إجمالي التحويلات"
          value={formatCurrency(totalTransferred)}
          subtitle={`${completedCount} تحويل`}
          icon={ArrowRightLeft}
          variant="blue"
        />
        
        <StatCard
          title="تحويلات اليوم"
          value={formatCurrency(todayTotal)}
          subtitle={`${todayTransfers.length} تحويل`}
          icon={Calendar}
          variant="green"
        />
        
        <StatCard
          title="تحويلات الشهر"
          value={formatCurrency(monthTotal)}
          subtitle={`${monthTransfers.length} تحويل`}
          icon={TrendingUp}
          variant="purple"
        />
        
        <StatCard
          title="عدد التحويلات"
          value={formatNumber(transfers.length)}
          subtitle="إجمالي"
          icon={Activity}
          variant="orange"
        />
      </div>

      {/* التبويبات والتصفية */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterType('all')}>
              الكل ({transfers.length})
            </TabsTrigger>
            <TabsTrigger value="today" onClick={() => setFilterType('all')}>
              اليوم ({todayTransfers.length})
            </TabsTrigger>
            <TabsTrigger value="month" onClick={() => setFilterType('all')}>
              الشهر ({monthTransfers.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AccountType | 'all')}
            >
              <option value="all">جميع الأنواع</option>
              <option value="bank-account">حسابات بنكية</option>
              <option value="cash-vault">خزائن نقدية</option>
              <option value="e-wallet">محافظ إلكترونية</option>
              <option value="prepaid-card">بطاقات مسبقة</option>
              <option value="pos-machine">ماكينات دفع</option>
            </select>
          </div>
        </div>

        {/* جميع التحويلات */}
        <TabsContent value="all" className="space-y-4">
          {filteredTransfers.length === 0 ? (
            <EmptyState
              icon={ArrowRightLeft}
              title="لا توجد تحويلات"
              description="ابدأ بإجراء تحويل جديد بين حساباتك"
              action={{
                label: 'تحويل جديد',
                onClick: () => setIsTransferDialogOpen(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredTransfers.map((transfer) => (
                <Card key={transfer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* الحساب المصدر */}
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <div className="p-2 bg-red-100 rounded-lg">
                            {getTypeIcon(typeof transfer.fromAccount === 'object' ? transfer.fromAccount?.type ?? 'bank' : 'bank')}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{typeof transfer.fromAccount === 'object' ? transfer.fromAccount?.name : transfer.fromAccount}</p>
                            <Badge className={`text-xs ${getTypeBadgeColor(typeof transfer.fromAccount === 'object' ? transfer.fromAccount?.type ?? 'bank' : 'bank')}`}>
                              {getTypeLabel(typeof transfer.fromAccount === 'object' ? transfer.fromAccount?.type ?? 'bank' : 'bank')}
                            </Badge>
                          </div>
                        </div>

                        {/* السهم */}
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft className="h-5 w-5 text-gray-400" />
                        </div>

                        {/* الحساب المستهدف */}
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <div className="p-2 bg-green-100 rounded-lg">
                            {getTypeIcon(typeof transfer.toAccount === 'object' ? transfer.toAccount?.type ?? 'bank' : 'bank')}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{typeof transfer.toAccount === 'object' ? transfer.toAccount?.name : transfer.toAccount}</p>
                            <Badge className={`text-xs ${getTypeBadgeColor(typeof transfer.toAccount === 'object' ? transfer.toAccount?.type ?? 'bank' : 'bank')}`}>
                              {getTypeLabel(typeof transfer.toAccount === 'object' ? transfer.toAccount?.type ?? 'bank' : 'bank')}
                            </Badge>
                          </div>
                        </div>

                        {/* التفاصيل */}
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            {transfer.date ?? transfer.transfer_date} - {transfer.time ?? ''}
                          </p>
                          {(transfer.fee ?? transfer.fees ?? 0) > 0 && (
                            <p className="text-xs text-orange-600 mt-1">
                              رسوم: {formatCurrency(transfer.fee ?? transfer.fees ?? 0)}
                              {transfer.feeBearer && ` (${transfer.feeBearer === 'sender' ? 'المرسل' : transfer.feeBearer === 'receiver' ? 'المستقبل' : 'لا أحد'})`}
                            </p>
                          )}
                          {transfer.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {transfer.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* المبلغ */}
                      <div className="text-left space-y-1">
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(transfer.amount)}
                        </p>
                        {(transfer.fee ?? transfer.fees ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            + {formatCurrency(transfer.fee ?? transfer.fees ?? 0)} رسوم
                          </p>
                        )}
                        <Badge
                          variant={transfer.status === 'completed' ? 'secondary' : 'secondary'}
                          className={`text-xs ${transfer.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}
                        >
                          {transfer.status === 'completed' ? 'مكتمل' : transfer.status === 'pending' ? 'معلق' : 'فشل'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* تحويلات اليوم */}
        <TabsContent value="today" className="space-y-4">
          {todayTransfers.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="لا توجد تحويلات اليوم"
              description="لم يتم إجراء أي تحويلات اليوم"
              action={{
                label: 'تحويل جديد',
                onClick: () => setIsTransferDialogOpen(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {todayTransfers.map((transfer) => (
                <Card key={transfer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {typeof transfer.fromAccount === 'object' ? transfer.fromAccount?.name : transfer.fromAccount} → {typeof transfer.toAccount === 'object' ? transfer.toAccount?.name : transfer.toAccount}
                          </p>
                          <p className="text-xs text-muted-foreground">{transfer.time ?? ''}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(transfer.amount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* تحويلات الشهر */}
        <TabsContent value="month" className="space-y-4">
          {monthTransfers.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="لا توجد تحويلات هذا الشهر"
              description="لم يتم إجراء أي تحويلات هذا الشهر"
              action={{
                label: 'تحويل جديد',
                onClick: () => setIsTransferDialogOpen(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {monthTransfers.map((transfer) => (
                <Card key={transfer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {typeof transfer.fromAccount === 'object' ? transfer.fromAccount?.name : transfer.fromAccount} → {typeof transfer.toAccount === 'object' ? transfer.toAccount?.name : transfer.toAccount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transfer.date ?? transfer.transfer_date} - {transfer.time ?? ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {formatCurrency(transfer.amount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog التحويل */}
      <CentralTransferDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onTransfer={addTransfer}
      />
    </AppLayout>
  )
}

