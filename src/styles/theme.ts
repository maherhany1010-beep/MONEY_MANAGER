/**
 * نظام الألوان الموحد للتطبيق
 * مصمم ليكون مريحاً للعين مع تباين جيد
 */

export const theme = {
  // الألوان الأساسية - درجات ناعمة ومريحة
  colors: {
    // الأزرق - اللون الأساسي
    primary: {
      50: '#EFF6FF',   // خلفية فاتحة جداً
      100: '#DBEAFE',  // خلفية فاتحة
      200: '#BFDBFE',  // حدود فاتحة
      300: '#93C5FD',  // عناصر ثانوية
      400: '#60A5FA',  // عناصر تفاعلية
      500: '#3B82F6',  // اللون الأساسي
      600: '#2563EB',  // hover
      700: '#1D4ED8',  // نص داكن
      800: '#1E40AF',  // نص أغمق
      900: '#1E3A8A',  // نص أغمق جداً
    },

    // الأخضر - النجاح والإيجابية
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },

    // الأحمر - التحذيرات والأخطاء
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },

    // البرتقالي - التنبيهات
    warning: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },

    // البنفسجي - العناصر المميزة
    purple: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },

    // الرمادي - العناصر المحايدة
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // ألوان الوضع الداكن
  dark: {
    // الخلفيات
    background: {
      primary: '#0F172A',    // الخلفية الرئيسية
      secondary: '#1E293B',  // خلفية البطاقات
      tertiary: '#334155',   // خلفية ثانوية
    },

    // النصوص
    text: {
      primary: '#F1F5F9',    // نص أساسي
      secondary: '#E2E8F0',  // نص ثانوي
      tertiary: '#CBD5E1',   // نص فاتح
      muted: '#94A3B8',      // نص باهت
    },

    // الحدود
    border: {
      primary: '#334155',
      secondary: '#475569',
      tertiary: '#64748B',
    },

    // الألوان الأساسية (معدلة للوضع الداكن)
    primary: {
      50: '#1E3A8A',
      100: '#1E40AF',
      200: '#1D4ED8',
      300: '#2563EB',
      400: '#3B82F6',
      500: '#60A5FA',   // اللون الأساسي في الوضع الداكن
      600: '#93C5FD',
      700: '#BFDBFE',
      800: '#DBEAFE',
      900: '#EFF6FF',
    },

    success: {
      500: '#4ADE80',
      600: '#86EFAC',
    },

    danger: {
      500: '#F87171',
      600: '#FCA5A5',
    },

    warning: {
      500: '#FB923C',
      600: '#FDBA74',
    },

    purple: {
      500: '#C084FC',
      600: '#D8B4FE',
    },
  },

  // التدرجات اللونية
  gradients: {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    success: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    danger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    warning: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    purple: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',

    // تدرجات ناعمة للخلفيات
    softBlue: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    softGreen: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    softRed: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
    softOrange: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    softPurple: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
    softGray: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
  },

  // تدرجات الوضع الداكن
  darkGradients: {
    primary: 'linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%)',
    success: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',
    danger: 'linear-gradient(135deg, #DC2626 0%, #E11D48 100%)',
    warning: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
    purple: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',

    // تدرجات ناعمة للخلفيات في الوضع الداكن
    softBlue: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)',
    softGreen: 'linear-gradient(135deg, #14532D 0%, #15803D 100%)',
    softRed: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
    softOrange: 'linear-gradient(135deg, #7C2D12 0%, #9A3412 100%)',
    softPurple: 'linear-gradient(135deg, #581C87 0%, #6B21A8 100%)',
    softGray: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
  },

  // الظلال
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    
    // ظلال ملونة ناعمة
    primarySoft: '0 4px 14px 0 rgba(59, 130, 246, 0.15)',
    successSoft: '0 4px 14px 0 rgba(34, 197, 94, 0.15)',
    dangerSoft: '0 4px 14px 0 rgba(239, 68, 68, 0.15)',
    warningSoft: '0 4px 14px 0 rgba(249, 115, 22, 0.15)',
  },

  // الحدود
  borders: {
    radius: {
      none: '0',
      sm: '0.375rem',   // 6px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
      '2xl': '1.5rem',  // 24px
      full: '9999px',
    },
    width: {
      thin: '1px',
      normal: '2px',
      thick: '3px',
    },
  },

  // المسافات
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // الخطوط
  typography: {
    fontFamily: {
      sans: '"Noto Sans Arabic", system-ui, -apple-system, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // الانتقالات
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// فئات CSS جاهزة للاستخدام - مع دعم كامل للوضع الداكن
export const themeClasses = {
  // البطاقات
  card: {
    base: 'bg-card rounded-xl border-2 border-border shadow-sm hover:shadow-md dark:shadow-black/20 transition-all duration-300',
    elevated: 'bg-card rounded-xl shadow-lg hover:shadow-xl dark:shadow-black/30 transition-all duration-300',
    gradient: 'rounded-xl shadow-md hover:shadow-lg transition-all duration-300',
  },

  // بطاقات الإحصائيات - محسّنة للوضع الداكن
  statCard: {
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm transition-all duration-300',
    success: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 shadow-sm transition-all duration-300',
    danger: 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/50 dark:to-red-950/50 border-2 border-rose-200 dark:border-rose-800 rounded-xl p-6 shadow-sm transition-all duration-300',
    warning: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 shadow-sm transition-all duration-300',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 shadow-sm transition-all duration-300',
    neutral: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm transition-all duration-300',
  },

  // الأزرار - تبقى كما هي لأن التدرجات تعمل في كلا الوضعين
  button: {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300',
    warning: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300',
    outline: 'border-2 border-border hover:border-primary hover:bg-primary/10 text-foreground hover:text-primary font-semibold rounded-lg px-4 py-2 transition-all duration-300',
  },

  // أيقونات الحاويات - تبقى كما هي لأن التدرجات تعمل في كلا الوضعين
  iconContainer: {
    primary: 'p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md',
    success: 'p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-md',
    danger: 'p-3 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg shadow-md',
    warning: 'p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md',
    purple: 'p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md',
  },

  // الإدخالات - محسّنة للوضع الداكن
  input: {
    base: 'w-full px-4 py-2 border-2 border-input rounded-lg focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-300 bg-card text-foreground placeholder:text-muted-foreground',
    error: 'w-full px-4 py-2 border-2 border-destructive/50 rounded-lg focus:border-destructive focus:ring-2 focus:ring-destructive/20 transition-all duration-300 bg-card text-foreground',
  },

  // التنبيهات - مع دعم الوضع الداكن
  alert: {
    success: 'bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 text-green-800 dark:text-green-200',
    danger: 'bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200',
    warning: 'bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 text-orange-800 dark:text-orange-200',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-800 dark:text-blue-200',
  },

  // الشارات - مع دعم الوضع الداكن
  badge: {
    primary: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
    success: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
    danger: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
    warning: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200',
    neutral: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  },

  // الجداول - محسّنة للوضع الداكن
  table: {
    wrapper: 'bg-card rounded-lg border border-border overflow-hidden',
    header: 'bg-muted/50 dark:bg-muted/30 border-b border-border',
    headerCell: 'px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide',
    row: 'border-b border-border hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors duration-200',
    cell: 'px-6 py-4 text-sm text-foreground',
  },
}

// دوال مساعدة للوضع الداكن
export const getDarkModeClass = (lightClass: string, darkClass: string) => {
  return `${lightClass} dark:${darkClass}`
}

export const getResponsiveGradient = (type: 'primary' | 'success' | 'danger' | 'warning' | 'purple') => {
  const gradients = {
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
    success: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950',
    danger: 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950 dark:to-red-950',
    warning: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
  }
  return gradients[type]
}

// دوال مساعدة
export const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    active: 'success',
    inactive: 'neutral',
    pending: 'warning',
    blocked: 'danger',
    paid: 'success',
    unpaid: 'danger',
    partial: 'warning',
    overdue: 'danger',
  }
  return statusMap[status] || 'neutral'
}

export const getAccountTypeColor = (type: string) => {
  const typeMap: Record<string, string> = {
    bank: 'primary',
    'e-wallet': 'purple',
    'cash-vault': 'success',
    'prepaid-card': 'warning',
    pos: 'neutral',
  }
  return typeMap[type] || 'neutral'
}

