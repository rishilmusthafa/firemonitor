import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForSelector('h1:has-text("Hassantuk")');
    
    // Wait for content to stabilize
    await page.waitForTimeout(3000);
  });

  test.describe('Main Application Views', () => {
    test('should match main dashboard screenshot', async ({ page }) => {
      // Wait for all content to load
      await page.waitForTimeout(5000);
      
      // Take screenshot of the entire page
      await expect(page).toHaveScreenshot('main-dashboard.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match header component screenshot', async ({ page }) => {
      // Wait for header to load
      await page.waitForSelector('text=Open Today');
      
      // Take screenshot of header section
      const header = page.locator('header');
      await expect(header).toHaveScreenshot('header-component.png', {
        animations: 'disabled'
      });
    });

    test('should match alert list screenshot', async ({ page }) => {
      // Wait for alert list to load
      await page.waitForSelector('text=Alarms');
      await page.waitForTimeout(2000);
      
      // Take screenshot of alert list section
      const alertList = page.locator('[data-testid="alert-list"]').first();
      if (await alertList.isVisible()) {
        await expect(alertList).toHaveScreenshot('alert-list.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match map view screenshot', async ({ page }) => {
      // Wait for map to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(5000);
      
      // Take screenshot of map section
      const mapContainer = page.locator('[data-testid="cesium-viewer"]').first();
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toHaveScreenshot('map-view.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Theme Variations', () => {
    test('should match light theme screenshot', async ({ page }) => {
      // Switch to light theme
      const themeToggle = page.locator('button[aria-label*="theme"]');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(1000);
      }
      
      // Take screenshot
      await expect(page).toHaveScreenshot('light-theme.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match dark theme screenshot', async ({ page }) => {
      // Ensure dark theme is active
      const themeToggle = page.locator('button[aria-label*="theme"]');
      if (await themeToggle.isVisible()) {
        // Click twice to ensure dark theme
        await themeToggle.click();
        await page.waitForTimeout(500);
        await themeToggle.click();
        await page.waitForTimeout(1000);
      }
      
      // Take screenshot
      await expect(page).toHaveScreenshot('dark-theme.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('should match mobile viewport screenshot', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await expect(page).toHaveScreenshot('mobile-viewport.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match tablet viewport screenshot', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await expect(page).toHaveScreenshot('tablet-viewport.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match desktop viewport screenshot', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await expect(page).toHaveScreenshot('desktop-viewport.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Component States', () => {
    test('should match loading state screenshot', async ({ page }) => {
      // Reload page to capture loading state
      await page.reload();
      
      // Take screenshot immediately (loading state)
      await expect(page).toHaveScreenshot('loading-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match error state screenshot', async ({ page }) => {
      // Simulate error by navigating to non-existent route
      await page.goto('/non-existent-route');
      await page.waitForTimeout(2000);
      
      // Take screenshot of error state
      await expect(page).toHaveScreenshot('error-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Interactive Elements', () => {
    test('should match button hover states', async ({ page }) => {
      // Find a button and hover over it
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.hover();
        await page.waitForTimeout(500);
        
        // Take screenshot of hover state
        await expect(button).toHaveScreenshot('button-hover.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match alert card interactions', async ({ page }) => {
      // Wait for alert cards to load
      await page.waitForSelector('[data-testid="alert-card"]');
      await page.waitForTimeout(2000);
      
      const alertCard = page.locator('[data-testid="alert-card"]').first();
      if (await alertCard.isVisible()) {
        // Hover over alert card
        await alertCard.hover();
        await page.waitForTimeout(500);
        
        // Take screenshot of hover state
        await expect(alertCard).toHaveScreenshot('alert-card-hover.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('should match focus states', async ({ page }) => {
      // Focus on first interactive element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      // Take screenshot of focus state
      await expect(page).toHaveScreenshot('focus-state.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match high contrast mode', async ({ page }) => {
      // Simulate high contrast mode by adding CSS
      await page.addStyleTag({
        content: `
          * {
            background: white !important;
            color: black !important;
            border: 1px solid black !important;
          }
        `
      });
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await expect(page).toHaveScreenshot('high-contrast-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
}); 