'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  CashbackRecord,
  CashbackRedemption,
  CardCashbackSettings,
  CashbackStats,
  CashbackFilter,
  CashbackSortOptions,
  CashbackStatus,
  RedemptionType,
  RedemptionMode,
} from '@/types/cashback'

interface CashbackContextType {
  // سجلات الكاش باك
  cashbackRecords: CashbackRecord[]
  addCashbackRecord: (record: Omit<CashbackRecord, 'id' | 'createdAt' | 'updatedAt' | 'redeemedAmount' | 'remainingAmount' | 'status'>) => void
  updateCashbackRecord: (id: string, updates: Partial<CashbackRecord>) => void
  deleteCashbackRecord: (id: string) => void
  getCashbackRecord: (id: string) => CashbackRecord | undefined
  getCardCashbackRecords: (cardId: string) => CashbackRecord[]
  
  // عمليات الاسترداد
  redemptions: CashbackRedemption[]
  redeemCashback: (redemption: Omit<CashbackRedemption, 'id' | 'createdAt'>) => void
  getCardRedemptions: (cardId: string) => CashbackRedemption[]
  
  // الإعدادات
  settings: CardCashbackSettings[]
  getCardSettings: (cardId: string) => CardCashbackSettings | undefined
  updateCardSettings: (cardId: string, settings: Partial<CardCashbackSettings>) => void
  
  // الإحصائيات
  getCardStats: (cardId: string) => CashbackStats
  
  // البحث والتصفية
  searchCashback: (filter: CashbackFilter, sort?: CashbackSortOptions) => CashbackRecord[]
  
  // الاسترداد التلقائي
  processAutomaticRedemptions: () => void
}

const CashbackContext = createContext<CashbackContextType | undefined>(undefined)

