# 🎁 نظام استرداد الكاش باك للبطاقات الائتمانية

## 📋 نظرة عامة

نظام شامل لإدارة الكاش باك للبطاقات الائتمانية مع دعم:
- ✅ **الاسترداد اليدوي**: استرداد الكاش باك يدوياً في أي وقت
- ✅ **الاسترداد التلقائي**: استرداد تلقائي بعد عدد أيام محدد
- ✅ **الاسترداد الكلي أو الجزئي**: استرداد كامل المبلغ أو جزء منه
- ✅ **طرق الاسترداد**: إضافة لرصيد البطاقة أو قسيمة مشتريات
- ✅ **إعدادات مخصصة**: إعدادات مستقلة لكل بطاقة

---

## 🏗️ البنية التقنية

### 1. الأنواع (Types)

**الملف**: `src/types/cashback.ts`

#### الأنواع الأساسية:

```typescript
// حالة الكاش باك
type CashbackStatus = 'pending' | 'approved' | 'redeemed' | 'expired' | 'cancelled'

// نوع الاسترداد
type RedemptionType = 'balance' | 'voucher' // رصيد البطاقة أو قسيمة مشتريات

// نوع الاسترداد (كلي أو جزئي)
type RedemptionMode = 'full' | 'partial'
```

#### الواجهات (Interfaces):

**1. سجل الكاش باك (CashbackRecord)**:
```typescript
interface CashbackRecord {
  id: string
  cardId: string
  
  // معلومات الكاش باك
  amount: number // المبلغ الإجمالي
  earnedDate: string // تاريخ الحصول
  source: string // المصدر (اسم المتجر، العملية)
  description?: string
  
  // الاسترداد التلقائي
  autoRedeemEnabled: boolean
  autoRedeemDays: number // عدد الأيام (0 = معطل)
  autoRedeemDate?: string // تاريخ الاسترداد المتوقع
  
  // الحالة والمبالغ
  status: CashbackStatus
  redeemedAmount: number // المبلغ المسترد
  remainingAmount: number // المبلغ المتبقي
  
  createdAt: string
  updatedAt: string
}
```

**2. عملية الاسترداد (CashbackRedemption)**:
```typescript
interface CashbackRedemption {
  id: string
  cashbackId: string
  cardId: string
  
  // معلومات الاسترداد
  redemptionDate: string
  amount: number
  redemptionType: RedemptionType
  redemptionMode: RedemptionMode
  
  // تفاصيل القسيمة (إذا كان النوع قسيمة)
  voucherDetails?: {
    storeName: string // اسم المكان (مطلوب)
    voucherCode?: string // كود القسيمة
    expiryDate?: string // تاريخ الانتهاء
    notes?: string
  }
  
  isAutomatic: boolean // هل تم تلقائياً
  notes?: string
  
  createdAt: string
  createdBy?: string
}
```

**3. إعدادات الكاش باك (CardCashbackSettings)**:
```typescript
interface CardCashbackSettings {
  cardId: string
  
  // الإعدادات العامة
  cashbackEnabled: boolean
  cashbackRate: number // نسبة الكاش باك (%)
  
  // الاسترداد التلقائي
  autoRedeemEnabled: boolean
  autoRedeemDays: number
  autoRedeemType: RedemptionType
  autoRedeemStoreName?: string // للقسيمة
  
  // الحدود
  minRedemptionAmount: number
  maxCashbackPerTransaction: number
  
  updatedAt: string
}
```

**4. الإحصائيات (CashbackStats)**:
```typescript
interface CashbackStats {
  cardId: string
  
  // الإحصائيات المالية
  totalEarned: number // إجمالي المكتسب
  totalRedeemed: number // إجمالي المسترد
  totalPending: number // إجمالي المعلق
  totalExpired: number // إجمالي المنتهي
  availableBalance: number // المتاح للاسترداد
  
  // الإحصائيات العددية
  totalRecords: number
  totalRedemptions: number
  
  // التوزيع
  redemptionsByType: {
    balance: number // عدد استردادات الرصيد
    voucher: number // عدد استردادات القسائم
  }
  
  // التواريخ
  lastEarnedDate?: string
  lastRedeemedDate?: string
}
```

