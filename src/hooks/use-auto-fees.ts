'use client'

import { useEffect } from 'react'
import { useCards } from '@/contexts/cards-context'
import { useNotifications } from '@/contexts/notifications-context'

const STORAGE_KEY = 'auto-fees-last-check'
const ANNUAL_FEE_STORAGE_KEY = 'annual-fees-charged'

interface AnnualFeeRecord {
  cardId: string
  lastChargedYear: number
}

/**
 * Hook لإدارة خصم المصاريف والرسوم التلقائي من البطاقات الائتمانية
 * 
 * يقوم بالتحقق اليومي من:
 * 1. الرسوم السنوية - تُخصم مرة واحدة سنوياً في تاريخ إصدار البطاقة
 * 2. رسوم التأخير - تُخصم عند عدم السداد في موعد الاستحقاق
 * 3. رسوم تجاوز الحد - تُخصم عند تجاوز الرصيد للحد الائتماني
 */
export function useAutoFees() {
  const { cards, updateCard } = useCards()
  const { addNotification } = useNotifications()

  useEffect(() => {
    // التحقق من آخر مرة تم فيها التحقق من المصاريف
    const lastCheck = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toDateString()

    // إذا تم التحقق اليوم، لا نفعل شيء
    if (lastCheck === today) {
      return
    }

    // تحديث تاريخ آخر تحقق
    localStorage.setItem(STORAGE_KEY, today)

    // الحصول على سجل الرسوم السنوية المخصومة
    const annualFeesRecordStr = localStorage.getItem(ANNUAL_FEE_STORAGE_KEY)
    const annualFeesRecord: AnnualFeeRecord[] = annualFeesRecordStr 
      ? JSON.parse(annualFeesRecordStr) 
      : []

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // 1-12
    const currentDay = new Date().getDate()

    // معالجة كل بطاقة
    cards.forEach(card => {
      if (!card.isActive) return // تجاهل البطاقات المعطلة

      // 1. التحقق من الرسوم السنوية
      if (card.annualFee && card.annualFee > 0) {
        const cardCreatedDate = card.createdAt ? new Date(card.createdAt) : null
        
        if (cardCreatedDate) {
          const createdMonth = cardCreatedDate.getMonth() + 1
          const createdDay = cardCreatedDate.getDate()

          // التحقق من أن اليوم هو نفس يوم إصدار البطاقة
          if (currentMonth === createdMonth && currentDay === createdDay) {
            // التحقق من أن الرسوم لم تُخصم هذا العام
            const feeRecord = annualFeesRecord.find(r => r.cardId === card.id)
            
            if (!feeRecord || feeRecord.lastChargedYear < currentYear) {
              // خصم الرسوم السنوية
              const newBalance = (card.currentBalance ?? 0) + card.annualFee
              
              updateCard(card.id, {
                currentBalance: newBalance,
              })

              // تحديث سجل الرسوم السنوية
              const updatedRecord = annualFeesRecord.filter(r => r.cardId !== card.id)
              updatedRecord.push({
                cardId: card.id,
                lastChargedYear: currentYear,
              })
              localStorage.setItem(ANNUAL_FEE_STORAGE_KEY, JSON.stringify(updatedRecord))

              // إرسال إشعار
              addNotification(
                'payment_due',
                'تم خصم الرسوم السنوية',
                `تم خصم ${card.annualFee.toLocaleString('ar-EG')} ج.م كرسوم سنوية من بطاقة ${card.name}. الرصيد الجديد: ${newBalance.toLocaleString('ar-EG')} ج.م`,
                'high'
              )
            }
          }
        }
      }

      // 2. التحقق من رسوم التأخير
      if (card.latePaymentFee && card.latePaymentFee > 0 && (card.currentBalance ?? 0) > 0) {
        // التحقق من أن اليوم الحالي بعد موعد الاستحقاق
        if (currentDay > (card.dueDate ?? 0)) {
          // التحقق من أن الرسوم لم تُخصم هذا الشهر
          const lateFeesKey = `late-fees-${card.id}-${currentYear}-${currentMonth}`
          const alreadyCharged = localStorage.getItem(lateFeesKey)

          if (!alreadyCharged) {
            // خصم رسوم التأخير
            const newBalance = (card.currentBalance ?? 0) + card.latePaymentFee
            
            updateCard(card.id, {
              currentBalance: newBalance,
            })

            // تسجيل أن الرسوم تم خصمها هذا الشهر
            localStorage.setItem(lateFeesKey, 'true')

            // إرسال إشعار
            addNotification(
              'payment_due',
              'تم خصم رسوم التأخير',
              `تم خصم ${card.latePaymentFee.toLocaleString('ar-EG')} ج.م كرسوم تأخير من بطاقة ${card.name} لعدم السداد في الموعد المحدد. الرصيد الجديد: ${newBalance.toLocaleString('ar-EG')} ج.م`,
              'high'
            )
          }
        }
      }

      // 3. التحقق من رسوم تجاوز الحد
      if (card.overLimitFee && card.overLimitFee > 0) {
        // التحقق من أن الرصيد تجاوز الحد الائتماني
        if ((card.currentBalance ?? 0) > (card.creditLimit ?? 0)) {
          // التحقق من أن الرسوم لم تُخصم هذا الشهر
          const overLimitFeesKey = `over-limit-fees-${card.id}-${currentYear}-${currentMonth}`
          const alreadyCharged = localStorage.getItem(overLimitFeesKey)

          if (!alreadyCharged) {
            // خصم رسوم تجاوز الحد
            const newBalance = (card.currentBalance ?? 0) + card.overLimitFee
            
            updateCard(card.id, {
              currentBalance: newBalance,
            })

            // تسجيل أن الرسوم تم خصمها هذا الشهر
            localStorage.setItem(overLimitFeesKey, 'true')

            // إرسال إشعار
            addNotification(
              'payment_due',
              'تم خصم رسوم تجاوز الحد',
              `تم خصم ${card.overLimitFee.toLocaleString('ar-EG')} ج.م كرسوم تجاوز الحد الائتماني من بطاقة ${card.name}. الرصيد الجديد: ${newBalance.toLocaleString('ar-EG')} ج.م`,
              'high'
            )
          }
        }
      }
    })
  }, [cards, updateCard, addNotification])
}

