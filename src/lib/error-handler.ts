/**
 * Error Handler
 * 
 * معالجة موحدة للأخطاء في التطبيق
 * 
 * @module lib/error-handler
 */

import { toast } from 'sonner'

// ===================================
// 📋 Types
// ===================================

export interface AppError {
  code: string
  message: string
  details?: unknown
  originalError?: Error
}

export interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// ===================================
// 🗺️ Error Message Mapping
// ===================================

/** رسائل الخطأ بالعربية حسب الكود */
const ERROR_MESSAGES: Record<string, string> = {
  // أخطاء المصادقة
  'auth/invalid-credentials': 'بيانات الدخول غير صحيحة',
  'auth/user-not-found': 'المستخدم غير موجود',
  'auth/wrong-password': 'كلمة المرور غير صحيحة',
  'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
  'auth/weak-password': 'كلمة المرور ضعيفة جداً',
  'auth/invalid-email': 'البريد الإلكتروني غير صالح',
  'auth/session-expired': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً',

  // أخطاء الشبكة
  'network/offline': 'لا يوجد اتصال بالإنترنت',
  'network/timeout': 'انتهت مهلة الاتصال، يرجى المحاولة مجدداً',
  'network/server-error': 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',

  // أخطاء قاعدة البيانات
  'db/duplicate': 'هذا السجل موجود بالفعل',
  'db/not-found': 'السجل المطلوب غير موجود',
  'db/constraint-violation': 'لا يمكن تنفيذ هذه العملية بسبب قيود البيانات',
  'db/permission-denied': 'ليس لديك صلاحية لتنفيذ هذه العملية',

  // أخطاء التحقق
  'validation/required': 'يرجى ملء جميع الحقول المطلوبة',
  'validation/invalid-amount': 'المبلغ غير صالح',
  'validation/insufficient-balance': 'الرصيد غير كافٍ',
  'validation/limit-exceeded': 'تم تجاوز الحد المسموح',

  // أخطاء عامة
  'unknown': 'حدث خطأ غير متوقع',
}

// ===================================
// 🔧 Error Functions
// ===================================

/**
 * معالجة أخطاء Supabase وتحويلها لصيغة موحدة
 */
export function handleSupabaseError(error: SupabaseError | Error | unknown): AppError {
  if (!error) {
    return { code: 'unknown', message: ERROR_MESSAGES['unknown'] }
  }

  // إذا كان الخطأ من Supabase
  if (typeof error === 'object' && 'message' in error) {
    const supabaseError = error as SupabaseError
    const message = supabaseError.message.toLowerCase()

    // تحديد نوع الخطأ
    let code = 'unknown'
    
    if (message.includes('duplicate') || message.includes('unique')) {
      code = 'db/duplicate'
    } else if (message.includes('not found') || message.includes('no rows')) {
      code = 'db/not-found'
    } else if (message.includes('permission') || message.includes('denied') || message.includes('policy')) {
      code = 'db/permission-denied'
    } else if (message.includes('constraint') || message.includes('foreign key')) {
      code = 'db/constraint-violation'
    } else if (message.includes('network') || message.includes('fetch')) {
      code = 'network/offline'
    } else if (message.includes('timeout')) {
      code = 'network/timeout'
    } else if (message.includes('invalid') && message.includes('credentials')) {
      code = 'auth/invalid-credentials'
    }

    return {
      code,
      message: ERROR_MESSAGES[code] || supabaseError.message,
      details: supabaseError.details || supabaseError.hint,
      originalError: error instanceof Error ? error : undefined,
    }
  }

  // إذا كان Error عادي
  if (error instanceof Error) {
    return {
      code: 'unknown',
      message: error.message || ERROR_MESSAGES['unknown'],
      originalError: error,
    }
  }

  return { code: 'unknown', message: ERROR_MESSAGES['unknown'] }
}

/**
 * عرض رسالة خطأ للمستخدم باستخدام Toast
 */
export function showErrorToast(
  error: AppError | Error | string,
  title?: string
): void {
  let message: string

  if (typeof error === 'string') {
    message = error
  } else if ('message' in error) {
    message = error.message
  } else {
    message = ERROR_MESSAGES['unknown']
  }

  toast.error(title || 'خطأ', {
    description: message,
    duration: 5000,
  })
}

/**
 * عرض رسالة نجاح للمستخدم
 */
export function showSuccessToast(message: string, title?: string): void {
  toast.success(title || 'نجاح', {
    description: message,
    duration: 3000,
  })
}

/**
 * تسجيل الخطأ (للتطوير)
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error, additionalInfo || '')
  }
  
  // TODO: إضافة إرسال للـ error tracking service في الإنتاج
  // مثل Sentry, LogRocket, etc.
}

/**
 * معالجة خطأ شاملة مع عرض Toast وتسجيل
 */
export function handleError(
  context: string,
  error: unknown,
  showToast = true
): AppError {
  const appError = handleSupabaseError(error)
  
  logError(context, error, { appError })
  
  if (showToast) {
    showErrorToast(appError)
  }
  
  return appError
}

