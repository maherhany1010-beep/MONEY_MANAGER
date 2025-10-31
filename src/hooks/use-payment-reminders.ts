'use client'

import { useEffect, useMemo } from 'react'
import { useCards } from '@/contexts/cards-context'
import { useNotifications } from '@/contexts/notifications-context'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentReminder {
  cardId: string
  cardName: string
  dueDate: Date
  daysUntilDue: number
  minimumPayment: number
  currentBalance: number
  urgency: 'critical' | 'warning' | 'info'
}

/**
 * Hook لمراقبة تذكيرات الدفع وإضافتها تلقائياً للإشعارات
 * يتم التحقق مرة واحدة يومياً فقط
 */
export function usePaymentReminders() {
  const { cards } = useCards()
  const { addNotification } = useNotifications()

  // حساب التذكيرات
  const reminders = useMemo(() => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const activeReminders: PaymentReminder[] = []

    cards.forEach(card => {
      if (!card.isActive || card.currentBalance === 0) return

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
  }, [cards])

  // إضافة الإشعارات تلقائياً
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (reminders.length === 0) return

    // التحقق مرة واحدة يومياً فقط
    const today = new Date().toDateString()
    const lastCheck = localStorage.getItem('lastPaymentReminderCheck')
    
    if (lastCheck === today) return

    // إضافة إشعار لكل تذكير
    reminders.forEach(reminder => {
      // التحقق من عدم وجود إشعار مماثل بالفعل
      const notificationKey = `payment-reminder-${reminder.cardId}-${reminder.dueDate.toDateString()}`
      const alreadyNotified = localStorage.getItem(notificationKey)
      
      if (alreadyNotified) return

      // تحديد الأولوية والرسالة حسب الاستعجال
      let priority: 'low' | 'medium' | 'high' = 'medium'
      let title = ''
      let message = ''

      if (reminder.urgency === 'critical') {
        priority = 'high'
        title = `⚠️ تذكير عاجل: موعد سداد ${reminder.cardName}`
        message = `موعد السداد بعد ${reminder.daysUntilDue} ${reminder.daysUntilDue === 1 ? 'يوم' : 'أيام'} فقط! الرصيد المستحق: ${formatCurrency(reminder.currentBalance)}`
      } else if (reminder.urgency === 'warning') {
        priority = 'medium'
        title = `🔔 تذكير: موعد سداد ${reminder.cardName} قريب`
        message = `موعد السداد بعد ${reminder.daysUntilDue} أيام (${formatDate(reminder.dueDate.toISOString())}). الحد الأدنى: ${formatCurrency(reminder.minimumPayment)}`
      } else {
        priority = 'low'
        title = `📅 تذكير: موعد سداد ${reminder.cardName}`
        message = `موعد السداد في ${formatDate(reminder.dueDate.toISOString())}. الرصيد: ${formatCurrency(reminder.currentBalance)}`
      }

      // إضافة الإشعار
      addNotification(
        'payment_due',
        title,
        message,
        priority,
        '/cards', // رابط لصفحة البطاقات
        'سداد الآن',
        {
          cardId: reminder.cardId,
          cardName: reminder.cardName,
          dueDate: reminder.dueDate.toISOString(),
          amount: reminder.currentBalance,
          minimumPayment: reminder.minimumPayment,
        }
      )

      // حفظ أنه تم إرسال الإشعار
      localStorage.setItem(notificationKey, 'true')
    })

    // حفظ تاريخ آخر فحص
    localStorage.setItem('lastPaymentReminderCheck', today)
  }, [reminders, addNotification])

  return {
    reminders,
    hasReminders: reminders.length > 0,
    criticalCount: reminders.filter(r => r.urgency === 'critical').length,
    warningCount: reminders.filter(r => r.urgency === 'warning').length,
  }
}

