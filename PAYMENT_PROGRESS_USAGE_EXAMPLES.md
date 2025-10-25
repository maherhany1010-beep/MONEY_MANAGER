# 📚 أمثلة استخدام مؤشر السداد

## 🎯 أمثلة عملية لاستخدام `PaymentProgressIndicator`

---

## 1️⃣ الاستخدام الأساسي

### مثال بسيط:
```tsx
import { PaymentProgressIndicator } from '@/components/statements/payment-progress-indicator'

function MyComponent() {
  return (
    <PaymentProgressIndicator
      statementAmount={10000}
      paidAmount={6000}
    />
  )
}
```

**النتيجة**:
- نسبة السداد: 60%
- شريط تقدم أخضر/أزرق/كهرماني/أحمر حسب الحالة
- تفاصيل كاملة للمبالغ

---

## 2️⃣ مع الحد الأدنى للسداد

### مثال مع علامة الحد الأدنى:
```tsx
<PaymentProgressIndicator
  statementAmount={10000}
  paidAmount={6000}
  minimumPayment={1000}
/>
```

**النتيجة**:
- نسبة السداد: 60%
- علامة عند 10% (الحد الأدنى)
- الحالة: "تم سداد الحد الأدنى" (أزرق)

---

## 3️⃣ مع تاريخ الاستحقاق

### مثال مع عداد الأيام:
```tsx
<PaymentProgressIndicator
  statementAmount={10000}
  paidAmount={0}
  minimumPayment={1000}
  dueDate="2024-02-15"
/>
```

**النتيجة**:
- عداد الأيام المتبقية
- تحذير إذا كان متبقي ≤ 3 أيام
- الحالة: "غير مدفوع" (أحمر)

---

## 4️⃣ العرض المضغوط

### مثال للقوائم والجداول:
```tsx
<PaymentProgressIndicator
  statementAmount={10000}
  paidAmount={6000}
  compact={true}
/>
```

**النتيجة**:
- عرض مضغوط (3 أسطر)
- مثالي للقوائم
- بدون تفاصيل إضافية

---

## 5️⃣ بدون تفاصيل

### مثال مع إخفاء التفاصيل:
```tsx
<PaymentProgressIndicator
  statementAmount={10000}
  paidAmount={6000}
  minimumPayment={1000}
  showDetails={false}
/>
```

**النتيجة**:
- نسبة السداد وشريط التقدم فقط
- بدون تفاصيل المبالغ

---

## 6️⃣ في صفحة كشوف الحساب

### الملف: `src/app/statements/page.tsx`

```tsx
'use client'

import { PaymentProgressIndicator } from '@/components/statements/payment-progress-indicator'

export default function StatementsPage() {
  const statement = {
    id: '1',
    statementAmount: 12500,
    paidAmount: 500,
    minimumPayment: 625,
    dueDate: '2024-02-15',
  }

  return (
    <div className="space-y-6">
      <h1>كشوف الحساب</h1>
      
      <PaymentProgressIndicator
        statementAmount={statement.statementAmount}
        paidAmount={statement.paidAmount}
        minimumPayment={statement.minimumPayment}
        dueDate={statement.dueDate}
      />
    </div>
  )
}
```

---

## 7️⃣ في قائمة كشوف الحساب

### عرض مضغوط لكل كشف:

```tsx
function StatementsList({ statements }) {
  return (
    <div className="space-y-4">
      {statements.map(statement => (
        <Card key={statement.id}>
          <CardHeader>
            <CardTitle>
              كشف {statement.month}/{statement.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentProgressIndicator
              statementAmount={statement.statementAmount}
              paidAmount={statement.paidAmount}
              minimumPayment={statement.minimumPayment}
              compact={true}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 8️⃣ في جدول

### استخدام في TableCell:

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function StatementsTable({ statements }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الشهر</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>حالة السداد</TableHead>
        </TableRow>
      </TableHeader>
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
  )
}
```

---

## 9️⃣ في Dialog/Modal

### عرض في نافذة منبثقة:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

