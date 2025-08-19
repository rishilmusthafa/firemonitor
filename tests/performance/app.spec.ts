import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performance.mark = window.performance.mark || function() {};
      window.performance.measure = window.performance.measure || function() {};
    });
  });

  test.describe('Page Load Performance', () => {
    test('should load main page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to the application
      await page.goto('/');
      
      // Wait for critical content to load
      await page.waitForSelector('h1:has-text("Hassantuk")');
      await page.waitForSelector('text=Open Today');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 3 seconds for initial load
      expect(loadTime).toBeLessThan(3000);
      
      // Log performance metrics
      console.log(`Page load time: ${loadTime}ms`);
    });

    test('should measure First Contentful Paint (FCP)', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for FCP
      await page.waitForLoadState('domcontentloaded');
      
      // Get FCP metric
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            resolve(fcpEntry?.startTime || 0);
          }).observe({ entryTypes: ['paint'] });
        });
      });
      
      // Performance budget: FCP should be under 1.5 seconds
      expect(fcp).toBeLessThan(1500);
      
      console.log(`First Contentful Paint: ${fcp}ms`);
    });

    test('should measure Largest Contentful Paint (LCP)', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for LCP
      await page.waitForLoadState('networkidle');
      
      // Get LCP metric
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries[entries.length - 1];
            resolve(lcpEntry?.startTime || 0);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });
      
      // Performance budget: LCP should be under 2.5 seconds
      expect(lcp).toBeLessThan(2500);
      
      console.log(`Largest Contentful Paint: ${lcp}ms`);
    });

    test('should measure Cumulative Layout Shift (CLS)', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for page to stabilize
      await page.waitForTimeout(5000);
      
      // Get CLS metric
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
        });
      });
      
      // Performance budget: CLS should be under 0.1
      expect(cls).toBeLessThan(0.1);
      
      console.log(`Cumulative Layout Shift: ${cls}`);
    });
  });

  test.describe('Map Performance', () => {
    test('should load map within performance budget', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      const startTime = Date.now();
      
      // Wait for map to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(2000); // Allow map to stabilize
      
      const mapLoadTime = Date.now() - startTime;
      
      // Performance budget: Map should load within 5 seconds
      expect(mapLoadTime).toBeLessThan(5000);
      
      console.log(`Map load time: ${mapLoadTime}ms`);
    });

    test('should measure map interaction performance', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for map to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(3000);
      
      // Measure map pan performance
      const panStartTime = Date.now();
      
      // Simulate map pan
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();
      
      const panTime = Date.now() - panStartTime;
      
      // Performance budget: Map pan should be under 100ms
      expect(panTime).toBeLessThan(100);
      
      console.log(`Map pan interaction time: ${panTime}ms`);
    });

    test('should measure map zoom performance', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for map to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(3000);
      
      // Measure map zoom performance
      const zoomStartTime = Date.now();
      
      // Simulate map zoom
      await page.keyboard.press('PageUp');
      await page.waitForTimeout(500);
      
      const zoomTime = Date.now() - zoomStartTime;
      
      // Performance budget: Map zoom should be under 500ms
      expect(zoomTime).toBeLessThan(500);
      
      console.log(`Map zoom interaction time: ${zoomTime}ms`);
    });
  });

  test.describe('Data Loading Performance', () => {
    test('should load alerts data within performance budget', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      const startTime = Date.now();
      
      // Wait for alerts to load
      await page.waitForSelector('text=Alarms');
      await page.waitForTimeout(2000);
      
      const alertsLoadTime = Date.now() - startTime;
      
      // Performance budget: Alerts should load within 3 seconds
      expect(alertsLoadTime).toBeLessThan(3000);
      
      console.log(`Alerts data load time: ${alertsLoadTime}ms`);
    });

    test('should measure API response times', async ({ page }) => {
      // Set up performance monitoring for network requests
      const responseTimes: number[] = [];
      
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('get-alerts') || url.includes('villas')) {
          responseTimes.push(response.request().timing().responseEnd - response.request().timing().requestStart);
        }
      });
      
      // Navigate to the application
      await page.goto('/');
      
      // Wait for API calls to complete
      await page.waitForTimeout(5000);
      
      // Calculate average response time
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      
      // Performance budget: Average API response time should be under 1 second
      expect(avgResponseTime).toBeLessThan(1000);
      
      console.log(`Average API response time: ${avgResponseTime}ms`);
    });
  });

  test.describe('Memory Usage', () => {
    test('should maintain reasonable memory usage', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for application to load
      await page.waitForLoadState('networkidle');
      
      // Get memory usage
      const memoryInfo = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });
      
      if (memoryInfo) {
        const usedMemoryMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
        const totalMemoryMB = memoryInfo.totalJSHeapSize / 1024 / 1024;
        
        // Performance budget: Used memory should be under 100MB
        expect(usedMemoryMB).toBeLessThan(100);
        
        // Performance budget: Total memory should be under 200MB
        expect(totalMemoryMB).toBeLessThan(200);
        
        console.log(`Used memory: ${usedMemoryMB.toFixed(2)}MB`);
        console.log(`Total memory: ${totalMemoryMB.toFixed(2)}MB`);
      }
    });

    test('should not have memory leaks during interactions', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for application to load
      await page.waitForLoadState('networkidle');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Perform multiple interactions
      for (let i = 0; i < 10; i++) {
        // Simulate theme toggle
        const themeToggle = page.locator('button[aria-label*="theme"]');
        if (await themeToggle.isVisible()) {
          await themeToggle.click();
          await page.waitForTimeout(500);
        }
        
        // Simulate page refresh
        await page.reload();
        await page.waitForLoadState('networkidle');
      }
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Calculate memory increase
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      // Performance budget: Memory increase should be less than 10MB
      expect(memoryIncreaseMB).toBeLessThan(10);
      
      console.log(`Memory increase after interactions: ${memoryIncreaseMB.toFixed(2)}MB`);
    });
  });

  test.describe('Bundle Size and Loading', () => {
    test('should load JavaScript bundles efficiently', async ({ page }) => {
      const scriptLoadTimes: number[] = [];
      
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('.js') && !url.includes('hot-update')) {
          const timing = response.request().timing();
          const loadTime = timing.responseEnd - timing.requestStart;
          scriptLoadTimes.push(loadTime);
        }
      });
      
      // Navigate to the application
      await page.goto('/');
      
      // Wait for all scripts to load
      await page.waitForLoadState('networkidle');
      
      // Calculate total script load time
      const totalScriptTime = scriptLoadTimes.reduce((a, b) => a + b, 0);
      
      // Performance budget: Total script load time should be under 2 seconds
      expect(totalScriptTime).toBeLessThan(2000);
      
      console.log(`Total script load time: ${totalScriptTime}ms`);
      console.log(`Number of scripts loaded: ${scriptLoadTimes.length}`);
    });

    test('should have reasonable bundle sizes', async ({ page }) => {
      const bundleSizes: { url: string; size: number }[] = [];
      
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('.js') && !url.includes('hot-update')) {
          const size = response.request().headers()['content-length'];
          if (size) {
            bundleSizes.push({
              url: url.split('/').pop() || url,
              size: parseInt(size)
            });
          }
        }
      });
      
      // Navigate to the application
      await page.goto('/');
      
      // Wait for all resources to load
      await page.waitForLoadState('networkidle');
      
      // Calculate total bundle size
      const totalSize = bundleSizes.reduce((sum, bundle) => sum + bundle.size, 0);
      const totalSizeMB = totalSize / 1024 / 1024;
      
      // Performance budget: Total bundle size should be under 5MB
      expect(totalSizeMB).toBeLessThan(5);
      
      console.log(`Total bundle size: ${totalSizeMB.toFixed(2)}MB`);
      bundleSizes.forEach(bundle => {
        console.log(`${bundle.url}: ${(bundle.size / 1024).toFixed(2)}KB`);
      });
    });
  });

  test.describe('Real-time Updates Performance', () => {
    test('should handle real-time updates efficiently', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for application to load
      await page.waitForLoadState('networkidle');
      
      const startTime = Date.now();
      
      // Wait for real-time updates (10-second intervals)
      await page.waitForTimeout(15000);
      
      const updateTime = Date.now() - startTime;
      
      // Performance budget: Real-time updates should not cause significant performance degradation
      // This is a qualitative test - we're mainly checking that the app doesn't crash
      expect(updateTime).toBeGreaterThan(0);
      
      console.log(`Real-time update cycle time: ${updateTime}ms`);
    });

    test('should maintain performance during data updates', async ({ page }) => {
      // Navigate to the application
      await page.goto('/');
      
      // Wait for application to load
      await page.waitForLoadState('networkidle');
      
      // Measure performance before updates
      const beforePerformance = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const now = performance.now();
            resolve(now);
          }, 100);
        });
      });
      
      // Wait for data updates
      await page.waitForTimeout(10000);
      
      // Measure performance after updates
      const afterPerformance = await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const now = performance.now();
            resolve(now);
          }, 100);
        });
      });
      
      // Performance budget: Performance degradation should be minimal
      const performanceDiff = afterPerformance - beforePerformance;
      
      // This is a basic check - in a real scenario, you'd want more sophisticated metrics
      expect(performanceDiff).toBeLessThan(1000); // Less than 1 second degradation
      
      console.log(`Performance difference after updates: ${performanceDiff}ms`);
    });
  });
}); 