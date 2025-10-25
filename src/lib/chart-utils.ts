/**
 * Utilities for transforming data for charts with performance optimization
 */

/**
 * Sample large datasets to improve chart performance
 * Reduces data points while maintaining visual accuracy
 */
export function sampleData<T>(data: T[], maxPoints: number = 50): T[] {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  const sampled: T[] = []

  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i])
  }

  // Always include the last point
  if (sampled[sampled.length - 1] !== data[data.length - 1]) {
    sampled.push(data[data.length - 1])
  }

  return sampled
}

/**
 * Aggregate data by time period (day, week, month)
 */
export function aggregateByPeriod<T>(
  data: T[],
  dateFn: (item: T) => Date,
  valueFn: (item: T) => number,
  period: 'day' | 'week' | 'month' = 'day'
): Array<{ date: string; value: number }> {
  const aggregated: Record<string, number> = {}

  data.forEach(item => {
    const date = dateFn(item)
    let key: string

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
    }

    aggregated[key] = (aggregated[key] || 0) + valueFn(item)
  })

  return Object.entries(aggregated)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate moving average for smoother charts
 */
export function calculateMovingAverage(
  data: number[],
  windowSize: number = 7
): number[] {
  if (data.length < windowSize) return data

  const result: number[] = []

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const window = data.slice(start, i + 1)
    const average = window.reduce((sum, val) => sum + val, 0) / window.length
    result.push(average)
  }

  return result
}

/**
 * Format large numbers for chart labels
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}م`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}ألف`
  }
  return value.toFixed(0)
}

/**
 * Generate color palette for charts
 */
export function generateColorPalette(count: number): string[] {
  const baseColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
  ]

  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }

  // Generate additional colors by interpolation
  const colors = [...baseColors]
  while (colors.length < count) {
    colors.push(baseColors[colors.length % baseColors.length])
  }

  return colors
}

/**
 * Transform data for pie chart
 */
export function transformToPieData<T>(
  data: T[],
  nameFn: (item: T) => string,
  valueFn: (item: T) => number
): Array<{ name: string; value: number }> {
  return data.map(item => ({
    name: nameFn(item),
    value: valueFn(item),
  }))
}

/**
 * Transform data for line/bar chart
 */
export function transformToChartData<T>(
  data: T[],
  labelFn: (item: T) => string,
  valueFn: (item: T) => number
): Array<{ label: string; value: number }> {
  return data.map(item => ({
    label: labelFn(item),
    value: valueFn(item),
  }))
}

/**
 * Group data by category for stacked charts
 */
export function groupByCategory<T>(
  data: T[],
  categoryFn: (item: T) => string,
  labelFn: (item: T) => string,
  valueFn: (item: T) => number
): Array<Record<string, any>> {
  const grouped: Record<string, Record<string, number>> = {}

  data.forEach(item => {
    const label = labelFn(item)
    const category = categoryFn(item)
    const value = valueFn(item)

    if (!grouped[label]) {
      grouped[label] = {}
    }

    grouped[label][category] = (grouped[label][category] || 0) + value
  })

  return Object.entries(grouped).map(([label, categories]) => ({
    label,
    ...categories,
  }))
}

/**
 * Calculate trend line data
 */
export function calculateTrendLine(
  data: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  if (data.length < 2) return data

  // Simple linear regression
  const n = data.length
  const sumX = data.reduce((sum, point) => sum + point.x, 0)
  const sumY = data.reduce((sum, point) => sum + point.y, 0)
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return data.map(point => ({
    x: point.x,
    y: slope * point.x + intercept,
  }))
}

/**
 * Fill missing dates in time series data
 */
export function fillMissingDates(
  data: Array<{ date: string; value: number }>,
  startDate: Date,
  endDate: Date,
  defaultValue: number = 0
): Array<{ date: string; value: number }> {
  const dataMap = new Map(data.map(item => [item.date, item.value]))
  const result: Array<{ date: string; value: number }> = []

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    result.push({
      date: dateStr,
      value: dataMap.get(dateStr) || defaultValue,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

/**
 * Calculate percentage distribution
 */
export function calculatePercentageDistribution<T>(
  data: T[],
  valueFn: (item: T) => number
): Array<T & { percentage: number }> {
  const total = data.reduce((sum, item) => sum + valueFn(item), 0)

  if (total === 0) {
    return data.map(item => ({ ...item, percentage: 0 }))
  }

  return data.map(item => ({
    ...item,
    percentage: (valueFn(item) / total) * 100,
  }))
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(data: number[]): {
  outliers: number[]
  cleaned: number[]
} {
  if (data.length < 4) return { outliers: [], cleaned: data }

  const sorted = [...data].sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)

  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = q3 - q1

  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const outliers: number[] = []
  const cleaned: number[] = []

  data.forEach(value => {
    if (value < lowerBound || value > upperBound) {
      outliers.push(value)
    } else {
      cleaned.push(value)
    }
  })

  return { outliers, cleaned }
}

/**
 * Normalize data to 0-100 scale
 */
export function normalizeData(data: number[]): number[] {
  if (data.length === 0) return []

  const min = Math.min(...data)
  const max = Math.max(...data)

  if (min === max) return data.map(() => 50)

  return data.map(value => ((value - min) / (max - min)) * 100)
}

