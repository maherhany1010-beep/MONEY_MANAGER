/**
 * @fileoverview Unit Tests for Credit Cards Helpers
 * 
 * اختبارات الوحدة لدوال مساعدة البطاقات الائتمانية
 */

import { describe, it, expect } from 'vitest'
import {
  transformCardFromDB,
  transformCardToDB,
  calculateCardStats,
  calculateBalanceAfterPurchase,
  calculateBalanceAfterPayment,
  validatePurchase,
  validatePayment,
} from '../helpers'
import type { CreditCard, Purchase } from '../types'

// ===================================
// 🔄 Transformation Tests
// ===================================

describe('transformCardFromDB', () => {
  it('should transform database record to frontend format', () => {
    const dbRecord = {
      id: 'card-123',
      user_id: 'user-1',
      name: 'بطاقة البنك الأهلي',
      bank_name: 'البنك الأهلي',
      card_number_last_four: '1234',
      card_type: 'visa',
      credit_limit: 10000,
      current_balance: 3000,
      status: 'active',
    }

    const result = transformCardFromDB(dbRecord)

    expect(result.id).toBe('card-123')
    expect(result.card_name).toBe('بطاقة البنك الأهلي')
    expect(result.bank_name).toBe('البنك الأهلي')
    expect(result.credit_limit).toBe(10000)
    expect(result.current_balance).toBe(3000)
    expect(result.available_credit).toBe(7000) // 10000 - 3000
    expect(result.isActive).toBe(true)
  })

  it('should calculate available credit correctly', () => {
    const dbRecord = {
      id: 'card-123',
      credit_limit: 5000,
      current_balance: 2500,
    }

    const result = transformCardFromDB(dbRecord)
    expect(result.available_credit).toBe(2500)
  })
})

describe('transformCardToDB', () => {
  it('should transform frontend format to database format', () => {
    const card: Partial<CreditCard> = {
      card_name: 'بطاقتي',
      bank_name: 'البنك الأهلي',
      credit_limit: 15000,
      current_balance: 5000,
    }

    const result = transformCardToDB(card)

    expect(result.name).toBe('بطاقتي')
    expect(result.bank_name).toBe('البنك الأهلي')
    expect(result.credit_limit).toBe(15000)
    expect(result.current_balance).toBe(5000)
  })
})

// ===================================
// 📊 Statistics Tests
// ===================================

describe('calculateCardStats', () => {
  it('should calculate correct statistics', () => {
    const cards: CreditCard[] = [
      { id: '1', credit_limit: 10000, current_balance: 3000, available_credit: 7000, status: 'active' } as CreditCard,
      { id: '2', credit_limit: 5000, current_balance: 1000, available_credit: 4000, status: 'active' } as CreditCard,
      { id: '3', credit_limit: 8000, current_balance: 0, available_credit: 8000, status: 'blocked' } as CreditCard,
    ]

    const purchases: Purchase[] = [
      { id: '1', cashbackEarned: 50 } as Purchase,
      { id: '2', cashbackEarned: 30 } as Purchase,
    ]

    const stats = calculateCardStats(cards, purchases)

    expect(stats.totalCreditLimit).toBe(23000)
    expect(stats.totalBalance).toBe(4000)
    expect(stats.totalAvailableCredit).toBe(19000)
    expect(stats.totalCashback).toBe(80)
    expect(stats.cardsCount).toBe(3)
    expect(stats.activeCardsCount).toBe(2)
    expect(stats.utilizationRate).toBeCloseTo(17.39, 1) // (4000/23000)*100
  })
})

// ===================================
// 💰 Balance Calculation Tests
// ===================================

describe('calculateBalanceAfterPurchase', () => {
  it('should increase balance after purchase', () => {
    const card = { current_balance: 1000, credit_limit: 5000 } as CreditCard
    const result = calculateBalanceAfterPurchase(card, 500)

    expect(result.newBalance).toBe(1500)
    expect(result.newAvailableCredit).toBe(3500)
  })
})

describe('calculateBalanceAfterPayment', () => {
  it('should decrease balance after payment', () => {
    const card = { current_balance: 2000, credit_limit: 5000 } as CreditCard
    const result = calculateBalanceAfterPayment(card, 500)

    expect(result.newBalance).toBe(1500)
    expect(result.newAvailableCredit).toBe(3500)
  })

  it('should not go below zero', () => {
    const card = { current_balance: 500, credit_limit: 5000 } as CreditCard
    const result = calculateBalanceAfterPayment(card, 1000)

    expect(result.newBalance).toBe(0)
    expect(result.newAvailableCredit).toBe(5000)
  })
})

// ===================================
// ✅ Validation Tests
// ===================================

describe('validatePurchase', () => {
  const activeCard = { id: '1', status: 'active', available_credit: 5000 } as CreditCard

  it('should validate successful purchase', () => {
    const result = validatePurchase(activeCard, 1000)
    expect(result.valid).toBe(true)
  })

  it('should reject inactive card', () => {
    const blockedCard = { ...activeCard, status: 'blocked' } as CreditCard
    const result = validatePurchase(blockedCard, 100)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('البطاقة غير نشطة')
  })

  it('should reject exceeding available credit', () => {
    const result = validatePurchase(activeCard, 6000)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('المبلغ يتجاوز الحد الائتماني المتاح')
  })
})

describe('validatePayment', () => {
  const card = { id: '1' } as CreditCard

  it('should validate successful payment', () => {
    const result = validatePayment(card, 500)
    expect(result.valid).toBe(true)
  })

  it('should reject zero amount', () => {
    const result = validatePayment(card, 0)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('المبلغ يجب أن يكون أكبر من صفر')
  })
})

