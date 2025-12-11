'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useBankAccountsStore } from '@/stores/bank-accounts-store'
import { useSalesStore } from '@/stores/sales-store'
import { useCustomersStore } from '@/stores/customers-store'
import { useProductsStore } from '@/stores/products-store'
import { useEWalletsStore } from '@/stores/e-wallets-store'
import { useCashVaultsStore } from '@/stores/cash-vaults-store'
import { useCreditCardsStore } from '@/stores/cards-store'
import { usePrepaidCardsStore } from '@/stores/prepaid-cards-store'
import { usePOSMachinesStore } from '@/stores/pos-machines-store'
import { useSavingsCirclesStore } from '@/stores/savings-circles-store'
import { useInvestmentsStore } from '@/stores/investments-store'
import { useMerchantsStore } from '@/stores/merchants-store'
import { useCentralTransfersStore } from '@/stores/central-transfers-store'
import { useCashbacksStore } from '@/stores/cashback-store'
import { useReconciliationsStore } from '@/stores/reconciliation-store'

/**
 * StoreInitializer Component
 *
 * يقوم بتهيئة جميع الـ Zustand stores عند تسجيل الدخول وتنظيفها عند تسجيل الخروج.
 *
 * ⚠️ ملاحظة مهمة للمطورين:
 * ---------------------------
 * المشروع يستخدم نظامين للـ State Management:
 *
 * 1. **React Contexts** (src/contexts/) - الأساسي للـ UI components
 *    - يُستخدم في معظم الصفحات والمكونات
 *    - متكامل مع الـ Provider hierarchy
 *
 * 2. **Zustand Stores** (src/stores/) - للتخزين المركزي و real-time updates
 *    - يُستخدم في صفحة التحويلات (transfers) و StoreInitializer
 *    - يدعم real-time subscriptions مع Supabase
 *
 * 📋 خطة التوحيد المستقبلية:
 * - الاحتفاظ بـ Zustand للكيانات التي تحتاج real-time (central-transfers)
 * - استخدام Contexts للباقي (bank-accounts, cards, etc.)
 * - حذف الـ stores المكررة تدريجياً
 */
export function StoreInitializer() {
  const { user } = useAuth()

  // Financial Accounts
  const initializeBankAccounts = useBankAccountsStore((state) => state.initialize)
  const cleanupBankAccounts = useBankAccountsStore((state) => state.cleanup)
  const initializeEWallets = useEWalletsStore((state) => state.initialize)
  const cleanupEWallets = useEWalletsStore((state) => state.cleanup)
  const initializeCashVaults = useCashVaultsStore((state) => state.initialize)
  const cleanupCashVaults = useCashVaultsStore((state) => state.cleanup)
  const initializeCards = useCreditCardsStore((state) => state.initialize)
  const cleanupCards = useCreditCardsStore((state) => state.cleanup)
  const initializePrepaidCards = usePrepaidCardsStore((state) => state.initialize)
  const cleanupPrepaidCards = usePrepaidCardsStore((state) => state.cleanup)

  // Sales & Business
  const initializeSales = useSalesStore((state) => state.initialize)
  const cleanupSales = useSalesStore((state) => state.cleanup)
  const initializeCustomers = useCustomersStore((state) => state.initialize)
  const cleanupCustomers = useCustomersStore((state) => state.cleanup)
  const initializeProducts = useProductsStore((state) => state.initialize)
  const cleanupProducts = useProductsStore((state) => state.cleanup)
  const initializePOSMachines = usePOSMachinesStore((state) => state.initialize)
  const cleanupPOSMachines = usePOSMachinesStore((state) => state.cleanup)
  const initializeMerchants = useMerchantsStore((state) => state.initialize)
  const cleanupMerchants = useMerchantsStore((state) => state.cleanup)

  // Savings & Investments
  const initializeSavingsCircles = useSavingsCirclesStore((state) => state.initialize)
  const cleanupSavingsCircles = useSavingsCirclesStore((state) => state.cleanup)
  const initializeInvestments = useInvestmentsStore((state) => state.initialize)
  const cleanupInvestments = useInvestmentsStore((state) => state.cleanup)

  // Transfers & Cashback
  const initializeCentralTransfers = useCentralTransfersStore((state) => state.initialize)
  const cleanupCentralTransfers = useCentralTransfersStore((state) => state.cleanup)
  const initializeCashback = useCashbacksStore((state) => state.initialize)
  const cleanupCashback = useCashbacksStore((state) => state.cleanup)

  // Reconciliation
  const initializeReconciliation = useReconciliationsStore((state) => state.initialize)
  const cleanupReconciliation = useReconciliationsStore((state) => state.cleanup)

  useEffect(() => {
    if (user) {
      // Initialize all stores when user logs in
      initializeBankAccounts(user.id)
      initializeEWallets(user.id)
      initializeCashVaults(user.id)
      initializeCards(user.id)
      initializePrepaidCards(user.id)
      initializeSales(user.id)
      initializeCustomers(user.id)
      initializeProducts(user.id)
      initializePOSMachines(user.id)
      initializeMerchants(user.id)
      initializeSavingsCircles(user.id)
      initializeInvestments(user.id)
      initializeCentralTransfers(user.id)
      initializeCashback(user.id)
      initializeReconciliation(user.id)
    } else {
      // Cleanup all stores when user logs out
      cleanupBankAccounts()
      cleanupEWallets()
      cleanupCashVaults()
      cleanupCards()
      cleanupPrepaidCards()
      cleanupSales()
      cleanupCustomers()
      cleanupProducts()
      cleanupPOSMachines()
      cleanupMerchants()
      cleanupSavingsCircles()
      cleanupInvestments()
      cleanupCentralTransfers()
      cleanupCashback()
      cleanupReconciliation()
    }
  }, [user])

  return null // This component doesn't render anything
}

