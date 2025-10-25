/**
 * أنواع البيانات الخاصة بنظام إدارة العملاء
 */

/**
 * حالة العميل
 */
export type CustomerStatus = 'active' | 'inactive' | 'blocked'

/**
 * تصنيف العميل
 */
export type CustomerCategory = 'vip' | 'regular' | 'new'

/**
 * نوع المعاملة المالية
 */
export type TransactionType = 'invoice' | 'payment' | 'return'

/**
 * طريقة الدفع
 */
export type PaymentMethod = 'cash' | 'bank-transfer' | 'check' | 'credit-card' | 'e-wallet' | 'other'

/**
 * حالة الفاتورة
 */
export type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'overdue'

/**
 * معلومات العميل الأساسية
 */
export interface Customer {
  id: string
  
  // المعلومات الشخصية
  fullName: string
  phone: string
  email?: string
  address?: string
  
  // معلومات العمل
  company?: string
  profession?: string
  commercialRegister?: string
  
  // معلومات إضافية
  registrationDate: string
  status: CustomerStatus
  category: CustomerCategory
  notes?: string
  
  // صورة العميل
  avatar?: string
  
  // الإحصائيات المالية (محسوبة)
  totalPurchases: number
  totalPayments: number
  currentDebt: number
  openingBalance: number // مديونية بداية المدة (لا تؤثر على الأرصدة)

  // الإعدادات
  debtAlertThreshold?: number // تنبيه عند تجاوز هذا المبلغ
  
  // معلومات النظام
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

/**
 * فاتورة العميل
 */
export interface CustomerInvoice {
  id: string
  customerId: string
  
  // معلومات الفاتورة
  invoiceNumber: string
  invoiceDate: string
  dueDate?: string
  
  // المبالغ
  amount: number
  paidAmount: number
  remainingAmount: number
  
  // الحالة
  status: InvoiceStatus
  
  // التفاصيل
  description?: string
  items?: InvoiceItem[]
  notes?: string

  // المرفقات
  attachments?: string[]

  // نوع الفاتورة
  invoiceType: 'sale' | 'transfer' // بيع أو تحويل

  // معلومات التحويل (إذا كان النوع تحويل)
  transferDetails?: {
    // حساب الخصم (المصدر)
    debitAccountType: 'bank' | 'e-wallet' | 'pos' | 'cash-vault' | 'prepaid-card' | 'customer'
    debitAccountId: string
    debitAmount: number // المبلغ المخصوم
    fees: number // الرسوم
    feesBearer: 'sender' | 'receiver' | 'none' // من يتحمل الرسوم
    // المبلغ المحصل من العميل
    collectionAmount: number
    // نوع التحصيل
    collectionType: 'immediate' | 'deferred' // فوري أو أجل
    // حساب التحصيل (إذا كان فوري)
    creditAccountType?: 'bank' | 'e-wallet' | 'pos' | 'cash-vault' | 'prepaid-card' | 'customer'
    creditAccountId?: string
  }

  // معلومات النظام
  createdAt: string
  updatedAt: string
  createdBy?: string
}

/**
 * عنصر في الفاتورة
 */
export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  description?: string
}

/**
 * دفعة من العميل
 */
export interface CustomerPayment {
  id: string
  customerId: string
  invoiceId?: string // اختياري - قد تكون دفعة عامة
  
  // معلومات الدفعة
  paymentDate: string
  amount: number
  paymentMethod: PaymentMethod
  
  // التفاصيل
  referenceNumber?: string // رقم الشيك أو رقم التحويل
  notes?: string
  
  // المرفقات
  attachments?: string[]
  
  // معلومات النظام
  createdAt: string
  createdBy?: string
}

/**
 * مرتجع من العميل
 */
export interface CustomerReturn {
  id: string
  customerId: string
  invoiceId?: string
  
  // معلومات المرتجع
  returnDate: string
  amount: number
  reason?: string
  
  // التفاصيل
  items?: InvoiceItem[]
  notes?: string
  
  // معلومات النظام
  createdAt: string
  createdBy?: string
}

/**
 * معاملة مالية (موحدة)
 */
export interface CustomerTransaction {
  id: string
  customerId: string
  
  // نوع المعاملة
  type: TransactionType
  
  // معلومات المعاملة
  date: string
  amount: number
  description: string
  
  // الرصيد بعد المعاملة
  balanceAfter: number
  
  // مرجع المعاملة
  referenceId?: string // ID الفاتورة أو الدفعة أو المرتجع
  referenceType?: 'invoice' | 'payment' | 'return'
  
  // معلومات النظام
  createdAt: string
}

/**
 * ملاحظة على العميل
 */
export interface CustomerNote {
  id: string
  customerId: string
  
  // محتوى الملاحظة
  content: string
  type: 'note' | 'call' | 'meeting' | 'email' | 'other'
  
  // معلومات النظام
  createdAt: string
  createdBy?: string
}

/**
 * مرفق للعميل
 */
export interface CustomerAttachment {
  id: string
  customerId: string
  
  // معلومات الملف
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  
  // التصنيف
  category: 'contract' | 'invoice' | 'id' | 'other'
  description?: string
  
  // معلومات النظام
  uploadedAt: string
  uploadedBy?: string
}

/**
 * سجل نشاط العميل
 */
export interface CustomerActivityLog {
  id: string
  customerId: string
  
  // نوع النشاط
  action: 'created' | 'updated' | 'deleted' | 'invoice_added' | 'payment_received' | 'status_changed' | 'other'
  
  // التفاصيل
  description: string
  changes?: Record<string, { old: any; new: any }>
  
  // معلومات النظام
  timestamp: string
  performedBy?: string
}

/**
 * إحصائيات العميل
 */
export interface CustomerStats {
  customerId: string
  
  // الإحصائيات المالية
  totalInvoices: number
  totalPurchases: number
  totalPayments: number
  totalReturns: number
  currentDebt: number
  averageInvoiceValue: number
  
  // الإحصائيات الزمنية
  lastInvoiceDate?: string
  lastPaymentDate?: string
  daysSinceLastPurchase?: number
  
  // حالة المديونية
  overdueAmount: number
  overdueInvoices: number
}

/**
 * فلتر البحث عن العملاء
 */
export interface CustomerFilter {
  searchQuery?: string
  status?: CustomerStatus[]
  category?: CustomerCategory[]
  minDebt?: number
  maxDebt?: number
  registrationDateFrom?: string
  registrationDateTo?: string
}

/**
 * خيارات الفرز
 */
export interface CustomerSortOptions {
  field: 'fullName' | 'registrationDate' | 'currentDebt' | 'totalPurchases'
  direction: 'asc' | 'desc'
}

/**
 * تقرير العميل
 */
export interface CustomerReport {
  customer: Customer
  stats: CustomerStats
  invoices: CustomerInvoice[]
  payments: CustomerPayment[]
  returns: CustomerReturn[]
  transactions: CustomerTransaction[]
  
  // بيانات الرسوم البيانية
  monthlyPurchases: { month: string; amount: number }[]
  monthlyPayments: { month: string; amount: number }[]
  debtEvolution: { date: string; debt: number }[]
}

/**
 * فترة زمنية للتقرير
 */
export type ReportPeriod = 'today' | 'week' | 'month' | 'year' | 'custom'

/**
 * خيارات التقرير
 */
export interface ReportOptions {
  period: ReportPeriod
  startDate?: string
  endDate?: string
  includeCharts?: boolean
  includeTransactions?: boolean
}

