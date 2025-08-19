# Visual Regression & Performance Testing Guide

This document provides comprehensive guidance for implementing and running visual regression tests and performance tests for the FireMonitor application.

## 🎯 Overview

The FireMonitor project now includes two advanced testing capabilities:

1. **Visual Regression Testing**: Ensures UI consistency across different browsers, devices, and viewports using Playwright
2. **Performance Testing**: Monitors application performance metrics and Core Web Vitals

## 📦 Dependencies

### Visual Regression Testing
- **Playwright**: Built-in visual testing capabilities
- **Screenshot comparison**: Native Playwright screenshot functionality

### Performance Testing
- **lighthouse**: Google Lighthouse for performance auditing
- **puppeteer**: Browser automation for Lighthouse

## 🚀 Quick Start

### Installation

```bash
# Install dependencies with legacy peer deps (for React 19 compatibility)
npm install --legacy-peer-deps

# Or use the provided script
npm run install:legacy
```

### Environment Setup

1. **Performance Testing Setup**:
   ```bash
   # No additional setup required for basic performance tests
   # Lighthouse and Puppeteer are included as dev dependencies
   ```

## 🧪 Running Tests

### Visual Regression Tests

```bash
# Run visual regression tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

### Performance Tests

```bash
# Run performance tests
npm run test:performance

# View performance test reports
npm run test:performance:report

