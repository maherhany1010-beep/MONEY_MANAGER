# 📊 مؤشر تتبع سداد كشف الحساب الشهري

## 📋 نظرة عامة

تم إضافة **مؤشر مرئي متقدم** لتتبع سداد كشف الحساب الشهري للبطاقات الائتمانية.

### ✨ الميزات الرئيسية:
- 📊 **نسبة مئوية** تعرض نسبة السداد من إجمالي كشف الحساب
- 📈 **شريط تقدم (Progress Bar)** يوضح بصرياً مقدار ما تم سداده
- 🎯 **علامة الحد الأدنى** على شريط التقدم
- 🎨 **ألوان ديناميكية** حسب حالة السداد
- ⏰ **عداد الأيام المتبقية** حتى تاريخ الاستحقاق
- ⚠️ **تنبيهات ذكية** للمواعيد القريبة
- 🌙 **دعم كامل للوضع الليلي**

---

## 🎯 الحسابات

### المعادلات الأساسية:

```typescript
// المبلغ المتبقي
remainingAmount = statementAmount - paidAmount

// نسبة السداد
paymentPercentage = (paidAmount / statementAmount) × 100%

// نسبة الحد الأدنى
minimumPercentage = (minimumPayment / statementAmount) × 100%
```

### مثال عملي:

```
إجمالي كشف الحساب: 10,000 جنيه
المبلغ المدفوع: 6,000 جنيه
الحد الأدنى للسداد: 1,000 جنيه

النتائج:
- المبلغ المتبقي: 4,000 جنيه
- نسبة السداد: 60%
- نسبة الحد الأدنى: 10%
- الحالة: "سداد جزئي" (تم تجاوز الحد الأدنى)
```

---

## 🎨 حالات السداد والألوان

### 1️⃣ **مدفوع بالكامل** (Paid) ✅
- **الشرط**: `paidAmount >= statementAmount`
- **النسبة**: 100%
- **اللون**: أخضر (`green-600`)
- **الأيقونة**: ✅ CheckCircle2
- **الرسالة**: "تم السداد بالكامل. شكراً لالتزامك!"

### 2️⃣ **تم سداد الحد الأدنى** (Minimum Met) 💙
- **الشرط**: `paidAmount >= minimumPayment` و `paidAmount < statementAmount`
- **النسبة**: بين نسبة الحد الأدنى و 100%
- **اللون**: أزرق (`blue-600`)
- **الأيقونة**: 📈 TrendingUp
- **الرسالة**: لا توجد (حالة آمنة)

### 3️⃣ **سداد جزئي** (Partial) ⚠️
- **الشرط**: `paidAmount > 0` و `paidAmount < minimumPayment`
- **النسبة**: أقل من نسبة الحد الأدنى
- **اللون**: كهرماني (`amber-600`)
- **الأيقونة**: ⏰ Clock
- **الرسالة**: لا توجد (لكن يحتاج سداد أكثر)

### 4️⃣ **غير مدفوع** (Unpaid) ❌
- **الشرط**: `paidAmount = 0`
- **النسبة**: 0%
- **اللون**: أحمر (`red-600`)
- **الأيقونة**: ⚠️ AlertCircle
- **الرسالة**: "تحذير: اقتراب موعد الاستحقاق" (إذا كان متبقي ≤ 3 أيام)

---

## 🏗️ البنية التقنية

### 1. نوع البيانات

**الملف**: `src/types/statement.ts`

```typescript
export interface CreditCardStatement {
  id: string
  cardId: string
  cardName: string
  
  // معلومات الفترة
  month: number
  year: number
  statementDate: string
  dueDate: string
  
  // المبالغ
  previousBalance: number
  currentBalance: number
  totalSpent: number
  totalPayments: number
  minimumPayment: number
  
  // تتبع السداد
  statementAmount: number // إجمالي مبلغ الكشف
  paidAmount: number // المبلغ المدفوع
  remainingAmount: number // المبلغ المتبقي
  paymentPercentage: number // نسبة السداد
  
  // معلومات إضافية
  cashbackEarned: number
  interestCharges: number
  fees: number
  status: StatementStatus
  
  createdAt: string
  updatedAt: string
}
```

---

### 2. المكون الرئيسي

**الملف**: `src/components/statements/payment-progress-indicator.tsx`

#### الخصائص (Props):

```typescript
interface PaymentProgressIndicatorProps {
  statementAmount: number // إجمالي مبلغ الكشف (مطلوب)
  paidAmount: number // المبلغ المدفوع (مطلوب)
  minimumPayment?: number // الحد الأدنى للسداد (اختياري)
  dueDate?: string // تاريخ الاستحقاق (اختياري)
  showDetails?: boolean // عرض التفاصيل (افتراضي: true)
  compact?: boolean // عرض مضغوط (افتراضي: false)
}
```

#### الوظائف الداخلية:

