'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { TransactionsTab } from '@/components/prepaid-cards/transactions-tab'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Wallet, BarChart3, Settings, Receipt, User, Phone, IdCard } from 'lucide-react'

export default function PrepaidCardDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { getCardById, updateCards, cards, getCardTransactions } = usePrepaidCards()
  const [card, setCard] = useState<any>(null)

  useEffect(() => {
    const foundCard = getCardById(params.id as string)
    if (foundCard) {
      setCard(foundCard)
    }
  }, [params.id, getCardById, cards])

  const handleBack = () => {
    router.push('/prepaid-cards')
  }

  if (!card) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </AppLayout>
    )
  }

  const getProviderColor = (provider: string) => {
    const p = provider.toLowerCase()
    if (p.includes('فوري')) return 'from-blue-500 to-blue-700'
    if (p.includes('أمان')) return 'from-green-500 to-green-700'
    if (p.includes('ممكن')) return 'from-purple-500 to-purple-700'
    if (p.includes('مصاري')) return 'from-orange-500 to-orange-700'
    return 'from-gray-500 to-gray-700'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">نشطة</Badge>
      case 'suspended':
        return <Badge variant="secondary">معلقة</Badge>
      case 'blocked':
        return <Badge variant="destructive">محظورة</Badge>
      case 'expired':
        return <Badge variant="outline">منتهية</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* زر العودة */}
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة إلى البطاقات
        </Button>

        {/* معلومات البطاقة */}
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-br ${getProviderColor(card.provider)} p-6 text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{card.cardName}</h1>
                  <p className="text-sm opacity-90">{card.provider}</p>
                </div>
              </div>
              {getStatusBadge(card.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm opacity-75 mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-bold">{formatCurrency(card.balance)}</p>
              </div>
              <div>
                <p className="text-sm opacity-75 mb-1">رقم البطاقة</p>
                <p className="text-lg font-mono">{card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-75 mb-1">صاحب البطاقة</p>
                <p className="text-sm font-medium">{card.holderName}</p>
              </div>
              <div>
                <p className="text-xs opacity-75 mb-1">رقم الهاتف</p>
                <p className="text-sm font-mono">{card.holderPhone}</p>
              </div>
              <div>
                <p className="text-xs opacity-75 mb-1">الرقم القومي</p>
                <p className="text-sm font-mono">{card.holderNationalId}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">الحد اليومي</p>
                <p className="text-lg font-bold">{formatCurrency(card.dailyLimit)}</p>
                <p className="text-xs text-muted-foreground">مستخدم: {formatCurrency(card.dailyUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">الحد الشهري</p>
                <p className="text-lg font-bold">{formatCurrency(card.monthlyLimit)}</p>
                <p className="text-xs text-muted-foreground">مستخدم: {formatCurrency(card.monthlyUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">حد المعاملة</p>
                <p className="text-lg font-bold">{formatCurrency(card.transactionLimit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">عدد المعاملات</p>
                <p className="text-lg font-bold">{card.transactionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التبويبات */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 ml-2" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Receipt className="h-4 w-4 ml-2" />
              المعاملات
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الإيداعات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">إجمالي الإيداعات</span>
                    <span className="font-semibold text-green-600">{formatCurrency(card.totalDeposits)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">رسوم الإيداع</span>
                    <span className="font-semibold">{card.depositFee}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات السحوبات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">إجمالي السحوبات</span>
                    <span className="font-semibold text-red-600">{formatCurrency(card.totalWithdrawals)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">رسوم السحب</span>
                    <span className="font-semibold">{card.withdrawalFee}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات المشتريات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">إجمالي المشتريات</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(card.totalPurchases)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">رسوم المشتريات</span>
                    <span className="font-semibold">{card.purchaseFee}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معلومات عامة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ الإصدار</span>
                    <span className="font-semibold">{card.issueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ الانتهاء</span>
                    <span className="font-semibold">{card.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">نوع البطاقة</span>
                    <Badge variant="outline">{card.cardType === 'physical' ? 'فعلية' : 'افتراضية'}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab
              transactions={getCardTransactions(card.id)}
              cardName={card.cardName}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-12 text-center">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">الإعدادات</h3>
                <p className="text-muted-foreground">سيتم إضافة إعدادات البطاقة قريباً</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
