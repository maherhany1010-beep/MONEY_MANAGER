/**
 * @fileoverview Unit Tests for Error Handler
 * 
 * اختبارات الوحدة لدوال معالجة الأخطاء
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleSupabaseError,
  logError,
} from '../error-handler'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// ===================================
// 🛠️ handleSupabaseError Tests
// ===================================

describe('handleSupabaseError', () => {
  it('should handle null/undefined error', () => {
    const result = handleSupabaseError(null)
    expect(result.code).toBe('unknown')
    expect(result.message).toBe('حدث خطأ غير متوقع')
  })

  it('should detect duplicate key error', () => {
    const error = { message: 'duplicate key value violates unique constraint' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('db/duplicate')
    expect(result.message).toBe('هذا السجل موجود بالفعل')
  })

  it('should detect not found error', () => {
    const error = { message: 'no rows returned' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('db/not-found')
    expect(result.message).toBe('السجل المطلوب غير موجود')
  })

  it('should detect permission denied error', () => {
    const error = { message: 'new row violates row-level security policy' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('db/permission-denied')
    expect(result.message).toBe('ليس لديك صلاحية لتنفيذ هذه العملية')
  })

  it('should detect constraint violation error', () => {
    const error = { message: 'violates foreign key constraint' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('db/constraint-violation')
    expect(result.message).toBe('لا يمكن تنفيذ هذه العملية بسبب قيود البيانات')
  })

  it('should detect network error', () => {
    const error = { message: 'failed to fetch' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('network/offline')
    expect(result.message).toBe('لا يوجد اتصال بالإنترنت')
  })

  it('should detect timeout error', () => {
    const error = { message: 'request timeout' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('network/timeout')
    expect(result.message).toBe('انتهت مهلة الاتصال، يرجى المحاولة مجدداً')
  })

  it('should detect invalid credentials error', () => {
    const error = { message: 'Invalid credentials provided' }
    const result = handleSupabaseError(error)
    
    expect(result.code).toBe('auth/invalid-credentials')
    expect(result.message).toBe('بيانات الدخول غير صحيحة')
  })

  it('should handle standard Error object', () => {
    const error = new Error('Something went wrong')
    const result = handleSupabaseError(error)

    expect(result.code).toBe('unknown')
    // The error handler returns Arabic message for unknown errors
    expect(result.message).toBe('حدث خطأ غير متوقع')
    expect(result.originalError).toBe(error)
  })

  it('should include details from Supabase error', () => {
    const error = {
      message: 'some error',
      details: 'Additional info',
      hint: 'Try this',
    }
    const result = handleSupabaseError(error)
    
    expect(result.details).toBe('Additional info')
  })
})

// ===================================
// 📝 logError Tests
// ===================================

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should not log in non-development environment', () => {
    // In test environment (NODE_ENV !== 'development'), logError should not call console.error
    logError('TestContext', new Error('Test error'), { extra: 'info' })

    // logError only logs in development mode
    expect(console.error).not.toHaveBeenCalled()
  })
})

