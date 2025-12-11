'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AddAccountDialog } from '@/components/pos-machines/add-account-dialog'
import { InternalTransferDialog } from '@/components/pos-machines/internal-transfer-dialog'
import { DepositDialog, DepositData } from '@/components/pos-machines/deposit-dialog'
import { WithdrawalDialog, WithdrawalData } from '@/components/pos-machines/withdrawal-dialog'
import { ReconciliationDialog } from '@/components/reconciliation/reconciliation-dialog'
import { usePOSMachines, POSMachine, POSAccount } from '@/contexts/pos-machines-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useCards } from '@/contexts/cards-context'
import { useNotifications } from '@/contexts/notifications-context'
import { formatCurrency } from '@/lib/design-system'
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Plus,
  Star,
  ArrowRightLeft,
  RefreshCw,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react'

export default function POSMachineDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const {
    getMachineById,
    machines,
    setPrimaryAccount,
    addAccountToMachine,
    updateAccountBalance,
    addInternalTransfer,
    getTransfersByMachine
  } = usePOSMachines()
  const { wallets, updateWalletBalance } = useEWallets()
  const { bankAccounts, updateBankAccountBalance } = useBankAccounts() as any
  const { cashVaults, updateCashVaultBalance } = useCashVaults() as any
  const { cards, updateCardBalance } = useCards() as any
  const { addNotification } = useNotifications()

  const [machine, setMachine] = useState<POSMachine | null>(null)
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false)
  const [isReconciliationDialogOpen, setIsReconciliationDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<POSAccount | null>(null)

  useEffect(() => {
    const foundMachine = getMachineById(params.id as string)
    if (foundMachine) {
      setMachine(foundMachine)
    }
  }, [params.id, getMachineById, machines])

  const handleBack = () => {
    router.push('/pos-machines')
  }

  const handleSetPrimary = (accountId: string) => {
    if (machine) {
      setPrimaryAccount(machine.id, accountId)
    }
  }

  const handleReconcile = (account: POSAccount) => {
    setSelectedAccount(account)
    setIsReconciliationDialogOpen(true)
  }

  const handleReconcileConfirm = (actualBalance: number, difference: number, notes?: string) => {
    if (machine && selectedAccount) {
      updateAccountBalance(machine.id, selectedAccount.id, actualBalance)
    }
  }

  const handleDeposit = (data: DepositData) => {
    if (!machine) return

    try {
      // حساب الرسوم
      const fee = data.feeType === 'percentage'
        ? (data.amount * data.feeValue) / 100
        : data.feeValue
      const totalDeduction = data.amount + fee

      // التحقق من المصدر وخصم المبلغ
      let sourceBalance = 0
      switch (data.sourceType) {
        case 'ewallet':
          const ewallet = wallets.find(w => w.id === data.sourceId)
          if (!ewallet || ewallet.balance < totalDeduction) {
            addNotification('general', 'خطأ', 'الرصيد غير كافٍ في المحفظة المصدر')
            return
          }
          sourceBalance = ewallet.balance
          updateWalletBalance(data.sourceId, ewallet.balance - totalDeduction)
          break
        case 'bank-account':
          const bankAccount = bankAccounts.find((acc: any) => acc.id === data.sourceId)
          if (!bankAccount || bankAccount.balance < totalDeduction) {
            addNotification('general', 'خطأ', 'الرصيد غير كافٍ في الحساب البنكي المصدر')
            return
          }
          sourceBalance = bankAccount.balance
          updateBankAccountBalance(data.sourceId, bankAccount.balance - totalDeduction)
          break
        case 'cash-vault':
          const vault = cashVaults.find((v: any) => v.id === data.sourceId)
          if (!vault || vault.balance < totalDeduction) {
            addNotification('general', 'خطأ', 'الرصيد غير كافٍ في الخزنة المصدر')
            return
          }
          sourceBalance = vault.balance
          updateCashVaultBalance(data.sourceId, vault.balance - totalDeduction)
          break
        case 'credit-card':
          const card = cards.find((c: any) => c.id === data.sourceId)
          if (!card || card.availableBalance < totalDeduction) {
            addNotification('general', 'خطأ', 'الرصيد المتاح غير كافٍ في البطاقة المصدر')
            return
          }
          sourceBalance = card.availableBalance
          updateCardBalance(data.sourceId, card.availableBalance - totalDeduction)
          break
      }

      // إضافة المبلغ للحساب المستهدف
      const targetAccount = (machine.accounts ?? []).find(acc => acc.id === data.targetAccountId)
      if (targetAccount) {
        updateAccountBalance(machine.id, data.targetAccountId, targetAccount.balance + data.amount)
      }

      addNotification('general', 'نجاح', `تم شحن ${formatCurrency(data.amount)} بنجاح`)
    } catch (error) {
      addNotification('general', 'خطأ', 'حدث خطأ أثناء عملية الشحن')
    }
  }

  const handleWithdrawal = (data: WithdrawalData) => {
    if (!machine) return

    try {
      // حساب الرسوم
      const fee = data.feeType === 'percentage'
        ? (data.amount * data.feeValue) / 100
        : data.feeValue
      const amountToDestination = data.amount - fee

      // خصم المبلغ من الحساب المصدر
      const sourceAccount = (machine.accounts ?? []).find((acc: any) => acc.id === data.sourceAccountId)
      if (!sourceAccount || sourceAccount.balance < data.amount) {
        addNotification('general', 'خطأ', 'الرصيد غير كافٍ في الحساب المصدر')
        return
      }

      updateAccountBalance(machine.id, data.sourceAccountId, sourceAccount.balance - data.amount)

      // إضافة المبلغ للوجهة
      switch (data.destinationType) {
        case 'ewallet':
          const ewallet = wallets.find(w => w.id === data.destinationId)
          if (ewallet) {
            updateWalletBalance(data.destinationId, ewallet.balance + amountToDestination)
          }
          break
        case 'bank-account':
          const bankAccount = bankAccounts.find((acc: any) => acc.id === data.destinationId)
          if (bankAccount) {
            updateBankAccountBalance(data.destinationId, bankAccount.balance + amountToDestination)
          }
          break
        case 'cash-vault':
          const vault = cashVaults.find((v: any) => v.id === data.destinationId)
          if (vault) {
            updateCashVaultBalance(data.destinationId, vault.balance + amountToDestination)
          }
          break
        case 'credit-card':
          const card = cards.find((c: any) => c.id === data.destinationId)
          if (card) {
            updateCardBalance(data.destinationId, card.availableBalance + amountToDestination)
          }
          break
      }

      addNotification('general', 'نجاح', `تم سحب ${formatCurrency(data.amount)} بنجاح`)
    } catch (error) {
      addNotification('general', 'خطأ', 'حدث خطأ أثناء عملية السحب')
    }
  }

  if (!machine) {
    return (
      <div className="flex items-center justify-center min-h-[400px] container mx-auto p-6">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  const getStatusBadge = () => {
    switch (machine.status) {
      case 'active':
        return <Badge className="bg-green-500">نشط</Badge>
      case 'inactive':
        return <Badge variant="secondary">معطل</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-500">صيانة</Badge>
      default:
        return null
    }
  }

  const totalBalance = (machine.accounts ?? []).reduce((sum, acc) => sum + acc.balance, 0)
  const primaryAccount = (machine.accounts ?? []).find(acc => acc.isPrimary)
  const transfers = getTransfersByMachine(machine.id)

  const handleAddAccount = (account: POSAccount) => {
    addAccountToMachine(machine.id, account)
  }

  const handleInternalTransfer = (transfer: any) => {
    addInternalTransfer(transfer)
  }

  const handleUpdateBalance = (accountId: string, newBalance: number) => {
    updateAccountBalance(machine.id, accountId, newBalance)
  }

  return (
    <div className="space-y-6 container mx-auto p-6">
        {/* زر العودة */}
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة إلى الماكينات
        </Button>

        {/* معلومات الماكينة */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{machine.machineName}</h1>
                  <p className="text-sm opacity-90">{machine.machineId}</p>
                </div>
              </div>
              {getStatusBadge()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-sm opacity-75 mb-1">إجمالي الرصيد</p>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
                <p className="text-xs opacity-75 mt-1">{(machine.accounts ?? []).length} حساب</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">المزود</p>
                <p className="text-lg font-semibold">{machine.provider}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">الموقع</p>
                <p className="text-lg font-semibold">{machine.location}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* التبويبات */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">
              <Wallet className="h-4 w-4 ml-2" />
              الحسابات
            </TabsTrigger>
            <TabsTrigger value="transfers">
              <ArrowRightLeft className="h-4 w-4 ml-2" />
              التحويلات الداخلية
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="h-4 w-4 ml-2" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* تبويب الحسابات */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold">حسابات الماكينة</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDepositDialogOpen(true)}
                  className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50"
                >
                  <ArrowDownToLine className="h-4 w-4 ml-2" />
                  شحن
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsWithdrawalDialogOpen(true)}
                  className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50"
                >
                  <ArrowUpFromLine className="h-4 w-4 ml-2" />
                  سحب
                </Button>
                <Button onClick={() => setIsAddAccountDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة حساب
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(machine.accounts ?? []).map((account) => (
                <Card key={account.id} className={account.isPrimary ? 'border-indigo-500 border-2' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{account.accountName ?? account.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {account.accountNumber ?? ''}
                        </p>
                      </div>
                      {account.isPrimary && (
                        <Badge variant="default" className="bg-indigo-600">
                          <Star className="h-3 w-3 ml-1" />
                          رئيسي
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <p className="text-sm text-indigo-700 dark:text-indigo-200 mb-1">الرصيد المتاح</p>
                      <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        {formatCurrency(account.balance)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">إجمالي الإيداعات</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(account.totalDeposits || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">إجمالي السحوبات</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(account.totalWithdrawals || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleReconcile(account)}
                      >
                        <RefreshCw className="h-4 w-4 ml-2" />
                        تسوية
                      </Button>
                      {!account.isPrimary ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(account.id)}
                        >
                          <Star className="h-4 w-4 ml-2" />
                          تعيين كرئيسي
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 ml-2" />
                          إدارة
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب التحويلات الداخلية */}
          <TabsContent value="transfers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">التحويلات الداخلية</h2>
              <Button onClick={() => setIsTransferDialogOpen(true)}>
                <ArrowRightLeft className="h-4 w-4 ml-2" />
                تحويل جديد
              </Button>
            </div>

            {transfers.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد تحويلات داخلية بعد
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer) => {
                  const fromAcc = (machine.accounts ?? []).find(a => a.id === (transfer.fromAccountId ?? transfer.fromAccount))
                  const toAcc = (machine.accounts ?? []).find(a => a.id === (transfer.toAccountId ?? transfer.toAccount))

                  return (
                    <Card key={transfer.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                من: {fromAcc?.accountName} → إلى: {toAcc?.accountName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {transfer.date}
                              </p>
                              {transfer.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {transfer.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(transfer.amount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* تبويب الإحصائيات */}
          <TabsContent value="stats" className="space-y-6">
            <h2 className="text-xl font-semibold">الإحصائيات والتقارير</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    المعاملات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {machine.totalTransactions?.toLocaleString('en-EG') || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">معاملة</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    الإيرادات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(machine.monthlyRevenue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">إيرادات</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    الإيرادات اليومية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(machine.dailyRevenue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">متوسط يومي</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">معلومات الماكينة</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">المعلومات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الرقم التسلسلي</p>
                      <p className="font-medium">{machine.serialNumber || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الموديل</p>
                      <p className="font-medium">{machine.model || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ التركيب</p>
                      <p className="font-medium">{machine.installationDate || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الموقع</p>
                      <p className="font-medium">{machine.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات الاتصال</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">المسؤول</p>
                      <p className="font-medium">{machine.contactPerson || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                      <p className="font-medium">{machine.contactPhone || 'غير محدد'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium">{machine.contactEmail || 'غير محدد'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      {/* Dialogs */}
      <AddAccountDialog
        open={isAddAccountDialogOpen}
        onOpenChange={setIsAddAccountDialogOpen}
        onAdd={handleAddAccount}
        machineId={machine.machineId ?? machine.id}
        provider={machine.provider ?? ''}
      />

      <InternalTransferDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onTransfer={handleInternalTransfer}
        machineId={machine.id}
        accounts={machine.accounts ?? []}
        updateAccountBalance={handleUpdateBalance}
      />

      {selectedAccount && (
        <ReconciliationDialog
          open={isReconciliationDialogOpen}
          onOpenChange={setIsReconciliationDialogOpen}
          accountId={selectedAccount.id}
          accountName={`${machine.machineName} - ${selectedAccount.accountName}`}
          accountType="pos_machine"
          currentBalance={selectedAccount.balance}
          onReconcile={handleReconcileConfirm}
        />
      )}

      <DepositDialog
        open={isDepositDialogOpen}
        onOpenChange={setIsDepositDialogOpen}
        machine={machine}
        onDeposit={handleDeposit}
      />

      <WithdrawalDialog
        open={isWithdrawalDialogOpen}
        onOpenChange={setIsWithdrawalDialogOpen}
        machine={machine}
        onWithdrawal={handleWithdrawal}
      />
    </div>
  )
}
