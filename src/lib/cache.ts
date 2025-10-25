/**
 * Simple in-memory cache with TTL (Time To Live)
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutes

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiresAt })
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value as T
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) return false
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }
    
    const value = await fetchFn()
    this.set(key, value, ttl)
    return value
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Singleton instance
export const cache = new Cache()

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 10 * 60 * 1000)
}

/**
 * Cache decorator for functions
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  }
): T {
  const keyGenerator = options?.keyGenerator || ((...args: any[]) => JSON.stringify(args))
  
  return ((...args: Parameters<T>) => {
    const key = `memoize:${fn.name}:${keyGenerator(...args)}`
    
    const cached = cache.get<ReturnType<T>>(key)
    if (cached !== null) {
      return cached
    }
    
    const result = fn(...args)
    cache.set(key, result, options?.ttl)
    return result
  }) as T
}

/**
 * Async cache decorator
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  }
): T {
  const keyGenerator = options?.keyGenerator || ((...args: any[]) => JSON.stringify(args))
  
  return (async (...args: Parameters<T>) => {
    const key = `memoize:${fn.name}:${keyGenerator(...args)}`
    
    return await cache.getOrSet(
      key,
      () => fn(...args),
      options?.ttl
    )
  }) as T
}

/**
 * Cache keys generator helpers
 */
export const cacheKeys = {
  financialStats: (accountType: string) => `stats:${accountType}`,
  accountsList: (accountType: string) => `accounts:${accountType}`,
  transactions: (accountId: string, month?: string) => 
    `transactions:${accountId}${month ? `:${month}` : ''}`,
  chartData: (chartType: string, period: string) => `chart:${chartType}:${period}`,
  reports: (reportType: string, startDate: string, endDate: string) => 
    `report:${reportType}:${startDate}:${endDate}`,
  dashboard: (userId?: string) => `dashboard${userId ? `:${userId}` : ''}`,
}

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  /**
   * Invalidate all cache for a specific account type
   */
  accountType: (accountType: string) => {
    const keys = cache.keys()
    keys.forEach(key => {
      if (key.includes(accountType)) {
        cache.delete(key)
      }
    })
  },

  /**
   * Invalidate all cache for a specific account
   */
  account: (accountId: string) => {
    const keys = cache.keys()
    keys.forEach(key => {
      if (key.includes(accountId)) {
        cache.delete(key)
      }
    })
  },

  /**
   * Invalidate all stats cache
   */
  stats: () => {
    const keys = cache.keys()
    keys.forEach(key => {
      if (key.startsWith('stats:')) {
        cache.delete(key)
      }
    })
  },

  /**
   * Invalidate all charts cache
   */
  charts: () => {
    const keys = cache.keys()
    keys.forEach(key => {
      if (key.startsWith('chart:')) {
        cache.delete(key)
      }
    })
  },

  /**
   * Invalidate dashboard cache
   */
  dashboard: () => {
    const keys = cache.keys()
    keys.forEach(key => {
      if (key.startsWith('dashboard')) {
        cache.delete(key)
      }
    })
  },

  /**
   * Invalidate all cache
   */
  all: () => {
    cache.clear()
  },
}

/**
 * React Hook for cached data
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T> | T,
  options?: {
    ttl?: number
    enabled?: boolean
  }
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        const result = await cache.getOrSet(key, fetchFn, options?.ttl)
        setData(result)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, options?.enabled])

  return { data, loading, error }
}

// Import React for the hook
import React from 'react'

