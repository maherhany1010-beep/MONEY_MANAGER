/**
 * أنواع البيانات الخاصة بنظام استرداد الكاش باك
 */

/**
 * حالة الكاش باك
 */
export type CashbackStatus = 'pending' | 'approved' | 'redeemed' | 'expired' | 'cancelled'

/**
 * نوع الاسترداد
 */
export type RedemptionType = 'balance' | 'voucher' // رصيد البطاقة أو قسيمة مشتريات

/**
 * نوع الاسترداد (كلي أو جزئي)
 */
export type RedemptionMode = 'full' | 'partial'

/**
 * سجل الكاش باك
 */
export interface CashbackRecord {
  id: string
  cardId: string // البطاقة المرتبطة
  
  // معلومات الكاش باك
  amount: number // المبلغ الإجمالي
  earnedDate: string // تاريخ الحصول على الكاش باك
  source: string // مصدر الكاش باك (اسم المتجر، العملية، إلخ)
  description?: string
  
  // الاسترداد التلقائي
  autoRedeemEnabled: boolean // تفعيل الاسترداد التلقائي
  autoRedeemDays: number // عدد الأيام للاسترداد التلقائي (0 = معطل)
  autoRedeemDate?: string // تاريخ الاسترداد التلقائي المتوقع
  
  // الحالة
  status: CashbackStatus
  
  // المبالغ
  redeemedAmount: number // المبلغ المسترد
  remainingAmount: number // المبلغ المتبقي
  
  // معلومات النظام
  createdAt: string
  updatedAt: string
}

/**
 * عملية استرداد الكاش باك
 */
export interface CashbackRedemption {
  id: string
  cashbackId: string // معرف سجل الكاش باك
  cardId: string
  
  // معلومات الاسترداد
  redemptionDate: string
  amount: number // المبلغ المسترد
  redemptionType: RedemptionType // رصيد أو قسيمة
  redemptionMode: RedemptionMode // كلي أو جزئي
  
  // تفاصيل القسيمة (إذا كان النوع قسيمة)
  voucherDetails?: {
    storeName: string // اسم المكان
    voucherCode?: string // كود القسيمة (اختياري)
    expiryDate?: string // تاريخ انتهاء القسيمة
    notes?: string
  }
  
  // معلومات إضافية
  isAutomatic: boolean // هل تم الاسترداد تلقائياً
  notes?: string
  
  // معلومات النظام
  createdAt: string
  createdBy?: string
}

/**
 * إعدادات الكاش باك للبطاقة
 */
export interface CardCashbackSettings {
  cardId: string
  
  // الإعدادات العامة
  cashbackEnabled: boolean // تفعيل الكاش باك
  cashbackRate: number // نسبة الكاش باك (%)
  
  // الاسترداد التلقائي
  autoRedeemEnabled: boolean // تفعيل الاسترداد التلقائي
  autoRedeemDays: number // عدد الأيام للاسترداد التلقائي
  autoRedeemType: RedemptionType // نوع الاسترداد التلقائي (رصيد أو قسيمة)
  autoRedeemStoreName?: string // اسم المكان للقسيمة (إذا كان النوع قسيمة)
  
  // الحدود
  minRedemptionAmount: number // الحد الأدنى للاسترداد
  maxCashbackPerTransaction: number // الحد الأقصى للكاش باك لكل عملية
  
  // معلومات النظام
  updatedAt: string
}

/**
 * إحصائيات الكاش باك
 */
export interface CashbackStats {
  cardId: string
  
  // الإحصائيات المالية
  totalEarned: number // إجمالي الكاش باك المكتسب
  totalRedeemed: number // إجمالي الكاش باك المسترد
  totalPending: number // إجمالي الكاش باك المعلق
  totalExpired: number // إجمالي الكاش باك المنتهي
  availableBalance: number // الرصيد المتاح للاسترداد
  
  // الإحصائيات العددية
  totalRecords: number // عدد سجلات الكاش باك
  totalRedemptions: number // عدد عمليات الاسترداد
  
  // التوزيع
  redemptionsByType: {
    balance: number // عدد الاستردادات للرصيد
    voucher: number // عدد الاستردادات للقسائم
  }
  
  // التواريخ
  lastEarnedDate?: string
  lastRedeemedDate?: string
}

/**
 * فلتر البحث عن الكاش باك
 */
export interface CashbackFilter {
  cardId?: string
  status?: CashbackStatus[]
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}

/**
 * خيارات الفرز
 */
export interface CashbackSortOptions {
  field: 'earnedDate' | 'amount' | 'status'
  direction: 'asc' | 'desc'
}

