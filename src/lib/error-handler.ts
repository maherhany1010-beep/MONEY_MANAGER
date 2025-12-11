/**
 * @fileoverview Unified Error Handler for the Application
 *
 * معالجة موحدة للأخطاء في التطبيق مع دعم رسائل الخطأ بالعربية.
 *
 * A unified error handling module with Arabic error message support.
 * Handles Supabase errors, network errors, and validation errors.
 *
 * @module lib/error-handler
 * @author Money Manager Team
 * @version 1.0.0
 *
 * @example
 * // معالجة خطأ Supabase
 * try {
 *   await supabase.from('table').insert(data)
 * } catch (error) {
 *   handleError('MyComponent.createItem', error)
 * }
 *
 * @example
 * // عرض رسالة خطأ مباشرة
 * showErrorToast('فشل في تحميل البيانات')
 *
 * @example
 * // عرض رسالة نجاح
 * showSuccessToast('تم الحفظ بنجاح')
 */

import { toast } from 'sonner'

// ===================================
// 📋 Types
// ===================================

/**
 * واجهة خطأ التطبيق الموحدة
 * Unified application error interface
 *
 * @interface AppError
 */
export interface AppError {
  /**
   * كود الخطأ الفريد
   * Unique error code (e.g., 'auth/invalid-credentials', 'db/not-found')
   */
  code: string

  /**
   * رسالة الخطأ للعرض للمستخدم (بالعربية)
   * User-friendly error message (in Arabic)
   */
  message: string

  /**
   * تفاصيل إضافية عن الخطأ
   * Additional error details
   */
  details?: unknown

  /**
   * الخطأ الأصلي (للتصحيح)
   * Original error (for debugging)
   */
  originalError?: Error
}

/**
 * واجهة خطأ Supabase
 * Supabase error interface
 *
 * @interface SupabaseError
 */
export interface SupabaseError {
  /** رسالة الخطأ من Supabase */
  message: string
  /** كود الخطأ */
  code?: string
  /** تفاصيل إضافية */
  details?: string
  /** تلميح للحل */
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
 * Transform Supabase errors to unified AppError format
 *
 * تحلل رسالة الخطأ وتحدد نوعه ثم تُرجع رسالة عربية مناسبة.
 *
 * @param error - الخطأ من Supabase أو أي خطأ آخر
 * @returns كائن AppError موحد مع رسالة عربية
 *
 * @example
 * ```typescript
 * const { error } = await supabase.from('accounts').insert(data)
 * if (error) {
 *   const appError = handleSupabaseError(error)
 *   console.log(appError.code)    // 'db/duplicate'
 *   console.log(appError.message) // 'هذا السجل موجود بالفعل'
 * }
 * ```
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
 * Display error message to user using Toast notification
 *
 * @param error - الخطأ أو رسالة الخطأ
 * @param title - عنوان الرسالة (اختياري)، الافتراضي: 'خطأ'
 *
 * @example
 * ```typescript
 * // باستخدام نص مباشر
 * showErrorToast('فشل في حفظ البيانات')
 *
 * // باستخدام AppError
 * const appError = handleSupabaseError(error)
 * showErrorToast(appError)
 *
 * // مع عنوان مخصص
 * showErrorToast('الرصيد غير كافٍ', 'تحذير')
 * ```
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
 * Display success message to user using Toast notification
 *
 * @param message - رسالة النجاح
 * @param title - عنوان الرسالة (اختياري)، الافتراضي: 'نجاح'
 *
 * @example
 * ```typescript
 * showSuccessToast('تم حفظ البيانات بنجاح')
 * showSuccessToast('تم التحويل بنجاح', 'عملية مالية')
 * ```
 */
export function showSuccessToast(message: string, title?: string): void {
  toast.success(title || 'نجاح', {
    description: message,
    duration: 3000,
  })
}

/**
 * تسجيل الخطأ في الـ console (للتطوير فقط)
 * Log error to console (development only)
 *
 * في بيئة الإنتاج، يمكن إضافة إرسال للـ error tracking service.
 *
 * @param context - سياق الخطأ (اسم الدالة أو المكون)
 * @param error - الخطأ
 * @param additionalInfo - معلومات إضافية للتصحيح
 *
 * @example
 * ```typescript
 * logError('CardsContext.addPurchase', error, { cardId, amount })
 * ```
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
 * Comprehensive error handling with Toast display and logging
 *
 * تجمع بين handleSupabaseError و showErrorToast و logError في دالة واحدة.
 *
 * @param context - سياق الخطأ (اسم الدالة أو المكون)
 * @param error - الخطأ
 * @param showToast - هل يتم عرض Toast؟ (الافتراضي: true)
 * @returns كائن AppError موحد
 *
 * @example
 * ```typescript
 * try {
 *   await supabase.from('accounts').insert(data)
 * } catch (error) {
 *   const appError = handleError('AccountsContext.create', error)
 *   // سيتم تسجيل الخطأ وعرض Toast تلقائياً
 * }
 *
 * // بدون عرض Toast
 * const appError = handleError('silent-operation', error, false)
 * ```
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

