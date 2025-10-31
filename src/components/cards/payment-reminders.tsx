'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useCards } from '@/contexts/cards-context'
import { Bell, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'

interface PaymentReminder {
  cardId: string
  cardName: string
  dueDate: Date
  daysUntilDue: number
  minimumPayment: number
  currentBalance: number
  urgency: 'critical' | 'warning' | 'info'
}

interface PaymentRemindersProps {
  onPayNow?: (cardId: string) => void
}

export function PaymentReminders({ onPayNow }: PaymentRemindersProps) {
  const { cards } = useCards()
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set())

  const reminders = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const activeReminders: PaymentReminder[] = []

    cards.forEach(card => {
      if (!card.isActive || card.currentBalance === 0 || dismissedReminders.has(card.id)) return

      // Calculate due date for current month
      let dueDate = new Date(currentYear, currentMonth, card.dueDate)

      // If due date has passed this month, use next month
      if (dueDate < today) {
        dueDate = new Date(currentYear, currentMonth + 1, card.dueDate)
      }

      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Only show reminders for upcoming payments (within 14 days)
      if (daysUntilDue >= 0 && daysUntilDue <= 14) {
        const minimumPayment = (card.currentBalance ?? 0) * 0.05 // 5% minimum payment

        let urgency: 'critical' | 'warning' | 'info' = 'info'
        if (daysUntilDue <= 3) urgency = 'critical'
        else if (daysUntilDue <= 7) urgency = 'warning'

        activeReminders.push({
          cardId: card.id,
          cardName: card.name ?? card.card_name ?? '',
          dueDate,
          daysUntilDue,
          minimumPayment,
          currentBalance: card.currentBalance ?? 0,
          urgency,
        })
      }
    })

    // Sort by urgency and days until due
    activeReminders.sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, info: 2 }
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }
      return a.daysUntilDue - b.daysUntilDue
    })

    return activeReminders
  }, [cards, dismissedReminders])

  const handlePayNow = (cardId: string) => {
    if (onPayNow) {
      onPayNow(cardId)
    }
  }

  const handleDismiss = (cardId: string) => {
    setDismissedReminders(prev => new Set(prev).add(cardId))
  }

  if (reminders.length === 0) {
    return null
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getUrgencyBadge = (urgency: string, days: number) => {
    switch (urgency) {
      case 'critical':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            عاجل - {days} {days === 1 ? 'يوم' : 'أيام'}
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700 gap-1">
            <Bell className="h-3 w-3" />
            قريب - {days} {days === 1 ? 'يوم' : 'أيام'}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {days} {days === 1 ? 'يوم' : 'أيام'}
          </Badge>
        )
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          تذكيرات السداد
          <Badge variant="secondary">{reminders.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <Card
              key={reminder.cardId}
              className={`${getUrgencyColor(reminder.urgency)} transition-all hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{reminder.cardName}</h4>
                      {getUrgencyBadge(reminder.urgency, reminder.daysUntilDue)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                        <div className="font-medium">
                          {formatDate(reminder.dueDate.toISOString())}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الرصيد الحالي:</span>
                        <div className="font-medium">
                          {formatCurrency(reminder.currentBalance)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الحد الأدنى للسداد:</span>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(reminder.minimumPayment)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">السداد الكامل:</span>
                        <div className="font-medium">
                          {formatCurrency(reminder.currentBalance)}
                        </div>
                      </div>
                    </div>

                    {reminder.urgency === 'critical' && (
                      <div className="flex items-start gap-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-sm text-red-800 dark:text-red-200">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          تحذير: موعد السداد قريب جداً! تأكد من توفر الرصيد لتجنب الرسوم المتأخرة.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handlePayNow(reminder.cardId)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      سداد الآن
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(reminder.cardId)}
                    >
                      تأجيل التذكير
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              إجمالي المدفوعات المطلوبة:
            </span>
            <span className="font-semibold">
              {formatCurrency(reminders.reduce((sum, r) => sum + r.currentBalance, 0))}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">
              الحد الأدنى المطلوب:
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(reminders.reduce((sum, r) => sum + r.minimumPayment, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

