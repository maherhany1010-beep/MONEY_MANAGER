/**
 * Advanced Analytics and Insights Library
 */

export interface Insight {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  value?: number
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Calculate statistics
 */
export function calculateStats(numbers: number[]) {
  if (numbers.length === 0) {
    return {
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
      median: 0,
      mode: 0,
      variance: 0,
      standardDeviation: 0,
    }
  }

  const sorted = [...numbers].sort((a, b) => a - b)
  const sum = numbers.reduce((acc, val) => acc + val, 0)
  const average = sum / numbers.length

  // Median
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]

  // Mode
  const frequency: Record<number, number> = {}
  let maxFreq = 0
  let mode = numbers[0]

  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num]
      mode = num
    }
  })

  // Variance and Standard Deviation
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / numbers.length
  const standardDeviation = Math.sqrt(variance)

  return {
    sum,
    average,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median,
    mode,
    variance,
    standardDeviation,
  }
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Calculate trend
 */
export function calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable'

  const recent = data.slice(-3)
  const older = data.slice(-6, -3)

  if (recent.length === 0 || older.length === 0) return 'stable'

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

  const diff = recentAvg - olderAvg
  const threshold = olderAvg * 0.05 // 5% threshold

  if (diff > threshold) return 'up'
  if (diff < -threshold) return 'down'
  return 'stable'
}

/**
 * Detect anomalies using Z-score
 */
export function detectAnomalies(
  data: number[],
  threshold: number = 2
): number[] {
  const stats = calculateStats(data)
  const anomalies: number[] = []

  data.forEach((value, index) => {
    const zScore = Math.abs((value - stats.average) / stats.standardDeviation)
    if (zScore > threshold) {
      anomalies.push(index)
    }
  })

  return anomalies
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: number[],
  window: number = 7
): number[] {
  const result: number[] = []

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length
    result.push(avg)
  }

  return result
}

/**
 * Predict next value using linear regression
 */
export function predictNextValue(data: number[]): number {
  if (data.length < 2) return data[0] || 0

  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return slope * n + intercept
}

/**
 * Calculate percentile
 */
export function calculatePercentile(data: number[], percentile: number): number {
  const sorted = [...data].sort((a, b) => a - b)
  const index = (percentile / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower

  if (lower === upper) return sorted[lower]
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

/**
 * Generate spending insights
 */
export function generateSpendingInsights(
  currentMonth: number,
  previousMonth: number,
  average: number,
  budget?: number
): Insight[] {
  const insights: Insight[] = []

  // Growth rate
  const growth = calculateGrowthRate(currentMonth, previousMonth)

  if (growth > 20) {
    insights.push({
      id: 'high-growth',
      type: 'warning',
      title: 'زيادة كبيرة في الإنفاق',
      description: `ارتفع إنفاقك بنسبة ${growth.toFixed(1)}% مقارنة بالشهر الماضي`,
      value: currentMonth,
      trend: 'up',
      percentage: growth,
    })
  } else if (growth < -20) {
    insights.push({
      id: 'high-decrease',
      type: 'success',
      title: 'انخفاض كبير في الإنفاق',
      description: `انخفض إنفاقك بنسبة ${Math.abs(growth).toFixed(1)}% مقارنة بالشهر الماضي`,
      value: currentMonth,
      trend: 'down',
      percentage: Math.abs(growth),
    })
  }

  // Budget comparison
  if (budget) {
    const budgetUsage = (currentMonth / budget) * 100

    if (budgetUsage > 90) {
      insights.push({
        id: 'budget-warning',
        type: 'error',
        title: 'تجاوز الميزانية',
        description: `استخدمت ${budgetUsage.toFixed(1)}% من ميزانيتك الشهرية`,
        value: currentMonth,
        percentage: budgetUsage,
      })
    } else if (budgetUsage > 75) {
      insights.push({
        id: 'budget-alert',
        type: 'warning',
        title: 'اقتراب من حد الميزانية',
        description: `استخدمت ${budgetUsage.toFixed(1)}% من ميزانيتك الشهرية`,
        value: currentMonth,
        percentage: budgetUsage,
      })
    }
  }

  // Average comparison
  if (currentMonth > average * 1.3) {
    insights.push({
      id: 'above-average',
      type: 'info',
      title: 'إنفاق أعلى من المتوسط',
      description: `إنفاقك هذا الشهر أعلى بـ ${((currentMonth / average - 1) * 100).toFixed(1)}% من متوسطك`,
      value: currentMonth,
    })
  }

  return insights
}

/**
 * Generate payment insights
 */
export function generatePaymentInsights(
  dueDate: Date,
  minimumPayment: number,
  totalBalance: number,
  lastPaymentDate?: Date
): Insight[] {
  const insights: Insight[] = []
  const today = new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Due date warning
  if (daysUntilDue <= 3 && daysUntilDue > 0) {
    insights.push({
      id: 'payment-due-soon',
      type: 'warning',
      title: 'موعد الدفع قريب',
      description: `يجب دفع ${minimumPayment.toLocaleString('ar-SA')} ريال خلال ${daysUntilDue} أيام`,
      value: minimumPayment,
    })
  } else if (daysUntilDue <= 0) {
    insights.push({
      id: 'payment-overdue',
      type: 'error',
      title: 'تأخر في الدفع',
      description: `تأخرت عن موعد الدفع بـ ${Math.abs(daysUntilDue)} يوم`,
      value: minimumPayment,
    })
  }

  // Minimum payment warning
  if (minimumPayment < totalBalance * 0.1) {
    insights.push({
      id: 'low-payment',
      type: 'info',
      title: 'الدفع الأدنى منخفض',
      description: 'ننصح بدفع أكثر من الحد الأدنى لتقليل الفوائد',
      value: minimumPayment,
    })
  }

  return insights
}

/**
 * Generate cashback insights
 */
export function generateCashbackInsights(
  currentCashback: number,
  potentialCashback: number,
  categories: Record<string, number>
): Insight[] {
  const insights: Insight[] = []

  // Missed cashback
  const missed = potentialCashback - currentCashback
  if (missed > 100) {
    insights.push({
      id: 'missed-cashback',
      type: 'warning',
      title: 'فرصة لزيادة الكاش باك',
      description: `يمكنك كسب ${missed.toLocaleString('ar-SA')} ريال إضافي باستخدام البطاقات المناسبة`,
      value: missed,
    })
  }

  // Best category
  const bestCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]
  if (bestCategory && bestCategory[1] > 0) {
    insights.push({
      id: 'best-category',
      type: 'success',
      title: 'أفضل فئة للكاش باك',
      description: `حصلت على ${bestCategory[1].toLocaleString('ar-SA')} ريال من فئة ${bestCategory[0]}`,
      value: bestCategory[1],
    })
  }

  return insights
}

/**
 * Calculate correlation between two datasets
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

