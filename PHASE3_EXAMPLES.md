# 📚 أمثلة الاستخدام - المرحلة الثالثة

## 1️⃣ Command Palette

### الاستخدام الأساسي

Command Palette مضاف تلقائياً في `AppLayout` ويعمل بضغطة `Ctrl+K`:

```typescript
// تم إضافته تلقائياً في src/components/layout/app-layout.tsx
<CommandPalette
  open={commandPaletteOpen}
  onOpenChange={setCommandPaletteOpen}
/>
```

### الميزات:
- اضغط `Ctrl+K` أو `⌘K` لفتح القائمة
- ابحث عن أي صفحة أو أمر
- استخدم `↑` `↓` للتنقل
- اضغط `Enter` للاختيار
- اضغط `Esc` للإغلاق

---

## 2️⃣ Keyboard Shortcuts

### استخدام Hook واحد

```typescript
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcuts'

function MyComponent() {
  useKeyboardShortcut({
    key: 's',
    ctrl: true,
    callback: () => {
      console.log('حفظ!')
    },
    description: 'حفظ البيانات'
  })

  return <div>اضغط Ctrl+S للحفظ</div>
}
```

### استخدام عدة Shortcuts

```typescript
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

function MyComponent() {
  useKeyboardShortcuts([
    { key: 's', ctrl: true, callback: handleSave },
    { key: 'n', ctrl: true, callback: handleNew },
    { key: 'Escape', callback: handleCancel },
  ])

  return <div>...</div>
}
```

### استخدام Safe Shortcuts (لا تعمل أثناء الكتابة)

```typescript
import { useKeyboardShortcutsSafe } from '@/hooks/use-keyboard-shortcuts'

function MyComponent() {
  // هذه الاختصارات لن تعمل عندما يكون المستخدم يكتب في input
  useKeyboardShortcutsSafe([
    { key: 'n', ctrl: true, callback: handleNew },
    { key: 'd', ctrl: true, callback: handleDelete },
  ])

  return <div>...</div>
}
```

### عرض Shortcut في UI

```typescript
import { formatShortcut, globalShortcuts } from '@/hooks/use-keyboard-shortcuts'

function MyButton() {
  const shortcut = globalShortcuts.NEW
  
  return (
    <button>
      جديد
      <kbd>{formatShortcut(shortcut)}</kbd>
    </button>
  )
}
```

### عرض قائمة المساعدة

```typescript
// تم إضافتها تلقائياً في AppLayout
// اضغط ? لعرض جميع الاختصارات
<KeyboardShortcutsDialog />
```

---

## 3️⃣ Advanced Search & Filter

### الاستخدام الأساسي

```typescript
'use client'

import { useState } from 'react'
import { AdvancedSearch } from '@/components/ui/advanced-search'
import { useAdvancedSearch } from '@/hooks/use-memoized-data'

function MyPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})

  // تعريف الفلاتر المتاحة
  const searchFilters = [
    {
      id: 'status',
      label: 'الحالة',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
      ],
    },
    {
      id: 'minAmount',
      label: 'الحد الأدنى للمبلغ',
      type: 'number' as const,
      placeholder: '0',
    },
    {
      id: 'date',
      label: 'التاريخ',
      type: 'date' as const,
    },
  ]

  // تعريف دوال الفلترة
  const filterFunctions = {
    status: (item: any, value: string) => item.status === value,
    minAmount: (item: any, value: string) => item.amount >= Number(value),
    date: (item: any, value: string) => item.date === value,
  }

  // استخدام Hook للبحث والفلترة
  const filteredData = useAdvancedSearch(
    data,
    searchTerm,
    [
      (item) => item.name,
      (item) => item.description,
      (item) => item.id.toString(),
    ],
    filters,
    filterFunctions
  )

  return (
    <div>
      <AdvancedSearch
        value={searchTerm}
        onChange={setSearchTerm}
        filters={searchFilters}
        activeFilters={filters}
        onFiltersChange={setFilters}
        placeholder="ابحث في البطاقات..."
      />

      {/* عرض النتائج */}
      <div>
        {filteredData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  )
}
```

### مثال متقدم مع جميع أنواع الفلاتر

```typescript
const advancedFilters = [
  {
    id: 'cardName',
    label: 'اسم البطاقة',
    type: 'text' as const,
    placeholder: 'ابحث بالاسم...',
  },
  {
    id: 'bank',
    label: 'البنك',
    type: 'select' as const,
    options: [
      { value: 'الراجحي', label: 'الراجحي' },
      { value: 'الأهلي', label: 'الأهلي' },
      { value: 'الإنماء', label: 'الإنماء' },
    ],
  },
  {
    id: 'minLimit',
    label: 'الحد الأدنى',
    type: 'number' as const,
    placeholder: '0',
  },
  {
    id: 'maxLimit',
    label: 'الحد الأقصى',
    type: 'number' as const,
    placeholder: '100000',
  },
  {
    id: 'expiryDate',
    label: 'تاريخ الانتهاء',
    type: 'date' as const,
  },
]

const filterFunctions = {
  cardName: (card: Card, value: string) => 
    card.name.toLowerCase().includes(value.toLowerCase()),
  bank: (card: Card, value: string) => 
    card.bank === value,
  minLimit: (card: Card, value: string) => 
    card.creditLimit >= Number(value),
  maxLimit: (card: Card, value: string) => 
    card.creditLimit <= Number(value),
  expiryDate: (card: Card, value: string) => 
    card.expiryDate <= value,
}
```

