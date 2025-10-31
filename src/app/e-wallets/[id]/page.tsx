'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useEWallets } from '@/contexts/e-wallets-context'
import { EWalletSettings } from '@/components/e-wallets/e-wallet-settings'
import { EWalletTransactions } from '@/components/e-wallets/e-wallet-transactions'
import { EWalletStats } from '@/components/e-wallets/e-wallet-stats'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Wallet, Smartphone, TrendingUp, TrendingDown, ArrowLeftRight, CheckCircle, XCircle } from 'lucide-react'

export default function EWalletDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { wallets, updateWallets } = useEWallets()
  
  const wallet = wallets.find(w => w.id === params.id)

  if (!wallet) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">المحفظة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على المحفظة المطلوبة</p>
          <Button onClick={() => router.push('/e-wallets')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للمحافظ
          </Button>
        </div>
      </AppLayout>
    )
  }

  const handleUpdateWallet = (updatedWallet: any) => {
    const updatedWallets = wallets.map(w => 
      w.id === wallet.id ? { ...w, ...updatedWallet } : w
    )
    updateWallets(updatedWallets)
  }

  const getProviderColor = (provider: string) => {
    if (provider.toLowerCase().includes('vodafone')) return 'from-red-500 to-red-700'
    if (provider.toLowerCase().includes('etisalat')) return 'from-green-500 to-green-700'
    if (provider.toLowerCase().includes('orange')) return 'from-orange-500 to-orange-700'
    if (provider.toLowerCase().includes('we')) return 'from-purple-500 to-purple-700'
    return 'from-blue-500 to-blue-700'
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة'
      case 'suspended': return 'معلقة'
      case 'blocked': return 'محظورة'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'suspended': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/e-wallets')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للمحافظ
          </Button>
        </div>

        {/* معلومات المحفظة */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-br ${getProviderColor(wallet.provider ?? 'other')} p-8 text-white`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold mb-2">{wallet.walletName}</h1>
                  <p className="text-lg opacity-90">{wallet.provider}</p>
                  <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                    <Smartphone className="h-4 w-4" />
                    <p className="font-mono">{wallet.phoneNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {wallet.isDefault && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    افتراضية
                  </Badge>
                )}
                <Badge className={getStatusColor(wallet.status)}>
                  {getStatusLabel(wallet.status)}
                </Badge>
                {wallet.isVerified ? (
                  <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>موثقة</span>
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    <span>غير موثقة</span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm opacity-75 mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-bold">{formatCurrency(wallet.balance)}</p>
              </div>
              {wallet.dailyLimit && (
                <div>
                  <p className="text-sm opacity-75 mb-1">الحد اليومي</p>
                  <p className="text-2xl font-bold">{formatCurrency(wallet.dailyLimit)}</p>
                  <p className="text-xs opacity-75">مستخدم: {formatCurrency(wallet.dailyUsed || 0)}</p>
                </div>
              )}
              {wallet.monthlyLimit && (
                <div>
                  <p className="text-sm opacity-75 mb-1">الحد الشهري</p>
                  <p className="text-2xl font-bold">{formatCurrency(wallet.monthlyLimit)}</p>
                  <p className="text-xs opacity-75">مستخدم: {formatCurrency(wallet.monthlyUsed || 0)}</p>
                </div>
              )}
              {wallet.transactionLimit && (
                <div>
                  <p className="text-sm opacity-75 mb-1">حد المعاملة</p>
                  <p className="text-2xl font-bold">{formatCurrency(wallet.transactionLimit)}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* الإحصائيات السريعة */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                إجمالي الإيداعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(wallet.totalDeposits || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                منذ إنشاء المحفظة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                إجمالي السحوبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(wallet.totalWithdrawals || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                منذ إنشاء المحفظة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-blue-600" />
                إجمالي التحويلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(wallet.totalTransfers || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                منذ إنشاء المحفظة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <EWalletTransactions wallet={wallet} />
          </TabsContent>

          <TabsContent value="stats">
            <EWalletStats wallet={wallet} />
          </TabsContent>

          <TabsContent value="settings">
            <EWalletSettings wallet={wallet} onUpdate={handleUpdateWallet} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

