'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface AppSettings {
  // الإعدادات العامة
  companyName: string
  defaultCurrency: 'EGP' | 'USD' | 'EUR'
  defaultExchangeRate: number
  language: 'ar' | 'en'
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'gregorian' | 'hijri'
  numberFormat: {
    decimalSeparator: '.' | ','
    thousandsSeparator: ',' | '.' | ' '
    decimalPlaces: number
  }

  // إعدادات الإشعارات
  notifications: {
    enabled: boolean
    installmentsDue: boolean
    savingsCircles: boolean
    lowBalance: boolean
    investments: boolean
    inventory: boolean
    customers: boolean
  }

  // إعدادات العرض
  display: {
    itemsPerPage: number
    showStatistics: boolean
    compactMode: boolean
  }

  // إعدادات الأمان
  security: {
    pinEnabled: boolean
    biometricEnabled: boolean
    autoLockMinutes: number
    hideBalances: boolean
  }

  // إعدادات النسخ الاحتياطي
  backup: {
    autoBackupEnabled: boolean
  }

  // إعدادات التنبيهات
  alerts: {
    lowBalanceThreshold: number
    priceChangeThreshold: number // نسبة مئوية
    inventoryLowStockThreshold: number
  }
}

const defaultSettings: AppSettings = {
  companyName: 'نظام إدارة البطاقات الائتمانية',
  defaultCurrency: 'EGP',
  defaultExchangeRate: 48.5,
  language: 'ar',
  theme: 'system',
  dateFormat: 'gregorian',
  numberFormat: {
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
  },
  notifications: {
    enabled: true,
    installmentsDue: true,
    savingsCircles: true,
    lowBalance: true,
    investments: true,
    inventory: true,
    customers: true,
  },
  display: {
    itemsPerPage: 10,
    showStatistics: true,
    compactMode: false,
  },
  security: {
    pinEnabled: false,
    biometricEnabled: false,
    autoLockMinutes: 0, // 0 = never
    hideBalances: false,
  },
  backup: {
    autoBackupEnabled: false,
  },
  alerts: {
    lowBalanceThreshold: 1000,
    priceChangeThreshold: 5,
    inventoryLowStockThreshold: 10,
  },
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
  exportData: () => string
  importData: (data: string) => boolean
  clearAllData: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  // تحميل الإعدادات من localStorage عند بدء التطبيق
  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // حفظ الإعدادات في localStorage عند التغيير
  // ملاحظة: تطبيق الثيم يتم عبر ThemeContext فقط لتجنب التعارض
  useEffect(() => {
    if (typeof window === 'undefined') return

    localStorage.setItem('appSettings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings))
    }
  }

  const exportData = (): string => {
    if (typeof window === 'undefined') return '{}'

    const allData = {
      settings,
      bankAccounts: localStorage.getItem('bankAccounts'),
      eWallets: localStorage.getItem('eWallets'),
      cashVaults: localStorage.getItem('cashVaults'),
      posMachines: localStorage.getItem('posMachines'),
      prepaidCards: localStorage.getItem('prepaidCards'),
      investments: localStorage.getItem('investments'),
      customers: localStorage.getItem('customers'),
      savingsCircles: localStorage.getItem('savingsCircles'),
      products: localStorage.getItem('products'),
      sales: localStorage.getItem('sales'),
      centralTransfers: localStorage.getItem('centralTransfers'),
      reconciliations: localStorage.getItem('reconciliations'),
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(allData, null, 2)
  }

  const importData = (data: string): boolean => {
    if (typeof window === 'undefined') return false

    try {
      const parsed = JSON.parse(data)

      // استعادة الإعدادات
      if (parsed.settings) {
        setSettings({ ...defaultSettings, ...parsed.settings })
      }

      // استعادة البيانات الأخرى
      const dataKeys = [
        'bankAccounts', 'eWallets', 'cashVaults', 'posMachines', 'prepaidCards',
        'investments', 'customers', 'savingsCircles', 'products', 'sales',
        'centralTransfers', 'reconciliations'
      ]

      dataKeys.forEach(key => {
        if (parsed[key]) {
          localStorage.setItem(key, parsed[key])
        }
      })

      // إعادة تحميل الصفحة لتطبيق التغييرات
      window.location.reload()
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  const clearAllData = () => {
    if (typeof window === 'undefined') return

    const confirmClear = window.confirm(
      'هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!'
    )

    if (confirmClear) {
      const doubleConfirm = window.confirm(
        'تأكيد نهائي: سيتم حذف جميع البيانات بشكل دائم. هل تريد المتابعة؟'
      )

      if (doubleConfirm) {
        localStorage.clear()
        window.location.reload()
      }
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportData,
        importData,
        clearAllData,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

