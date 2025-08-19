import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'puppeteer';

test.describe('Lighthouse Performance Tests', () => {
  test('should pass Lighthouse performance audit', async () => {
    // Launch browser for Lighthouse
    const browser = await launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      // Run Lighthouse audit
      const { lhr } = await lighthouse('http://localhost:3000', {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      });

      // Performance budget assertions
      expect(lhr.categories.performance.score).toBeGreaterThan(0.8);
      expect(lhr.categories.accessibility.score).toBeGreaterThan(0.9);
      expect(lhr.categories['best-practices'].score).toBeGreaterThan(0.8);
      expect(lhr.categories.seo.score).toBeGreaterThan(0.8);

      // Core Web Vitals
      const fcp = lhr.audits['first-contentful-paint'];
      const lcp = lhr.audits['largest-contentful-paint'];
      const cls = lhr.audits['cumulative-layout-shift'];
      const fid = lhr.audits['max-potential-fid'];
      const ttfb = lhr.audits['server-response-time'];

      // Performance budgets for Core Web Vitals
      expect(fcp.numericValue).toBeLessThan(1500); // FCP < 1.5s
      expect(lcp.numericValue).toBeLessThan(2500); // LCP < 2.5s
      expect(cls.numericValue).toBeLessThan(0.1); // CLS < 0.1
      expect(fid.numericValue).toBeLessThan(100); // FID < 100ms
      expect(ttfb.numericValue).toBeLessThan(600); // TTFB < 600ms

      // Log detailed results
      console.log('=== Lighthouse Performance Results ===');
      console.log(`Performance Score: ${(lhr.categories.performance.score * 100).toFixed(1)}%`);
      console.log(`Accessibility Score: ${(lhr.categories.accessibility.score * 100).toFixed(1)}%`);
      console.log(`Best Practices Score: ${(lhr.categories['best-practices'].score * 100).toFixed(1)}%`);
      console.log(`SEO Score: ${(lhr.categories.seo.score * 100).toFixed(1)}%`);
      console.log('');
      console.log('=== Core Web Vitals ===');
      console.log(`First Contentful Paint: ${fcp.numericValue}ms (${fcp.score})`);
      console.log(`Largest Contentful Paint: ${lcp.numericValue}ms (${lcp.score})`);
      console.log(`Cumulative Layout Shift: ${cls.numericValue} (${cls.score})`);
      console.log(`Max Potential FID: ${fid.numericValue}ms (${fid.score})`);
      console.log(`Time to First Byte: ${ttfb.numericValue}ms (${ttfb.score})`);

    } finally {
      await browser.close();
    }
  });

  test('should pass Lighthouse mobile audit', async () => {
    // Launch browser for Lighthouse
    const browser = await launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      // Run Lighthouse audit for mobile
      const { lhr } = await lighthouse('http://localhost:3000', {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'mobile',
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      });

      // Mobile performance budget assertions (more lenient)
      expect(lhr.categories.performance.score).toBeGreaterThan(0.6);
      expect(lhr.categories.accessibility.score).toBeGreaterThan(0.9);
      expect(lhr.categories['best-practices'].score).toBeGreaterThan(0.7);
      expect(lhr.categories.seo.score).toBeGreaterThan(0.8);

      // Core Web Vitals for mobile
      const fcp = lhr.audits['first-contentful-paint'];
      const lcp = lhr.audits['largest-contentful-paint'];
      const cls = lhr.audits['cumulative-layout-shift'];
      const fid = lhr.audits['max-potential-fid'];
      const ttfb = lhr.audits['server-response-time'];

      // Mobile performance budgets (more lenient)
      expect(fcp.numericValue).toBeLessThan(2000); // FCP < 2s
      expect(lcp.numericValue).toBeLessThan(3500); // LCP < 3.5s
      expect(cls.numericValue).toBeLessThan(0.1); // CLS < 0.1
      expect(fid.numericValue).toBeLessThan(200); // FID < 200ms
      expect(ttfb.numericValue).toBeLessThan(800); // TTFB < 800ms

      // Log detailed results
      console.log('=== Lighthouse Mobile Performance Results ===');
      console.log(`Performance Score: ${(lhr.categories.performance.score * 100).toFixed(1)}%`);
      console.log(`Accessibility Score: ${(lhr.categories.accessibility.score * 100).toFixed(1)}%`);
      console.log(`Best Practices Score: ${(lhr.categories['best-practices'].score * 100).toFixed(1)}%`);
      console.log(`SEO Score: ${(lhr.categories.seo.score * 100).toFixed(1)}%`);
      console.log('');
      console.log('=== Mobile Core Web Vitals ===');
      console.log(`First Contentful Paint: ${fcp.numericValue}ms (${fcp.score})`);
      console.log(`Largest Contentful Paint: ${lcp.numericValue}ms (${lcp.score})`);
      console.log(`Cumulative Layout Shift: ${cls.numericValue} (${cls.score})`);
      console.log(`Max Potential FID: ${fid.numericValue}ms (${fid.score})`);
      console.log(`Time to First Byte: ${ttfb.numericValue}ms (${ttfb.score})`);

    } finally {
      await browser.close();
    }
  });

  test('should identify performance opportunities', async () => {
    // Launch browser for Lighthouse
    const browser = await launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      // Run Lighthouse audit
      const { lhr } = await lighthouse('http://localhost:3000', {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        onlyCategories: ['performance'],
        formFactor: 'desktop'
      });

      // Check for specific performance opportunities
      const opportunities = lhr.audits;
      
      // Log performance opportunities
      console.log('=== Performance Opportunities ===');
      
      const opportunityAudits = [
        'unused-css-rules',
        'unused-javascript',
        'unminified-css',
        'unminified-javascript',
        'unused-images',
        'modern-image-formats',
        'efficient-animated-content',
        'preload-lcp-image',
        'render-blocking-resources',
        'unused-preloads',
        'duplicated-javascript',
        'legacy-javascript'
      ];

      opportunityAudits.forEach(auditKey => {
        const audit = opportunities[auditKey];
        if (audit && audit.details && audit.details.type === 'opportunity') {
          const savings = audit.details.overallSavingsMs;
          if (savings > 0) {
            console.log(`${audit.title}: ${savings}ms potential savings`);
          }
        }
      });

      // Check for diagnostics
      console.log('\n=== Performance Diagnostics ===');
      const diagnosticAudits = [
        'total-blocking-time',
        'max-potential-fid',
        'cumulative-layout-shift',
        'largest-contentful-paint',
        'first-contentful-paint',
        'speed-index',
        'server-response-time'
      ];

      diagnosticAudits.forEach(auditKey => {
        const audit = opportunities[auditKey];
        if (audit) {
          console.log(`${audit.title}: ${audit.numericValue}${audit.numericUnit || ''} (${audit.score})`);
        }
      });

    } finally {
      await browser.close();
    }
  });
}); 