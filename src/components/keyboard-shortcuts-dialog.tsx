'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { globalShortcuts, formatShortcut } from '@/hooks/use-keyboard-shortcuts'
import { Keyboard } from 'lucide-react'

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const shortcutGroups = {
    'التنقل': [
      { key: 'HOME', label: 'لوحة التحكم' },
      { key: 'ACCOUNTS', label: 'مركز الحسابات' },
      { key: 'CARDS', label: 'البطاقات الائتمانية' },
      { key: 'PREPAID', label: 'البطاقات مسبقة الدفع' },
      { key: 'BANK', label: 'الحسابات البنكية' },
      { key: 'VAULTS', label: 'الخزائن النقدية' },
      { key: 'WALLETS', label: 'المحافظ الإلكترونية' },
      { key: 'POS', label: 'ماكينات الدفع' },
      { key: 'SETTINGS', label: 'الإعدادات' },
      { key: 'REPORTS', label: 'التقارير' },
    ],
    'الإجراءات': [
      { key: 'NEW', label: 'إضافة جديد' },
      { key: 'SAVE', label: 'حفظ' },
      { key: 'SEARCH', label: 'بحث' },
      { key: 'REFRESH', label: 'تحديث' },
    ],
    'الواجهة': [
      { key: 'THEME', label: 'تبديل الوضع الفاتح/الداكن' },
      { key: 'COMMAND', label: 'فتح قائمة الأوامر' },
    ],
    'المساعدة': [
      { key: 'HELP', label: 'عرض الاختصارات' },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            اختصارات لوحة المفاتيح
          </DialogTitle>
          <DialogDescription>
            استخدم هذه الاختصارات للتنقل والعمل بشكل أسرع في التطبيق
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(shortcutGroups).map(([groupName, shortcuts]) => (
            <div key={groupName}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {groupName}
              </h3>
              <div className="space-y-2">
                {shortcuts.map(({ key, label }) => {
                  const shortcut = globalShortcuts[key as keyof typeof globalShortcuts]
                  if (!shortcut) return null

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{label}</span>
                      <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 font-mono text-xs font-medium text-muted-foreground">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 نصيحة:</p>
          <ul className="space-y-1 mr-4">
            <li>• اضغط <kbd className="px-1.5 py-0.5 rounded bg-background">Ctrl+K</kbd> لفتح قائمة الأوامر السريعة</li>
            <li>• اضغط <kbd className="px-1.5 py-0.5 rounded bg-background">?</kbd> في أي وقت لعرض هذه القائمة</li>
            <li>• على Mac، استخدم <kbd className="px-1.5 py-0.5 rounded bg-background">⌘</kbd> بدلاً من <kbd className="px-1.5 py-0.5 rounded bg-background">Ctrl</kbd></li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