export function CashbackProvider({ children }: { children: React.ReactNode }) {
  const [cashbackRecords, setCashbackRecords] = useState<CashbackRecord[]>([])
  const [redemptions, setRedemptions] = useState<CashbackRedemption[]>([])
  const [settings, setSettings] = useState<CardCashbackSettings[]>([])

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem('cashbackRecords')
    const savedRedemptions = localStorage.getItem('cashbackRedemptions')
    const savedSettings = localStorage.getItem('cashbackSettings')

    if (savedRecords) setCashbackRecords(JSON.parse(savedRecords))
    if (savedRedemptions) setRedemptions(JSON.parse(savedRedemptions))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
  }, [])

  // حفظ البيانات في localStorage
  useEffect(() => {
    localStorage.setItem('cashbackRecords', JSON.stringify(cashbackRecords))
  }, [cashbackRecords])

  useEffect(() => {
    localStorage.setItem('cashbackRedemptions', JSON.stringify(redemptions))
  }, [redemptions])

  useEffect(() => {
    localStorage.setItem('cashbackSettings', JSON.stringify(settings))
  }, [settings])

  /**
   * إضافة سجل كاش باك جديد
   */
  const addCashbackRecord = useCallback((recordData: Omit<CashbackRecord, 'id' | 'createdAt' | 'updatedAt' | 'redeemedAmount' | 'remainingAmount' | 'status'>) => {
    const newRecord: CashbackRecord = {
      ...recordData,
      id: `cashback-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      redeemedAmount: 0,
      remainingAmount: recordData.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // حساب تاريخ الاسترداد التلقائي
    if (newRecord.autoRedeemEnabled && newRecord.autoRedeemDays > 0) {
      const autoRedeemDate = new Date()
      autoRedeemDate.setDate(autoRedeemDate.getDate() + newRecord.autoRedeemDays)
      newRecord.autoRedeemDate = autoRedeemDate.toISOString().split('T')[0]
    }

    setCashbackRecords(prev => [...prev, newRecord])
  }, [])

  /**
   * تحديث سجل كاش باك
   */
  const updateCashbackRecord = useCallback((id: string, updates: Partial<CashbackRecord>) => {
    setCashbackRecords(prev => prev.map(record =>
      record.id === id
        ? { ...record, ...updates, updatedAt: new Date().toISOString() }
        : record
    ))
  }, [])

  /**
   * حذف سجل كاش باك
   */
  const deleteCashbackRecord = useCallback((id: string) => {
    setCashbackRecords(prev => prev.filter(record => record.id !== id))
  }, [])

  /**
   * الحصول على سجل كاش باك
   */
  const getCashbackRecord = useCallback((id: string) => {
    return cashbackRecords.find(record => record.id === id)
  }, [cashbackRecords])

  /**
   * الحصول على سجلات كاش باك البطاقة
   */
  const getCardCashbackRecords = useCallback((cardId: string) => {
    return cashbackRecords.filter(record => record.cardId === cardId)
  }, [cashbackRecords])

  /**
   * استرداد الكاش باك
   */
  const redeemCashback = useCallback((redemptionData: Omit<CashbackRedemption, 'id' | 'createdAt'>) => {
    const newRedemption: CashbackRedemption = {
      ...redemptionData,
      id: `redemption-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
    }

    setRedemptions(prev => [...prev, newRedemption])

    // تحديث سجل الكاش باك
    const cashbackRecord = cashbackRecords.find(r => r.id === redemptionData.cashbackId)
    if (cashbackRecord) {
      const newRedeemedAmount = cashbackRecord.redeemedAmount + redemptionData.amount
      const newRemainingAmount = cashbackRecord.amount - newRedeemedAmount

      let newStatus: CashbackStatus = cashbackRecord.status
      if (newRemainingAmount === 0) {
        newStatus = 'redeemed'
      } else if (newRedeemedAmount > 0) {
        newStatus = 'approved'
      }

      updateCashbackRecord(redemptionData.cashbackId, {
        redeemedAmount: newRedeemedAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
      })
    }
  }, [cashbackRecords, updateCashbackRecord])

  /**
   * الحصول على عمليات استرداد البطاقة
   */
  const getCardRedemptions = useCallback((cardId: string) => {
    return redemptions.filter(redemption => redemption.cardId === cardId)
  }, [redemptions])

  /**
   * الحصول على إعدادات البطاقة
   */
  const getCardSettings = useCallback((cardId: string) => {
    return settings.find(s => s.cardId === cardId)
  }, [settings])

  /**
   * تحديث إعدادات البطاقة
   */
  const updateCardSettings = useCallback((cardId: string, updates: Partial<CardCashbackSettings>) => {
    setSettings(prev => {
      const existing = prev.find(s => s.cardId === cardId)
      if (existing) {
        return prev.map(s =>
          s.cardId === cardId
            ? { ...s, ...updates, updatedAt: new Date().toISOString() }
            : s
        )
      } else {
        // إنشاء إعدادات جديدة
        const newSettings: CardCashbackSettings = {
          cardId,
          cashbackEnabled: true,
          cashbackRate: 1,
          autoRedeemEnabled: false,
          autoRedeemDays: 30,
          autoRedeemType: 'balance',
          minRedemptionAmount: 10,
          maxCashbackPerTransaction: 1000,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        return [...prev, newSettings]
      }
    })
  }, [])

  /**
   * الحصول على إحصائيات البطاقة
   */
  const getCardStats = useCallback((cardId: string): CashbackStats => {
    const cardRecords = cashbackRecords.filter(r => r.cardId === cardId)
    const cardRedemptions = redemptions.filter(r => r.cardId === cardId)

    const totalEarned = cardRecords.reduce((sum, r) => sum + r.amount, 0)
    const totalRedeemed = cardRecords.reduce((sum, r) => sum + r.redeemedAmount, 0)
    const totalPending = cardRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.remainingAmount, 0)
    const totalExpired = cardRecords.filter(r => r.status === 'expired').reduce((sum, r) => sum + r.remainingAmount, 0)
    const availableBalance = cardRecords.filter(r => r.status !== 'expired' && r.status !== 'cancelled').reduce((sum, r) => sum + r.remainingAmount, 0)

    const redemptionsByType = {
      balance: cardRedemptions.filter(r => r.redemptionType === 'balance').length,
      voucher: cardRedemptions.filter(r => r.redemptionType === 'voucher').length,
    }

    const sortedRecords = [...cardRecords].sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
    const sortedRedemptions = [...cardRedemptions].sort((a, b) => new Date(b.redemptionDate).getTime() - new Date(a.redemptionDate).getTime())

    return {
      cardId,
      totalEarned,
      totalRedeemed,
      totalPending,
      totalExpired,
      availableBalance,
      totalRecords: cardRecords.length,
      totalRedemptions: cardRedemptions.length,
      redemptionsByType,
      lastEarnedDate: sortedRecords[0]?.earnedDate,
      lastRedeemedDate: sortedRedemptions[0]?.redemptionDate,
    }
  }, [cashbackRecords, redemptions])

  /**
   * البحث والتصفية
   */
  const searchCashback = useCallback((filter: CashbackFilter, sort?: CashbackSortOptions) => {
    let filtered = [...cashbackRecords]

    if (filter.cardId) {
      filtered = filtered.filter(r => r.cardId === filter.cardId)
    }

    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(r => filter.status!.includes(r.status))
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(r => r.earnedDate >= filter.dateFrom!)
    }

    if (filter.dateTo) {
      filtered = filtered.filter(r => r.earnedDate <= filter.dateTo!)
    }

    if (filter.minAmount !== undefined) {
      filtered = filtered.filter(r => r.amount >= filter.minAmount!)
    }

    if (filter.maxAmount !== undefined) {
      filtered = filtered.filter(r => r.amount <= filter.maxAmount!)
    }

    // الفرز
    if (sort) {
      filtered.sort((a, b) => {
        let aValue: any = a[sort.field]
        let bValue: any = b[sort.field]

        if (sort.field === 'earnedDate') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (sort.direction === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  }, [cashbackRecords])

  /**
   * معالجة الاستردادات التلقائية
   */
  const processAutomaticRedemptions = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]

    cashbackRecords.forEach(record => {
      if (
        record.autoRedeemEnabled &&
        record.autoRedeemDate &&
        record.autoRedeemDate <= today &&
        record.status === 'pending' &&
        record.remainingAmount > 0
      ) {
        const cardSettings = getCardSettings(record.cardId)
        if (cardSettings && cardSettings.autoRedeemEnabled) {
          // استرداد تلقائي
          redeemCashback({
            cashbackId: record.id,
            cardId: record.cardId,
            redemptionDate: today,
            amount: record.remainingAmount,
            redemptionType: cardSettings.autoRedeemType,
            redemptionMode: 'full',
            voucherDetails: cardSettings.autoRedeemType === 'voucher' && cardSettings.autoRedeemStoreName
              ? { storeName: cardSettings.autoRedeemStoreName }
              : undefined,
            isAutomatic: true,
          })
        }
      }
    })
  }, [cashbackRecords, getCardSettings, redeemCashback])

  const value: CashbackContextType = {
    cashbackRecords,
    addCashbackRecord,
    updateCashbackRecord,
    deleteCashbackRecord,
    getCashbackRecord,
    getCardCashbackRecords,
    redemptions,
    redeemCashback,
    getCardRedemptions,
    settings,
    getCardSettings,
    updateCardSettings,
    getCardStats,
    searchCashback,
    processAutomaticRedemptions,
  }

  return <CashbackContext.Provider value={value}>{children}</CashbackContext.Provider>
}

export function useCashback() {
  const context = useContext(CashbackContext)
  if (!context) {
    throw new Error('useCashback must be used within CashbackProvider')
  }
  return context
}

