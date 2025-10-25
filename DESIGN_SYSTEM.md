# نظام التصميم - الإدارة المالية الشاملة
# Design System - Comprehensive Financial Management

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الخطوط (Typography)](#الخطوط-typography)
3. [الألوان (Colors)](#الألوان-colors)
4. [المسافات (Spacing)](#المسافات-spacing)
5. [المكونات (Components)](#المكونات-components)
6. [الشبكات (Grid System)](#الشبكات-grid-system)
7. [الحركات والانتقالات (Animations)](#الحركات-والانتقالات-animations)

---

## نظرة عامة

نظام تصميم موحد ومتسق لتطبيق الإدارة المالية الشاملة، يهدف إلى توفير تجربة مستخدم سلسة واحترافية.

### المبادئ الأساسية:
- ✅ **الاتساق**: جميع الصفحات تتبع نفس نظام التصميم
- ✅ **الوضوح**: واجهات واضحة وسهلة القراءة
- ✅ **الاستجابة**: تصميم متجاوب على جميع الأجهزة
- ✅ **إمكانية الوصول**: تباين كافٍ ودعم كامل للغة العربية

---

## الخطوط (Typography)

### الخط الأساسي
```css
font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### أحجام الخطوط

| الاستخدام | الحجم | الفئة |
|----------|------|-------|
| نص صغير جداً | 12px | `text-xs` |
| نص ثانوي | 14px | `text-sm` |
| نص عادي | 16px | `text-base` |
| نص بارز | 18px | `text-lg` |
| عنوان صغير | 20px | `text-xl` |
| عنوان متوسط | 24px | `text-2xl` |
| عنوان كبير | 30px | `text-3xl` |
| عنوان رئيسي | 36px | `text-4xl` |

### أوزان الخطوط

| الاستخدام | الوزن | الفئة |
|----------|------|-------|
| نص عادي | 400 | `font-normal` |
| نص متوسط | 500 | `font-medium` |
| نص شبه عريض | 600 | `font-semibold` |
| نص عريض | 700 | `font-bold` |

### ارتفاع السطر

- **Tight** (`leading-tight`): 1.25 - للعناوين
- **Normal** (`leading-normal`): 1.5 - للنصوص العادية
- **Relaxed** (`leading-relaxed`): 1.75 - للفقرات الطويلة

---

## الألوان (Colors)

### الألوان الأساسية

#### الأزرق (Primary)
```css
--primary: #2563eb
```
- الاستخدام: الأزرار الرئيسية، الروابط، العناصر التفاعلية

#### الألوان الدلالية

| الحالة | اللون | الاستخدام |
|--------|------|----------|
| نجاح (Success) | `#10b981` | العمليات الناجحة، الحسابات النشطة |
| تحذير (Warning) | `#f59e0b` | التنبيهات، الحدود القريبة من الامتلاء |
| خطأ (Error) | `#ef4444` | الأخطاء، الحسابات المعطلة |
| معلومات (Info) | `#3b82f6` | المعلومات العامة |

### تدرجات البطاقات

```css
/* أزرق */
bg-gradient-to-br from-blue-500 to-blue-700

/* أخضر */
bg-gradient-to-br from-green-500 to-green-700

/* بنفسجي */
bg-gradient-to-br from-purple-500 to-purple-700

/* برتقالي */
bg-gradient-to-br from-orange-500 to-orange-700
```

---

## المسافات (Spacing)

### نظام المسافات

| الحجم | القيمة | الفئة |
|------|--------|-------|
| XS | 8px | `p-2`, `m-2`, `gap-2` |
| SM | 12px | `p-3`, `m-3`, `gap-3` |
| MD | 16px | `p-4`, `m-4`, `gap-4` |
| LG | 24px | `p-6`, `m-6`, `gap-6` |
| XL | 32px | `p-8`, `m-8`, `gap-8` |
| 2XL | 48px | `p-12`, `m-12`, `gap-12` |

### الاستخدامات الموصى بها

- **البطاقات**: `p-6` (24px)
- **الشبكات**: `gap-6` (24px)
- **المسافة بعد العناوين**: `mb-8` (32px)
- **المسافة بين الأقسام**: `space-y-6` (24px)

---

## المكونات (Components)

### بطاقات الإحصائيات (Stat Cards)

```tsx
<StatCard
  title="إجمالي الرصيد"
  value={formatCurrency(totalBalance)}
  subtitle="5 حسابات"
  icon={DollarSign}
  variant="blue"
/>
```

**المواصفات:**
- Padding: `p-6` (24px)
- Border Radius: `rounded-xl` (12px)
- Shadow: `shadow-lg`
- Transition: `duration-300`
- Hover: `hover:shadow-xl`

### البطاقات العادية (Cards)

```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>العنوان</CardTitle>
  </CardHeader>
  <CardContent>
    {/* المحتوى */}
  </CardContent>
</Card>
```

**المواصفات:**
- Background: `bg-white`
- Border: `border border-gray-200`
- Border Radius: `rounded-lg` (8px)
- Shadow: `shadow-sm`
- Hover: `hover:shadow-md`

### الأزرار (Buttons)

```tsx
<Button size="default" variant="default">
  <Plus className="h-4 w-4 ml-2" />
  إضافة جديد
</Button>
```

**الأحجام:**
- Small: `h-9 px-3 text-sm`
- Default: `h-10 px-4 text-base`
- Large: `h-11 px-6 text-lg`

### الشارات (Badges)

```tsx
<Badge variant="success">نشط</Badge>
<Badge variant="warning">معلق</Badge>
<Badge variant="error">محظور</Badge>
```

---

## الشبكات (Grid System)

### شبكات الإحصائيات

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {/* 4 بطاقات إحصائيات */}
</div>
```

### شبكات البطاقات

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* بطاقات الحسابات */}
</div>
```

### نقاط التوقف (Breakpoints)

- **Mobile**: < 768px (1 عمود)
- **Tablet**: 768px - 1024px (2 عمود)
- **Desktop**: > 1024px (3-4 أعمدة)

---

## الحركات والانتقالات (Animations)

### الانتقالات الأساسية

```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### حالات Hover

```css
/* الظل */
hover:shadow-lg

/* التكبير */
hover:scale-105

/* الشفافية */
hover:opacity-80
```

### الحركات المخصصة

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeIn 0.3s ease-in;
}
```

---

## أفضل الممارسات

### ✅ افعل

- استخدم `StatCard` لبطاقات الإحصائيات
- استخدم `PageHeader` لعناوين الصفحات
- استخدم `EmptyState` للحالات الفارغة
- استخدم `formatCurrency` لتنسيق العملات
- استخدم الشبكات الموحدة (`grid gap-6`)

### ❌ لا تفعل

- لا تستخدم ألوان مخصصة خارج نظام الألوان
- لا تستخدم مسافات عشوائية
- لا تستخدم أحجام خطوط غير موحدة
- لا تنسخ الكود بدلاً من استخدام المكونات

---

## الدوال المساعدة

### تنسيق العملات

```typescript
formatCurrency(12500.50) // "EGP 12,500.50"
```

### تنسيق الأرقام

```typescript
formatNumber(1234567) // "1,234,567"
```

### دمج الفئات

```typescript
cn('base-class', condition && 'conditional-class', 'another-class')
```

---

## الملفات المرجعية

- **نظام التصميم**: `src/lib/design-system.ts`
- **الأنماط العامة**: `src/app/globals.css`
- **بطاقات الإحصائيات**: `src/components/ui/stat-card.tsx`
- **عنوان الصفحة**: `src/components/layout/page-header.tsx`

---

## التحديثات والصيانة

آخر تحديث: 2025-10-09

للمساهمة في تحسين نظام التصميم، يرجى:
1. مراجعة المبادئ الأساسية
2. اتباع الأنماط الموحدة
3. اختبار التغييرات على جميع الأجهزة
4. توثيق أي إضافات جديدة

