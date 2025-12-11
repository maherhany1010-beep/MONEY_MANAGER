/**
 * أنواع البيانات لنظام إدارة الجمعيات المالية
 * Savings Circles / ROSCAs (Rotating Savings and Credit Associations)
 */

/**
 * نوع الجمعية
 */
export type CircleType = 'app-based' | 'personal'

/**
 * دور المستخدم في الجمعية
 */
export type CircleRole = 'manager' | 'member'

/**
 * حالة الجمعية
 */
export type CircleStatus = 'active' | 'completed' | 'cancelled' | 'pending'

/**
 * نوع الرسوم
 */
export type FeeType = 'monthly' | 'one-time' | 'percentage'

/**
 * طريقة الدفع
 */
export type PaymentMethod = 'cash' | 'bank-transfer' | 'e-wallet' | 'app'

/**
 * حالة العضو
 */
export type MemberStatus = 'active' | 'withdrawn' | 'defaulted'

/**
 * عضو في الجمعية
 */
export interface CircleMember {
  id: string
  name: string
  phone?: string
  email?: string
  turnNumber: number // رقم الدور (متى يستلم المبلغ الكلي)
  hasPaid: boolean[] // سجل الدفعات الشهرية [true, true, false, ...]
  hasReceived: boolean // هل استلم دوره؟
  receivedDate?: string // تاريخ الاستلام
  receivedAmount?: number // المبلغ المستلم
  totalPaid: number // إجمالي ما دفعه
  status: MemberStatus // حالة العضو
  notes?: string // ملاحظات
  createdAt: string
  updatedAt: string
}

/**
 * دفعة شهرية
 */
export interface CirclePayment {
  id: string
  circleId: string
  memberId: string
  memberName: string
  amount: number
  roundNumber: number // رقم الدورة (الشهر)
  paymentDate: string
  paymentMethod: PaymentMethod
  linkedAccountId?: string // الحساب المرتبط
  notes?: string
  createdAt: string
}

/**
 * استلام دور
 */
export interface CirclePayout {
  id: string
  circleId: string
  memberId: string
  memberName: string
  amount: number
  roundNumber: number // رقم الدورة عند الاستلام
  payoutDate: string
  paymentMethod: PaymentMethod
  linkedAccountId?: string // الحساب المرتبط
  fees?: number // الرسوم المخصومة
  netAmount: number // المبلغ الصافي بعد الرسوم
  notes?: string
  createdAt: string
}

/**
 * الجمعية المالية
 */
export interface SavingsCircle {
  id: string
  name: string // اسم الجمعية
  description?: string // وصف الجمعية
  type: CircleType // نوع الجمعية
  role: CircleRole // دورك في الجمعية

  // تفاصيل الجمعية
  monthlyAmount: number // المبلغ الشهري لكل عضو
  totalMembers: number // عدد الأعضاء الكلي
  duration: number // المدة بالأشهر (= عدد الأعضاء عادةً)
  startDate: string // تاريخ البداية
  endDate: string // تاريخ النهاية المتوقعة

  // الرسوم
  hasFees: boolean // هل توجد رسوم؟
  managementFee?: number // رسوم إدارية
  feeType?: FeeType // نوع الرسوم
  lateFee?: number // رسوم التأخير
  earlyWithdrawalFee?: number // رسوم الانسحاب المبكر

  // الحالة
  status: CircleStatus // حالة الجمعية
  currentRound: number // الدورة الحالية (الشهر الحالي)

  // الأعضاء (إذا كنت المدير)
  members: CircleMember[]

  // معلومات الدفع
  paymentMethod: PaymentMethod // طريقة الدفع
  linkedAccountId?: string // الحساب المرتبط (بنك/محفظة/نقدية)
  linkedAccountType?: 'bank' | 'cash' | 'ewallet' | 'prepaid' // نوع الحساب المرتبط

  // معلومات إضافية (إذا كنت عضو)
  myTurnNumber?: number // رقم دورك إذا كنت عضو
  myMemberId?: string // معرف عضويتك إذا كنت عضو

  // معلومات التطبيق (إذا كانت app-based)
  appName?: string // اسم التطبيق (MoneyFellows, Gam3eety, etc.)
  appAccountId?: string // معرف الحساب في التطبيق

  // الإحصائيات
  totalCollected: number // إجمالي المبالغ المحصلة
  totalDistributed: number // إجمالي المبالغ الموزعة
  totalFees: number // إجمالي الرسوم المحصلة
  currentBalance: number // الرصيد الحالي

  // Database fields (snake_case) for compatibility
  circle_name?: string
  monthly_payment?: number
  total_amount?: number
  start_date?: string
  end_date?: string | null
  current_round?: number
  my_turn_number?: number
  user_id?: string
  created_at?: string
  updated_at?: string

  // Additional tracking fields
  totalPaid?: number // إجمالي ما تم دفعه
  hasWithdrawn?: boolean // هل تم السحب؟
  withdrawnAmount?: number // المبلغ المسحوب
  totalWithdrawn?: number // إجمالي المسحوبات

  // التواريخ
  createdAt: string
  updatedAt: string
}

/**
 * إحصائيات الجمعية
 */
export interface CircleStats {
  totalCircles: number
  activeCircles: number
  completedCircles: number
  cancelledCircles: number
  totalMonthlyCommitment: number // إجمالي الالتزام الشهري
  totalInCircles: number // إجمالي الأموال في الجمعيات
  totalFeesEarned: number // إجمالي الرسوم المكتسبة (كمدير)
  averageMonthlyAmount: number
  upcomingPayouts: CirclePayout[] // الاستلامات القادمة
  overduePayments: CirclePayment[] // الدفعات المتأخرة
  totalPayments?: number // إجمالي الدفعات
  totalWithdrawals?: number // إجمالي السحوبات
  balance?: number // الرصيد الحالي
  totalSavings?: number // إجمالي المدخرات
  monthlyContribution?: number // المساهمة الشهرية
}

/**
 * فلتر الجمعيات
 */
export interface CircleFilter {
  role?: CircleRole
  status?: CircleStatus
  type?: CircleType
  searchQuery?: string
}

/**
 * بيانات نموذج إضافة/تعديل جمعية
 */
export interface CircleFormData {
  name: string
  description?: string
  type: CircleType
  role: CircleRole
  monthlyAmount: string
  totalMembers: string
  duration: string
  startDate: string
  hasFees: boolean
  managementFee?: string
  feeType?: FeeType
  lateFee?: string
  earlyWithdrawalFee?: string
  paymentMethod: PaymentMethod
  linkedAccountId?: string
  linkedAccountType?: 'bank' | 'cash' | 'ewallet' | 'prepaid'
  myTurnNumber?: string
  appName?: string
  appAccountId?: string
  members: Omit<CircleMember, 'id' | 'hasPaid' | 'hasReceived' | 'totalPaid' | 'status' | 'createdAt' | 'updatedAt'>[]
}

/**
 * بيانات نموذج تسجيل دفعة
 */
export interface PaymentFormData {
  circleId: string
  memberId: string
  amount: string
  roundNumber: number
  paymentDate: string
  paymentMethod: PaymentMethod
  linkedAccountId?: string
  notes?: string
}

/**
 * بيانات نموذج تسجيل استلام
 */
export interface PayoutFormData {
  circleId: string
  memberId: string
  amount: string
  roundNumber: number
  payoutDate: string
  paymentMethod: PaymentMethod
  linkedAccountId?: string
  fees?: string
  notes?: string
}

