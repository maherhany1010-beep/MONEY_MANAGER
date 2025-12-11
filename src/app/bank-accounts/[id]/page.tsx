'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { BankAccountSettings } from '@/components/bank-accounts/bank-account-settings'
import { BankAccountTransactions } from '@/components/bank-accounts/bank-account-transactions'
import { BankAccountStats } from '@/components/bank-accounts/bank-account-stats'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Landmark, TrendingUp, TrendingDown, Settings, Receipt, BarChart3 } from 'lucide-react'

export default function BankAccountDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { getAccountById, updateAccounts, accounts } = useBankAccounts()
  const [account, setAccount] = useState<any>(null)

  useEffect(() => {
    const foundAccount = getAccountById(params.id as string)
    if (foundAccount) {
      setAccount(foundAccount)
    }
  }, [params.id, getAccountById, accounts])

  const handleBack = () => {
    router.push('/bank-accounts')
  }

  const handleUpdateAccount = (updatedAccount: any) => {
    const updatedAccounts = accounts.map(acc => 
      acc.id === updatedAccount.id ? updatedAccount : acc
    )
    updateAccounts(updatedAccounts)
    setAccount(updatedAccount)
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'حساب جاري'
      case 'savings':
        return 'حساب توفير'
      case 'current':
        return 'حساب تجاري'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6 container mx-auto p-6">
        {/* زر العودة */}
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة إلى الحسابات
        </Button>

        {/* معلومات الحساب */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 p-6 text-blue-900 dark:text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Landmark className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{account.accountName}</h1>
                  <p className="text-sm opacity-90">{account.bankName}</p>
                </div>
              </div>
              {account.isDefault && (
                <Badge variant="secondary" className="bg-blue-200/50 dark:bg-white/20 text-blue-900 dark:text-white border-blue-300 dark:border-white/30">
                  افتراضي
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-sm opacity-75 mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-bold">{formatCurrency(account.balance)}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">نوع الحساب</p>
                <p className="text-lg font-semibold">{getAccountTypeLabel(account.accountType)}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">رقم الحساب</p>
                <p className="text-lg font-mono">{account.accountNumber}</p>
              </div>
            </div>

            {account.iban && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm opacity-75 mb-1">رقم IBAN</p>
                <p className="font-mono text-sm">{account.iban}</p>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">إجمالي الإيداعات</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(account.totalDeposits || 0)}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <TrendingDown className="h-5 w-5" />
                  <span className="text-sm font-medium">إجمالي السحوبات</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(account.totalWithdrawals || 0)}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm font-medium">الإنفاق الشهري</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(account.monthlySpending || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التبويبات */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              المعاملات
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <BankAccountTransactions account={account} />
          </TabsContent>

          <TabsContent value="stats">
            <BankAccountStats account={account} />
          </TabsContent>

          <TabsContent value="settings">
            <BankAccountSettings 
              account={account} 
              onUpdate={handleUpdateAccount}
            />
          </TabsContent>
        </Tabs>
    </div>
  )
}

