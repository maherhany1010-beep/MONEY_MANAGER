/**
 * Hook لتوليد الإشعارات التلقائية بناءً على البيانات
 * يتم استدعاؤه في المكونات الرئيسية لمراقبة التغييرات وإنشاء الإشعارات
 */

import { useEffect } from 'react'
import { useNotifications } from '@/contexts/notifications-context'
import { useBankAccounts } from '@/contexts/bank-accounts-context'
import { useCashVaults } from '@/contexts/cash-vaults-context'
import { useEWallets } from '@/contexts/e-wallets-context'
import { usePrepaidCards } from '@/contexts/prepaid-cards-context'

export function useAutoNotifications() {
  const { addNotification, settings } = useNotifications()
  const { accounts } = useBankAccounts()
  const { vaults } = useCashVaults()
  const { wallets } = useEWallets()
  const { cards } = usePrepaidCards()

  // مراقبة الأرصدة المنخفضة
  useEffect(() => {
    if (!settings.lowBalance.enabled) return

    const threshold = settings.lowBalance.threshold

    // فحص الحسابات البنكية
    accounts.forEach(account => {
      if (account.balance < threshold) {
        const key = `low-balance-bank-${account.id}`
        const lastNotified = localStorage.getItem(key)
        const now = Date.now()
        
        // إرسال إشعار مرة واحدة كل 24 ساعة
        if (!lastNotified || now - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
          addNotification(
            'low_balance',
            'تنبيه: رصيد منخفض',
            `رصيد الحساب "${account.accountName}" منخفض (${account.balance.toFixed(2)} جنيه)`,
            'high',
            '/bank-accounts',
            'عرض الحساب'
          )
          localStorage.setItem(key, now.toString())
        }
      }
    })

    // فحص الخزائن النقدية
    vaults.forEach(vault => {
      if (vault.balance < threshold) {
        const key = `low-balance-vault-${vault.id}`
        const lastNotified = localStorage.getItem(key)
        const now = Date.now()
        
        if (!lastNotified || now - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
          addNotification(
            'low_balance',
            'تنبيه: رصيد خزينة منخفض',
            `رصيد الخزينة "${vault.vaultName}" منخفض (${vault.balance.toFixed(2)} جنيه)`,
            'high',
            '/cash-vaults',
            'عرض الخزينة'
          )
          localStorage.setItem(key, now.toString())
        }
      }
    })

    // فحص المحافظ الإلكترونية
    wallets.forEach(wallet => {
      if (wallet.balance < threshold) {
        const key = `low-balance-wallet-${wallet.id}`
        const lastNotified = localStorage.getItem(key)
        const now = Date.now()
        
        if (!lastNotified || now - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
          addNotification(
            'low_balance',
            'تنبيه: رصيد محفظة منخفض',
            `رصيد المحفظة "${wallet.walletName}" منخفض (${wallet.balance.toFixed(2)} جنيه)`,
            'high',
            '/e-wallets',
            'عرض المحفظة'
          )
          localStorage.setItem(key, now.toString())
        }
      }
    })

    // فحص البطاقات المسبقة الدفع
    cards.forEach(card => {
      if (card.balance < threshold) {
        const key = `low-balance-card-${card.id}`
        const lastNotified = localStorage.getItem(key)
        const now = Date.now()
        
        if (!lastNotified || now - parseInt(lastNotified) > 24 * 60 * 60 * 1000) {
          addNotification(
            'low_balance',
            'تنبيه: رصيد بطاقة منخفض',
            `رصيد البطاقة "${card.cardName}" منخفض (${card.balance.toFixed(2)} جنيه)`,
            'high',
            '/prepaid-cards',
            'عرض البطاقة'
          )
          localStorage.setItem(key, now.toString())
        }
      }
    })
  }, [accounts, vaults, wallets, cards, settings.lowBalance, addNotification])

  // يمكن إضافة المزيد من المراقبات هنا
  // مثل: مراقبة الأقساط المستحقة، الاستثمارات، المخزون، إلخ
}

