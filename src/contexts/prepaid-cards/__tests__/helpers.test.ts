/**
 * @fileoverview Unit Tests for Prepaid Cards Helpers
 * 
 * اختبارات الوحدة لدوال مساعدة البطاقات المدفوعة مسبقاً
 */

import { describe, it, expect } from 'vitest'
import {
  transformPrepaidCardFromDB,
  transformPrepaidCardToDB,
  calculatePrepaidCardStats,
  validateCardForTransaction,
} from '../helpers'
import type { PrepaidCard, PrepaidTransaction } from '../types'

// ===================================
// 🔄 Transformation Tests
// ===================================

describe('transformPrepaidCardFromDB', () => {
  it('should transform database record to frontend format', () => {
    const dbRecord = {
      id: 'card-123',
      user_id: 'user-1',
      card_name: 'فودافون كاش',
      card_number: '1234',
      balance: 1500,
      currency: 'EGP',
      status: 'active',
      daily_limit: 5000,
      monthly_limit: 20000,
    }

    const result = transformPrepaidCardFromDB(dbRecord)

    // Check snake_case fields
    expect(result.card_name).toBe('فودافون كاش')
    expect(result.daily_limit).toBe(5000)

    // Check camelCase aliases
    expect(result.cardName).toBe('فودافون كاش')
    expect(result.dailyLimit).toBe(5000)
    expect(result.balance).toBe(1500)
  })

  it('should handle default values', () => {
    const dbRecord = {
      id: 'card-123',
      card_name: 'بطاقة جديدة',
      balance: 0,
    }

    const result = transformPrepaidCardFromDB(dbRecord)

    expect(result.currency).toBe('EGP')
    expect(result.status).toBe('active')
  })
})

describe('transformPrepaidCardToDB', () => {
  it('should accept camelCase input', () => {
    const input = {
      cardName: 'بطاقتي',
      balance: 500,
      dailyLimit: 2000,
    }

    const result = transformPrepaidCardToDB(input as Partial<PrepaidCard>)

    expect(result.card_name).toBe('بطاقتي')
    expect(result.balance).toBe(500)
    expect(result.daily_limit).toBe(2000)
  })

  it('should accept snake_case input', () => {
    const input = {
      card_name: 'بطاقتي',
      balance: 500,
      daily_limit: 2000,
    }

    const result = transformPrepaidCardToDB(input as Partial<PrepaidCard>)

    expect(result.card_name).toBe('بطاقتي')
    expect(result.daily_limit).toBe(2000)
  })
})

// ===================================
// 📊 Statistics Tests
// ===================================

describe('calculatePrepaidCardStats', () => {
  it('should calculate correct statistics', () => {
    const cards: PrepaidCard[] = [
      { id: '1', card_name: 'Card 1', cardName: 'Card 1', balance: 1000, status: 'active' } as PrepaidCard,
      { id: '2', card_name: 'Card 2', cardName: 'Card 2', balance: 500, status: 'active' } as PrepaidCard,
      { id: '3', card_name: 'Card 3', cardName: 'Card 3', balance: 0, status: 'blocked' } as PrepaidCard,
    ]

    const transactions: PrepaidTransaction[] = [
      { id: '1', cardId: '1', type: 'purchase', amount: 200 } as PrepaidTransaction,
      { id: '2', cardId: '1', type: 'reload', amount: 500 } as PrepaidTransaction,
    ]

    const stats = calculatePrepaidCardStats(cards, transactions)

    expect(stats.totalCards).toBe(3)
    expect(stats.totalBalance).toBe(1500)
    expect(stats.activeCards).toBe(2)
    expect(stats.blockedCards).toBe(1)
    expect(stats.totalSpent).toBe(200)
    expect(stats.totalDeposited).toBe(500)
  })
})

// ===================================
// ✅ Validation Tests
// ===================================

describe('validateCardForTransaction', () => {
  const activeCard: PrepaidCard = {
    id: '1',
    card_name: 'Test Card',
    cardName: 'Test Card',
    balance: 1000,
    status: 'active',
    daily_limit: 2000,
    daily_used: 500,
    transaction_limit: 1500,
  } as PrepaidCard

  it('should validate successful transaction', () => {
    const result = validateCardForTransaction(activeCard, 300, 'purchase')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should reject inactive card', () => {
    const blockedCard = { ...activeCard, status: 'blocked' }
    const result = validateCardForTransaction(blockedCard as PrepaidCard, 100, 'purchase')
    
    expect(result.valid).toBe(false)
    expect(result.error).toBe('البطاقة غير نشطة')
  })

  it('should reject zero or negative amount', () => {
    const result = validateCardForTransaction(activeCard, 0, 'purchase')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('المبلغ يجب أن يكون أكبر من صفر')
  })

  it('should reject insufficient balance', () => {
    const result = validateCardForTransaction(activeCard, 2000, 'purchase')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('الرصيد غير كافٍ')
  })

  it('should reject exceeding daily limit', () => {
    const result = validateCardForTransaction(activeCard, 1600, 'purchase')
    expect(result.valid).toBe(false)
    // 1600 > 1000 (balance), so insufficient balance error comes first
    expect(result.error).toBe('الرصيد غير كافٍ')
  })
})

