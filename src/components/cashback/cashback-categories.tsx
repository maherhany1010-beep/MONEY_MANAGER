'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Award,
  ShoppingCart,
  Car,
  Coffee,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  Receipt
} from 'lucide-react'

interface CashbackHistory {
  id: string
  cardId: string
  cardName: string
  amount: number
  category: string
  earnedDate: string
  status: string
}

interface Card {
  id: string
  name: string
  cashbackRate: number
}

interface CashbackCategoriesProps {
  history: CashbackHistory[]
  cards: Card[]
}

const categoryIcons: Record<string, any> = {
  'طعام ومشروبات': Coffee,
  'وقود': Car,
  'تسوق': ShoppingCart,
  'ترفيه': Gamepad2,
  'صحة': Heart,
  'تعليم': GraduationCap,
  'مواصلات': Plane,
  'فواتير': Receipt,
  'أخرى': BarChart3,
}

export function CashbackCategories({ history, cards }: CashbackCategoriesProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedCard, setSelectedCard] = useState('all')

  // Filter history based on selected period and card
  const filteredHistory = history.filter(h => {
    if (h.status !== 'earned') return false
    
    if (selectedCard !== 'all' && h.cardId !== selectedCard) return false
    
    if (selectedPeriod !== 'all') {
      const transactionDate = new Date(h.earnedDate)
      const now = new Date()
      
      switch (selectedPeriod) {
        case 'thisMonth':
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear()
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
          return transactionDate.getMonth() === lastMonth.getMonth() && 
                 transactionDate.getFullYear() === lastMonth.getFullYear()
        case 'thisYear':
          return transactionDate.getFullYear() === now.getFullYear()
        default:
          return true
      }
    }
    
    return true
  })

  // Calculate category breakdown
  const categoryBreakdown = filteredHistory.reduce((acc, transaction) => {
    const category = transaction.category
    if (!acc[category]) {
      acc[category] = {
        amount: 0,
        count: 0,
        transactions: []
      }
    }
    acc[category].amount += transaction.amount
    acc[category].count += 1
    acc[category].transactions.push(transaction)
    return acc
  }, {} as Record<string, { amount: number; count: number; transactions: any[] }>)

  // Sort categories by amount
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.amount - a.amount)

  const totalAmount = filteredHistory.reduce((sum, h) => sum + h.amount, 0)

  // Calculate card performance by category
  const cardCategoryBreakdown = cards.map(card => {
    const cardTransactions = filteredHistory.filter(h => h.cardId === card.id)
    const cardCategories = cardTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)
    
    const totalCardAmount = cardTransactions.reduce((sum, h) => sum + h.amount, 0)
    
    return {
      card,
      categories: cardCategories,
      total: totalCardAmount
    }
  }).filter(item => item.total > 0)

  // Find best category
  const bestCategory = sortedCategories[0]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">فلترة البيانات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  <SelectItem value="thisMonth">هذا الشهر</SelectItem>
                  <SelectItem value="lastMonth">الشهر الماضي</SelectItem>
                  <SelectItem value="thisYear">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">البطاقة</label>
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكاش باك</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              من {sortedCategories.length} فئة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أفضل فئة</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bestCategory ? formatCurrency(bestCategory[1].amount) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bestCategory ? bestCategory[0] : 'لا توجد بيانات'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الفئة</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(sortedCategories.length > 0 ? totalAmount / sortedCategories.length : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              لكل فئة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              توزيع الفئات
            </CardTitle>
            <CardDescription>
              الكاش باك حسب فئة الإنفاق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedCategories.map(([category, data], index) => {
                const percentage = totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
                const IconComponent = categoryIcons[category] || BarChart3
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{category}</span>
                        <Badge variant="outline" className="text-xs">
                          {data.count} معاملة
                        </Badge>
                      </div>
                      <span className="font-bold text-green-600">
                        {formatCurrency(data.amount)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% من إجمالي الكاش باك
                      </p>
                    </div>
                  </div>
                )
              })}

              {sortedCategories.length === 0 && (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد بيانات للفترة المحددة
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card Performance by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              أداء البطاقات حسب الفئة
            </CardTitle>
            <CardDescription>
              مقارنة أداء البطاقات في الفئات المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cardCategoryBreakdown.map(({ card, categories, total }) => (
                <div key={card.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{card.name}</h4>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(categories)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3) // Show top 3 categories
                      .map(([category, amount]) => {
                        const percentage = total > 0 ? (amount / total) * 100 : 0
                        const IconComponent = categoryIcons[category] || BarChart3
                        
                        return (
                          <div key={category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-3 w-3 text-muted-foreground" />
                              <span>{category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(amount)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}

              {cardCategoryBreakdown.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد بيانات للفترة المحددة
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Insights */}
      {bestCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">رؤى الفئات</CardTitle>
            <CardDescription>
              تحليل أداء الفئات وتوصيات للتحسين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">أفضل فئة</h4>
                </div>
                <p className="text-sm text-green-700">
                  فئة &quot;{bestCategory[0]}&quot; هي الأكثر إنتاجاً بمبلغ {formatCurrency(bestCategory[1].amount)}
                  من {bestCategory[1].count} معاملة
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">توصية</h4>
                </div>
                <p className="text-sm text-blue-700">
                  ركز على استخدام البطاقات ذات معدل الكاش باك الأعلى في فئة &quot;{bestCategory[0]}&quot;
                  لزيادة المكافآت
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
