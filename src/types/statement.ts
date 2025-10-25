/**
 * أنواع البيانات الخاصة بكشوف الحساب الشهرية للبطاقات الائتمانية
 */

/**
 * حالة كشف الحساب
 */
export type StatementStatus = 'current' | 'paid' | 'overdue' | 'partial'

/**
 * كشف الحساب الشهري
 */
export interface CreditCardStatement {
  id: string
  cardId: string
  cardName: string
  
  // معلومات الفترة
  month: number // 1-12
  year: number
  statementDate: string // تاريخ إصدار الكشف
  dueDate: string // تاريخ الاستحقاق
  
  // المبالغ
  previousBalance: number // الرصيد السابق
  currentBalance: number // الرصيد الحالي
  totalSpent: number // إجمالي المصروفات
  totalPayments: number // إجمالي المدفوعات
  minimumPayment: number // الحد الأدنى للسداد
  
  // تتبع السداد
  statementAmount: number // إجمالي مبلغ الكشف (المطلوب سداده)
  paidAmount: number // المبلغ المدفوع من الكشف
  remainingAmount: number // المبلغ المتبقي من الكشف
  paymentPercentage: number // نسبة السداد (0-100)
  
  // معلومات إضافية
  cashbackEarned: number // الكاش باك المكتسب
  interestCharges: number // رسوم الفائدة
  fees: number // الرسوم الأخرى
  
  // الحالة
  status: StatementStatus
  
  // معلومات النظام
  createdAt: string
  updatedAt: string
}

/**
 * دفعة على كشف حساب
 */
export interface StatementPayment {
  id: string
  statementId: string
  cardId: string
  
  // معلومات الدفعة
  paymentDate: string
  amount: number
  paymentMethod: 'bank-transfer' | 'cash' | 'check' | 'other'
  referenceNumber?: string
  
  // ملاحظات
  notes?: string
  
  // معلومات النظام
  createdAt: string
  createdBy?: string
}

/**
 * إحصائيات كشف الحساب
 */
export interface StatementStats {
  cardId: string
  
  // الإحصائيات
  totalStatements: number
  paidStatements: number
  overdueStatements: number
  partialStatements: number
  
  // المبالغ
  totalOwed: number // إجمالي المديونية
  totalPaid: number // إجمالي المدفوع
  totalRemaining: number // إجمالي المتبقي
  
  // متوسطات
  averageStatementAmount: number
  averagePaymentPercentage: number
}

/**
 * فلتر كشوف الحساب
 */
export interface StatementFilter {
  cardId?: string
  year?: number
  month?: number
  status?: StatementStatus[]
  dateFrom?: string
  dateTo?: string
}

/**
 * خيارات الفرز
 */
export interface StatementSortOptions {
  field: 'statementDate' | 'dueDate' | 'statementAmount' | 'paymentPercentage'
  direction: 'asc' | 'desc'
}