---

### 2. السياق (Context)

**الملف**: `src/contexts/cashback-context.tsx`

#### الوظائف المتاحة:

```typescript
interface CashbackContextType {
  // سجلات الكاش باك
  cashbackRecords: CashbackRecord[]
  addCashbackRecord: (record) => void
  updateCashbackRecord: (id, updates) => void
  deleteCashbackRecord: (id) => void
  getCashbackRecord: (id) => CashbackRecord | undefined
  getCardCashbackRecords: (cardId) => CashbackRecord[]
  
  // عمليات الاسترداد
  redemptions: CashbackRedemption[]
  redeemCashback: (redemption) => void
  getCardRedemptions: (cardId) => CashbackRedemption[]
  
  // الإعدادات
  settings: CardCashbackSettings[]
  getCardSettings: (cardId) => CardCashbackSettings | undefined
  updateCardSettings: (cardId, settings) => void
  
  // الإحصائيات
  getCardStats: (cardId) => CashbackStats
  
  // البحث والتصفية
  searchCashback: (filter, sort?) => CashbackRecord[]
  
  // الاسترداد التلقائي
  processAutomaticRedemptions: () => void
}
```

#### التخزين:
- يتم حفظ جميع البيانات في `localStorage`:
  - `cashbackRecords`: سجلات الكاش باك
  - `cashbackRedemptions`: عمليات الاسترداد
  - `cashbackSettings`: إعدادات البطاقات

---

### 3. المكونات (Components)

#### 1. **CashbackTab** - التبويب الرئيسي
**الملف**: `src/components/cashback/cashback-tab.tsx`

**الميزات**:
- 📊 عرض الإحصائيات (إجمالي، متاح، مسترد، معلق)
- 📝 قائمة سجلات الكاش باك
- 🎫 قائمة عمليات الاسترداد
- ⚙️ أزرار الإجراءات (إضافة، استرداد، إعدادات)

**الاستخدام**:
```tsx
<CashbackTab cardId="card-123" />
```

---

#### 2. **AddCashbackDialog** - إضافة كاش باك جديد
**الملف**: `src/components/cashback/add-cashback-dialog.tsx`

**الحقول**:
- ✅ المبلغ (مطلوب)
- ✅ تاريخ الحصول (مطلوب)
- ✅ المصدر (مطلوب)
- ⚪ الوصف (اختياري)
- ⚪ تفعيل الاسترداد التلقائي
- ⚪ عدد الأيام للاسترداد التلقائي

**الاختيارات السريعة للأيام**:
- يوم (1)
- يومين (2)
- أسبوع (7)
- أسبوعين (14)
- شهر (30)
- 3 أشهر (90)

**الاستخدام**:
```tsx
<AddCashbackDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  cardId="card-123"
/>
```

---

#### 3. **RedeemCashbackDialog** - استرداد الكاش باك
**الملف**: `src/components/cashback/redeem-cashback-dialog.tsx`

**الخيارات**:

**1. نوع الاسترداد**:
- 🔵 استرداد كلي (كامل المبلغ)
- 🟡 استرداد جزئي (مبلغ محدد)

**2. طريقة الاسترداد**:
- 💰 إضافة لرصيد البطاقة
- 🎫 قسيمة مشتريات

**3. تفاصيل القسيمة** (إذا اخترت قسيمة):
- ✅ اسم المكان (مطلوب)
- ⚪ كود القسيمة (اختياري)
- ⚪ تاريخ الانتهاء (اختياري)

**الاستخدام**:
```tsx
<RedeemCashbackDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  cashbackId="cashback-123"
  cardId="card-123"
/>
```

---

#### 4. **CashbackSettingsDialog** - إعدادات الكاش باك
**الملف**: `src/components/cashback/cashback-settings-dialog.tsx`

