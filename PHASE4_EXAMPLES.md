# 📚 أمثلة الاستخدام - المرحلة الرابعة

## 1️⃣ Export/Import

### تصدير البيانات

```typescript
'use client'

import { ExportDialog } from '@/components/export-import-dialog'
import { Button } from '@/components/ui/button'

function MyPage() {
  const data = [
    { id: 1, name: 'بطاقة الراجحي', balance: 5000 },
    { id: 2, name: 'بطاقة الأهلي', balance: 3000 },
  ]

  // تصدير بسيط
  return (
    <ExportDialog
      data={data}
      filename="البطاقات"
      title="قائمة البطاقات"
    />
  )
}

// تصدير مع أعمدة مخصصة
function AdvancedExport() {
  const columns = [
    { header: 'الاسم', dataKey: 'name' },
    { header: 'الرصيد', dataKey: 'balance' },
  ]

  return (
    <ExportDialog
      data={data}
      filename="البطاقات"
      title="قائمة البطاقات"
      columns={columns}
      trigger={
        <Button variant="outline">
          تصدير البيانات
        </Button>
      }
    />
  )
}
```

### استيراد البيانات

```typescript
import { ImportDialog } from '@/components/export-import-dialog'

function MyPage() {
  const handleImport = (importedData: any[]) => {
    console.log('تم استيراد:', importedData)
    // معالجة البيانات المستوردة
  }

  return (
    <ImportDialog
      onImport={handleImport}
      acceptedFormats={['excel', 'csv', 'json']}
      title="استيراد البطاقات"
      description="اختر ملف Excel أو CSV أو JSON"
    />
  )
}
```

### استخدام الدوال مباشرة

```typescript
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  importFromExcel,
} from '@/lib/export'

// تصدير إلى Excel
function handleExportExcel() {
  exportToExcel(data, 'البطاقات')
}

// تصدير إلى CSV
function handleExportCSV() {
  exportToCSV(data, 'البطاقات')
}

// تصدير إلى PDF
function handleExportPDF() {
  exportToPDF(data, 'البطاقات', {
    title: 'قائمة البطاقات الائتمانية',
    columns: [
      { header: 'الاسم', dataKey: 'name' },
      { header: 'الرصيد', dataKey: 'balance' },
    ],
    orientation: 'landscape',
  })
}

// استيراد من Excel
async function handleImport(file: File) {
  try {
    const data = await importFromExcel(file)
    console.log('البيانات المستوردة:', data)
  } catch (error) {
    console.error('فشل الاستيراد:', error)
  }
}
```

---

## 2️⃣ Bulk Actions

### الاستخدام الأساسي

```typescript
'use client'

import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { BulkActionsBar } from '@/components/bulk-actions-bar'
import { Checkbox } from '@/components/ui/checkbox'

function MyPage() {
  const items = [
    { id: '1', name: 'عنصر 1' },
    { id: '2', name: 'عنصر 2' },
    { id: '3', name: 'عنصر 3' },
  ]

  const selection = useBulkSelection(items)

  const bulkActions = [
    {
      id: 'delete',
      label: 'حذف',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: () => {
        const selected = selection.getSelectedData()
        console.log('حذف:', selected)
        selection.clearSelection()
      },
    },
    {
      id: 'export',
      label: 'تصدير',
      icon: Download,
      onClick: () => {
        const selected = selection.getSelectedData()
        exportToExcel(selected, 'العناصر المحددة')
      },
    },
  ]

  return (
    <div>
      {/* Select All Checkbox */}
      <Checkbox
        checked={selection.isAllSelected}
        onCheckedChange={selection.toggleAll}
      />

      {/* Items List */}
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox
            checked={selection.isSelected(item.id)}
            onCheckedChange={() => selection.toggleItem(item.id)}
          />
          <span>{item.name}</span>
        </div>
      ))}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selection.selectedCount}
        onClear={selection.clearSelection}
        actions={bulkActions}
      />
    </div>
  )
}
```

### مع Undo/Redo

```typescript
import { useBulkSelectionWithHistory } from '@/hooks/use-bulk-selection'

function AdvancedBulkSelection() {
  const selection = useBulkSelectionWithHistory(items)

  return (
    <div>
      {/* ... */}
      
      <Button
        onClick={selection.undo}
        disabled={!selection.canUndo}
      >
        تراجع
      </Button>
      
      <Button
        onClick={selection.redo}
        disabled={!selection.canRedo}
      >
        إعادة
      </Button>
    </div>
  )
}
```

### مع الفلاتر

