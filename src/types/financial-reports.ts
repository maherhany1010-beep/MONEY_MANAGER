// أنواع التقارير المالية

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export type ReportType = 'profit-loss' | 'cash-flow' | 'balance-sheet' | 'summary'

export interface DateRange {
  startDate: string
  endDate: string
}

// تقرير الأرباح والخسائر (Profit & Loss Statement)
export interface ProfitLossReport {
  period: DateRange
  
  // الإيرادات
  revenue: {
    cashbackEarned: number
    investmentReturns: number
    salesRevenue: number
    otherIncome: number
    total: number
  }
  
  // المصروفات
  expenses: {
    cardPayments: number
    installments: number
    fees: number
    purchases: number
    transfers: number
    otherExpenses: number
    total: number
  }
  
  // صافي الربح/الخسارة
  netProfit: number
  profitMargin: number // نسبة مئوية
}

// تقرير التدفقات النقدية (Cash Flow Report)
export interface CashFlowReport {
  period: DateRange
  
  // التدفقات النقدية من الأنشطة التشغيلية
  operatingActivities: {
    cashReceived: number // النقد المستلم
    cashPaid: number // النقد المدفوع
    net: number // صافي التدفق
  }
  
  // التدفقات النقدية من الأنشطة الاستثمارية
  investingActivities: {
    investmentPurchases: number // شراء استثمارات
    investmentSales: number // بيع استثمارات
    net: number
  }
  
  // التدفقات النقدية من الأنشطة التمويلية
  financingActivities: {
    loansReceived: number // قروض مستلمة
    loansRepaid: number // قروض مسددة
    net: number
  }
  
  // صافي التغير في النقد
  netCashChange: number
  
  // النقد في بداية الفترة
  openingCash: number
  
  // النقد في نهاية الفترة
  closingCash: number
}

// تقرير الميزانية العمومية (Balance Sheet)
export interface BalanceSheetReport {
  asOfDate: string
  
  // الأصول
  assets: {
    // الأصول المتداولة
    currentAssets: {
      cash: number // النقد
      bankAccounts: number // الحسابات البنكية
      eWallets: number // المحافظ الإلكترونية
      prepaidCards: number // البطاقات المسبقة الدفع
      inventory: number // المخزون
      accountsReceivable: number // العملاء (المدينون)
      total: number
    }
    
    // الأصول غير المتداولة
    nonCurrentAssets: {
      investments: number // الاستثمارات
      fixedAssets: number // الأصول الثابتة
      total: number
    }
    
    totalAssets: number
  }
  
  // الخصوم
  liabilities: {
    // الخصوم المتداولة
    currentLiabilities: {
      creditCards: number // البطاقات الائتمانية
      installments: number // الأقساط المستحقة
      accountsPayable: number // الموردون (الدائنون)
      savingsCircles: number // الجمعيات
      total: number
    }
    
    // الخصوم غير المتداولة
    nonCurrentLiabilities: {
      longTermLoans: number // القروض طويلة الأجل
      total: number
    }
    
    totalLiabilities: number
  }
  
  // حقوق الملكية
  equity: {
    capital: number // رأس المال
    retainedEarnings: number // الأرباح المحتجزة
    currentPeriodProfit: number // ربح الفترة الحالية
    total: number
  }
  
  // إجمالي الخصوم وحقوق الملكية
  totalLiabilitiesAndEquity: number
}

// ملخص التقرير المالي
export interface FinancialSummary {
  period: DateRange
  
  // مؤشرات الأداء الرئيسية
  kpis: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    
    cashFlow: number
    liquidityRatio: number // نسبة السيولة
    debtRatio: number // نسبة المديونية
  }
  
  // المقارنة مع الفترة السابقة
  comparison?: {
    revenueChange: number // نسبة التغير
    expensesChange: number
    profitChange: number
    assetsChange: number
    liabilitiesChange: number
  }
}

// بيانات الرسم البياني
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

// فلاتر التقارير
export interface ReportFilters {
  period: ReportPeriod
  dateRange?: DateRange
  cardId?: string
  category?: string
  accountType?: 'all' | 'bank' | 'cash' | 'wallet' | 'card'
}

// إعدادات التصدير
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeDetails: boolean
  fileName?: string
}

