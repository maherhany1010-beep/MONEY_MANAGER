import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: () => void
  description?: string
}

/**
 * Hook for registering keyboard shortcuts
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  const { key, ctrl, shift, alt, meta, callback } = shortcut

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if all modifiers match
      const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey
      const altMatch = alt ? event.altKey : !event.altKey
      const metaMatch = meta ? event.metaKey : true

      // Check if key matches (case insensitive)
      const keyMatch = event.key.toLowerCase() === key.toLowerCase()

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, ctrl, shift, alt, meta, callback])
}

/**
 * Hook for registering multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const { key, ctrl, shift, alt, meta, callback } = shortcut

        // Skip if key is not defined
        if (!key) continue

        // Check if all modifiers match
        const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey
        const altMatch = alt ? event.altKey : !event.altKey
        const metaMatch = meta ? event.metaKey : true

        // Check if key matches (case insensitive)
        const keyMatch = event.key?.toLowerCase() === key.toLowerCase()

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault()
          callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

/**
 * Common keyboard shortcuts
 */
export const commonShortcuts = {
  // Navigation
  goToHome: { key: 'h', ctrl: true, description: 'الذهاب إلى لوحة التحكم' },
  goToAccounts: { key: 'a', ctrl: true, description: 'الذهاب إلى مركز الحسابات' },
  goToSettings: { key: ',', ctrl: true, description: 'الذهاب إلى الإعدادات' },
  
  // Actions
  newItem: { key: 'n', ctrl: true, description: 'إضافة عنصر جديد' },
  save: { key: 's', ctrl: true, description: 'حفظ' },
  cancel: { key: 'Escape', description: 'إلغاء' },
  search: { key: 'f', ctrl: true, description: 'بحث' },
  refresh: { key: 'r', ctrl: true, description: 'تحديث' },
  
  // UI
  toggleTheme: { key: 't', ctrl: true, description: 'تبديل الوضع الفاتح/الداكن' },
  toggleSidebar: { key: 'b', ctrl: true, description: 'إظهار/إخفاء القائمة الجانبية' },
  commandPalette: { key: 'k', ctrl: true, description: 'فتح قائمة الأوامر' },
  
  // Editing
  undo: { key: 'z', ctrl: true, description: 'تراجع' },
  redo: { key: 'y', ctrl: true, description: 'إعادة' },
  copy: { key: 'c', ctrl: true, description: 'نسخ' },
  paste: { key: 'v', ctrl: true, description: 'لصق' },
  cut: { key: 'x', ctrl: true, description: 'قص' },
  
  // Selection
  selectAll: { key: 'a', ctrl: true, shift: true, description: 'تحديد الكل' },
  
  // Help
  showHelp: { key: '?', shift: true, description: 'عرض المساعدة' },
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Partial<KeyboardShortcut>): string {
  const parts: string[] = []
  
  if (shortcut.ctrl || shortcut.meta) {
    parts.push('Ctrl')
  }
  if (shortcut.shift) {
    parts.push('Shift')
  }
  if (shortcut.alt) {
    parts.push('Alt')
  }
  if (shortcut.key) {
    parts.push(shortcut.key.toUpperCase())
  }
  
  return parts.join('+')
}

/**
 * Check if user is typing in an input field
 */
export function isTyping(): boolean {
  const activeElement = document.activeElement
  const tagName = activeElement?.tagName.toLowerCase()
  
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    (activeElement as HTMLElement)?.isContentEditable === true
  )
}

/**
 * Hook for keyboard shortcuts that should not trigger while typing
 */
export function useKeyboardShortcutSafe(shortcut: KeyboardShortcut) {
  const safeCallback = useCallback(() => {
    if (!isTyping()) {
      shortcut.callback()
    }
  }, [shortcut])

  useKeyboardShortcut({
    ...shortcut,
    callback: safeCallback,
  })
}

/**
 * Hook for multiple keyboard shortcuts that should not trigger while typing
 */
export function useKeyboardShortcutsSafe(shortcuts: KeyboardShortcut[]) {
  const safeShortcuts = shortcuts.map(shortcut => ({
    ...shortcut,
    callback: () => {
      if (!isTyping()) {
        shortcut.callback()
      }
    },
  }))

  useKeyboardShortcuts(safeShortcuts)
}

/**
 * Global keyboard shortcuts context
 */
export const globalShortcuts: Record<string, Partial<KeyboardShortcut>> = {
  // Navigation
  HOME: { key: 'h', ctrl: true, description: 'لوحة التحكم' },
  ACCOUNTS: { key: 'a', ctrl: true, shift: true, description: 'مركز الحسابات' },
  CARDS: { key: '1', ctrl: true, description: 'البطاقات الائتمانية' },
  PREPAID: { key: '2', ctrl: true, description: 'البطاقات مسبقة الدفع' },
  BANK: { key: '3', ctrl: true, description: 'الحسابات البنكية' },
  VAULTS: { key: '4', ctrl: true, description: 'الخزائن النقدية' },
  WALLETS: { key: '5', ctrl: true, description: 'المحافظ الإلكترونية' },
  POS: { key: '6', ctrl: true, description: 'ماكينات الدفع' },
  SETTINGS: { key: ',', ctrl: true, description: 'الإعدادات' },
  REPORTS: { key: 'r', ctrl: true, shift: true, description: 'التقارير' },
  
  // Actions
  NEW: { key: 'n', ctrl: true, description: 'جديد' },
  SAVE: { key: 's', ctrl: true, description: 'حفظ' },
  SEARCH: { key: 'f', ctrl: true, description: 'بحث' },
  REFRESH: { key: 'r', ctrl: true, description: 'تحديث' },
  
  // UI
  THEME: { key: 't', ctrl: true, description: 'تبديل الوضع' },
  COMMAND: { key: 'k', ctrl: true, description: 'قائمة الأوامر' },
  
  // Help
  HELP: { key: '?', shift: true, description: 'مساعدة' },
}

/**
 * Get shortcut display text
 */
export function getShortcutText(shortcutKey: keyof typeof globalShortcuts): string {
  const shortcut = globalShortcuts[shortcutKey]
  return formatShortcut(shortcut)
}

