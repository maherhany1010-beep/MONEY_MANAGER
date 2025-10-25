import { useMemo } from 'react'

/**
 * Hook لحساب الإحصائيات المالية مع Memoization
 */
export function useFinancialStats(accounts: any[]) {
  return useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return {
        totalBalance: 0,
        totalAccounts: 0,
        averageBalance: 0,
        highestBalance: 0,
        lowestBalance: 0,
      }
    }

    const balances = accounts.map(acc => acc.balance || acc.currentBalance || 0)
    const totalBalance = balances.reduce((sum, balance) => sum + balance, 0)
    const totalAccounts = accounts.length
    const averageBalance = totalBalance / totalAccounts
    const highestBalance = Math.max(...balances)
    const lowestBalance = Math.min(...balances)

    return {
      totalBalance,
      totalAccounts,
      averageBalance,
      highestBalance,
      lowestBalance,
    }
  }, [accounts])
}

/**
 * Hook لفلترة البيانات مع Memoization
 */
export function useFilteredData<T>(
  data: T[],
  filterFn: (item: T) => boolean
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    return data.filter(filterFn)
  }, [data, filterFn])
}

/**
 * Hook لترتيب البيانات مع Memoization
 */
export function useSortedData<T>(
  data: T[],
  sortFn: (a: T, b: T) => number
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    return [...data].sort(sortFn)
  }, [data, sortFn])
}

/**
 * Hook لتجميع البيانات حسب مفتاح مع Memoization
 */
export function useGroupedData<T>(
  data: T[],
  keyFn: (item: T) => string
) {
  return useMemo(() => {
    if (!data || data.length === 0) return {}
    
    return data.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }, [data, keyFn])
}

/**
 * Hook لحساب مجموع حقل معين مع Memoization
 */
export function useSumByField<T>(
  data: T[],
  fieldFn: (item: T) => number
) {
  return useMemo(() => {
    if (!data || data.length === 0) return 0
    return data.reduce((sum, item) => sum + fieldFn(item), 0)
  }, [data, fieldFn])
}

/**
 * Hook لحساب إحصائيات متقدمة مع Memoization
 */
export function useAdvancedStats(data: number[]) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return {
        mean: 0,
        median: 0,
        mode: 0,
        standardDeviation: 0,
        variance: 0,
      }
    }

    // المتوسط
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length

    // الوسيط
    const sorted = [...data].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]

    // المنوال
    const frequency: Record<number, number> = {}
    let maxFreq = 0
    let mode = data[0]
    
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val]
        mode = val
      }
    })

    // التباين والانحراف المعياري
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    const standardDeviation = Math.sqrt(variance)

    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
    }
  }, [data])
}

/**
 * Hook لحساب النسب المئوية مع Memoization
 */
export function usePercentages(values: number[]) {
  return useMemo(() => {
    if (!values || values.length === 0) return []
    
    const total = values.reduce((sum, val) => sum + val, 0)
    if (total === 0) return values.map(() => 0)
    
    return values.map(val => (val / total) * 100)
  }, [values])
}

/**
 * Hook لحساب معدل النمو مع Memoization
 */
export function useGrowthRate(currentValue: number, previousValue: number) {
  return useMemo(() => {
    if (previousValue === 0) return 0
    return ((currentValue - previousValue) / previousValue) * 100
  }, [currentValue, previousValue])
}

/**
 * Hook لتحويل البيانات إلى Chart Data مع Memoization
 */
export function useChartData<T>(
  data: T[],
  labelFn: (item: T) => string,
  valueFn: (item: T) => number
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map(item => ({
      label: labelFn(item),
      value: valueFn(item),
    }))
  }, [data, labelFn, valueFn])
}

/**
 * Hook لحساب Top N Items مع Memoization
 */
export function useTopItems<T>(
  data: T[],
  valueFn: (item: T) => number,
  limit: number = 5
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    
    return [...data]
      .sort((a, b) => valueFn(b) - valueFn(a))
      .slice(0, limit)
  }, [data, valueFn, limit])
}

/**
 * Hook لحساب البيانات الشهرية مع Memoization
 */
export function useMonthlyData<T>(
  data: T[],
  dateFn: (item: T) => Date,
  valueFn: (item: T) => number
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []

    const monthlyMap: Record<string, number> = {}

    data.forEach(item => {
      const date = dateFn(item)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + valueFn(item)
    })

    return Object.entries(monthlyMap)
      .map(([month, value]) => ({ month, value }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [data, dateFn, valueFn])
}

/**
 * Hook للبحث في البيانات مع Memoization
 */
export function useSearchData<T>(
  data: T[],
  searchTerm: string,
  searchFields: ((item: T) => string)[]
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []
    if (!searchTerm || searchTerm.trim() === '') return data

    const lowerSearchTerm = searchTerm.toLowerCase()

    return data.filter(item =>
      searchFields.some(fieldFn =>
        fieldFn(item).toLowerCase().includes(lowerSearchTerm)
      )
    )
  }, [data, searchTerm, searchFields])
}

/**
 * Hook للبحث والفلترة المتقدمة مع Memoization
 */
export function useAdvancedSearch<T>(
  data: T[],
  searchTerm: string,
  searchFields: ((item: T) => string)[],
  filters: Record<string, any> = {},
  filterFunctions: Record<string, (item: T, value: any) => boolean> = {}
) {
  return useMemo(() => {
    if (!data || data.length === 0) return []

    let result = data

    // Apply search
    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase()
      result = result.filter(item =>
        searchFields.some(fieldFn =>
          fieldFn(item).toLowerCase().includes(lowerSearchTerm)
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([filterId, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        const filterFn = filterFunctions[filterId]
        if (filterFn) {
          result = result.filter(item => filterFn(item, value))
        }
      }
    })

    return result
  }, [data, searchTerm, searchFields, filters, filterFunctions])
}

/**
 * Hook لحساب Pagination مع Memoization
 */
export function usePaginatedData<T>(
  data: T[],
  page: number,
  pageSize: number
) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return {
        items: [],
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    }

    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = data.slice(startIndex, endIndex)

    return {
      items,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  }, [data, page, pageSize])
}