```typescript
// حساب المبلغ المتبقي
const remainingAmount = statementAmount - paidAmount

// حساب نسبة السداد
const paymentPercentage = statementAmount > 0 
  ? (paidAmount / statementAmount) * 100 
  : 0

// حساب نسبة الحد الأدنى
const minimumPercentage = minimumPayment && statementAmount > 0 
  ? (minimumPayment / statementAmount) * 100 
  : 0

// تحديد الحالة
const getPaymentStatus = () => {
  if (paymentPercentage >= 100) return 'paid'
  if (minimumPayment && paidAmount >= minimumPayment) return 'minimum-met'
  if (paidAmount > 0) return 'partial'
  return 'unpaid'
}

// حساب الأيام المتبقية
const getDaysRemaining = () => {
  if (!dueDate) return null
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}
```

---

## 📱 أنماط العرض

### 1️⃣ العرض الكامل (Full Display)

**الاستخدام**:
```tsx
<PaymentProgressIndicator
  statementAmount={10000}
  paidAmount={6000}
  minimumPayment={1000}
  dueDate="2024-02-15"
  showDetails={true}
  compact={false}
/>
```

**المحتوى**:
- ✅ رأس البطاقة مع الأيقونة والحالة
- ✅ عداد الأيام المتبقية
- ✅ نسبة السداد (كبيرة وواضحة)
- ✅ شريط التقدم مع علامة الحد الأدنى
- ✅ تفاصيل المبالغ (إجمالي، مدفوع، متبقي، حد أدنى)
- ✅ رسائل التنبيه/النجاح

---

### 2️⃣ العرض المضغوط (Compact Display)

**الاستخدام**:
```tsx
<PaymentProgressIndicator
  statementAmount={10000}
  paidAmount={6000}
  compact={true}
/>
```

**المحتوى**:
- ✅ نسبة السداد (سطر واحد)
- ✅ شريط التقدم (رفيع)
- ✅ مدفوع ومتبقي (سطر واحد)

**مثالي لـ**:
- قوائم كشوف الحساب
- البطاقات الصغيرة
- الجداول

---

## 🎨 العناصر المرئية

### 1. شريط التقدم (Progress Bar)

```tsx
<Progress 
  value={paymentPercentage} 
  className="h-4"
  indicatorClassName={config.progressColor}
/>
```

**الألوان**:
- 🟢 أخضر: مدفوع بالكامل
- 🔵 أزرق: تم سداد الحد الأدنى
- 🟡 كهرماني: سداد جزئي
- 🔴 أحمر: غير مدفوع

---

### 2. علامة الحد الأدنى

```tsx
{minimumPayment && minimumPercentage > 0 && minimumPercentage < 100 && (
  <div 
    className="absolute top-0 bottom-0 w-0.5 bg-gray-800 dark:bg-gray-200"
    style={{ left: `${minimumPercentage}%` }}
  >
    <div className="absolute -top-1 -left-1 w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full" />
  </div>
)}
```

**الوظيفة**: توضيح موقع الحد الأدنى على شريط التقدم

---

### 3. رسائل التنبيه

#### رسالة التحذير (Unpaid + ≤ 3 أيام):
```tsx
<div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg">
  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
  <div>
    <p className="font-semibold">تحذير: اقتراب موعد الاستحقاق</p>
    <p className="text-xs">يرجى سداد الحد الأدنى على الأقل لتجنب الرسوم الإضافية</p>
  </div>
</div>
```

#### رسالة النجاح (Paid):
```tsx
<div className="flex items-start gap-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-lg">
  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
  <div>
    <p className="font-semibold">تم السداد بالكامل</p>
    <p className="text-xs">تم سداد كشف الحساب بالكامل. شكراً لالتزامك!</p>
  </div>
</div>
```

---

## 📍 أماكن الاستخدام

### 1️⃣ صفحة كشوف الحساب (`/statements`)

**الملف**: `src/components/statements/statement-summary.tsx`

```tsx
import { PaymentProgressIndicator } from './payment-progress-indicator'

export function StatementSummary({ statement }: StatementSummaryProps) {
  return (
    <div className="space-y-6">
      {/* ... */}
      
      {/* مؤشر السداد المرئي */}
      <PaymentProgressIndicator
        statementAmount={statement.currentBalance}
        paidAmount={statement.totalPayments}
        minimumPayment={statement.minimumPayment}
        dueDate={statement.dueDate}
        showDetails={true}
      />
      
      {/* ... */}
    </div>
  )
}
```

---

### 2️⃣ صفحة تفاصيل البطاقة (`/cards/[id]`)

**مثال استخدام**:
```tsx
// في تبويب "كشوف الحساب"
<TabsContent value="statements">
  <div className="space-y-4">
    {statements.map(statement => (
      <Card key={statement.id}>
        <CardHeader>
          <CardTitle>كشف {statement.month}/{statement.year}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentProgressIndicator
            statementAmount={statement.statementAmount}
            paidAmount={statement.paidAmount}
            minimumPayment={statement.minimumPayment}
            dueDate={statement.dueDate}
            compact={true}
          />
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>
```

