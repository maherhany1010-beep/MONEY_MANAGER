import { toast as sonnerToast } from 'sonner'

/**
 * Toast utility functions with RTL support and Arabic messages
 */

export const toast = {
  /**
   * Success toast
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 4000,
    })
  },

  /**
   * Error toast
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 5000,
    })
  },

  /**
   * Warning toast
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 4500,
    })
  },

  /**
   * Info toast
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 4000,
    })
  },

  /**
   * Loading toast
   */
  loading: (message: string) => {
    return sonnerToast.loading(message)
  },

  /**
   * Promise toast - shows loading, then success or error
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId)
  },

  /**
   * Custom toast with action button
   */
  custom: (message: string, options?: {
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
    cancel?: {
      label: string
      onClick?: () => void
    }
  }) => {
    return sonnerToast(message, {
      description: options?.description,
      action: options?.action && options.action.onClick ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
      cancel: options?.cancel && options.cancel.onClick ? {
        label: options.cancel.label,
        onClick: options.cancel.onClick,
      } : undefined,
    })
  },
}

/**
 * Common toast messages in Arabic
 */
export const toastMessages = {
  // Success messages
  success: {
    added: 'تمت الإضافة بنجاح',
    updated: 'تم التحديث بنجاح',
    deleted: 'تم الحذف بنجاح',
    saved: 'تم الحفظ بنجاح',
    copied: 'تم النسخ بنجاح',
    sent: 'تم الإرسال بنجاح',
    uploaded: 'تم الرفع بنجاح',
    downloaded: 'تم التنزيل بنجاح',
  },
  
  // Error messages
  error: {
    general: 'حدث خطأ ما',
    network: 'خطأ في الاتصال بالشبكة',
    notFound: 'العنصر غير موجود',
    unauthorized: 'غير مصرح لك بهذا الإجراء',
    validation: 'يرجى التحقق من البيانات المدخلة',
    required: 'يرجى ملء جميع الحقول المطلوبة',
    invalidFormat: 'صيغة البيانات غير صحيحة',
    serverError: 'خطأ في الخادم',
  },
  
  // Warning messages
  warning: {
    unsavedChanges: 'لديك تغييرات غير محفوظة',
    lowBalance: 'الرصيد منخفض',
    limitReached: 'تم الوصول للحد الأقصى',
    expiringSoon: 'ينتهي قريباً',
  },
  
  // Info messages
  info: {
    processing: 'جاري المعالجة...',
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    deleting: 'جاري الحذف...',
    uploading: 'جاري الرفع...',
    downloading: 'جاري التنزيل...',
  },
}

