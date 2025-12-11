'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Users, TrendingUp, DollarSign, Calendar, ArrowRight, Trash2, CreditCard, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSavingsCircles } from '@/contexts/savings-circles-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { AddCircleDialog } from '@/components/savings-circles/add-circle-dialog'
import { CircleTransactionDialog } from '@/components/savings-circles/circle-transaction-dialog'
import type { SavingsCircle } from '@/types/savings-circles'

export default function SavingsCirclesPage() {
  const router = useRouter()
  const { circles, stats, filter, setFilter, deleteCircle, updateCircle } = useSavingsCircles()
  const { accounts: bankAccounts, updateAccountBalance: updateBankBalance } = useBankAccounts()
  const { vaults: cashVaults, updateVaultBalance } = useCashVaults()
  const { wallets: eWallets, updateWalletBalance } = useEWallets()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [transactionDialog, setTransactionDialog] = useState<{
    open: boolean
    type: 'payment' | 'withdrawal'
    circle: SavingsCircle | null
  }>({ open: false, type: 'payment', circle: null })

  // تصنيف الجمعيات (إذا لم يكن هناك role، نعتبرها manager افتراضياً)
  const managerCircles = circles.filter(c => (c.role === 'manager' || !c.role) && c.status === 'active')
  const memberCircles = circles.filter(c => c.role === 'member' && c.status === 'active')
  const completedCircles = circles.filter(c => c.status === 'completed')

  // دالة تنسيق العملة بالأرقام اللاتينية
  const formatCurrency = (amount: number | undefined | null) => {
    const value = amount ?? 0
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
  }

  // دالة تنسيق الأرقام بالأرقام اللاتينية
  const formatNumber = (num: number | undefined | null) => {
    const value = num ?? 0
    return value.toLocaleString('en-US')
  }

  // دالة تنسيق التاريخ بالأرقام اللاتينية
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString('ar-EG', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  // دالة الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 dark:bg-green-600'
      case 'completed': return 'bg-slate-500 dark:bg-slate-600'
      case 'cancelled': return 'bg-red-500 dark:bg-red-600'
      case 'pending': return 'bg-yellow-500 dark:bg-yellow-600'
      default: return 'bg-slate-500 dark:bg-slate-600'
    }
  }

  // دالة الحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة'
      case 'completed': return 'مكتملة'
      case 'cancelled': return 'ملغاة'
      case 'pending': return 'معلقة'
      default: return status
    }
  }

  // دالة حساب تاريخ الانتهاء
  const calculateEndDate = (startDate: string, durationMonths: number) => {
    const start = new Date(startDate)
    start.setMonth(start.getMonth() + durationMonths)
    return start
  }

  // دالة حساب تاريخ القبض حسب الدور
  const calculateTurnDate = (startDate: string, turnNumber: number) => {
    const start = new Date(startDate)
    start.setMonth(start.getMonth() + turnNumber)
    return start
  }

  // معالجة السداد
  const handlePayment = async (accountId: string, accountType: string) => {
    const circle = transactionDialog.circle
    if (!circle) return

    const monthlyAmount = circle.monthly_payment || circle.monthlyAmount || 0
    const currentRound = circle.currentRound || circle.current_round || 1
    const duration = circle.duration || circle.totalMembers || 12

    // تحديث رصيد الحساب
    if (accountType === 'bank') {
      const account = bankAccounts.find(a => a.id === accountId)
      if (account) {
        await updateBankBalance(accountId, account.balance - monthlyAmount)
      }
    } else if (accountType === 'cash') {
      const vault = cashVaults.find(v => v.id === accountId)
      if (vault) {
        await updateVaultBalance(accountId, vault.balance - monthlyAmount)
      }
    } else if (accountType === 'wallet') {
      const wallet = eWallets.find(w => w.id === accountId)
      if (wallet) {
        await updateWalletBalance(accountId, wallet.balance - monthlyAmount)
      }
    }

    // تحديث الجمعية
    const newRound = currentRound + 1
    const isCompleted = newRound > duration

    await updateCircle(circle.id, {
      currentRound: newRound,
      current_round: newRound,
      totalPaid: (circle.totalPaid || 0) + monthlyAmount,
      status: isCompleted ? 'completed' : 'active',
    })
  }

  // معالجة السحب
  const handleWithdrawal = async (accountId: string, accountType: string) => {
    const circle = transactionDialog.circle
    if (!circle) return

    const totalAmount = circle.total_amount ||
      ((circle.monthly_payment || circle.monthlyAmount || 0) * (circle.totalMembers || circle.duration || 1))

    // تحديث رصيد الحساب
    if (accountType === 'bank') {
      const account = bankAccounts.find(a => a.id === accountId)
      if (account) {
        await updateBankBalance(accountId, account.balance + totalAmount)
      }
    } else if (accountType === 'cash') {
      const vault = cashVaults.find(v => v.id === accountId)
      if (vault) {
        await updateVaultBalance(accountId, vault.balance + totalAmount)
      }
    } else if (accountType === 'wallet') {
      const wallet = eWallets.find(w => w.id === accountId)
      if (wallet) {
        await updateWalletBalance(accountId, wallet.balance + totalAmount)
      }
    }

    // تحديث الجمعية - تسجيل أن السحب تم
    await updateCircle(circle.id, {
      hasWithdrawn: true,
      withdrawnAmount: totalAmount,
      totalWithdrawn: (circle.totalWithdrawn || 0) + totalAmount,
    })
  }

  // مكون بطاقة الجمعية
  const CircleCard = ({ circle }: { circle: SavingsCircle }) => {
    // استخدام البيانات من قاعدة البيانات أو البيانات المحلية
    const circleName = circle.name || circle.circle_name || 'جمعية بدون اسم'
    const monthlyAmount = circle.monthlyAmount || circle.monthly_payment || 0
    const totalAmount = circle.total_amount || (monthlyAmount * (circle.totalMembers || 1))
    const duration = circle.duration || circle.totalMembers || 12
    const currentRound = circle.currentRound || circle.current_round || 1
    const progress = (currentRound / duration) * 100
    const startDate = circle.startDate || circle.start_date
    const myTurn = circle.myTurnNumber || circle.my_turn_number || 0

    // حساب تاريخ الانتهاء
    const endDate = startDate ? calculateEndDate(startDate, duration) : null
    const isExpired = endDate ? new Date() > endDate : false

    // حساب تاريخ القبض حسب الدور
    const turnDate = startDate && myTurn > 0 ? calculateTurnDate(startDate, myTurn) : null
    const isTurnReady = turnDate ? new Date() >= turnDate : false

    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{circleName}</CardTitle>
              {circle.description && (
                <CardDescription className="text-sm">{circle.description}</CardDescription>
              )}
            </div>
            <Badge className={`${getStatusColor(isExpired ? 'completed' : circle.status)} text-white`}>
              {getStatusText(isExpired ? 'completed' : circle.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* المبلغ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">المبلغ الشهري</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(monthlyAmount)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">المبلغ الكلي</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* التقدم */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">التقدم</span>
              <span className="font-semibold">
                الدورة {formatNumber(currentRound)} من {formatNumber(duration)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{formatNumber(circle.totalMembers || duration)} عضو</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>بداية: {formatDate(startDate)}</span>
            </div>
          </div>

          {/* تاريخ الانتهاء وتاريخ القبض */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-red-500" />
              <span>انتهاء: {endDate ? formatDate(endDate.toISOString()) : '-'}</span>
            </div>
            {myTurn > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className={`h-4 w-4 ${isTurnReady ? 'text-green-500' : 'text-amber-500'}`} />
                <span className={isTurnReady ? 'text-green-600 font-semibold' : ''}>
                  قبضك: {turnDate ? formatDate(turnDate.toISOString()) : '-'}
                </span>
              </div>
            )}
          </div>

          {/* دورك */}
          {myTurn > 0 && (
            <div className="pt-2 border-t">
              <Badge variant={isTurnReady && !circle.hasWithdrawn ? 'default' : 'outline'}
                     className={`text-sm ${isTurnReady && !circle.hasWithdrawn ? 'bg-green-600' : ''}`}>
                {circle.hasWithdrawn
                  ? '✅ تم استلام دورك'
                  : isTurnReady
                    ? `🎉 دورك جاهز للقبض! (رقم ${formatNumber(myTurn)})`
                    : `دورك: رقم ${formatNumber(myTurn)}`
                }
              </Badge>
            </div>
          )}

          {/* نوع الجمعية */}
          <div className="pt-2 border-t">
            <Badge variant="secondary" className="text-sm">
              {circle.type === 'app-based' ? `📱 ${circle.appName || 'تطبيق'}` : '👥 شخصية'}
            </Badge>
            {circle.hasFees && (
              <Badge variant="outline" className="text-sm mr-2">
                💰 برسوم
              </Badge>
            )}
          </div>

          {/* الأزرار */}
          <div className="space-y-2 pt-3 border-t">
            {/* صف أزرار السداد والسحب */}
            <div className="grid grid-cols-2 gap-2">
              {/* زر السداد */}
              <Button
                variant="default"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
                onClick={(e) => {
                  e.stopPropagation()
                  if (currentRound >= duration) {
                    alert('تم سداد جميع الدورات!')
                    return
                  }
                  setTransactionDialog({
                    open: true,
                    type: 'payment',
                    circle: circle as SavingsCircle,
                  })
                }}
                disabled={currentRound >= duration}
              >
                <CreditCard className="h-5 w-5 ml-2" />
                سداد
              </Button>

              {/* زر السحب */}
              <Button
                variant="default"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-semibold"
                onClick={(e) => {
                  e.stopPropagation()
                  const myTurn = circle.myTurnNumber || circle.my_turn_number || 0
                  if (myTurn === 0) {
                    const turnNumber = prompt('أدخل رقم دورك في الجمعية:')
                    if (turnNumber && !isNaN(parseInt(turnNumber))) {
                      updateCircle(circle.id, {
                        myTurnNumber: parseInt(turnNumber),
                        my_turn_number: parseInt(turnNumber)
                      })
                    }
                    return
                  }
                  if (circle.hasWithdrawn) {
                    alert('لقد استلمت دورك بالفعل!')
                    return
                  }
                  if (myTurn > currentRound) {
                    alert(`دورك في الدورة رقم ${myTurn} - لم يحن بعد (الدورة الحالية: ${currentRound})`)
                    return
                  }
                  setTransactionDialog({
                    open: true,
                    type: 'withdrawal',
                    circle: circle as SavingsCircle,
                  })
                }}
                disabled={circle.hasWithdrawn}
              >
                <Banknote className="h-5 w-5 ml-2" />
                سحب
              </Button>
            </div>

            {/* زر الحذف */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('هل أنت متأكد من حذف هذه الجمعية؟')) {
                  deleteCircle(circle.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4 ml-1" />
              حذف الجمعية
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
          <div className="space-y-6" dir="rtl">

        {/* العنوان والإحصائيات */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة الجمعيات</h1>
            <p className="text-muted-foreground">
              إدارة جمعياتك المالية وتتبع الدفعات والاستلامات
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 ml-2" />
            إضافة جمعية جديدة
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الجمعيات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalCircles)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats?.activeCircles)} نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الالتزام الشهري</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalMonthlyCommitment)}
            </div>
            <p className="text-xs text-muted-foreground">
              في جميع الجمعيات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأموال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalInCircles)}
            </div>
            <p className="text-xs text-muted-foreground">
              في جميع الجمعيات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <ArrowRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              ما دفعته حتى الآن
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المسحوبات</CardTitle>
            <ArrowRight className="h-4 w-4 text-green-500 rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground">
              ما استلمته حتى الآن
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد (الفرق)</CardTitle>
            <DollarSign className={`h-4 w-4 ${(stats?.balance ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(stats?.balance ?? 0) > 0 ? '+' : ''}{formatCurrency(stats?.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(stats?.balance ?? 0) > 0 ? 'عليّ مبلغ' : (stats?.balance ?? 0) < 0 ? 'لي مبلغ' : 'متساوي'}
            </p>
          </CardContent>
        </Card>
        </div>

        {/* Tabs للجمعيات */}
        <Tabs defaultValue="manager" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manager">
            أنا المدير ({formatNumber(managerCircles.length)})
          </TabsTrigger>
          <TabsTrigger value="member">
            أنا عضو ({formatNumber(memberCircles.length)})
          </TabsTrigger>
          <TabsTrigger value="completed">
            مكتملة ({formatNumber(completedCircles.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manager" className="space-y-4">
          {managerCircles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">لا توجد جمعيات تديرها</p>
                <p className="text-sm text-muted-foreground">
                  ابدأ بإنشاء جمعية جديدة تكون أنت المدير فيها من الزر أعلاه
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ direction: 'rtl' }}>
              {managerCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle as any} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="member" className="space-y-4">
          {memberCircles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">لا توجد جمعيات مشترك فيها</p>
                <p className="text-sm text-muted-foreground">
                  سجل اشتراكك في جمعية موجودة من الزر أعلاه
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ direction: 'rtl' }}>
              {memberCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle as any} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCircles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">لا توجد جمعيات مكتملة</p>
                <p className="text-sm text-muted-foreground">
                  الجمعيات المكتملة ستظهر هنا
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" style={{ direction: 'rtl' }}>
              {completedCircles.map(circle => (
                <CircleCard key={circle.id} circle={circle as any} />
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>

        {/* نافذة إضافة جمعية */}
        <AddCircleDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        {/* نافذة السداد/السحب */}
        {transactionDialog.circle && (
          <CircleTransactionDialog
            open={transactionDialog.open}
            onOpenChange={(open) => setTransactionDialog(prev => ({ ...prev, open }))}
            type={transactionDialog.type}
            circleName={transactionDialog.circle.name || transactionDialog.circle.circle_name || 'الجمعية'}
            amount={
              transactionDialog.type === 'payment'
                ? (transactionDialog.circle.monthly_payment || transactionDialog.circle.monthlyAmount || 0)
                : (transactionDialog.circle.total_amount ||
                    ((transactionDialog.circle.monthly_payment || transactionDialog.circle.monthlyAmount || 0) *
                     (transactionDialog.circle.totalMembers || transactionDialog.circle.duration || 1)))
            }
            onConfirm={transactionDialog.type === 'payment' ? handlePayment : handleWithdrawal}
          />
        )}
      </div>
      )
}