**الإعدادات**:

**1. الإعدادات العامة**:
- تفعيل/تعطيل الكاش باك
- نسبة الكاش باك (%)

**2. الاسترداد التلقائي**:
- تفعيل/تعطيل
- عدد الأيام (اختيارات سريعة: أسبوع، أسبوعين، شهر، شهرين، 3 أشهر، 6 أشهر)
- نوع الاسترداد (رصيد أو قسيمة)
- اسم المكان (للقسيمة)

**3. الحدود**:
- الحد الأدنى للاسترداد
- الحد الأقصى للكاش باك لكل عملية

**الاستخدام**:
```tsx
<CashbackSettingsDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  cardId="card-123"
/>
```

---

## 🔄 سير العمل (Workflow)

### 1. إضافة كاش باك جديد

```
المستخدم → زر "إضافة كاش باك"
         ↓
    نافذة الإضافة
         ↓
    إدخال البيانات:
    - المبلغ
    - المصدر
    - تاريخ الحصول
    - (اختياري) تفعيل الاسترداد التلقائي
         ↓
    حفظ السجل
         ↓
    الحالة: pending
    المبلغ المتبقي = المبلغ الإجمالي
```

### 2. الاسترداد اليدوي

```
المستخدم → زر "استرداد الكاش باك" على السجل
         ↓
    نافذة الاسترداد
         ↓
    اختيار:
    1. نوع الاسترداد (كلي/جزئي)
    2. طريقة الاسترداد (رصيد/قسيمة)
    3. (إذا قسيمة) اسم المكان
         ↓
    تنفيذ الاسترداد:
    - إنشاء سجل استرداد جديد
    - تحديث المبلغ المسترد
    - تحديث المبلغ المتبقي
    - تحديث الحالة (redeemed إذا اكتمل)
```

### 3. الاسترداد التلقائي

```
المستخدم → زر "معالجة الاستردادات التلقائية"
         ↓
    البحث عن السجلات:
    - autoRedeemEnabled = true
    - autoRedeemDate <= اليوم
    - status = pending
    - remainingAmount > 0
         ↓
    لكل سجل:
    - قراءة إعدادات البطاقة
    - استرداد كامل المبلغ المتبقي
    - استخدام نوع الاسترداد من الإعدادات
    - وضع علامة isAutomatic = true
```

---

## 📊 الإحصائيات المحسوبة

يتم حساب الإحصائيات تلقائياً من السجلات:

```typescript
// إجمالي الكاش باك المكتسب
totalEarned = sum(cashbackRecords.amount)

// إجمالي المسترد
totalRedeemed = sum(cashbackRecords.redeemedAmount)

// إجمالي المعلق
totalPending = sum(
  cashbackRecords
    .filter(r => r.status === 'pending')
    .map(r => r.remainingAmount)
)

// الرصيد المتاح
availableBalance = sum(
  cashbackRecords
    .filter(r => r.status !== 'expired' && r.status !== 'cancelled')
    .map(r => r.remainingAmount)
)
```

---

## 🎨 الألوان والأيقونات

### الألوان (Light Mode):
- 🟣 **البنفسجي** (`#9333ea`): الكاش باك الإجمالي
- 🟢 **الأخضر** (`#16a34a`): المتاح والمسترد
- 🔵 **الأزرق** (`#2563eb`): رصيد البطاقة
- 🟠 **البرتقالي** (`#c2410c`): القسائم
- 🟡 **الكهرماني** (`#d97706`): المعلق

### الأيقونات:
- 🎁 `Gift`: الكاش باك
- 💰 `DollarSign`: رصيد البطاقة
- 🎫 `Ticket`: قسيمة مشتريات
- ⏰ `Clock`: الاسترداد التلقائي
- 📅 `Calendar`: التواريخ
- ⚙️ `Settings`: الإعدادات
- ➕ `Plus`: إضافة جديد

---

## 🔧 التكامل مع صفحة البطاقة

**الملف**: `src/app/cards/[id]/page.tsx`

