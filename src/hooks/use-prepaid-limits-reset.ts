import { useEffect } from 'react'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useNotifications } from '@/contexts/notifications-context'

const STORAGE_KEY_DAILY = 'prepaid-last-daily-reset'
const STORAGE_KEY_MONTHLY = 'prepaid-last-monthly-reset'

export function usePrepaidLimitsReset() {
  const { cards, updateCards } = usePrepaidCards()
  const { addNotification } = useNotifications()

  useEffect(() => {
    const checkAndResetLimits = () => {
      const now = new Date()
      const today = now.toISOString().split('T')[0] // YYYY-MM-DD
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` // YYYY-MM

      // Get last reset dates from localStorage
      const lastDailyReset = localStorage.getItem(STORAGE_KEY_DAILY)
      const lastMonthlyReset = localStorage.getItem(STORAGE_KEY_MONTHLY)

      let needsDailyReset = false
      let needsMonthlyReset = false

      // Check if daily reset is needed
      if (!lastDailyReset || lastDailyReset !== today) {
        needsDailyReset = true
      }

      // Check if monthly reset is needed
      if (!lastMonthlyReset || lastMonthlyReset !== currentMonth) {
        needsMonthlyReset = true
      }

      // Perform resets if needed
      if (needsDailyReset || needsMonthlyReset) {
        const updatedCards = cards.map(card => {
          const updates: any = {}

          if (needsDailyReset && (card.dailyUsed ?? 0) > 0) {
            updates.dailyUsed = 0
          }

          if (needsMonthlyReset && (card.monthlyUsed ?? 0) > 0) {
            updates.monthlyUsed = 0
          }

          return Object.keys(updates).length > 0 ? { ...card, ...updates } : card
        })

        // Update cards if any changes were made
        const hasChanges = updatedCards.some((card, index) => 
          card.dailyUsed !== cards[index].dailyUsed || 
          card.monthlyUsed !== cards[index].monthlyUsed
        )

        if (hasChanges) {
          updateCards(updatedCards)

          // Send notifications
          if (needsDailyReset) {
            const activeCards = cards.filter(c => c.status === 'active' && (c.dailyUsed ?? 0) > 0)
            if (activeCards.length > 0) {
              addNotification(
                'general',
                'إعادة تعيين الحدود اليومية',
                `تم إعادة تعيين الحدود اليومية لـ ${activeCards.length} بطاقة مسبقة الدفع`,
                'low'
              )
            }
            localStorage.setItem(STORAGE_KEY_DAILY, today)
          }

          if (needsMonthlyReset) {
            const activeCards = cards.filter(c => c.status === 'active' && (c.monthlyUsed ?? 0) > 0)
            if (activeCards.length > 0) {
              addNotification(
                'general',
                'إعادة تعيين الحدود الشهرية',
                `تم إعادة تعيين الحدود الشهرية لـ ${activeCards.length} بطاقة مسبقة الدفع. شهر جديد سعيد! 🎉`,
                'medium'
              )
            }
            localStorage.setItem(STORAGE_KEY_MONTHLY, currentMonth)
          }
        }
      }
    }

    // Check immediately on mount
    checkAndResetLimits()

    // Check every hour
    const interval = setInterval(checkAndResetLimits, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [cards, updateCards, addNotification])
}

