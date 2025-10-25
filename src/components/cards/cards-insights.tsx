'use client'

import { useMemo, useState } from 'react'
import { useCards } from '@/contexts/cards-context'
import { InsightsPanel } from '@/components/insights-panel'
import { Insight } from '@/lib/analytics'
import { calculateCreditUtilization } from '@/lib/utils'

export function CardsInsights() {
  const { cards, getTotalBalance, getTotalCreditLimit } = useCards()
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())

  const insights = useMemo(() => {
    const generatedInsights: Insight[] = []
    const totalBalance = getTotalBalance()
    const totalLimit = getTotalCreditLimit()
    const utilizationRate = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

    // رؤية: استخدام مرتفع للحد الائتماني
    if (utilizationRate >= 80) {
      generatedInsights.push({
        id: 'high-utilization',
        type: 'warning',
        title: 'استخدام مرتفع للحد الائتماني',
        description: `نسبة استخدامك للحد الائتماني ${utilizationRate.toFixed(1)}% وهي مرتفعة جداً. يُنصح بتقليلها إلى أقل من 30% لتحسين تقييمك الائتماني.`,
        trend: 'up',
        percentage: utilizationRate,
      })
    } else if (utilizationRate >= 50) {
      generatedInsights.push({
        id: 'medium-utilization',
        type: 'info',
        title: 'استخدام متوسط للحد الائتماني',
        description: `نسبة استخدامك للحد الائتماني ${utilizationRate.toFixed(1)}%. حاول الحفاظ عليها أقل من 30% للحصول على أفضل تقييم ائتماني.`,
        trend: 'stable',
        percentage: utilizationRate,
      })
    } else if (utilizationRate < 30 && totalBalance > 0) {
      generatedInsights.push({
        id: 'good-utilization',
        type: 'success',
        title: 'استخدام ممتاز للحد الائتماني',
        description: `نسبة استخدامك ${utilizationRate.toFixed(1)}% وهي ممتازة! استمر في الحفاظ على هذا المستوى.`,
        trend: 'down',
        percentage: utilizationRate,
      })
    }

    // رؤية: بطاقات معطلة
    const inactiveCards = cards.filter(c => !c.isActive)
    if (inactiveCards.length > 0) {
      generatedInsights.push({
        id: 'inactive-cards',
        type: 'info',
        title: 'بطاقات معطلة',
        description: `لديك ${inactiveCards.length} بطاقة معطلة. قد ترغب في تفعيلها أو حذفها لتنظيم حساباتك.`,
      })
    }

    // رؤية: مواعيد السداد القريبة
    const today = new Date()
    const currentDay = today.getDate()
    const upcomingPayments = cards.filter(card => {
      const daysUntilDue = card.dueDate - currentDay
      return card.isActive && card.currentBalance > 0 && daysUntilDue >= 0 && daysUntilDue <= 7
    })

    if (upcomingPayments.length > 0) {
      generatedInsights.push({
        id: 'upcoming-payments',
        type: 'warning',
        title: 'مواعيد سداد قريبة',
        description: `لديك ${upcomingPayments.length} بطاقة تستحق السداد خلال الأسبوع القادم. تأكد من توفر الرصيد لتجنب الرسوم المتأخرة.`,
      })
    }

    // رؤية: تحسين الكاش باك
    const lowCashbackCards = cards.filter(c => c.isActive && c.cashbackRate < 2.0)
    const highCashbackCards = cards.filter(c => c.isActive && c.cashbackRate >= 3.0)
    
    if (lowCashbackCards.length > 0 && highCashbackCards.length > 0) {
      generatedInsights.push({
        id: 'optimize-cashback',
        type: 'info',
        title: 'حسّن الكاش باك',
        description: `لديك ${highCashbackCards.length} بطاقة بكاش باك عالي (${highCashbackCards[0].cashbackRate}%). استخدمها للمشتريات الكبيرة لزيادة عوائدك.`,
      })
    }

    // رؤية: بطاقات بدون استخدام
    const unusedCards = cards.filter(c => c.isActive && c.currentBalance === 0)
    if (unusedCards.length >= 2) {
      generatedInsights.push({
        id: 'unused-cards',
        type: 'info',
        title: 'بطاقات غير مستخدمة',
        description: `لديك ${unusedCards.length} بطاقة نشطة بدون رصيد. استخدمها بشكل دوري للحفاظ على نشاطها الائتماني.`,
      })
    }

    // رؤية: توزيع الرصيد
    const cardsWithHighBalance = cards.filter(c => {
      const utilization = calculateCreditUtilization(c.currentBalance, c.creditLimit)
      return c.isActive && utilization >= 70
    })

    if (cardsWithHighBalance.length > 0) {
      generatedInsights.push({
        id: 'high-balance-cards',
        type: 'warning',
        title: 'بطاقات بأرصدة مرتفعة',
        description: `لديك ${cardsWithHighBalance.length} بطاقة باستخدام أكثر من 70%. حاول توزيع الرصيد على بطاقات أخرى لتحسين تقييمك.`,
      })
    }

    // رؤية: إضافة بطاقة جديدة
    if (cards.length === 0) {
      generatedInsights.push({
        id: 'add-first-card',
        type: 'info',
        title: 'ابدأ بإضافة بطاقتك الأولى',
        description: 'أضف بطاقتك الائتمانية الأولى لتبدأ في تتبع مصروفاتك وإدارة أموالك بفعالية.',
      })
    }

    return generatedInsights.filter(insight => !dismissedInsights.has(insight.id))
  }, [cards, getTotalBalance, getTotalCreditLimit, dismissedInsights])

  const handleDismiss = (id: string) => {
    setDismissedInsights(prev => new Set([...prev, id]))
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <InsightsPanel
      insights={insights}
      title="الرؤى الذكية للبطاقات"
      onDismiss={handleDismiss}
    />
  )
}