---

### 3️⃣ قائمة كشوف الحساب (List View)

**مثال استخدام**:
```tsx
<Table>
  <TableBody>
    {statements.map(statement => (
      <TableRow key={statement.id}>
        <TableCell>{statement.month}/{statement.year}</TableCell>
        <TableCell>{formatCurrency(statement.statementAmount)}</TableCell>
        <TableCell>
          <PaymentProgressIndicator
            statementAmount={statement.statementAmount}
            paidAmount={statement.paidAmount}
            compact={true}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🧪 سيناريوهات الاختبار

### اختبار 1: سداد كامل (5 دقائق)

**البيانات**:
```typescript
statementAmount: 10000
paidAmount: 10000
minimumPayment: 1000
dueDate: "2024-03-15"
```

**النتيجة المتوقعة**:
- ✅ نسبة السداد: 100%
- ✅ شريط التقدم: ممتلئ بالكامل (أخضر)
- ✅ الحالة: "مدفوع بالكامل"
- ✅ رسالة النجاح: تظهر
- ✅ المبلغ المتبقي: 0.00 جنيه

---

### اختبار 2: سداد الحد الأدنى (5 دقائق)

**البيانات**:
```typescript
statementAmount: 10000
paidAmount: 1000
minimumPayment: 1000
dueDate: "2024-03-15"
```

**النتيجة المتوقعة**:
- ✅ نسبة السداد: 10%
- ✅ شريط التقدم: 10% ممتلئ (أزرق)
- ✅ الحالة: "تم سداد الحد الأدنى"
- ✅ علامة الحد الأدنى: عند 10%
- ✅ المبلغ المتبقي: 9,000.00 جنيه

---

### اختبار 3: سداد جزئي (5 دقائق)

**البيانات**:
```typescript
statementAmount: 10000
paidAmount: 500
minimumPayment: 1000
dueDate: "2024-03-15"
```

**النتيجة المتوقعة**:
- ✅ نسبة السداد: 5%
- ✅ شريط التقدم: 5% ممتلئ (كهرماني)
- ✅ الحالة: "سداد جزئي"
- ✅ علامة الحد الأدنى: عند 10%
- ✅ المبلغ المتبقي: 9,500.00 جنيه

---

### اختبار 4: غير مدفوع + تحذير (5 دقائق)

**البيانات**:
```typescript
statementAmount: 10000
paidAmount: 0
minimumPayment: 1000
dueDate: "2024-02-12" // بعد يومين
```

**النتيجة المتوقعة**:
- ✅ نسبة السداد: 0%
- ✅ شريط التقدم: فارغ (أحمر)
- ✅ الحالة: "غير مدفوع"
- ✅ رسالة التحذير: تظهر
- ✅ الأيام المتبقية: "متبقي 2 يوم على تاريخ الاستحقاق"
- ✅ المبلغ المتبقي: 10,000.00 جنيه

---

### اختبار 5: العرض المضغوط (3 دقائق)

**البيانات**:
```typescript
statementAmount: 10000
paidAmount: 6000
compact: true
```

**النتيجة المتوقعة**:
- ✅ عرض مضغوط (3 أسطر فقط)
- ✅ نسبة السداد: 60%
- ✅ شريط التقدم: رفيع
- ✅ مدفوع: 6,000.00 جنيه
- ✅ متبقي: 4,000.00 جنيه

---

## 📊 الإحصائيات

| العنصر | القيمة |
|--------|--------|
| **الملفات الجديدة** | 2 |
| **الملفات المعدلة** | 1 |
| **إجمالي الأسطر** | ~500 |
| **الحالات المدعومة** | 4 |
| **أنماط العرض** | 2 |

---

## 🎯 الفوائد

### للمستخدم:
- ✅ **وضوح فوري**: معرفة حالة السداد بنظرة واحدة
- ✅ **تنبيهات ذكية**: تحذيرات قبل المواعيد
- ✅ **تتبع دقيق**: معرفة المبلغ المتبقي بالضبط
- ✅ **تحفيز**: رؤية التقدم في السداد

### للنظام:
- ✅ **واجهة احترافية**: تصميم عصري وجذاب
- ✅ **قابلية إعادة الاستخدام**: مكون مستقل
- ✅ **مرونة**: عرض كامل ومضغوط
- ✅ **دعم كامل**: Light/Dark Mode

---

## 🚀 التطبيق جاهز!

**الرابط**: `http://localhost:3003/statements`

**الخطوات**:
1. ✅ افتح صفحة كشوف الحساب
2. ✅ اختر كشف حساب
3. ✅ شاهد المؤشر المرئي الجديد
4. ✅ جرب السيناريوهات المختلفة

---

**تم التطوير بواسطة**: Augment Agent  
**التاريخ**: 2025-10-10  
**الإصدار**: 1.0.0