function StatementDialog({ statement, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            تفاصيل كشف {statement.month}/{statement.year}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <PaymentProgressIndicator
            statementAmount={statement.statementAmount}
            paidAmount={statement.paidAmount}
            minimumPayment={statement.minimumPayment}
            dueDate={statement.dueDate}
          />
          
          {/* باقي التفاصيل */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔟 مع بيانات ديناميكية

### استخدام مع Context/State:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { PaymentProgressIndicator } from '@/components/statements/payment-progress-indicator'

function DynamicStatementProgress({ statementId }) {
  const [statement, setStatement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // جلب البيانات من API أو Context
    fetchStatement(statementId).then(data => {
      setStatement(data)
      setLoading(false)
    })
  }, [statementId])

  if (loading) return <div>جاري التحميل...</div>

  return (
    <PaymentProgressIndicator
      statementAmount={statement.statementAmount}
      paidAmount={statement.paidAmount}
      minimumPayment={statement.minimumPayment}
      dueDate={statement.dueDate}
    />
  )
}
```

---

## 1️⃣1️⃣ مع تحديث مباشر

### تحديث المؤشر عند إضافة دفعة:

```tsx
'use client'

import { useState } from 'react'
import { PaymentProgressIndicator } from '@/components/statements/payment-progress-indicator'
import { Button } from '@/components/ui/button'

function StatementWithPayment() {
  const [statement, setStatement] = useState({
    statementAmount: 10000,
    paidAmount: 0,
    minimumPayment: 1000,
    dueDate: '2024-02-15',
  })

  const handleAddPayment = (amount: number) => {
    setStatement(prev => ({
      ...prev,
      paidAmount: prev.paidAmount + amount,
    }))
  }

  return (
    <div className="space-y-4">
      <PaymentProgressIndicator
        statementAmount={statement.statementAmount}
        paidAmount={statement.paidAmount}
        minimumPayment={statement.minimumPayment}
        dueDate={statement.dueDate}
      />
      
      <div className="flex gap-2">
        <Button onClick={() => handleAddPayment(1000)}>
          دفع الحد الأدنى
        </Button>
        <Button onClick={() => handleAddPayment(statement.statementAmount - statement.paidAmount)}>
          دفع المبلغ كاملاً
        </Button>
      </div>
    </div>
  )
}
```

---

## 1️⃣2️⃣ في Dashboard

### عرض ملخص لجميع البطاقات:

```tsx
function CreditCardsDashboard({ cards }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map(card => (
        <Card key={card.id}>
          <CardHeader>
            <CardTitle>{card.name}</CardTitle>
            <CardDescription>
              كشف {card.currentStatement.month}/{card.currentStatement.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentProgressIndicator
              statementAmount={card.currentStatement.statementAmount}
              paidAmount={card.currentStatement.paidAmount}
              minimumPayment={card.currentStatement.minimumPayment}
              dueDate={card.currentStatement.dueDate}
              compact={true}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 1️⃣3️⃣ مع Tooltip

### إضافة معلومات إضافية:

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function StatementProgressWithTooltip({ statement }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <PaymentProgressIndicator
              statementAmount={statement.statementAmount}
              paidAmount={statement.paidAmount}
              compact={true}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <p>إجمالي الكشف: {formatCurrency(statement.statementAmount)}</p>
            <p>المدفوع: {formatCurrency(statement.paidAmount)}</p>
            <p>المتبقي: {formatCurrency(statement.statementAmount - statement.paidAmount)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

---

## 1️⃣4️⃣ مع Animation

### إضافة حركة عند التحديث:

```tsx
import { motion } from 'framer-motion'

function AnimatedStatementProgress({ statement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PaymentProgressIndicator
        statementAmount={statement.statementAmount}
        paidAmount={statement.paidAmount}
        minimumPayment={statement.minimumPayment}
        dueDate={statement.dueDate}
      />
    </motion.div>
  )
}
```

---

## 1️⃣5️⃣ مع Skeleton Loading

### عرض Skeleton أثناء التحميل:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

function StatementProgressWithLoading({ statement, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <PaymentProgressIndicator
      statementAmount={statement.statementAmount}
      paidAmount={statement.paidAmount}
      minimumPayment={statement.minimumPayment}
      dueDate={statement.dueDate}
    />
  )
}
```

---

## 📊 ملخص الاستخدامات

| الاستخدام | النمط | الحالة |
|-----------|-------|--------|
| صفحة كشف الحساب | كامل | ✅ |
| قائمة الكشوف | مضغوط | ✅ |
| جدول | مضغوط | ✅ |
| Dialog/Modal | كامل | ✅ |
| Dashboard | مضغوط | ✅ |
| مع Tooltip | مضغوط | ✅ |
| مع Animation | كامل/مضغوط | ✅ |
| مع Loading | كامل/مضغوط | ✅ |

---

## 🎯 نصائح الاستخدام

### ✅ استخدم العرض الكامل عندما:
- تعرض تفاصيل كشف حساب واحد
- المساحة متوفرة
- تريد عرض جميع التفاصيل

### ✅ استخدم العرض المضغوط عندما:
- تعرض قائمة من الكشوف
- المساحة محدودة
- تريد عرض سريع

### ✅ أضف `minimumPayment` عندما:
- تريد توضيح الحد الأدنى
- تريد علامة على شريط التقدم

### ✅ أضف `dueDate` عندما:
- تريد عداد الأيام المتبقية
- تريد تنبيهات للمواعيد القريبة

---

**جاهز للاستخدام! 🚀**

