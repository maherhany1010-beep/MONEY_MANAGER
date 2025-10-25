/**
 * Performance monitoring utilities
 */

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string) {
  if (typeof window === 'undefined' || !window.performance) return

  const startMark = `${componentName}-render-start`
  const endMark = `${componentName}-render-end`
  const measureName = `${componentName}-render`

  performance.mark(startMark)

  return () => {
    performance.mark(endMark)
    performance.measure(measureName, startMark, endMark)

    const measure = performance.getEntriesByName(measureName)[0]
    if (measure && process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${componentName} rendered in ${measure.duration.toFixed(2)}ms`)
    }

    // Cleanup
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    performance.clearMeasures(measureName)
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    img.src = src
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        img.src = src
        observer.unobserve(img)
      }
    })
  }, options)

  observer.observe(img)

  return () => observer.disconnect()
}

/**
 * Request Idle Callback wrapper
 */
export function runWhenIdle(callback: () => void, options?: IdleRequestOptions) {
  if (typeof window === 'undefined') {
    callback()
    return
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, options)
  } else {
    setTimeout(callback, 1)
  }
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  label?: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label || fn.name} executed in ${(end - start).toFixed(2)}ms`)
    }

    return result
  }) as T
}

/**
 * Async function execution time measurement
 */
export function measureAsyncExecutionTime<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  label?: string
): T {
  return (async (...args: Parameters<T>) => {
    const start = performance.now()
    const result = await fn(...args)
    const end = performance.now()

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label || fn.name} executed in ${(end - start).toFixed(2)}ms`)
    }

    return result
  }) as T
}

/**
 * Get Web Vitals metrics
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vitals:', metric)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // })
  }
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory
  if (memory && memory < 4) return true

  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency
  if (cores && cores < 4) return true

  // Check connection speed
  const connection = (navigator as any).connection
  if (connection) {
    const effectiveType = connection.effectiveType
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return true
  }

  return false
}

/**
 * Prefetch resource
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' = 'script') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = type
  link.href = url

  document.head.appendChild(link)
}

/**
 * Preload critical resource
 */
export function preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script') {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = type
  link.href = url

  if (type === 'font') {
    link.crossOrigin = 'anonymous'
  }

  document.head.appendChild(link)
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  if (!navigation) return null

  return {
    // Page load metrics
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Network metrics
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    
    // Rendering metrics
    domInteractive: navigation.domInteractive - navigation.fetchStart,
    domComplete: navigation.domComplete - navigation.fetchStart,
    
    // Total time
    totalTime: navigation.loadEventEnd - navigation.fetchStart,
  }
}

/**
 * Log performance metrics
 */
export function logPerformanceMetrics() {
  if (process.env.NODE_ENV !== 'development') return

  runWhenIdle(() => {
    const metrics = getPerformanceMetrics()
    if (metrics) {
      console.group('📊 Performance Metrics')
      console.table(metrics)
      console.groupEnd()
    }
  })
}

/**
 * Optimize large list rendering
 */
export function getVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = Math.min(totalItems, start + visibleCount + overscan * 2)

  return { start, end }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Adaptive loading based on network conditions
 */
export function shouldLoadHeavyContent(): boolean {
  if (typeof window === 'undefined') return true

  // Check if device is low-end
  if (isLowEndDevice()) return false

  // Check network connection
  const connection = (navigator as any).connection
  if (connection) {
    const effectiveType = connection.effectiveType
    // Only load heavy content on good connections
    if (effectiveType === '4g' || effectiveType === 'wifi') return true
    return false
  }

  return true
}