```typescript
import { useBulkSelectionWithFilters } from '@/hooks/use-bulk-selection'

function FilteredBulkSelection() {
  const filters = {
    active: (item: Item) => item.status === 'active',
    highValue: (item: Item) => item.value > 1000,
  }

  const selection = useBulkSelectionWithFilters(items, filters)

  return (
    <div>
      <Button onClick={() => selection.selectByFilter('active')}>
        تحديد النشطة فقط
      </Button>
      
      <Button onClick={() => selection.selectByFilter('highValue')}>
        تحديد القيمة العالية
      </Button>
    </div>
  )
}
```

---

## 3️⃣ Quick Actions Menu

### قائمة منسدلة

```typescript
import { QuickActionsMenu, commonQuickActions } from '@/components/quick-actions-menu'

function ItemCard({ item }: { item: Item }) {
  const actions = [
    commonQuickActions.view(() => console.log('عرض', item)),
    commonQuickActions.edit(() => console.log('تعديل', item)),
    commonQuickActions.duplicate(() => console.log('نسخ', item)),
    commonQuickActions.delete(() => console.log('حذف', item)),
  ]

  return (
    <div className="flex items-center justify-between">
      <span>{item.name}</span>
      <QuickActionsMenu actions={actions} />
    </div>
  )
}
```

### Floating Action Button

```typescript
import { FloatingActionButton } from '@/components/quick-actions-menu'

function MyPage() {
  const actions = [
    {
      id: 'add',
      label: 'إضافة',
      icon: Plus,
      onClick: () => console.log('إضافة'),
    },
    {
      id: 'search',
      label: 'بحث',
      icon: Search,
      onClick: () => console.log('بحث'),
    },
  ]

  return (
    <div>
      {/* محتوى الصفحة */}
      <FloatingActionButton actions={actions} />
    </div>
  )
}
```

### Context Menu (Right-click)

```typescript
import { ContextMenu } from '@/components/quick-actions-menu'

function ItemCard({ item }: { item: Item }) {
  const actions = [
    {
      id: 'copy',
      label: 'نسخ',
      icon: Copy,
      onClick: () => navigator.clipboard.writeText(item.name),
      shortcut: 'Ctrl+C',
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: Trash2,
      onClick: () => console.log('حذف'),
      variant: 'destructive' as const,
      shortcut: 'Del',
    },
  ]

  return (
    <ContextMenu actions={actions}>
      <div className="p-4 border rounded">
        {item.name}
      </div>
    </ContextMenu>
  )
}
```

---

## 4️⃣ Smart Insights & Analytics

### توليد الرؤى

```typescript
import {
  generateSpendingInsights,
  generatePaymentInsights,
  generateCashbackInsights,
} from '@/lib/analytics'

function DashboardPage() {
  // رؤى الإنفاق
  const spendingInsights = generateSpendingInsights(
    5000, // الشهر الحالي
    4000, // الشهر السابق
    4500, // المتوسط
    6000  // الميزانية
  )

  // رؤى الدفع
  const paymentInsights = generatePaymentInsights(
    new Date('2024-01-15'), // تاريخ الاستحقاق
    500,  // الحد الأدنى للدفع
    5000, // الرصيد الكلي
    new Date('2023-12-15') // آخر دفعة
  )

  // رؤى الكاش باك
  const cashbackInsights = generateCashbackInsights(
    150,  // الكاش باك الحالي
    200,  // الكاش باك المحتمل
    {
      'مطاعم': 50,
      'وقود': 40,
      'تسوق': 60,
    }
  )

  return (
    <div>
      <InsightsPanel insights={spendingInsights} title="رؤى الإنفاق" />
      <InsightsPanel insights={paymentInsights} title="رؤى الدفع" />
      <InsightsPanel insights={cashbackInsights} title="رؤى الكاش باك" />
    </div>
  )
}
```

### عرض الرؤى

```typescript
import { InsightsPanel, CompactInsightsList } from '@/components/insights-panel'

// لوحة كاملة
function FullInsights() {
  return (
    <InsightsPanel
      insights={insights}
      title="الرؤى الذكية"
      onDismiss={(id) => console.log('إخفاء:', id)}
    />
  )
}

// قائمة مختصرة
function CompactInsights() {
  return (
    <CompactInsightsList
      insights={insights}
      maxItems={3}
    />
  )
}
```

### التحليلات المتقدمة

