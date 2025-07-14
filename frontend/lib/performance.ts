// Performance monitoring utilities
export interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
  navigationStart: number
}

export interface CustomMetric {
  name: string
  value: number
  label?: string
  category?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    navigationStart: performance.now(),
  }

  private customMetrics: Map<string, CustomMetric> = new Map()
  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set()

  constructor() {
    this.initCoreWebVitals()
    this.initCustomMetrics()
  }

  private initCoreWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime
            this.notifyObservers()
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })
      } catch (e) {
        console.warn('FCP observer failed:', e)
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            this.metrics.lcp = lastEntry.startTime
            this.notifyObservers()
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP observer failed:', e)
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.processingStart && entry.startTime) {
              this.metrics.fid = entry.processingStart - entry.startTime
              this.notifyObservers()
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('FID observer failed:', e)
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[]
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              this.metrics.cls = clsValue
              this.notifyObservers()
            }
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS observer failed:', e)
      }
    }

    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      this.notifyObservers()
    }
  }

  private initCustomMetrics() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.addCustomMetric('long_task', entry.duration, 'Long Task', 'performance')
            }
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.warn('Long task observer failed:', e)
      }
    }
  }

  public addCustomMetric(name: string, value: number, label?: string, category?: string) {
    const metric: CustomMetric = { name, value, label, category }
    this.customMetrics.set(name, metric)
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('performance_metric', {
        metric_name: name,
        value,
        label,
        category,
      })
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getCustomMetrics(): CustomMetric[] {
    return Array.from(this.customMetrics.values())
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.add(callback)
    return () => this.observers.delete(callback)
  }

  private notifyObservers() {
    this.observers.forEach((callback) => callback(this.getMetrics()))
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    return fn().finally(() => {
      const duration = performance.now() - start
      this.addCustomMetric(name, duration, `${name} Duration`, 'async')
    })
  }

  public measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      this.addCustomMetric(name, duration, `${name} Duration`, 'sync')
    }
  }

  public getPerformanceScore(): number {
    const { fcp, lcp, fid, cls } = this.metrics
    let score = 100

    // FCP scoring (0-25 points)
    if (fcp !== null) {
      if (fcp <= 1800) score -= 0
      else if (fcp <= 3000) score -= 10
      else score -= 25
    }

    // LCP scoring (0-25 points)
    if (lcp !== null) {
      if (lcp <= 2500) score -= 0
      else if (lcp <= 4000) score -= 10
      else score -= 25
    }

    // FID scoring (0-25 points)
    if (fid !== null) {
      if (fid <= 100) score -= 0
      else if (fid <= 300) score -= 10
      else score -= 25
    }

    // CLS scoring (0-25 points)
    if (cls !== null) {
      if (cls <= 0.1) score -= 0
      else if (cls <= 0.25) score -= 10
      else score -= 25
    }

    return Math.max(0, score)
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceMonitor.getMetrics())

  React.useEffect(() => {
    return performanceMonitor.subscribe(setMetrics)
  }, [])

  return {
    metrics,
    customMetrics: performanceMonitor.getCustomMetrics(),
    performanceScore: performanceMonitor.getPerformanceScore(),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    addCustomMetric: performanceMonitor.addCustomMetric.bind(performanceMonitor),
  }
}

// Utility functions
export const measurePageLoad = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - performanceMonitor.getMetrics().navigationStart
      performanceMonitor.addCustomMetric('page_load', loadTime, 'Page Load Time', 'navigation')
    })
  }
}

export const measureApiCall = async <T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsync(`api_${name}`, apiCall)
}

export const measureComponentRender = (componentName: string) => {
  return performanceMonitor.measureSync(`render_${componentName}`, () => {
    // This would be called at the start of component render
    return () => {
      // This would be called at the end of component render
    }
  })
} 