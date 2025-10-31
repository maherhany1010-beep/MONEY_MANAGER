'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CashbackOverview } from '@/components/cashback/cashback-overview'
import { CashbackHistory } from '@/components/cashback/cashback-history'
import { CashbackCategories } from '@/components/cashback/cashback-categories'
import { CashbackRedemption } from '@/components/cashback/cashback-redemption'
import { 
  formatCurrency, 
  formatDate,
} from '@/lib/utils'
import { Gift, TrendingUp, Calendar, Download, Star } from 'lucide-react'

// Mock data - will be replaced with real data from Supabase
const mockCashbackData = {
  totalEarned: 2450.75,
  currentBalance: 1850.25,
  totalRedeemed: 600.50,
  thisMonth: 185.30,
  lastMonth: 220.45,
  yearToDate: 1950.75,
  projectedAnnual: 2800.00,
}

const mockCashbackHistory = [
  {
    id: '1',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    amount: 25.30,
    category: 'طعام ومشروبات',
    transactionAmount: 1265.00,
    cashbackRate: 2.0,
    earnedDate: '2024-01-15T10:30:00Z',
    status: 'earned',
  },
  {
    id: '2',
    cardId: '2',
    cardName: 'بطاقة الأهلي البلاتينية',
    amount: 45.00,
    category: 'وقود',
    transactionAmount: 900.00,
    cashbackRate: 5.0,
    earnedDate: '2024-01-14T15:45:00Z',
    status: 'earned',
  },
  {
    id: '3',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    amount: 15.75,
    category: 'تسوق',
    transactionAmount: 1575.00,
    cashbackRate: 1.0,
    earnedDate: '2024-01-12T20:15:00Z',
    status: 'earned',
  },
  {
    id: '4',
    cardId: '3',
    cardName: 'بطاقة سامبا الكلاسيكية',
    amount: 8.50,
    category: 'ترفيه',
    transactionAmount: 425.00,
    cashbackRate: 2.0,
    earnedDate: '2024-01-10T18:30:00Z',
    status: 'earned',
  },
  {
    id: '5',
    cardId: '1',
    cardName: 'بطاقة الراجحي الذهبية',
    amount: 100.00,
    category: 'استرداد',
    transactionAmount: 0,
    cashbackRate: 0,
    earnedDate: '2024-01-05T12:00:00Z',
    status: 'redeemed',
  },
]

const mockCards = [
  { 
    id: '1', 
    name: 'بطاقة الراجحي الذهبية',
    cashbackRate: 2.0,
    totalEarned: 850.25,
    thisMonth: 95.30
  },
  { 
    id: '2', 
    name: 'بطاقة الأهلي البلاتينية',
    cashbackRate: 3.0,
    totalEarned: 1200.50,
    thisMonth: 65.00
  },
  { 
    id: '3', 
    name: 'بطاقة سامبا الكلاسيكية',
    cashbackRate: 1.5,
    totalEarned: 400.00,
    thisMonth: 25.00
  },
]

export default function CashbackPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')

  const handleRedeemCashback = (amount: number) => {
    // Implement cashback redemption logic
  }

  const handleExportHistory = () => {
    // Implement export functionality
  }

  return (
    <AppLayout>
      <PageHeader
        title="الكاش باك"
        description="تتبع وإدارة مكافآت الكاش باك من البطاقات الائتمانية"
        action={{
          label: 'تصدير التقرير',
          onClick: handleExportHistory,
          icon: Download,
        }}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(mockCashbackData.currentBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              متاح للاسترداد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockCashbackData.thisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockCashbackData.thisMonth > mockCashbackData.lastMonth ? '+' : ''}
              {((mockCashbackData.thisMonth - mockCashbackData.lastMonth) / mockCashbackData.lastMonth * 100).toFixed(1)}% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المكتسب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(mockCashbackData.totalEarned)}
            </div>
            <p className="text-xs text-muted-foreground">
              منذ بداية الاستخدام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التوقع السنوي</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(mockCashbackData.projectedAnnual)}
            </div>
            <p className="text-xs text-muted-foreground">
              بناءً على الاستخدام الحالي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleRedeemCashback(mockCashbackData.currentBalance)}
              disabled={mockCashbackData.currentBalance < 100}
            >
              <Gift className="h-4 w-4 ml-2" />
              استرداد الكاش باك
            </Button>
            <Button variant="outline" onClick={handleExportHistory}>
              <Download className="h-4 w-4 ml-2" />
              تصدير السجل
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 ml-2" />
              عرض الإحصائيات
            </Button>
          </div>
          {mockCashbackData.currentBalance < 100 && (
            <p className="text-sm text-muted-foreground mt-2">
              الحد الأدنى للاسترداد هو {formatCurrency(100)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="history">سجل الكاش باك</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="redemption">الاسترداد</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CashbackOverview 
            data={mockCashbackData}
            cards={mockCards}
            history={mockCashbackHistory}
          />
        </TabsContent>

        <TabsContent value="history">
          <CashbackHistory
            history={mockCashbackHistory as any}
            onExport={handleExportHistory}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CashbackCategories 
            history={mockCashbackHistory}
            cards={mockCards}
          />
        </TabsContent>

        <TabsContent value="redemption">
          <CashbackRedemption 
            currentBalance={mockCashbackData.currentBalance}
            onRedeem={handleRedeemCashback}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
