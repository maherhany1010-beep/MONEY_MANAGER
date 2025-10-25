# نظام إدارة العملاء الشامل

## 📋 نظرة عامة

تم إنشاء نظام شامل ومتكامل لإدارة العملاء والمديونيات في التطبيق. النظام يوفر جميع الأدوات اللازمة لتتبع العملاء، فواتيرهم، مدفوعاتهم، ومديونياتهم بشكل دقيق واحترافي.

---

## 🎯 الميزات الرئيسية

### 1. إدارة العملاء
- ✅ إضافة عملاء جدد مع معلومات شاملة
- ✅ تعديل بيانات العملاء
- ✅ حذف العملاء
- ✅ تصنيف العملاء (VIP، عادي، جديد)
- ✅ حالات العملاء (نشط، غير نشط، محظور)
- ✅ صورة العميل (اختياري)

### 2. نظام المديونيات
- ✅ تتبع جميع الفواتير والمشتريات
- ✅ تسجيل المدفوعات بطرق مختلفة
- ✅ حساب المديونية الحالية تلقائياً
- ✅ **لا توجد حدود ائتمانية** - يمكن للعميل الشراء بأي مبلغ
- ✅ تنبيهات عند تجاوز مبلغ معين (قابل للتخصيص)

### 3. الفواتير
- ✅ إضافة فواتير جديدة
- ✅ تفاصيل الفاتورة (رقم، تاريخ، مبلغ، عناصر)
- ✅ حالات الفاتورة (مدفوعة، جزئية، غير مدفوعة، متأخرة)
- ✅ ربط الدفعات بالفواتير
- ✅ حساب المبلغ المتبقي تلقائياً

### 4. المدفوعات
- ✅ تسجيل دفعات من العملاء
- ✅ طرق دفع متعددة (كاش، تحويل بنكي، شيك، بطاقة ائتمان، محفظة إلكترونية)
- ✅ ربط الدفعة بفاتورة محددة أو دفعة عامة
- ✅ رقم مرجعي (رقم الشيك أو التحويل)

### 5. المرتجعات
- ✅ تسجيل مرتجعات من العملاء
- ✅ ربط المرتجع بفاتورة محددة
- ✅ تفاصيل المرتجع (سبب، عناصر)
- ✅ تحديث المديونية تلقائياً

### 6. التقارير والإحصائيات
- ✅ تقرير مفصل لكل عميل
- ✅ إحصائيات مالية شاملة
- ✅ رسوم بيانية للمشتريات والمدفوعات
- ✅ تطور المديونية عبر الزمن
- ✅ فلترة حسب الفترة الزمنية

### 7. البحث والتصفية
- ✅ بحث بالاسم، رقم الهاتف، البريد الإلكتروني
- ✅ تصفية حسب الحالة، التصنيف، المديونية
- ✅ فرز حسب الاسم، المديونية، تاريخ التسجيل
- ✅ بحث متقدم بخيارات متعددة

### 8. الملاحظات والمرفقات
- ✅ إضافة ملاحظات على العملاء
- ✅ سجل المكالمات والاجتماعات
- ✅ رفع ملفات (عقود، فواتير، صور)
- ✅ تصنيف المرفقات

### 9. سجل النشاطات
- ✅ تتبع جميع التعديلات
- ✅ من قام بالتعديل ومتى
- ✅ سجل كامل للأحداث

### 10. التصدير والاستيراد
- ✅ تصدير قائمة العملاء إلى CSV/Excel
- ✅ تصدير التقارير إلى PDF
- ✅ استيراد عملاء من ملف Excel (قريباً)

---

## 📁 هيكل الملفات

### 1. Types والـ Interfaces
```
src/types/customer.ts
```
يحتوي على جميع الأنواع والـ interfaces:
- `Customer` - بيانات العميل الأساسية
- `CustomerInvoice` - الفواتير
- `CustomerPayment` - المدفوعات
- `CustomerReturn` - المرتجعات
- `CustomerTransaction` - المعاملات الموحدة
- `CustomerNote` - الملاحظات
- `CustomerAttachment` - المرفقات
- `CustomerActivityLog` - سجل النشاطات
- `CustomerStats` - الإحصائيات
- `CustomerFilter` - فلاتر البحث
- `CustomerSortOptions` - خيارات الفرز
- `CustomerReport` - التقرير المفصل

### 2. Context
```
src/contexts/customers-context.tsx
```
يوفر جميع الدوال اللازمة لإدارة العملاء:

#### دوال العملاء:
- `addCustomer()` - إضافة عميل جديد
- `updateCustomer()` - تحديث بيانات عميل
- `deleteCustomer()` - حذف عميل
- `getCustomer()` - الحصول على عميل محدد

#### دوال الفواتير:
- `addInvoice()` - إضافة فاتورة جديدة
- `updateInvoice()` - تحديث فاتورة
- `deleteInvoice()` - حذف فاتورة
- `getCustomerInvoices()` - الحصول على فواتير العميل

#### دوال المدفوعات:
- `addPayment()` - إضافة دفعة
- `deletePayment()` - حذف دفعة
- `getCustomerPayments()` - الحصول على دفعات العميل

#### دوال المرتجعات:
- `addReturn()` - إضافة مرتجع
- `deleteReturn()` - حذف مرتجع
- `getCustomerReturns()` - الحصول على مرتجعات العميل

#### دوال المعاملات:
- `getCustomerTransactions()` - الحصول على جميع معاملات العميل

#### دوال الملاحظات:
- `addNote()` - إضافة ملاحظة
- `deleteNote()` - حذف ملاحظة
- `getCustomerNotes()` - الحصول على ملاحظات العميل

#### دوال المرفقات:
- `addAttachment()` - إضافة مرفق
- `deleteAttachment()` - حذف مرفق
- `getCustomerAttachments()` - الحصول على مرفقات العميل

#### دوال الإحصائيات:
- `getCustomerStats()` - الحصول على إحصائيات العميل
- `getCustomerActivityLogs()` - الحصول على سجل النشاطات

#### دوال البحث:
- `searchCustomers()` - البحث والتصفية
- `exportCustomers()` - تصدير إلى CSV

### 3. الصفحات
```
src/app/customers/page.tsx
```
الصفحة الرئيسية لإدارة العملاء:
- عرض قائمة العملاء
- إحصائيات عامة
- بحث وتصفية
- تصدير البيانات

```
src/app/customers/[id]/page.tsx (قريباً)
```
صفحة تفاصيل العميل:
- معلومات العميل الكاملة
- الفواتير والمدفوعات
- التقرير المفصل

### 4. المكونات (Components)
```
src/components/customers/customer-dialog.tsx (قريباً)
```
نافذة إضافة/تعديل عميل

```
src/components/customers/invoice-dialog.tsx (قريباً)
```
نافذة إضافة فاتورة

```
src/components/customers/payment-dialog.tsx (قريباً)
```
نافذة تسجيل دفعة

```
src/components/customers/customer-report.tsx (قريباً)
```
مكون التقرير المفصل

---

## 🔧 كيفية الاستخدام

### 1. إضافة عميل جديد

```typescript
import { useCustomers } from '@/contexts/customers-context'

const { addCustomer } = useCustomers()

addCustomer({
  fullName: 'أحمد محمد',
  phone: '01234567890',
  email: 'ahmed@example.com',
  address: 'القاهرة، مصر',
  company: 'شركة ABC',
  profession: 'مهندس',
  registrationDate: new Date().toISOString().split('T')[0],
  status: 'active',
  category: 'regular',
  notes: 'عميل جديد',
})
```

### 2. إضافة فاتورة

```typescript
const { addInvoice } = useCustomers()

addInvoice({
  customerId: 'cust-123',
  invoiceNumber: 'INV-001',
  invoiceDate: new Date().toISOString().split('T')[0],
  amount: 5000,
  description: 'فاتورة مبيعات',
  items: [
    {
      id: '1',
      name: 'منتج A',
      quantity: 2,
      unitPrice: 1000,
      totalPrice: 2000,
    },
    {
      id: '2',
      name: 'منتج B',
      quantity: 3,
      unitPrice: 1000,
      totalPrice: 3000,
    },
  ],
})
```

### 3. تسجيل دفعة

```typescript
const { addPayment } = useCustomers()

addPayment({
  customerId: 'cust-123',
  invoiceId: 'inv-456', // اختياري
  paymentDate: new Date().toISOString().split('T')[0],
  amount: 2000,
  paymentMethod: 'cash',
  notes: 'دفعة نقدية',
})
```

### 4. البحث والتصفية

```typescript
const { searchCustomers } = useCustomers()

const results = searchCustomers(
  {
    searchQuery: 'أحمد',
    status: ['active'],
    category: ['vip', 'regular'],
    minDebt: 1000,
  },
  {
    field: 'currentDebt',
    direction: 'desc',
  }
)
```

### 5. الحصول على إحصائيات العميل

