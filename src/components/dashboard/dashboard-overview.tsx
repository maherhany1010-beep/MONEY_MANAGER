'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Gift,
  Calendar,
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react'

interface Activity {
  id: string
  type: string
  description: string
  amount: number
  date: string
  card: string
  category: string
}

interface Card {
  id: string
  name: string
  balance: number
  limit: number
  utilization: number
  cashbackRate: number
  status: string
}

interface Stats {
  totalBalance: number
  totalLimit: number
  monthlySpending: number
  lastMonthSpending: number
  cashbackEarned: number
  cashbackThisYear: number
  pendingPayments: number
  overduePayments: number
  totalCards: number
  activeCards: number
  creditUtilization: number
  averageMonthlySpending: number
}

interface DashboardOverviewProps {
  recentActivity: Activity[]
  cards: Card[]
  stats: Stats
}

export function DashboardOverview({ recentActivity, cards, stats }: DashboardOverviewProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'payment':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'cashback':
        return <Gift className="h-4 w-4 text-purple-600" />
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'معاملة'
      case 'payment':
        return 'سداد'
      case 'cashback':
        return 'كاش باك'
      default:
        return 'نشاط'
    }
  }

  const topCard = cards.reduce((prev, current) => 
    (prev.cashbackRate > current.cashbackRate) ? prev : current
  )

  const highUtilizationCards = cards.filter(card => card.utilization > 70)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Recent Activity */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>آخر المعاملات والأنشطة على بطاقاتك</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 ml-2" />
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{activity.card}</span>
                        <span>•</span>
                        <span>{activity.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(activity.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>الإجراءات الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <Button className="h-auto p-4 justify-start" variant="outline">
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5" />
                  <div className="text-right">
                    <p className="font-medium">إضافة معاملة</p>
                    <p className="text-sm text-muted-foreground">تسجيل معاملة جديدة</p>
                  </div>
                </div>
              </Button>
              
              <Button className="h-auto p-4 justify-start" variant="outline">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <div className="text-right">
                    <p className="font-medium">سداد فاتورة</p>
                    <p className="text-sm text-muted-foreground">سداد مستحقات البطاقة</p>
                  </div>
                </div>
              </Button>
              
              <Button className="h-auto p-4 justify-start" variant="outline">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5" />
                  <div className="text-right">
                    <p className="font-medium">استرداد كاش باك</p>
                    <p className="text-sm text-muted-foreground">استرداد المكافآت المتاحة</p>
                  </div>
                </div>
              </Button>
              
              <Button className="h-auto p-4 justify-start" variant="outline">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div className="text-right">
                    <p className="font-medium">إضافة بطاقة</p>
                    <p className="text-sm text-muted-foreground">إضافة بطاقة ائتمانية جديدة</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Account Summary */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الحساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي البطاقات</span>
                <span className="font-medium">{stats.totalCards}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">البطاقات النشطة</span>
                <span className="font-medium">{stats.activeCards}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">نسبة الاستخدام الإجمالية</span>
                <Badge variant={stats.creditUtilization > 80 ? 'destructive' : stats.creditUtilization > 50 ? 'secondary' : 'default'}>
                  {formatPercentage(stats.creditUtilization)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">متوسط الإنفاق الشهري</span>
                <span className="font-medium">{formatCurrency(stats.averageMonthlySpending)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Performing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              أفضل بطاقة
            </CardTitle>
            <CardDescription>البطاقة ذات أعلى معدل كاش باك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{topCard.name}</p>
                <p className="text-sm text-muted-foreground">
                  معدل الكاش باك: {formatPercentage(topCard.cashbackRate)}
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الرصيد المستخدم</span>
                <span className="font-medium">{formatCurrency(topCard.balance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">نسبة الاستخدام</span>
                <Badge variant={topCard.utilization > 80 ? 'destructive' : topCard.utilization > 50 ? 'secondary' : 'default'}>
                  {formatPercentage(topCard.utilization)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {highUtilizationCards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-4 w-4" />
                تنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highUtilizationCards.map((card) => (
                  <div key={card.id} className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800">{card.name}</p>
                    <p className="text-sm text-orange-700">
                      نسبة استخدام عالية: {formatPercentage(card.utilization)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Payments */}
        {stats.pendingPayments > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                المدفوعات القادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">المدفوعات المعلقة</span>
                  <Badge variant="secondary">{stats.pendingPayments}</Badge>
                </div>
                {stats.overduePayments > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">المدفوعات المتأخرة</span>
                    <Badge variant="destructive">{stats.overduePayments}</Badge>
                  </div>
                )}
                <Button size="sm" className="w-full mt-3">
                  عرض المدفوعات
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