```tsx
import { CashbackProvider } from '@/contexts/cashback-context'
import { CashbackTab } from '@/components/cashback/cashback-tab'

export default function CardDetailsPage() {
  return (
    <CashbackProvider>
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="cashback">الكاش باك</TabsTrigger>
          {/* ... */}
        </TabsList>
        
        <TabsContent value="cashback">
          <CashbackTab cardId={card.id} />
        </TabsContent>
      </Tabs>
    </CashbackProvider>
  )
}
```

---

## ✅ الميزات المنفذة

- ✅ إضافة سجلات كاش باك جديدة
- ✅ الاسترداد اليدوي (كلي أو جزئي)
- ✅ الاسترداد التلقائي بعد عدد أيام محدد
- ✅ طريقتان للاسترداد (رصيد البطاقة أو قسيمة مشتريات)
- ✅ إدخال اسم المكان يدوياً للقسائم
- ✅ إعدادات مخصصة لكل بطاقة
- ✅ إحصائيات شاملة
- ✅ واجهة مستخدم جميلة ومتجاوبة
- ✅ دعم الوضع الليلي (Dark Mode)

---

## 🚀 الاستخدام السريع

### 1. إضافة كاش باك:
```
1. افتح صفحة البطاقة
2. انتقل لتبويب "الكاش باك"
3. انقر "إضافة كاش باك"
4. املأ البيانات
5. (اختياري) فعّل الاسترداد التلقائي
6. احفظ
```

### 2. استرداد كاش باك:
```
1. في قائمة سجلات الكاش باك
2. انقر "استرداد الكاش باك" على السجل المطلوب
3. اختر نوع الاسترداد (كلي/جزئي)
4. اختر طريقة الاسترداد (رصيد/قسيمة)
5. (إذا قسيمة) أدخل اسم المكان
6. احفظ
```

### 3. تفعيل الاسترداد التلقائي:
```
1. انقر زر "الإعدادات"
2. فعّل "الاسترداد التلقائي"
3. حدد عدد الأيام
4. اختر نوع الاسترداد
5. (إذا قسيمة) أدخل اسم المكان الافتراضي
6. احفظ
```

### 4. معالجة الاستردادات التلقائية:
```
1. انقر زر "معالجة الاستردادات التلقائية"
2. سيتم استرداد جميع السجلات المستحقة تلقائياً
```

---

## 📝 ملاحظات مهمة

1. **الاسترداد التلقائي**:
   - يتم تفعيله على مستوى السجل الفردي
   - يمكن تعيين إعدادات افتراضية على مستوى البطاقة
   - يجب تشغيل `processAutomaticRedemptions()` يدوياً أو جدولته

2. **القسائم**:
   - اسم المكان مطلوب
   - كود القسيمة وتاريخ الانتهاء اختياريان
   - يمكن إضافة ملاحظات إضافية

3. **الحالات**:
   - `pending`: جديد، لم يسترد
   - `approved`: تم استرداد جزء منه
   - `redeemed`: تم استرداده بالكامل
   - `expired`: منتهي
   - `cancelled`: ملغي

---

## 🎯 التطويرات المستقبلية المقترحة

1. ⏰ **جدولة تلقائية**: تشغيل `processAutomaticRedemptions()` تلقائياً كل يوم
2. 🔔 **تنبيهات**: إشعارات عند اقتراب موعد الاسترداد التلقائي
3. 📊 **تقارير**: تقارير شهرية وسنوية للكاش باك
4. 🏪 **قائمة الأماكن**: قائمة محفوظة للأماكن المفضلة للقسائم
5. 📱 **تصدير القسائم**: تصدير القسائم كـ PDF أو صورة
6. 🔄 **مزامنة**: مزامنة مع Supabase
7. 📈 **رسوم بيانية**: عرض الإحصائيات برسوم بيانية

---

**تم التطوير بواسطة**: Augment Agent  
**التاريخ**: 2025-10-09  
**الإصدار**: 1.0.0

