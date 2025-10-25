'use client'

import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { CashVaultSettings } from '@/components/cash-vaults/cash-vault-settings'
import { CashVaultTransactions } from '@/components/cash-vaults/cash-vault-transactions'
import { CashVaultStats } from '@/components/cash-vaults/cash-vault-stats'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Vault, MapPin, TrendingUp, TrendingDown, DollarSign, Lock, Users } from 'lucide-react'

export default function CashVaultDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { vaults, updateVaults } = useCashVaults()
  
  const vault = vaults.find(v => v.id === params.id)

  if (!vault) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Vault className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">الخزينة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على الخزينة المطلوبة</p>
          <Button onClick={() => router.push('/cash-vaults')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للخزائن
          </Button>
        </div>
      </AppLayout>
    )
  }

  const handleUpdateVault = (updatedVault: any) => {
    const updatedVaults = vaults.map(v => 
      v.id === vault.id ? { ...v, ...updatedVault } : v
    )
    updateVaults(updatedVaults)
  }

  const getVaultTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'رئيسية'
      case 'branch': return 'فرع'
      case 'personal': return 'شخصية'
      case 'emergency': return 'طوارئ'
      default: return type
    }
  }

  const getVaultTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'from-blue-500 to-blue-700'
      case 'branch': return 'from-green-500 to-green-700'
      case 'personal': return 'from-purple-500 to-purple-700'
      case 'emergency': return 'from-red-500 to-red-700'
      default: return 'from-gray-500 to-gray-700'
    }
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'public': return <Users className="h-4 w-4" />
      case 'restricted': return <Lock className="h-4 w-4" />
      case 'private': return <Lock className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'public': return 'عام'
      case 'restricted': return 'محدود'
      case 'private': return 'خاص'
      default: return level
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/cash-vaults')}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للخزائن
          </Button>
        </div>

        {/* معلومات الخزينة */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-br ${getVaultTypeColor(vault.vaultType)} p-8 text-white`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Vault className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold mb-2">{vault.vaultName}</h1>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <MapPin className="h-4 w-4" />
                    <p>{vault.location}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {vault.isDefault && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    افتراضية
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {getVaultTypeLabel(vault.vaultType)}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 flex items-center gap-1">
                  {getAccessLevelIcon(vault.accessLevel)}
                  <span>{getAccessLevelLabel(vault.accessLevel)}</span>
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm opacity-75 mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-bold">{formatCurrency(vault.balance)}</p>
              </div>
              {vault.maxCapacity && (
                <div>
                  <p className="text-sm opacity-75 mb-1">السعة القصوى</p>
                  <p className="text-2xl font-bold">{formatCurrency(vault.maxCapacity)}</p>
                </div>
              )}
              {vault.minBalance !== undefined && (
                <div>
                  <p className="text-sm opacity-75 mb-1">الحد الأدنى</p>
                  <p className="text-2xl font-bold">{formatCurrency(vault.minBalance)}</p>
                </div>
              )}
              {vault.dailyWithdrawalLimit && (
                <div>
                  <p className="text-sm opacity-75 mb-1">حد السحب اليومي</p>
                  <p className="text-2xl font-bold">{formatCurrency(vault.dailyWithdrawalLimit)}</p>
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
                {formatCurrency(vault.totalDeposits || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                منذ إنشاء الخزينة
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
                {formatCurrency(vault.totalWithdrawals || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                منذ إنشاء الخزينة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                عدد المعاملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {vault.transactionCount || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                معاملة مسجلة
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
            <CashVaultTransactions vault={vault} />
          </TabsContent>

          <TabsContent value="stats">
            <CashVaultStats vault={vault} />
          </TabsContent>

          <TabsContent value="settings">
            <CashVaultSettings vault={vault} onUpdate={handleUpdateVault} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