# Run all tests (unit, e2e, visual, performance)
npm run test:all
```

## 📊 Test Configurations

### Visual Regression Configuration

**File**: `playwright.visual.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/visual',
  projects: [
    {
      name: 'desktop-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
  ],
});
```

### Performance Configuration

**File**: `playwright.performance.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/performance',
  fullyParallel: false, // Sequential execution for accurate measurements
  workers: 1,
  use: {
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
});
```

## 🎨 Visual Regression Tests

### Test Structure

**File**: `tests/visual/app.spec.ts`

```typescript
test.describe('Visual Regression Tests', () => {
  test('should match main dashboard screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);
    
    await expect(page).toHaveScreenshot('main-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
```

### Test Categories

1. **Main Application Views**
   - Dashboard screenshots
   - Header component
   - Alert list
   - Map view

2. **Theme Variations**
   - Light theme
   - Dark theme

3. **Responsive Design**
   - Mobile viewport (375x667)
   - Tablet viewport (768x1024)
   - Desktop viewport (1920x1080)

4. **Component States**
   - Loading states
   - Error states
   - Interactive elements

5. **Accessibility Features**
   - Focus states
   - High contrast mode

### Screenshot Management

```bash
# Screenshots are stored in:
test-results/visual/

# Snapshots are stored in:
tests/visual/screenshots/
```

## ⚡ Performance Tests

### Test Structure

**File**: `tests/performance/app.spec.ts`

```typescript
test.describe('Performance Tests', () => {
  test('should load main page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Hassantuk")');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
```

### Performance Metrics

1. **Core Web Vitals**
   - First Contentful Paint (FCP) < 1.5s
   - Largest Contentful Paint (LCP) < 2.5s
   - Cumulative Layout Shift (CLS) < 0.1
   - First Input Delay (FID) < 100ms

2. **Page Load Performance**
   - Initial page load < 3s
   - Map load < 5s
   - Data loading < 3s

3. **Memory Usage**
   - Used memory < 100MB
   - Total memory < 200MB
   - Memory leaks < 10MB increase

4. **Bundle Size**
   - Total bundle size < 5MB
   - Script load time < 2s

### Lighthouse Integration

**File**: `tests/performance/lighthouse.spec.ts`

```typescript
test('should pass Lighthouse performance audit', async () => {
  const { lhr } = await lighthouse('http://localhost:3000', {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop'
  });
  
  expect(lhr.categories.performance.score).toBeGreaterThan(0.8);
});
```

## 📈 Performance Budgets

### Desktop Performance Budgets

| Metric | Target | Budget |
|--------|--------|--------|
| Page Load Time | < 3s | 3000ms |
| First Contentful Paint | < 1.5s | 1500ms |
| Largest Contentful Paint | < 2.5s | 2500ms |
| Cumulative Layout Shift | < 0.1 | 0.1 |
| First Input Delay | < 100ms | 100ms |
| Map Load Time | < 5s | 5000ms |
| Memory Usage | < 100MB | 100MB |
| Bundle Size | < 5MB | 5MB |

### Mobile Performance Budgets

| Metric | Target | Budget |
|--------|--------|--------|
| Page Load Time | < 4s | 4000ms |
| First Contentful Paint | < 2s | 2000ms |
| Largest Contentful Paint | < 3.5s | 3500ms |
| Cumulative Layout Shift | < 0.1 | 0.1 |
| First Input Delay | < 200ms | 200ms |
| Map Load Time | < 7s | 7000ms |
| Memory Usage | < 150MB | 150MB |
| Bundle Size | < 3MB | 3MB |

## 🔧 Configuration Options

### Visual Testing Options

```typescript
// Screenshot options
await expect(page).toHaveScreenshot('filename.png', {
  fullPage: true,           // Capture full page
  animations: 'disabled',   // Disable animations
  mask: ['.dynamic-content'], // Mask dynamic content
  threshold: 0.1,           // Pixel difference threshold
});
```

### Performance Testing Options

```typescript
// Performance monitoring
await page.addInitScript(() => {
  window.performance.mark = window.performance.mark || function() {};
  window.performance.measure = window.performance.measure || function() {};
});

// Memory monitoring
const memoryInfo = await page.evaluate(() => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
});
```

## 📊 Reporting

### Visual Test Reports

```bash
# HTML report
open test-results/visual/index.html

# Screenshot comparison
# Compare screenshots in test-results/visual/
```

### Performance Test Reports

```bash
# HTML report
open test-results/performance/index.html

# JSON report
cat test-results/performance/results.json

# JUnit report (for CI)
cat test-results/performance/results.xml
```

### Lighthouse Reports

```bash
# Lighthouse HTML report
# Generated automatically in test-results/performance/
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Visual & Performance Tests
on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci --legacy-peer-deps
      - run: npm run test:visual
      - uses: actions/upload-artifacts@v3
        with:
          name: visual-test-results
          path: test-results/visual/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci --legacy-peer-deps
      - run: npm run test:performance
      - uses: actions/upload-artifacts@v3
        with:
          name: performance-test-results
          path: test-results/performance/
```

## 🛠️ Troubleshooting

### Visual Test Issues

1. **Screenshot Mismatches**
   ```bash
   # Update snapshots
   npm run test:visual:update
   
   # Check for dynamic content
   # Add mask options to ignore dynamic elements
   ```

2. **Installation Issues**
   ```bash
   # Use legacy peer deps for React 19 compatibility
   npm install --legacy-peer-deps
   
   # Or use alternative package managers
   yarn install
   pnpm install
   ```

### Performance Test Issues

1. **Slow Performance**
   ```bash
   # Check system resources
   # Ensure no other processes are running
   # Run tests in isolation
   ```

2. **Memory Issues**
   ```bash
   # Check for memory leaks
   # Monitor browser memory usage
   # Restart browser between tests
   ```

3. **Lighthouse Issues**
   ```bash
   # Check browser compatibility
   # Ensure proper browser launch
   # Verify network connectivity
   ```

## 📋 Best Practices

### Visual Testing

1. **Stable Screenshots**
   - Disable animations
   - Wait for content to stabilize
   - Mask dynamic content

2. **Comprehensive Coverage**
   - Test all viewports
   - Test all themes
   - Test all states

3. **Maintenance**
   - Regular snapshot updates
   - Review visual changes
   - Clean up old snapshots

### Performance Testing

1. **Consistent Environment**
   - Use same hardware
   - Control network conditions
   - Disable background processes

2. **Realistic Scenarios**
   - Test with real data
   - Simulate user interactions
   - Monitor over time

3. **Continuous Monitoring**
   - Track performance trends
   - Set up alerts
   - Regular performance reviews

## 🔮 Future Enhancements

### Planned Features

1. **Advanced Visual Testing**
   - Component-level screenshots
   - Visual diff analysis
   - Automated visual QA

2. **Enhanced Performance Testing**
   - Load testing
   - Stress testing
   - Performance profiling

3. **Integration Improvements**
   - Slack notifications
   - Performance dashboards
   - Automated reporting

### Alternative Visual Testing Tools

1. **Chromatic** (Recommended)
   ```bash
   npm install --save-dev chromatic
   ```

2. **BackstopJS**
   ```bash
   npm install --save-dev backstopjs
   ```

3. **Applitools**
   ```bash
   npm install --save-dev @applitools/eyes-playwright
   ```

## 📚 Resources

- [Playwright Visual Testing](https://playwright.dev/docs/test-screenshots)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)
- [React Testing Library v15](https://testing-library.com/docs/react-testing-library/intro/)

## 🆘 Getting Help

If you encounter issues:

1. **Check the installation guide**: `docs/INSTALLATION_GUIDE.md`
2. **Use legacy peer deps**: `npm install --legacy-peer-deps`
3. **Try alternative package managers**: yarn, pnpm
4. **Check the troubleshooting section above**
5. **Review error logs** for specific dependency conflicts

---

This comprehensive testing setup ensures the FireMonitor application maintains high visual quality and performance standards across all environments and devices. 