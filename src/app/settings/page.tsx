'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useSettings } from '@/contexts/settings-context'
import { useTheme } from '@/contexts/theme-context'
import {
  Settings as SettingsIcon,
  Bell,
  Download,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Globe,
  AlertTriangle,
  Shield,
  Lock,
  Fingerprint,
  EyeOff,
  Info,
  HelpCircle,
  FileText,
  ExternalLink,
  Database
} from 'lucide-react'

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, exportData, importData, clearAllData } = useSettings()
  const { theme, setTheme } = useTheme()
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // حفظ الإعدادات
  const handleSave = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // تصدير البيانات
  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // استيراد البيانات
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const success = importData(content)
        if (success) {
          alert('تم استيراد البيانات بنجاح! سيتم إعادة تحميل الصفحة.')
        } else {
          alert('فشل استيراد البيانات. تأكد من صحة الملف.')
        }
      }
      reader.readAsText(file)
    }
  }

  // حساب حجم البيانات المخزنة
  const getStorageSize = () => {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return (total / 1024).toFixed(2) // KB
  }

  // حساب عدد المعاملات
  const getTotalTransactions = () => {
    try {
      const cards = JSON.parse(localStorage.getItem('creditCards') || '[]')
      return cards.reduce((total: number, card: any) => total + (card.transactions?.length || 0), 0)
    } catch {
      return 0
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="الإعدادات"
        description="إدارة الإعدادات العامة للتطبيق"
      />

      {showSuccess && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <Save className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm sm:text-base text-green-800 dark:text-green-200">تم حفظ الإعدادات بنجاح ✅</p>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* القسم 2: الإعدادات العامة */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>الإعدادات العامة</CardTitle>
            </div>
            <CardDescription>إعدادات النظام الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* اسم الشركة */}
            <div className="space-y-2">
              <Label htmlFor="companyName">اسم الشركة/المستخدم</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => updateSettings({ companyName: e.target.value })}
                placeholder="أدخل اسم الشركة"
              />
            </div>

            {/* العملة الافتراضية */}
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">العملة الافتراضية</Label>
              <Select
                value={settings.defaultCurrency}
                onValueChange={(value: 'EGP' | 'USD' | 'EUR') => updateSettings({ defaultCurrency: value })}
              >
                <SelectTrigger id="defaultCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* سعر الصرف الافتراضي */}
            <div className="space-y-2">
              <Label htmlFor="defaultExchangeRate">سعر الصرف الافتراضي (USD إلى EGP)</Label>
              <Input
                id="defaultExchangeRate"
                type="number"
                step="0.01"
                value={settings.defaultExchangeRate}
                onChange={(e) => updateSettings({ defaultExchangeRate: parseFloat(e.target.value) || 0 })}
                placeholder="48.50"
              />
              <p className="text-sm text-muted-foreground">
                💡 يُستخدم هذا السعر كقيمة افتراضية عند إضافة استثمارات جديدة
              </p>
            </div>




            {/* المظهر */}
            <div className="space-y-2">
              <Label htmlFor="theme">المظهر</Label>
              <Select
                value={theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => {
                  setTheme(value)
                  // مزامنة مع الإعدادات للحفاظ على التناسق
                  updateSettings({ theme: value })
                }}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      فاتح
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      داكن
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      تلقائي (حسب النظام)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* تنسيق التاريخ */}
            <div className="space-y-2">
              <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value: 'gregorian' | 'hijri') => updateSettings({ dateFormat: value })}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gregorian">ميلادي</SelectItem>
                  <SelectItem value="hijri">هجري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
              <Button onClick={resetSettings} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                استعادة الافتراضي
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* القسم 3: إعدادات الإشعارات */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <CardTitle>إعدادات الإشعارات</CardTitle>
            </div>
            <CardDescription>تحكم في الإشعارات والتنبيهات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* تفعيل الإشعارات */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل الإشعارات</Label>
                <p className="text-sm text-muted-foreground">تفعيل/تعطيل جميع الإشعارات</p>
              </div>
              <Switch
                checked={settings.notifications.enabled}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, enabled: checked }
                  })
                }
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">أنواع الإشعارات</h3>

              {/* إشعارات الأقساط */}
              <div className="flex items-center justify-between">
                <Label>إشعارات الأقساط المستحقة</Label>
                <Switch
                  checked={settings.notifications.installmentsDue}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: { ...settings.notifications, installmentsDue: checked }
                    })
                  }
                  disabled={!settings.notifications.enabled}
                />
              </div>

              {/* إشعارات الجمعيات */}
              <div className="flex items-center justify-between">
                <Label>إشعارات الجمعيات</Label>
                <Switch
                  checked={settings.notifications.savingsCircles}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: { ...settings.notifications, savingsCircles: checked }
                    })
                  }
                  disabled={!settings.notifications.enabled}
                />
              </div>

              {/* إشعارات الرصيد المنخفض */}
              <div className="flex items-center justify-between">
                <Label>إشعارات الرصيد المنخفض</Label>
                <Switch
                  checked={settings.notifications.lowBalance}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: { ...settings.notifications, lowBalance: checked }
                    })
                  }
                  disabled={!settings.notifications.enabled}
                />
              </div>

              {/* إشعارات الاستثمارات */}
              <div className="flex items-center justify-between">
                <Label>إشعارات الاستثمارات</Label>
                <Switch
                  checked={settings.notifications.investments}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: { ...settings.notifications, investments: checked }
                    })
                  }
                  disabled={!settings.notifications.enabled}
                />
              </div>
            </div>

            {/* رابط للإعدادات المتقدمة */}
            <div className="pt-4 border-t">
              <Link href="/notifications">
                <Button variant="outline" className="gap-2 w-full">
                  <Bell className="h-4 w-4" />
                  إعدادات الإشعارات المتقدمة
                  <ExternalLink className="h-3 w-3 mr-auto" />
                </Button>
              </Link>
            </div>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>


        {/* القسم 4: إعدادات الأمان */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle>إعدادات الأمان</CardTitle>
            </div>
            <CardDescription>حماية بياناتك وخصوصيتك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* تفعيل رمز PIN */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <Label>تفعيل رمز PIN</Label>
                </div>
                <p className="text-sm text-muted-foreground">حماية التطبيق برمز PIN</p>
              </div>
              <Switch
                checked={settings.security.pinEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({
                    security: { ...settings.security, pinEnabled: checked }
                  })
                }
              />
            </div>

            {/* تفعيل البصمة */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-green-600" />
                  <Label>تفعيل البصمة/Face ID</Label>
                </div>
                <p className="text-sm text-muted-foreground">استخدام البصمة أو التعرف على الوجه</p>
              </div>
              <Switch
                checked={settings.security.biometricEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({
                    security: { ...settings.security, biometricEnabled: checked }
                  })
                }
              />
            </div>

            {/* القفل التلقائي */}
            <div className="space-y-2">
              <Label htmlFor="autoLock">القفل التلقائي بعد</Label>
              <Select
                value={settings.security.autoLockMinutes.toString()}
                onValueChange={(value) =>
                  updateSettings({
                    security: { ...settings.security, autoLockMinutes: parseInt(value) }
                  })
                }
              >
                <SelectTrigger id="autoLock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">أبداً</SelectItem>
                  <SelectItem value="1">1 دقيقة</SelectItem>
                  <SelectItem value="5">5 دقائق</SelectItem>
                  <SelectItem value="15">15 دقيقة</SelectItem>
                  <SelectItem value="30">30 دقيقة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* إخفاء الأرصدة */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-green-600" />
                  <Label>إخفاء الأرصدة</Label>
                </div>
                <p className="text-sm text-muted-foreground">إخفاء الأرصدة عند عدم الاستخدام</p>
              </div>
              <Switch
                checked={settings.security.hideBalances}
                onCheckedChange={(checked) =>
                  updateSettings({
                    security: { ...settings.security, hideBalances: checked }
                  })
                }
              />
            </div>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>

        {/* القسم 5: النسخ الاحتياطي والبيانات */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <CardTitle>النسخ الاحتياطي والبيانات</CardTitle>
            </div>
            <CardDescription>إدارة البيانات والنسخ الاحتياطي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* النسخ الاحتياطي التلقائي */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>النسخ الاحتياطي التلقائي</Label>
                <p className="text-sm text-muted-foreground">حفظ نسخة احتياطية تلقائياً كل يوم</p>
              </div>
              <Switch
                checked={settings.backup.autoBackupEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({
                    backup: { ...settings.backup, autoBackupEnabled: checked }
                  })
                }
              />
            </div>

            {/* تصدير البيانات */}
            <div className="space-y-2">
              <Label>تصدير البيانات</Label>
              <p className="text-sm text-muted-foreground mb-2">
                تصدير جميع البيانات إلى ملف JSON
              </p>
              <Button onClick={handleExport} variant="outline" className="gap-2 w-full">
                <Download className="h-4 w-4" />
                تصدير البيانات (JSON)
              </Button>
            </div>

            {/* استيراد البيانات */}
            <div className="space-y-2">
              <Label>استيراد البيانات</Label>
              <p className="text-sm text-muted-foreground mb-2">
                استيراد البيانات من ملف JSON
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2 w-full"
              >
                <Upload className="h-4 w-4" />
                استيراد البيانات
              </Button>
            </div>


            {/* مسح جميع البيانات */}
            <div className="space-y-2 pt-4 border-t border-red-200 dark:border-red-800">
              <Label className="text-red-600 dark:text-red-400">مسح جميع البيانات</Label>
              <p className="text-sm text-muted-foreground mb-2">
                ⚠️ تحذير: سيتم حذف جميع البيانات بشكل نهائي ولا يمكن التراجع عن هذا الإجراء
              </p>
              <Button
                onClick={() => {
                  if (confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
                    clearAllData()
                    alert('تم حذف جميع البيانات بنجاح')
                    window.location.reload()
                  }
                }}
                variant="destructive"
                className="gap-2 w-full"
              >
                <Trash2 className="h-4 w-4" />
                مسح جميع البيانات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* القسم 6: معلومات التطبيق */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <CardTitle>معلومات التطبيق</CardTitle>
            </div>
            <CardDescription>معلومات عن التطبيق والبيانات المخزنة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* رقم الإصدار */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">رقم الإصدار</span>
              <Badge variant="outline">2.0.0</Badge>
            </div>

            {/* آخر تحديث */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">آخر تحديث</span>
              <span className="text-sm text-muted-foreground">2025-10-11</span>
            </div>

            {/* حجم البيانات */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">حجم البيانات المخزنة</span>
              <Badge variant="secondary">{getStorageSize()} KB</Badge>
            </div>

            {/* عدد المعاملات */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">عدد المعاملات الإجمالي</span>
              <Badge variant="secondary">{getTotalTransactions()}</Badge>
            </div>

            {/* روابط المساعدة */}
            <div className="pt-4 space-y-2">
              <h4 className="font-semibold mb-3">المساعدة والدعم</h4>

              <Button variant="outline" className="gap-2 w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-4 w-4" />
                  مركز المساعدة
                  <ExternalLink className="h-3 w-3 mr-auto" />
                </a>
              </Button>

              <Button variant="outline" className="gap-2 w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  سياسة الخصوصية
                  <ExternalLink className="h-3 w-3 mr-auto" />
                </a>
              </Button>

              <Button variant="outline" className="gap-2 w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  شروط الاستخدام
                  <ExternalLink className="h-3 w-3 mr-auto" />
                </a>
              </Button>
            </div>

            {/* معلومات إضافية */}
            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                © 2025 نظام إدارة البطاقات الائتمانية. جميع الحقوق محفوظة.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
