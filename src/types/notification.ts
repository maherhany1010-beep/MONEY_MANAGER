// أنواع الإشعارات المختلفة في النظام

export type NotificationType =
  | 'payment_due'                    // تذكير بالمدفوعات المستحقة
  | 'low_balance'                    // تنبيه انخفاض الرصيد
  | 'credit_limit'                   // تنبيه الحد الائتماني
  | 'large_transaction'              // تنبيه بمعاملة كبيرة
  | 'cashback_earned'                // إشعار بكاش باك مكتسب
  | 'installment_due'                // تذكير بقسط مستحق
  | 'investment_change'              // تغيير في الاستثمارات
  | 'inventory_low'                  // مخزون منخفض
  | 'customer_payment'               // دفعة من عميل
  | 'savings_circle'                 // إشعار جمعية
  | 'customer_debt_threshold'        // تنبيه تجاوز حد المديونية
  | 'customer_invoice_due_soon'      // تذكير بفاتورة مستحقة قريباً
  | 'customer_invoice_overdue'       // تنبيه بفاتورة متأخرة
  | 'customer_payment_received'      // إشعار باستقبال دفعة من عميل
  | 'customer_transfer_completed'    // إشعار بإتمام تحويل
  | 'customer_data_modified'         // إشعار بتعديل بيانات العميل
  | 'general'                        // إشعار عام

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface AppNotification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  enabled: boolean
  
  // إعدادات المدفوعات
  paymentReminders: {
    enabled: boolean
    threeDaysBefore: boolean
    oneDayBefore: boolean
    onDueDate: boolean
  }
  
  // إعدادات الرصيد
  lowBalance: {
    enabled: boolean
    threshold: number // المبلغ الذي يتم التنبيه عنده
  }
  
  // إعدادات الحد الائتماني
  creditLimit: {
    enabled: boolean
    threshold80: boolean // تنبيه عند 80%
    threshold90: boolean // تنبيه عند 90%
    threshold100: boolean // تنبيه عند 100%
  }
  
  // إعدادات المعاملات الكبيرة
  largeTransactions: {
    enabled: boolean
    threshold: number // المبلغ الذي يعتبر معاملة كبيرة
  }
  
  // إعدادات الكاش باك
  cashback: {
    enabled: boolean
    notifyOnEarn: boolean
  }
  
  // إعدادات الأقساط
  installments: {
    enabled: boolean
    threeDaysBefore: boolean
    oneDayBefore: boolean
    onDueDate: boolean
  }
  
  // إعدادات الاستثمارات
  investments: {
    enabled: boolean
    priceChangeThreshold: number // نسبة مئوية
  }
  
  // إعدادات المخزون
  inventory: {
    enabled: boolean
    lowStockThreshold: number
  }
  
  // إعدادات العملاء
  customers: {
    enabled: boolean
    notifyOnPayment: boolean
    notifyOnOverdue: boolean
  }
  
  // إعدادات الجمعيات
  savingsCircles: {
    enabled: boolean
    notifyOnDue: boolean
    notifyOnCollection: boolean
  }
  
  // إعدادات Web Push
  webPush: {
    enabled: boolean
    permission: 'default' | 'granted' | 'denied'
  }
  
  // إعدادات الصوت
  sound: {
    enabled: boolean
  }
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  
  paymentReminders: {
    enabled: true,
    threeDaysBefore: true,
    oneDayBefore: true,
    onDueDate: true,
  },
  
  lowBalance: {
    enabled: true,
    threshold: 1000,
  },
  
  creditLimit: {
    enabled: true,
    threshold80: true,
    threshold90: true,
    threshold100: true,
  },
  
  largeTransactions: {
    enabled: true,
    threshold: 5000,
  },
  
  cashback: {
    enabled: true,
    notifyOnEarn: true,
  },
  
  installments: {
    enabled: true,
    threeDaysBefore: true,
    oneDayBefore: true,
    onDueDate: true,
  },
  
  investments: {
    enabled: true,
    priceChangeThreshold: 5,
  },
  
  inventory: {
    enabled: true,
    lowStockThreshold: 10,
  },
  
  customers: {
    enabled: true,
    notifyOnPayment: true,
    notifyOnOverdue: true,
  },
  
  savingsCircles: {
    enabled: true,
    notifyOnDue: true,
    notifyOnCollection: true,
  },
  
  webPush: {
    enabled: false,
    permission: 'default',
  },
  
  sound: {
    enabled: true,
  },
}

