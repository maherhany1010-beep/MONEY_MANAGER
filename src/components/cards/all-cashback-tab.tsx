'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Gift, 
  TrendingUp, 
  Wallet, 
  ShoppingBag,
  Calendar,
  Award,
  Sparkles,
  CreditCard
} from 'lucide-react'

interface AllCashbackTabProps {
  cards: any[]
}

// بيانات وهمية للكاش باك
const mockCashbackData = [
  {
    id: '1',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    cashbackRate: 2.5,
    totalEarned: 1250.50,
    availableBalance: 850.30,
    redeemedAmount: 400.20,
    pendingAmount: 125.00,
    thisMonthEarned: 85.50,
    lastRedemption: '2024-01-15',
  },
  {
    id: '2',
    cardId: '2',
    cardName: 'بطاقة بنك مصر البلاتينية',
    cashbackRate: 3.0,
    totalEarned: 2150.75,
    availableBalance: 1200.50,
    redeemedAmount: 950.25,
    pendingAmount: 82.50,
    thisMonthEarned: 82.50,
    lastRedemption: '2024-01-20',
  },
  {
    id: '3',
    cardId: '3',
    cardName: 'بطاقة البنك التجاري الدولي الكلاسيكية',
    cashbackRate: 1.8,
    totalEarned: 680.25,
    availableBalance: 450.00,
    redeemedAmount: 230.25,
    pendingAmount: 45.00,
    thisMonthEarned: 45.00,
    lastRedemption: '2024-01-10',
  },
]

// بيانات وهمية لسجل الكاش باك
const mockCashbackHistory = [
  {
    id: 'h1',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    amount: 85.50,
    type: 'earned' as const,
    source: 'مشتريات شهر يناير',
    date: '2024-01-31',
    status: 'available' as const,
  },
  {
    id: 'h2',
    cardId: '1',
    cardName: 'بطاقة البنك الأهلي المصري الذهبية',
    amount: 400.20,
    type: 'redeemed' as const,
    source: 'استرداد إلى رصيد البطاقة',
    date: '2024-01-15',
    status: 'completed' as const,
  },
  {
    id: 'h3',
    cardId: '2',
    cardName: 'بطاقة بنك مصر البلاتينية',
    amount: 82.50,
    type: 'earned' as const,
    source: 'مشتريات شهر يناير',
    date: '2024-01-25',
    status: 'available' as const,
  },
  {
    id: 'h4',
    cardId: '2',
    cardName: 'بطاقة بنك مصر البلاتينية',
    amount: 500.00,
    type: 'redeemed' as const,
    source: 'قسيمة مشتريات - كارفور',
    date: '2024-01-20',
    status: 'completed' as const,
  },
  {
    id: 'h5',
    cardId: '3',
    cardName: 'بطاقة البنك التجاري الدولي الكلاسيكية',
    amount: 45.00,
    type: 'earned' as const,
    source: 'مشتريات شهر يناير',
    date: '2024-01-10',
    status: 'pending' as const,
  },
]

export function AllCashbackTab({ cards }: AllCashbackTabProps) {
  const [cashbackData] = useState(mockCashbackData)
  const [cashbackHistory] = useState(mockCashbackHistory)
  const [selectedCard, setSelectedCard] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredHistory = cashbackHistory.filter(item => {
    const cardMatch = selectedCard === 'all' || item.cardId === selectedCard
    const typeMatch = selectedType === 'all' || item.type === selectedType
    return cardMatch && typeMatch
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'bg-purple-100 dark:bg-purple-950/30 border-purple-200 dark:border-purple-700'
      case 'redeemed':
        return 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earned':
        return 'مكتسب'
      case 'redeemed':
        return 'مسترد'
      default:
        return 'غير محدد'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-700'
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-700'
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'متاح'
      case 'pending':
        return 'قيد الانتظار'
      case 'completed':
        return 'مكتمل'
      default:
        return 'غير محدد'
    }
  }

  // إحصائيات إجمالية
  const totalEarned = cashbackData.reduce((sum, item) => sum + item.totalEarned, 0)
  const totalAvailable = cashbackData.reduce((sum, item) => sum + item.availableBalance, 0)
  const totalRedeemed = cashbackData.reduce((sum, item) => sum + item.redeemedAmount, 0)
  const totalPending = cashbackData.reduce((sum, item) => sum + item.pendingAmount, 0)
  const thisMonthTotal = cashbackData.reduce((sum, item) => sum + item.thisMonthEarned, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                نظام الكاش باك الشامل
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                متابعة وإدارة نقاط الكاش باك من جميع البطاقات
              </CardDescription>
            </div>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Sparkles className="h-4 w-4" />
              استرداد الكاش باك
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">إجمالي المكتسب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(totalEarned)}
            </div>
            <p className="text-xs text-muted-foreground">منذ البداية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">الرصيد المتاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalAvailable)}
            </div>
            <p className="text-xs text-muted-foreground">جاهز للاسترداد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">المسترد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalRedeemed)}
            </div>
            <p className="text-xs text-muted-foreground">تم استرداده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">قيد الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">سيضاف قريباً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">هذا الشهر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(thisMonthTotal)}
            </div>
            <p className="text-xs text-muted-foreground">يناير 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards Cashback Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">ملخص الكاش باك لكل بطاقة</CardTitle>
          <CardDescription className="text-muted-foreground">
            نظرة عامة على الكاش باك من جميع البطاقات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cashbackData.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                      <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.cardName}</h4>
                      <p className="text-sm text-muted-foreground">
                        معدل الكاش باك: {item.cashbackRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(item.availableBalance)}
                    </p>
                    <p className="text-sm text-muted-foreground">متاح للاسترداد</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">إجمالي المكتسب</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.totalEarned)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">المسترد</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.redeemedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.pendingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">هذا الشهر</p>
                    <p className="font-medium text-foreground">{formatCurrency(item.thisMonthEarned)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">نسبة الاسترداد</span>
                    <span className="font-medium text-foreground">
                      {((item.redeemedAmount / item.totalEarned) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(item.redeemedAmount / item.totalEarned) * 100}
                    className="h-2"
                    indicatorClassName="bg-purple-600"
                  />
                </div>

                {item.lastRedemption && (
                  <p className="text-xs text-muted-foreground mt-3">
                    آخر استرداد: {formatDate(item.lastRedemption)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">سجل الكاش باك</CardTitle>
          <CardDescription className="text-muted-foreground">
            جميع عمليات الكاش باك المكتسبة والمستردة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">البطاقة</label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر البطاقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البطاقات</SelectItem>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">النوع</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="earned">مكتسب</SelectItem>
                  <SelectItem value="redeemed">مسترد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center">
                <Gift className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">لا توجد سجلات</h3>
                <p className="text-muted-foreground">لم يتم العثور على سجلات كاش باك بالمعايير المحددة</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'earned' ? (
                          <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                        <span className="font-medium text-foreground">{item.cardName}</span>
                        <Badge className={getTypeColor(item.type)}>
                          {getTypeLabel(item.type)}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{item.source}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        item.type === 'earned'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {item.type === 'earned' ? '+' : '-'}
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

