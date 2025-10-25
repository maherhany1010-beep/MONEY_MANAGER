/**
 * دوال حسابية للتقارير المالية
 */

import { 
  ProfitLossReport, 
  CashFlowReport, 
  BalanceSheetReport,
  FinancialSummary,
  DateRange 
} from '@/types/financial-reports'

// حساب تقرير الأرباح والخسائر
export function calculateProfitLoss(
  period: DateRange,
  data: {
    cashbackEarned: number
    investmentReturns: number
    salesRevenue: number
    cardPayments: number
    installments: number
    fees: number
    purchases: number
    transfers: number
  }
): ProfitLossReport {
  // الإيرادات
  const revenue = {
    cashbackEarned: data.cashbackEarned,
    investmentReturns: data.investmentReturns,
    salesRevenue: data.salesRevenue,
    otherIncome: 0,
    total: 0,
  }
  revenue.total = revenue.cashbackEarned + revenue.investmentReturns + revenue.salesRevenue + revenue.otherIncome

  // المصروفات
  const expenses = {
    cardPayments: data.cardPayments,
    installments: data.installments,
    fees: data.fees,
    purchases: data.purchases,
    transfers: data.transfers,
    otherExpenses: 0,
    total: 0,
  }
  expenses.total = expenses.cardPayments + expenses.installments + expenses.fees + expenses.purchases + expenses.transfers + expenses.otherExpenses

  // صافي الربح/الخسارة
  const netProfit = revenue.total - expenses.total
  const profitMargin = revenue.total > 0 ? (netProfit / revenue.total) * 100 : 0

  return {
    period,
    revenue,
    expenses,
    netProfit,
    profitMargin,
  }
}

// حساب تقرير التدفقات النقدية
export function calculateCashFlow(
  period: DateRange,
  data: {
    cashReceived: number
    cashPaid: number
    investmentPurchases: number
    investmentSales: number
    loansReceived: number
    loansRepaid: number
    openingCash: number
  }
): CashFlowReport {
  const operatingActivities = {
    cashReceived: data.cashReceived,
    cashPaid: data.cashPaid,
    net: data.cashReceived - data.cashPaid,
  }

  const investingActivities = {
    investmentPurchases: data.investmentPurchases,
    investmentSales: data.investmentSales,
    net: data.investmentSales - data.investmentPurchases,
  }

  const financingActivities = {
    loansReceived: data.loansReceived,
    loansRepaid: data.loansRepaid,
    net: data.loansReceived - data.loansRepaid,
  }

  const netCashChange = operatingActivities.net + investingActivities.net + financingActivities.net
  const closingCash = data.openingCash + netCashChange

  return {
    period,
    operatingActivities,
    investingActivities,
    financingActivities,
    netCashChange,
    openingCash: data.openingCash,
    closingCash,
  }
}