---

## 4️⃣ Pagination

### Pagination كامل

```typescript
'use client'

import { useState } from 'react'
import { Pagination } from '@/components/ui/pagination'

function MyPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Get current page data
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = data.slice(startIndex, endIndex)

  return (
    <div>
      {/* عرض البيانات */}
      <div>
        {currentData.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        showPageSize={true}
        showInfo={true}
      />
    </div>
  )
}
```

### Simple Pagination

```typescript
import { SimplePagination } from '@/components/ui/pagination'

function MyPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10

  return (
    <SimplePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  )
}
```

---

## 5️⃣ Virtual Scrolling

### Virtual List (ارتفاع ثابت)

```typescript
import { VirtualList } from '@/components/ui/virtual-list'

function MyPage() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `عنصر ${i}`,
  }))

  return (
    <VirtualList
      items={items}
      itemHeight={60}
      containerHeight={600}
      renderItem={(item, index) => (
        <div className="p-4 border-b">
          <h3>{item.name}</h3>
          <p>رقم {index + 1}</p>
        </div>
      )}
      overscan={5}
    />
  )
}
```

### Auto Virtual List (ارتفاع متغير)

```typescript
import { AutoVirtualList } from '@/components/ui/virtual-list'

function MyPage() {
  return (
    <AutoVirtualList
      items={items}
      estimatedItemHeight={80}
      containerHeight={600}
      renderItem={(item, index) => (
        <div className="p-4 border-b">
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          {/* المحتوى يمكن أن يكون بارتفاعات مختلفة */}
        </div>
      )}
    />
  )
}
```

### Virtual Grid

```typescript
import { VirtualGrid } from '@/components/ui/virtual-list'

function MyPage() {
  return (
    <VirtualGrid
      items={items}
      itemHeight={200}
      itemWidth={250}
      columns={4}
      containerHeight={600}
      gap={16}
      renderItem={(item, index) => (
        <div className="border rounded-lg p-4">
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
      )}
    />
  )
}
```

---

## 🎯 مثال شامل: صفحة مع جميع التحسينات

```typescript
'use client'

import { useState } from 'react'
import { AdvancedSearch } from '@/components/ui/advanced-search'
import { Pagination } from '@/components/ui/pagination'
import { VirtualList } from '@/components/ui/virtual-list'
import { useAdvancedSearch } from '@/hooks/use-memoized-data'
import { useKeyboardShortcutsSafe } from '@/hooks/use-keyboard-shortcuts'

export default function CardsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [useVirtualScroll, setUseVirtualScroll] = useState(false)

  // Keyboard shortcuts
  useKeyboardShortcutsSafe([
    { key: 'n', ctrl: true, callback: handleAddNew },
    { key: 'f', ctrl: true, callback: () => document.getElementById('search')?.focus() },
  ])

  // Search & Filter
  const filteredData = useAdvancedSearch(
    cards,
    searchTerm,
    [(card) => card.name, (card) => card.bank],
    filters,
    filterFunctions
  )

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <AdvancedSearch
        value={searchTerm}
        onChange={setSearchTerm}
        filters={searchFilters}
        activeFilters={filters}
        onFiltersChange={setFilters}
      />

      {/* Data Display */}
      {useVirtualScroll && filteredData.length > 100 ? (
        <VirtualList
          items={filteredData}
          itemHeight={80}
          containerHeight={600}
          renderItem={(card) => <CardItem card={card} />}
        />
      ) : (
        <div>
          {paginatedData.map(card => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!useVirtualScroll && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={filteredData.length}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  )
}
```

---

## 💡 نصائح الاستخدام

### Command Palette:
- استخدمه للتنقل السريع بين الصفحات
- أضف أوامر مخصصة حسب احتياجاتك
- يعمل تلقائياً مع Dark/Light Mode

### Keyboard Shortcuts:
- استخدم `useKeyboardShortcutsSafe` للاختصارات التي لا يجب أن تعمل أثناء الكتابة
- اضغط `?` لعرض جميع الاختصارات المتاحة
- يمكنك تخصيص الاختصارات في `globalShortcuts`

### Advanced Search:
- استخدم `useAdvancedSearch` hook للأداء الأفضل
- أضف فلاتر حسب نوع البيانات
- الفلاتر النشطة تظهر كـ Badges قابلة للإزالة

### Pagination:
- استخدم `Pagination` للقوائم القصيرة (< 100 عنصر)
- استخدم `SimplePagination` للواجهات البسيطة
- يمكن تخصيص عدد العناصر في الصفحة

### Virtual Scrolling:
- استخدمه للقوائم الطويلة (> 100 عنصر)
- `VirtualList` للارتفاع الثابت (أسرع)
- `AutoVirtualList` للارتفاع المتغير
- `VirtualGrid` للشبكات

---

**تم إنشاء هذا الملف في**: المرحلة الثالثة - تحسينات تجربة المستخدم

