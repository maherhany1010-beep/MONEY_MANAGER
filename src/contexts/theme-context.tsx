'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

// نوع الثيم المحفوظ (يشمل system)
type ThemePreference = 'light' | 'dark' | 'system'
// نوع الثيم الفعلي المطبق
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  toggleTheme: () => void
  setTheme: (theme: ThemePreference) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// دالة لحساب الثيم الفعلي بناءً على تفضيل النظام
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// دالة لتطبيق الثيم على DOM - تعمل فوراً
const applyThemeToDOM = (resolvedTheme: ResolvedTheme) => {
  const root = document.documentElement

  // إزالة كلا الكلاسين أولاً
  root.classList.remove('light', 'dark')

  // تطبيق الثيم الجديد
  root.classList.add(resolvedTheme)
  root.setAttribute('data-theme', resolvedTheme)

  // تحديث لون الخلفية فوراً لمنع الوميض
  if (resolvedTheme === 'dark') {
    root.style.colorScheme = 'dark'
    root.style.backgroundColor = '#0f172a'
  } else {
    root.style.colorScheme = 'light'
    root.style.backgroundColor = '#f8fafc'
  }
}

// دالة للحصول على الثيم المحفوظ
const getSavedTheme = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system'

  const savedTheme = localStorage.getItem('theme') as ThemePreference | null
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    return savedTheme
  }

  return 'system'
}

// دالة لحساب الثيم الفعلي
const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === 'system') {
    return getSystemTheme()
  }
  return preference
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [mounted, setMounted] = useState(false)

  // تحميل الثيم عند بدء التشغيل
  useEffect(() => {
    const savedTheme = getSavedTheme()
    const resolved = resolveTheme(savedTheme)
    setThemeState(savedTheme)
    setResolvedTheme(resolved)
    applyThemeToDOM(resolved)
    setMounted(true)
  }, [])

  // الاستماع لتغييرات تفضيل النظام (مهم عندما يكون الثيم 'system')
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      // فقط نحدث إذا كان الثيم المحفوظ هو 'system'
      const savedTheme = localStorage.getItem('theme') as ThemePreference | null
      if (!savedTheme || savedTheme === 'system') {
        const newResolved = getSystemTheme()
        setResolvedTheme(newResolved)
        applyThemeToDOM(newResolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)
    applyThemeToDOM(resolved)
  }, [])

  const toggleTheme = useCallback(() => {
    // عند التبديل، نتبدل بين light و dark (نخرج من وضع system)
    const newTheme: ThemePreference = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [resolvedTheme, setTheme])

  // عرض المحتوى مباشرة بدون div إضافي
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

