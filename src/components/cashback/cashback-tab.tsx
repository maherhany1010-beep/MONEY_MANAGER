'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCashback } from '@/contexts/cashback-context'
import { AddCashbackDialog } from './add-cashback-dialog'
import { RedeemCashbackDialog } from './redeem-cashback-dialog'
import { CashbackSettingsDialog } from './cashback-settings-dialog'
import { formatCurrency } from '@/lib/design-system'
import { Plus, Gift, Settings, TrendingUp, DollarSign, Ticket, Calendar, Clock } from 'lucide-react'

interface CashbackTabProps {
  cardId: string
}

export function CashbackTab({ cardId }: CashbackTabProps) {
  const {
    getCardCashbackRecords,
    getCardRedemptions,
    getCardStats,
    processAutomaticRedemptions,
  } = useCashback()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showRedeemDialog, setShowRedeemDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedCashbackId, setSelectedCashbackId] = useState<string | null>(null)

  const cashbackRecords = useMemo(() => getCardCashbackRecords(cardId), [cardId, getCardCashbackRecords])
  const redemptions = useMemo(() => getCardRedemptions(cardId), [cardId, getCardRedemptions])
  const stats = useMemo(() => getCardStats(cardId), [cardId, getCardStats])

  const handleRedeem = (cashbackId: string) => {
    setSelectedCashbackId(cashbackId)
    setShowRedeemDialog(true)
  }

  const handleProcessAutoRedemptions = () => {
    processAutomaticRedemptions(cardId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">معلق</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">معتمد</Badge>
      case 'redeemed':
        return <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">مسترد</Badge>
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">منتهي</Badge>
      case 'cancelled':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">ملغي</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكاش باك</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(stats.totalEarned)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRecords} سجل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المتاح</CardTitle>
            <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              متاح للاسترداد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المسترد</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.totalRedeemed)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRedemptions} عملية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المعلق</CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(stats.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              في الانتظار
            </p>
          </CardContent>
        </Card>
      </div>

      {/* الأزرار */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4" />
          إضافة كاش باك
        </Button>
        <Button
          onClick={handleProcessAutoRedemptions}
          variant="outline"
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          معالجة الاستردادات التلقائية
        </Button>
        <Button
          onClick={() => setShowSettingsDialog(true)}
          variant="outline"
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          الإعدادات
        </Button>
      </div>

      {/* سجلات الكاش باك */}
      <Card>
        <CardHeader>
          <CardTitle>سجلات الكاش باك</CardTitle>
          <CardDescription>
            جميع سجلات الكاش باك المكتسبة من عمليات الشراء
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cashbackRecords.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">لا توجد سجلات كاش باك</p>
              <p className="text-sm text-muted-foreground">
                ابدأ بإضافة سجل كاش باك جديد
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cashbackRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{record.source}</h4>
                        {getStatusBadge(record.status)}
                      </div>
                      {record.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {record.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {record.earnedDate}
                        </span>
                        {record.autoRedeemEnabled && record.autoRedeemDate && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Clock className="h-3 w-3" />
                            استرداد تلقائي: {record.autoRedeemDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {formatCurrency(record.amount)}
                      </p>
                      {record.redeemedAmount > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          مسترد: {formatCurrency(record.redeemedAmount)}
                        </p>
                      )}
                      {record.remainingAmount > 0 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          متبقي: {formatCurrency(record.remainingAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {record.remainingAmount > 0 && record.status !== 'expired' && record.status !== 'cancelled' && (
                    <Button
                      onClick={() => handleRedeem(record.id)}
                      size="sm"
                      className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Gift className="h-4 w-4" />
                      استرداد الكاش باك
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* عمليات الاسترداد */}
      <Card>
        <CardHeader>
          <CardTitle>عمليات الاسترداد</CardTitle>
          <CardDescription>
            سجل جميع عمليات استرداد الكاش باك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد عمليات استرداد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redemptions.map((redemption: any) => (
                <div
                  key={redemption.id}
                  className="p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {redemption.redemptionType === 'balance' ? (
                          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Ticket className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        )}
                        <span className="font-medium">
                          {redemption.redemptionType === 'balance' ? 'رصيد البطاقة' : 'قسيمة مشتريات'}
                        </span>
                        {redemption.isAutomatic && (
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs">
                            تلقائي
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {redemption.redemptionMode === 'full' ? 'كلي' : 'جزئي'}
                        </Badge>
                      </div>
                      {redemption.voucherDetails && (
                        <p className="text-sm text-muted-foreground mb-1">
                          📍 {redemption.voucherDetails.storeName}
                        </p>
                      )}
                      {redemption.voucherDetails?.voucherCode && (
                        <p className="text-xs text-muted-foreground mb-1">
                          كود: {redemption.voucherDetails.voucherCode}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {redemption.redemptionDate}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(redemption.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddCashbackDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        cardId={cardId}
      />

      {selectedCashbackId && (
        <RedeemCashbackDialog
          open={showRedeemDialog}
          onOpenChange={setShowRedeemDialog}
          cashbackId={selectedCashbackId}
          cardId={cardId}
        />
      )}

      <CashbackSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        cardId={cardId}
      />
    </div>
  )
}

