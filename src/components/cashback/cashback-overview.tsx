'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  CreditCard,
  Calendar,
  Target,
  Award
} from 'lucide-react'

interface CashbackData {
  totalEarned: number
  currentBalance: number
  totalRedeemed: number
  thisMonth: number
  lastMonth: number
  yearToDate: number
  projectedAnnual: number
}

interface Card {
  id: string
  name: string
  cashbackRate: number
  totalEarned: number
  thisMonth: number
}

interface CashbackHistory {
  id: string
  cardId: string
  cardName: string
  amount: number
  category: string
  earnedDate: string
  status: string
}

interface CashbackOverviewProps {
  data: CashbackData
  cards: Card[]
  history: CashbackHistory[]
}

export function CashbackOverview({ data, cards, history }: CashbackOverviewProps) {
  const monthlyGrowth = ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100
  const isGrowthPositive = monthlyGrowth > 0
  
  // Calculate progress towards annual goal
  const annualGoal = 3000 // Example annual goal
  const annualProgress = (data.yearToDate / annualGoal) * 100

  // Get recent cashback transactions
  const recentTransactions = history
    .filter(h => h.status === 'earned')
    .sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
    .slice(0, 5)

  // Calculate category breakdown
  const categoryBreakdown = history
    .filter(h => h.status === 'earned')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  // Find best performing card
  const bestCard = cards.reduce((best, card) => 
    card.thisMonth > best.thisMonth ? card : best
  )

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النمو الشهري</CardTitle>
            {isGrowthPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              isGrowthPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isGrowthPositive ? '+' : ''}{formatPercentage(Math.abs(monthlyGrowth))}
            </div>
            <p className="text-xs text-muted-foreground">
              مقارنة بالشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الاسترداد</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPercentage((data.totalRedeemed / data.totalEarned) * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              من إجمالي المكتسب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط شهري</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.yearToDate / 12)}
            </div>
            <p className="text-xs text-muted-foreground">
              خلال العام الحالي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Annual Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            التقدم نحو الهدف السنوي
          </CardTitle>
          <CardDescription>
            هدفك السنوي: {formatCurrency(annualGoal)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>المحقق حتى الآن</span>
              <span>{formatPercentage(annualProgress)}</span>
            </div>
            <Progress value={annualProgress} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">المحقق</p>
              <p className="font-medium text-green-600">{formatCurrency(data.yearToDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">المتبقي</p>
              <p className="font-medium text-orange-600">
                {formatCurrency(annualGoal - data.yearToDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              أفضل بطاقة هذا الشهر
            </CardTitle>
            <CardDescription>
              البطاقة الأكثر إنتاجاً للكاش باك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  <div>
                    <h4 className="font-semibold">{bestCard.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      معدل الكاش باك: {formatPercentage(bestCard.cashbackRate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">
                    {formatCurrency(bestCard.thisMonth)}
                  </p>
                  <p className="text-xs text-muted-foreground">هذا الشهر</p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">جميع البطاقات:</h5>
                {cards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPercentage(card.cashbackRate)} كاش باك
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(card.thisMonth)}</p>
                      <p className="text-xs text-muted-foreground">
                        إجمالي: {formatCurrency(card.totalEarned)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أفضل الفئات</CardTitle>
            <CardDescription>
              الفئات الأكثر إنتاجاً للكاش باك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map(([category, amount], index) => {
                const percentage = (amount / data.totalEarned) * 100
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{category}</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={percentage} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        {formatPercentage(percentage)} من إجمالي الكاش باك
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">آخر المعاملات</CardTitle>
          <CardDescription>
            أحدث {recentTransactions.length} معاملات كاش باك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{transaction.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.cardName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.earnedDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    +{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