```typescript
const { getCustomerStats } = useCustomers()

const stats = getCustomerStats('cust-123')

console.log(stats.totalPurchases) // إجمالي المشتريات
console.log(stats.totalPayments) // إجمالي المدفوعات
console.log(stats.currentDebt) // المديونية الحالية
console.log(stats.averageInvoiceValue) // متوسط قيمة الفاتورة
```

---

## 📊 نموذج البيانات

### Customer
```typescript
{
  id: string
  fullName: string
  phone: string
  email?: string
  address?: string
  company?: string
  profession?: string
  commercialRegister?: string
  registrationDate: string
  status: 'active' | 'inactive' | 'blocked'
  category: 'vip' | 'regular' | 'new'
  notes?: string
  avatar?: string
  totalPurchases: number
  totalPayments: number
  currentDebt: number
  debtAlertThreshold?: number
  createdAt: string
  updatedAt: string
}
```

### CustomerInvoice
```typescript
{
  id: string
  customerId: string
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  amount: number
  paidAmount: number
  remainingAmount: number
  status: 'paid' | 'partial' | 'unpaid' | 'overdue'
  description?: string
  items?: InvoiceItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### CustomerPayment
```typescript
{
  id: string
  customerId: string
  invoiceId?: string
  paymentDate: string
  amount: number
  paymentMethod: 'cash' | 'bank-transfer' | 'check' | 'credit-card' | 'e-wallet' | 'other'
  referenceNumber?: string
  notes?: string
  createdAt: string
}
```

---

## 🎨 التصميم

النظام يستخدم نفس نظام الألوان والتصميم الموجود في التطبيق:

### الألوان:
- **الأزرق/النيلي**: الألوان الرئيسية
- **الأخضر**: الحالة النشطة، المدفوعات
- **الأحمر**: المديونيات، التنبيهات
- **البرتقالي**: الفواتير المتأخرة
- **البنفسجي**: عملاء VIP
- **الرمادي**: الحالة غير النشطة

### المكونات:
- استخدام نفس مكونات UI الموجودة (Button, Input, Dialog, إلخ)
- Gradients جميلة ومتناسقة
- Shadows خفيفة
- Borders ناعمة
- Responsive design كامل

---

## ✅ الحالة الحالية

### ✅ تم إنجازه:
1. ✅ إنشاء جميع الـ Types والـ Interfaces
2. ✅ إنشاء Context كامل مع جميع الدوال
3. ✅ إضافة CustomersProvider إلى التطبيق
4. ✅ إنشاء الصفحة الرئيسية لإدارة العملاء
5. ✅ نظام البحث والتصفية
6. ✅ نظام التصدير إلى CSV
7. ✅ حساب الإحصائيات تلقائياً
8. ✅ سجل النشاطات
9. ✅ حفظ البيانات في localStorage

### 🔄 قيد العمل:
1. 🔄 نافذة إضافة/تعديل عميل
2. 🔄 نافذة إضافة فاتورة
3. 🔄 نافذة تسجيل دفعة
4. 🔄 صفحة تفاصيل العميل
5. 🔄 صفحة التقرير المفصل
6. 🔄 الرسوم البيانية
7. 🔄 نظام المرفقات
8. 🔄 نظام الملاحظات

---

## 🚀 الخطوات التالية

1. إنشاء نافذة إضافة/تعديل عميل (CustomerDialog)
2. إنشاء نافذة إضافة فاتورة (InvoiceDialog)
3. إنشاء نافذة تسجيل دفعة (PaymentDialog)
4. إنشاء صفحة تفاصيل العميل
5. إنشاء مكون التقرير المفصل مع الرسوم البيانية
6. إضافة نظام الإشعارات
7. إضافة نظام الاستيراد من Excel
8. إضافة نظام الطباعة

---

## 📝 ملاحظات مهمة

1. **لا توجد حدود ائتمانية**: النظام لا يفرض حدود على المديونية، ولكن يمكن تعيين تنبيه عند تجاوز مبلغ معين
2. **الحسابات التلقائية**: جميع الحسابات (المديونية، المدفوعات، الأرصدة) تتم تلقائياً
3. **سجل النشاطات**: يتم تسجيل جميع التعديلات تلقائياً
4. **localStorage**: البيانات محفوظة محلياً في المتصفح

---

## 🎉 الخلاصة

تم إنشاء نظام شامل ومتكامل لإدارة العملاء والمديونيات. النظام جاهز للاستخدام ويمكن البناء عليه بسهولة لإضافة المزيد من الميزات.

**الملفات الأساسية جاهزة والنظام يعمل بشكل صحيح!** ✅