```typescript
import {
  calculateStats,
  calculateTrend,
  detectAnomalies,
  predictNextValue,
} from '@/lib/analytics'

function AdvancedAnalytics() {
  const data = [100, 120, 115, 130, 125, 140, 135]

  // إحصائيات
  const stats = calculateStats(data)
  console.log('المتوسط:', stats.average)
  console.log('الوسيط:', stats.median)
  console.log('الانحراف المعياري:', stats.standardDeviation)

  // الاتجاه
  const trend = calculateTrend(data)
  console.log('الاتجاه:', trend) // 'up', 'down', or 'stable'

  // كشف الشذوذ
  const anomalies = detectAnomalies(data)
  console.log('الشذوذ في المواضع:', anomalies)

  // التنبؤ
  const prediction = predictNextValue(data)
  console.log('القيمة المتوقعة التالية:', prediction)
}
```

---

## 🎯 مثال شامل: صفحة مع جميع الميزات

```typescript
'use client'

import { useState } from 'react'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { ExportDialog, ImportDialog } from '@/components/export-import-dialog'
import { BulkActionsBar } from '@/components/bulk-actions-bar'
import { QuickActionsMenu } from '@/components/quick-actions-menu'
import { InsightsPanel } from '@/components/insights-panel'
import { generateSpendingInsights } from '@/lib/analytics'

export default function ComprehensivePage() {
  const [items, setItems] = useState([
    { id: '1', name: 'بطاقة الراجحي', balance: 5000, spending: 3000 },
    { id: '2', name: 'بطاقة الأهلي', balance: 3000, spending: 2000 },
  ])

  const selection = useBulkSelection(items)

  // Generate insights
  const insights = generateSpendingInsights(
    items.reduce((sum, item) => sum + item.spending, 0),
    2500,
    2800,
    5000
  )

  // Bulk actions
  const bulkActions = [
    {
      id: 'export',
      label: 'تصدير المحدد',
      icon: Download,
      onClick: () => {
        const selected = selection.getSelectedData()
        exportToExcel(selected, 'البطاقات المحددة')
      },
    },
    {
      id: 'delete',
      label: 'حذف المحدد',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: () => {
        const selectedIds = Array.from(selection.selectedItems)
        setItems(items.filter(item => !selectedIds.includes(item.id)))
        selection.clearSelection()
      },
    },
  ]

  // Quick actions for each item
  const getItemActions = (item: typeof items[0]) => [
    {
      id: 'view',
      label: 'عرض',
      icon: Eye,
      onClick: () => console.log('عرض', item),
    },
    {
      id: 'edit',
      label: 'تعديل',
      icon: Edit,
      onClick: () => console.log('تعديل', item),
    },
    {
      id: 'delete',
      label: 'حذف',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: () => setItems(items.filter(i => i.id !== item.id)),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Insights */}
      <InsightsPanel insights={insights} />

      {/* Actions Bar */}
      <div className="flex gap-2">
        <ExportDialog data={items} filename="البطاقات" />
        <ImportDialog onImport={(data) => setItems([...items, ...data])} />
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
            <Checkbox
              checked={selection.isSelected(item.id)}
              onCheckedChange={() => selection.toggleItem(item.id)}
            />
            <div className="flex-1">
              <h3>{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                الرصيد: {item.balance.toLocaleString('ar-SA')} ريال
              </p>
            </div>
            <QuickActionsMenu actions={getItemActions(item)} />
          </div>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selection.selectedCount}
        onClear={selection.clearSelection}
        actions={bulkActions}
      />
    </div>
  )
}
```

---

## 💡 نصائح الاستخدام

### Export/Import:
- استخدم Excel للبيانات المعقدة
- استخدم CSV للبيانات البسيطة
- استخدم PDF للتقارير والطباعة
- استخدم JSON للنسخ الاحتياطي

### Bulk Actions:
- استخدم `useBulkSelection` للحالات البسيطة
- استخدم `useBulkSelectionWithHistory` إذا كنت تحتاج Undo/Redo
- استخدم `useBulkSelectionWithFilters` للتحديد المتقدم

### Quick Actions:
- استخدم `QuickActionsMenu` للقوائم المنسدلة
- استخدم `FloatingActionButton` للإجراءات الرئيسية
- استخدم `ContextMenu` للإجراءات السياقية

### Smart Insights:
- استخدم `generateSpendingInsights` لتحليل الإنفاق
- استخدم `generatePaymentInsights` لتذكيرات الدفع
- استخدم `generateCashbackInsights` لتحسين الكاش باك
- استخدم `calculateStats` للإحصائيات المتقدمة

---

**تم إنشاء هذا الملف في**: المرحلة الرابعة - الميزات الإضافية

