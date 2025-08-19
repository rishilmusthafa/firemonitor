/**
 * Performance monitoring utilities for the FireMonitor application
 */

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  loadTime: number; // Total page load time
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

export interface PerformanceBudget {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  loadTime: number;
  memoryUsage: number;
}

// Default performance budgets
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  fcp: 1500, // 1.5 seconds
  lcp: 2500, // 2.5 seconds
  cls: 0.1,  // 0.1
  fid: 100,  // 100ms
  ttfb: 600, // 600ms
  loadTime: 3000, // 3 seconds
  memoryUsage: 100 * 1024 * 1024, // 100MB
};

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private budget: PerformanceBudget;

  constructor(budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET) {
    this.budget = budget;
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // FCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
            this.logMetric('FCP', fcpEntry.startTime, this.budget.fcp);
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }

      // LCP Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries[entries.length - 1];
          if (lcpEntry) {
            this.metrics.lcp = lcpEntry.startTime;
            this.logMetric('LCP', lcpEntry.startTime, this.budget.lcp);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // CLS Observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cls = clsValue;
          this.logMetric('CLS', clsValue, this.budget.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fidEntry = entries[entries.length - 1];
          if (fidEntry) {
            this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
            this.logMetric('FID', this.metrics.fid, this.budget.fid);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }

  private logMetric(name: string, value: number, budget: number): void {
    const status = value <= budget ? '✅' : '❌';

  }

  public measurePageLoad(): void {
    const startTime = performance.now();
    
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      this.metrics.loadTime = loadTime;
      this.logMetric('Page Load', loadTime, this.budget.loadTime);
    });
  }

  public measureTTFB(): void {
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const navigationEntry = entries[0] as PerformanceNavigationTiming;
          if (navigationEntry) {
            const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
            this.metrics.ttfb = ttfb;
            this.logMetric('TTFB', ttfb, this.budget.ttfb);
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }
    }
  }

  public measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };

      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const budgetMB = this.budget.memoryUsage / 1024 / 1024;
      this.logMetric('Memory Usage', usedMB, budgetMB);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics;
  }

  public checkBudget(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    
    if (this.metrics.fcp && this.metrics.fcp > this.budget.fcp) {
      violations.push(`FCP: ${this.metrics.fcp}ms > ${this.budget.fcp}ms`);
    }
    
    if (this.metrics.lcp && this.metrics.lcp > this.budget.lcp) {
      violations.push(`LCP: ${this.metrics.lcp}ms > ${this.budget.lcp}ms`);
    }
    
    if (this.metrics.cls && this.metrics.cls > this.budget.cls) {
      violations.push(`CLS: ${this.metrics.cls} > ${this.budget.cls}`);
    }
    
    if (this.metrics.fid && this.metrics.fid > this.budget.fid) {
      violations.push(`FID: ${this.metrics.fid}ms > ${this.budget.fid}ms`);
    }
    
    if (this.metrics.ttfb && this.metrics.ttfb > this.budget.ttfb) {
      violations.push(`TTFB: ${this.metrics.ttfb}ms > ${this.budget.ttfb}ms`);
    }
    
    if (this.metrics.loadTime && this.metrics.loadTime > this.budget.loadTime) {
      violations.push(`Load Time: ${this.metrics.loadTime}ms > ${this.budget.loadTime}ms`);
    }
    
    if (this.metrics.memoryUsage && this.metrics.memoryUsage.used > this.budget.memoryUsage) {
      violations.push(`Memory: ${this.metrics.memoryUsage.used / 1024 / 1024}MB > ${this.budget.memoryUsage / 1024 / 1024}MB`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const budgetCheck = this.checkBudget();
    
    let report = '=== Performance Report ===\n';
    report += `FCP: ${metrics.fcp || 'N/A'}ms (budget: ${this.budget.fcp}ms)\n`;
    report += `LCP: ${metrics.lcp || 'N/A'}ms (budget: ${this.budget.lcp}ms)\n`;
    report += `CLS: ${metrics.cls || 'N/A'} (budget: ${this.budget.cls})\n`;
    report += `FID: ${metrics.fid || 'N/A'}ms (budget: ${this.budget.fid}ms)\n`;
    report += `TTFB: ${metrics.ttfb || 'N/A'}ms (budget: ${this.budget.ttfb}ms)\n`;
    report += `Load Time: ${metrics.loadTime || 'N/A'}ms (budget: ${this.budget.loadTime}ms)\n`;
    
    if (metrics.memoryUsage) {
      report += `Memory: ${(metrics.memoryUsage.used / 1024 / 1024).toFixed(2)}MB (budget: ${(this.budget.memoryUsage / 1024 / 1024).toFixed(2)}MB)\n`;
    }
    
    report += `\nBudget Check: ${budgetCheck.passed ? 'PASSED' : 'FAILED'}\n`;
    
    if (budgetCheck.violations.length > 0) {
      report += 'Violations:\n';
      budgetCheck.violations.forEach(violation => {
        report += `  - ${violation}\n`;
      });
    }
    
    return report;
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

export function initializePerformanceMonitoring(budget?: PerformanceBudget): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(budget);
    globalPerformanceMonitor.measurePageLoad();
    globalPerformanceMonitor.measureTTFB();
    globalPerformanceMonitor.measureMemoryUsage();
  }
  return globalPerformanceMonitor;
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return globalPerformanceMonitor;
}

export function destroyPerformanceMonitoring(): void {
  if (globalPerformanceMonitor) {
    globalPerformanceMonitor.destroy();
    globalPerformanceMonitor = null;
  }
}

// Utility functions for performance measurement
export function measureFunction<T>(fn: () => T, name: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return result;
}

export async function measureAsyncFunction<T>(fn: () => Promise<T>, name: string): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return result;
}

export function createPerformanceMark(name: string): void {
  if ('performance' in window) {
    performance.mark(name);
  }
}

export function measurePerformance(name: string, startMark: string, endMark: string): void {
  if ('performance' in window) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];

    } catch (error) {
      console.warn(`Could not measure ${name}:`, error);
    }
  }
} 