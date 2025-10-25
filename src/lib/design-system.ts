/**
 * نظام التصميم الموحد للتطبيق
 * Design System for Comprehensive Financial Management App
 */

// ========================================
// Typography System - نظام الخطوط
// ========================================

export const typography = {
  // أحجام الخطوط
  fontSize: {
    xs: 'text-xs',      // 12px - للنصوص الصغيرة جداً
    sm: 'text-sm',      // 14px - للنصوص الثانوية
    base: 'text-base',  // 16px - للنصوص العادية
    lg: 'text-lg',      // 18px - للنصوص البارزة
    xl: 'text-xl',      // 20px - للعناوين الصغيرة
    '2xl': 'text-2xl',  // 24px - للعناوين المتوسطة
    '3xl': 'text-3xl',  // 30px - للعناوين الكبيرة
    '4xl': 'text-4xl',  // 36px - للعناوين الرئيسية
  },
  
  // أوزان الخطوط
  fontWeight: {
    normal: 'font-normal',     // 400
    medium: 'font-medium',     // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',         // 700
  },
  
  // ارتفاع السطر
  lineHeight: {
    tight: 'leading-tight',   // 1.25
    normal: 'leading-normal', // 1.5
    relaxed: 'leading-relaxed', // 1.75
  },
  
  // تباعد الأحرف
  letterSpacing: {
    tight: 'tracking-tight',   // -0.025em
    normal: 'tracking-normal', // 0
    wide: 'tracking-wide',     // 0.025em
  },
}

// ========================================
// Color System - نظام الألوان
// ========================================

export const colors = {
  // الألوان الأساسية
  primary: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    text: 'text-blue-600',
    textDark: 'text-blue-700',
  },
  
  // ألوان الحالات
  success: {
    bg: 'bg-green-50',
    bgSolid: 'bg-green-500',
    text: 'text-green-600',
    textDark: 'text-green-700',
    border: 'border-green-200',
  },
  
  warning: {
    bg: 'bg-yellow-50',
    bgSolid: 'bg-yellow-500',
    text: 'text-yellow-600',
    textDark: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  
  error: {
    bg: 'bg-red-50',
    bgSolid: 'bg-red-500',
    text: 'text-red-600',
    textDark: 'text-red-700',
    border: 'border-red-200',
  },
  
  info: {
    bg: 'bg-blue-50',
    bgSolid: 'bg-blue-500',
    text: 'text-blue-600',
    textDark: 'text-blue-700',
    border: 'border-blue-200',
  },
  
  // ألوان محايدة
  neutral: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
  },
  
  // تدرجات للبطاقات
  gradients: {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
    green: 'bg-gradient-to-br from-green-500 to-green-700',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-700',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-700',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    pink: 'bg-gradient-to-br from-pink-500 to-pink-700',
  },
}

// ========================================
// Spacing System - نظام المسافات
// ========================================

export const spacing = {
  // Padding
  padding: {
    xs: 'p-2',   // 8px
    sm: 'p-3',   // 12px
    md: 'p-4',   // 16px
    lg: 'p-6',   // 24px
    xl: 'p-8',   // 32px
    '2xl': 'p-12', // 48px
  },
  
  // Margin
  margin: {
    xs: 'm-2',
    sm: 'm-3',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },
  
  // Gap (للشبكات)
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
  
  // Space between
  space: {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
}

// ========================================
// Border & Shadow System - الحدود والظلال
// ========================================

export const borders = {
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  
  width: {
    default: 'border',
    2: 'border-2',
    4: 'border-4',
  },
}

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
}

// ========================================
// Component Styles - أنماط المكونات
// ========================================

export const components = {
  // البطاقات
  card: {
    base: 'bg-white rounded-lg border border-gray-200 overflow-hidden',
    hover: 'hover:shadow-lg transition-shadow duration-300',
    padding: 'p-6',
  },
  
  // بطاقات الإحصائيات
  statCard: {
    base: 'p-4 rounded-lg text-white',
    title: 'text-sm opacity-90 mb-1 font-medium',
    value: 'text-2xl font-bold',
  },
  
  // الأزرار
  button: {
    base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200',
    sizes: {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-11 px-6 text-lg',
    },
  },
  
  // الشارات
  badge: {
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
    variants: {
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
      neutral: 'bg-gray-100 text-gray-700',
    },
  },
  
  // الأيقونات
  icon: {
    sizes: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-10 w-10',
    },
  },
}

// ========================================
// Grid System - نظام الشبكات
// ========================================

export const grid = {
  // شبكات الصفحات الرئيسية
  stats: 'grid gap-6 md:grid-cols-2 lg:grid-cols-4',
  cards: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
  full: 'grid gap-6 grid-cols-1',
  
  // شبكات التفاصيل
  details: 'grid gap-6 md:grid-cols-2',
  info: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
}

// ========================================
// Animation & Transitions - الحركات والانتقالات
// ========================================

export const animations = {
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },
  
  hover: {
    scale: 'hover:scale-105',
    shadow: 'hover:shadow-lg',
    opacity: 'hover:opacity-80',
  },
}

// ========================================
// Helper Functions - دوال مساعدة
// ========================================

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-EG').format(num)
}