// حساب تقرير الميزانية العمومية
export function calculateBalanceSheet(
  asOfDate: string,
  data: {
    cash: number
    bankAccounts: number
    eWallets: number
    prepaidCards: number
    inventory: number
    accountsReceivable: number
    investments: number
    fixedAssets: number
    creditCards: number
    installments: number
    accountsPayable: number
    savingsCircles: number
    longTermLoans: number
    capital: number
    retainedEarnings: number
    currentPeriodProfit: number
  }
): BalanceSheetReport {
  // الأصول المتداولة
  const currentAssets = {
    cash: data.cash,
    bankAccounts: data.bankAccounts,
    eWallets: data.eWallets,
    prepaidCards: data.prepaidCards,
    inventory: data.inventory,
    accountsReceivable: data.accountsReceivable,
    total: 0,
  }
  currentAssets.total = currentAssets.cash + currentAssets.bankAccounts + currentAssets.eWallets + 
                        currentAssets.prepaidCards + currentAssets.inventory + currentAssets.accountsReceivable

  // الأصول غير المتداولة
  const nonCurrentAssets = {
    investments: data.investments,
    fixedAssets: data.fixedAssets,
    total: 0,
  }
  nonCurrentAssets.total = nonCurrentAssets.investments + nonCurrentAssets.fixedAssets

  const totalAssets = currentAssets.total + nonCurrentAssets.total

  // الخصوم المتداولة
  const currentLiabilities = {
    creditCards: data.creditCards,
    installments: data.installments,
    accountsPayable: data.accountsPayable,
    savingsCircles: data.savingsCircles,
    total: 0,
  }
  currentLiabilities.total = currentLiabilities.creditCards + currentLiabilities.installments + 
                             currentLiabilities.accountsPayable + currentLiabilities.savingsCircles

  // الخصوم غير المتداولة
  const nonCurrentLiabilities = {
    longTermLoans: data.longTermLoans,
    total: data.longTermLoans,
  }

  const totalLiabilities = currentLiabilities.total + nonCurrentLiabilities.total

  // حقوق الملكية
  const equity = {
    capital: data.capital,
    retainedEarnings: data.retainedEarnings,
    currentPeriodProfit: data.currentPeriodProfit,
    total: 0,
  }
  equity.total = equity.capital + equity.retainedEarnings + equity.currentPeriodProfit

  const totalLiabilitiesAndEquity = totalLiabilities + equity.total

  return {
    asOfDate,
    assets: {
      currentAssets,
      nonCurrentAssets,
      totalAssets,
    },
    liabilities: {
      currentLiabilities,
      nonCurrentLiabilities,
      totalLiabilities,
    },
    equity,
    totalLiabilitiesAndEquity,
  }
}

// حساب الملخص المالي
export function calculateFinancialSummary(
  period: DateRange,
  profitLoss: ProfitLossReport,
  balanceSheet: BalanceSheetReport,
  cashFlow: CashFlowReport,
  previousPeriod?: {
    revenue: number
    expenses: number
    profit: number
    assets: number
    liabilities: number
  }
): FinancialSummary {
  const kpis = {
    totalRevenue: profitLoss.revenue.total,
    totalExpenses: profitLoss.expenses.total,
    netProfit: profitLoss.netProfit,
    profitMargin: profitLoss.profitMargin,
    
    totalAssets: balanceSheet.assets.totalAssets,
    totalLiabilities: balanceSheet.liabilities.totalLiabilities,
    netWorth: balanceSheet.equity.total,
    
    cashFlow: cashFlow.netCashChange,
    liquidityRatio: balanceSheet.liabilities.currentLiabilities.total > 0 
      ? balanceSheet.assets.currentAssets.total / balanceSheet.liabilities.currentLiabilities.total 
      : 0,
    debtRatio: balanceSheet.assets.totalAssets > 0 
      ? (balanceSheet.liabilities.totalLiabilities / balanceSheet.assets.totalAssets) * 100 
      : 0,
  }

  let comparison
  if (previousPeriod) {
    comparison = {
      revenueChange: previousPeriod.revenue > 0 
        ? ((kpis.totalRevenue - previousPeriod.revenue) / previousPeriod.revenue) * 100 
        : 0,
      expensesChange: previousPeriod.expenses > 0 
        ? ((kpis.totalExpenses - previousPeriod.expenses) / previousPeriod.expenses) * 100 
        : 0,
      profitChange: previousPeriod.profit !== 0 
        ? ((kpis.netProfit - previousPeriod.profit) / Math.abs(previousPeriod.profit)) * 100 
        : 0,
      assetsChange: previousPeriod.assets > 0 
        ? ((kpis.totalAssets - previousPeriod.assets) / previousPeriod.assets) * 100 
        : 0,
      liabilitiesChange: previousPeriod.liabilities > 0 
        ? ((kpis.totalLiabilities - previousPeriod.liabilities) / previousPeriod.liabilities) * 100 
        : 0,
    }
  }

  return {
    period,
    kpis,
    comparison,
  }
}

// دالة مساعدة لحساب النسبة المئوية للتغيير
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

// دالة مساعدة لتنسيق الفترة الزمنية
export function formatPeriodLabel(period: DateRange): string {
  const start = new Date(period.startDate)
  const end = new Date(period.endDate)
  
  const startStr = start.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  const endStr = end.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  
  return `من ${startStr} إلى ${endStr}`
}

