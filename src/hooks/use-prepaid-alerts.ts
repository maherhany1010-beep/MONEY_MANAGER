import { useEffect } from 'react'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'
import { useNotifications } from '@/contexts/notifications-context'
import { formatCurrency } from '@/lib/utils'

const STORAGE_KEY = 'prepaid-alerts-sent'
const LOW_BALANCE_THRESHOLD = 500
const LIMIT_WARNING_PERCENTAGE = 80
const EXPIRY_WARNING_DAYS = 30
const LARGE_TRANSACTION_THRESHOLD = 1000

interface AlertsSent {
  lowBalance: string[] // card IDs
  dailyLimit: string[]
  monthlyLimit: string[]
  expiringSoon: string[]
  lastCheck: string
}

export function usePrepaidAlerts() {
  const { cards, transactions } = usePrepaidCards()
  const { addNotification } = useNotifications()

  useEffect(() => {
    const checkAlerts = () => {
      const today = new Date().toISOString().split('T')[0]

      // Get previously sent alerts
      const savedAlerts = localStorage.getItem(STORAGE_KEY)
      let alertsSent: AlertsSent = savedAlerts
        ? JSON.parse(savedAlerts)
        : { lowBalance: [], dailyLimit: [], monthlyLimit: [], expiringSoon: [], lastCheck: '' }

      // Reset alerts if it's a new day
      if (alertsSent.lastCheck !== today) {
        alertsSent = {
          lowBalance: [],
          dailyLimit: [],
          monthlyLimit: [],
          expiringSoon: [],
          lastCheck: today,
        }
      }

      const newAlertsSent = { ...alertsSent }

      cards.forEach(card => {
        if (card.status !== 'active') return

        // 1. Low Balance Alert
        if (card.balance < LOW_BALANCE_THRESHOLD && !alertsSent.lowBalance.includes(card.id)) {
          addNotification(
            'low_balance',
            'رصيد منخفض',
            `رصيد ${card.cardName} منخفض: ${formatCurrency(card.balance)}. يُنصح بالشحن قريباً.`,
            'high',
            '/prepaid-cards',
            'شحن الآن'
          )
          newAlertsSent.lowBalance.push(card.id)
        }

        // 2. Daily Limit Warning (80% or more)
        const dailyUsagePercentage = ((card.dailyUsed ?? 0) / (card.dailyLimit ?? 1)) * 100
        if (
          dailyUsagePercentage >= LIMIT_WARNING_PERCENTAGE &&
          !alertsSent.dailyLimit.includes(card.id)
        ) {
          const remaining = (card.dailyLimit ?? 0) - (card.dailyUsed ?? 0)
          addNotification(
            'credit_limit',
            'اقتراب من الحد اليومي',
            `${card.cardName}: استخدمت ${dailyUsagePercentage.toFixed(0)}% من الحد اليومي. المتبقي: ${formatCurrency(remaining)}`,
            'medium'
          )
          newAlertsSent.dailyLimit.push(card.id)
        }

        // 3. Monthly Limit Warning (80% or more)
        const monthlyUsagePercentage = ((card.monthlyUsed ?? 0) / (card.monthlyLimit ?? 1)) * 100
        if (
          monthlyUsagePercentage >= LIMIT_WARNING_PERCENTAGE &&
          !alertsSent.monthlyLimit.includes(card.id)
        ) {
          const remaining = (card.monthlyLimit ?? 0) - (card.monthlyUsed ?? 0)
          addNotification(
            'credit_limit',
            'اقتراب من الحد الشهري',
            `${card.cardName}: استخدمت ${monthlyUsagePercentage.toFixed(0)}% من الحد الشهري. المتبقي: ${formatCurrency(remaining)}`,
            'medium'
          )
          newAlertsSent.monthlyLimit.push(card.id)
        }

        // 4. Card Expiring Soon (30 days or less)
        const expiryDate = new Date(card.expiryDate ?? '')
        const now = new Date()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (
          daysUntilExpiry > 0 &&
          daysUntilExpiry <= EXPIRY_WARNING_DAYS &&
          !alertsSent.expiringSoon.includes(card.id)
        ) {
          addNotification(
            'payment_due',
            'بطاقة قريبة من الانتهاء',
            `${card.cardName} ستنتهي خلال ${daysUntilExpiry} يوم (${expiryDate.toLocaleDateString('ar-EG')}). يُرجى تجديدها.`,
            'high'
          )
          newAlertsSent.expiringSoon.push(card.id)
        }
      })

      // 5. Large Transaction Alert (check recent transactions)
      const recentTransactions = transactions
        .filter(t => {
          const transactionDate = new Date(t.date)
          const hoursSinceTransaction = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60)
          return hoursSinceTransaction < 1 // Last hour
        })
        .filter(t => 
          (t.type === 'withdrawal' || t.type === 'purchase' || t.type === 'transfer_out') &&
          t.amount >= LARGE_TRANSACTION_THRESHOLD
        )

      recentTransactions.forEach(transaction => {
        const card = cards.find(c => c.id === transaction.cardId)
        if (!card) return

        const transactionType =
          transaction.type === 'withdrawal'
            ? 'سحب'
            : transaction.type === 'purchase'
            ? 'شراء'
            : 'تحويل'

        addNotification(
          'large_transaction',
          'معاملة كبيرة',
          `تم ${transactionType} بمبلغ ${formatCurrency(transaction.amount)} من ${card.cardName}`,
          'low'
        )
      })

      // Save updated alerts
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAlertsSent))
    }

    // Check immediately on mount
    checkAlerts()

    // Check every 30 minutes
    const interval = setInterval(checkAlerts, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [cards, transactions, addNotification])
}

