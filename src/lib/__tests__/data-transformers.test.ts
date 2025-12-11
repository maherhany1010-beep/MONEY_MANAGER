/**
 * @fileoverview Unit Tests for Data Transformers
 * 
 * اختبارات الوحدة لدوال تحويل البيانات
 */

import { describe, it, expect } from 'vitest'
import {
  snakeToCamel,
  camelToSnake,
  transformToCamelCase,
  transformToSnakeCase,
  transformBankAccount,
  transformBankAccountToDB,
  transformCreditCard,
  transformPrepaidCard,
  transformArray,
} from '../data-transformers'

// ===================================
// 🔤 String Transformation Tests
// ===================================

describe('snakeToCamel', () => {
  it('should convert simple snake_case to camelCase', () => {
    expect(snakeToCamel('user_id')).toBe('userId')
    expect(snakeToCamel('created_at')).toBe('createdAt')
    expect(snakeToCamel('bank_name')).toBe('bankName')
  })

  it('should handle multiple underscores', () => {
    expect(snakeToCamel('card_number_last_four')).toBe('cardNumberLastFour')
    expect(snakeToCamel('is_default_account')).toBe('isDefaultAccount')
  })

  it('should return unchanged if no underscores', () => {
    expect(snakeToCamel('name')).toBe('name')
    expect(snakeToCamel('id')).toBe('id')
  })
})

describe('camelToSnake', () => {
  it('should convert simple camelCase to snake_case', () => {
    expect(camelToSnake('userId')).toBe('user_id')
    expect(camelToSnake('createdAt')).toBe('created_at')
    expect(camelToSnake('bankName')).toBe('bank_name')
  })

  it('should handle multiple capitals', () => {
    expect(camelToSnake('cardNumberLastFour')).toBe('card_number_last_four')
    expect(camelToSnake('isDefaultAccount')).toBe('is_default_account')
  })

  it('should return unchanged if all lowercase', () => {
    expect(camelToSnake('name')).toBe('name')
    expect(camelToSnake('id')).toBe('id')
  })
})

// ===================================
// 🔄 Object Transformation Tests
// ===================================

describe('transformToCamelCase', () => {
  it('should transform object keys from snake_case to camelCase', () => {
    const input = {
      user_id: '123',
      bank_name: 'البنك الأهلي',
      created_at: '2024-01-01',
    }
    const result = transformToCamelCase(input)

    expect(result.userId).toBe('123')
    expect(result.bankName).toBe('البنك الأهلي')
    expect(result.createdAt).toBe('2024-01-01')
  })

  it('should handle nested objects', () => {
    const input = {
      user_data: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    const result = transformToCamelCase(input)

    expect(result.userData).toBeDefined()
    expect((result.userData as Record<string, unknown>).firstName).toBe('أحمد')
  })

  it('should handle null and undefined values', () => {
    const input = {
      user_id: null,
      bank_name: undefined,
    }
    const result = transformToCamelCase(input)

    expect(result.userId).toBeNull()
    expect(result.bankName).toBeUndefined()
  })
})

describe('transformToSnakeCase', () => {
  it('should transform object keys from camelCase to snake_case', () => {
    const input = {
      userId: '123',
      bankName: 'البنك الأهلي',
      createdAt: '2024-01-01',
    }
    const result = transformToSnakeCase(input)

    expect(result.user_id).toBe('123')
    expect(result.bank_name).toBe('البنك الأهلي')
    expect(result.created_at).toBe('2024-01-01')
  })
})

// ===================================
// 🏦 Entity Transformer Tests
// ===================================

describe('transformBankAccount', () => {
  it('should transform database record to frontend format', () => {
    const dbRecord = {
      id: '123',
      user_id: 'user1',
      account_name: 'حسابي الشخصي',
      bank_name: 'البنك الأهلي',
      account_number: '1234567890',
      balance: 5000,
      currency: 'EGP',
      account_type: 'checking',
      status: 'active',
    }

    const result = transformBankAccount(dbRecord)

    expect(result.id).toBe('123')
    expect(result.accountName).toBe('حسابي الشخصي')
    expect(result.bankName).toBe('البنك الأهلي')
    expect(result.balance).toBe(5000)
    expect(result.isActive).toBe(true)
  })
})

describe('transformArray', () => {
  it('should transform array of items using transformer', () => {
    const items = [
      { user_id: '1', balance: 100 },
      { user_id: '2', balance: 200 },
    ]

    const result = transformArray(items, transformToCamelCase)

    expect(result).toHaveLength(2)
    expect(result[0].userId).toBe('1')
    expect(result[1].userId).toBe('2')
  })
})

