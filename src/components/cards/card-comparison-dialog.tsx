'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency, formatPercentage, calculateCreditUtilization, getCardTypeIcon } from '@/lib/utils'
import { CreditCard as CreditCardType } from '@/contexts/cards-context'
import { GitCompare, Check, X, TrendingUp, Gift, DollarSign, CreditCard } from 'lucide-react'

interface CardComparisonDialogProps {
  cards: CreditCardType[]
}

export function CardComparisonDialog({ cards }: CardComparisonDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  const toggleCard = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, cardId]
    })
  }

  const compareCards = cards.filter(c => selectedCards.includes(c.id))

  const getBestCard = () => {
    if (compareCards.length === 0) return null

    // Calculate scores
    const scores = compareCards.map(card => {
      const utilization = calculateCreditUtilization(card.currentBalance ?? 0, card.creditLimit ?? 0)
      const availableCredit = (card.creditLimit ?? 0) - (card.currentBalance ?? 0)

      // Score calculation (higher is better)
      let score = 0
      score += (card.cashbackRate ?? 0) * 10 // Cashback weight
      score += (availableCredit / 10000) * 5 // Available credit weight
      score += (100 - utilization) * 2 // Low utilization is better
      score += card.isActive ? 10 : 0 // Active card bonus

      return { card, score }
    })

    scores.sort((a, b) => b.score - a.score)
    return scores[0].card
  }

  const bestCard = getBestCard()

  const ComparisonRow = ({ label, getValue, icon: Icon }: { 
    label: string
    getValue: (card: CreditCardType) => string | number
    icon?: any
  }) => (
    <div className="border-b last:border-b-0 py-3">
      <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {compareCards.map(card => (
          <div key={card.id} className="text-center">
            <span className={`font-semibold ${bestCard?.id === card.id ? 'text-green-600 dark:text-green-400' : ''}`}>
              {getValue(card)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <GitCompare className="h-4 w-4" />
          مقارنة البطاقات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            مقارنة البطاقات الائتمانية
          </DialogTitle>
          <DialogDescription>
            اختر حتى 3 بطاقات للمقارنة بينها
          </DialogDescription>
        </DialogHeader>

        {/* Card Selection */}
        <div className="space-y-4">
          <div className="text-sm font-medium">
            اختر البطاقات ({selectedCards.length}/3)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {cards.map(card => (
              <div
                key={card.id}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCards.includes(card.id)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                } ${selectedCards.length >= 3 && !selectedCards.includes(card.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => toggleCard(card.id)}
              >
                <Checkbox
                  checked={selectedCards.includes(card.id)}
                  disabled={selectedCards.length >= 3 && !selectedCards.includes(card.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{card.name}</div>
                  <div className="text-xs text-muted-foreground">{card.bankName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {compareCards.length > 0 && (
          <div className="space-y-4">
            {/* Card Headers */}
            <div className="grid grid-cols-3 gap-4">
              {compareCards.map(card => (
                <Card key={card.id} className={bestCard?.id === card.id ? 'border-green-500 dark:border-green-400' : ''}>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl">{getCardTypeIcon(card.cardType ?? '')}</div>
                      <div className="font-semibold text-sm">{card.name}</div>
                      <div className="text-xs text-muted-foreground">{card.bankName}</div>
                      {bestCard?.id === card.id && (
                        <Badge variant="default" className="bg-green-600">
                          <Check className="h-3 w-3 ml-1" />
                          الأفضل
                        </Badge>
                      )}
                      {!card.isActive && (
                        <Badge variant="destructive">معطلة</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Rows */}
            <Card>
              <CardContent className="p-4">
                <ComparisonRow
                  label="الحد الائتماني"
                  icon={CreditCard}
                  getValue={(card) => formatCurrency(card.creditLimit ?? 0)}
                />
                <ComparisonRow
                  label="الرصيد المستخدم"
                  icon={DollarSign}
                  getValue={(card) => formatCurrency(card.currentBalance ?? 0)}
                />
                <ComparisonRow
                  label="الرصيد المتاح"
                  getValue={(card) => formatCurrency((card.creditLimit ?? 0) - (card.currentBalance ?? 0))}
                />
                <ComparisonRow
                  label="نسبة الاستخدام"
                  icon={TrendingUp}
                  getValue={(card) => formatPercentage(calculateCreditUtilization(card.currentBalance ?? 0, card.creditLimit ?? 0))}
                />
                <ComparisonRow
                  label="نسبة الكاش باك"
                  icon={Gift}
                  getValue={(card) => `${card.cashbackRate}%`}
                />
                <ComparisonRow
                  label="تاريخ السداد"
                  getValue={(card) => `${card.dueDate} من كل شهر`}
                />
                <ComparisonRow
                  label="الحالة"
                  getValue={(card) => card.isActive ? 'نشطة' : 'معطلة'}
                />
              </CardContent>
            </Card>

            {/* Recommendation */}
            {bestCard && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        التوصية
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        بناءً على المقارنة، <strong>{bestCard.name}</strong> هي الأفضل للاستخدام حالياً بسبب:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 mt-2 space-y-1 mr-4">
                        <li>• نسبة كاش باك عالية ({bestCard.cashbackRate}%)</li>
                        <li>• رصيد متاح جيد ({formatCurrency((bestCard.creditLimit ?? 0) - (bestCard.currentBalance ?? 0))})</li>
                        <li>• نسبة استخدام منخفضة ({formatPercentage(calculateCreditUtilization(bestCard.currentBalance ?? 0, bestCard.creditLimit ?? 0))})</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {compareCards.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            اختر بطاقتين على الأقل للمقارنة
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

