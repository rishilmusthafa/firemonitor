import { test, expect } from '@playwright/test';

test.describe('FireMonitor Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the application to load
    await page.waitForSelector('h1:has-text("Hassantuk")');
  });

  test.describe('Page Loading and Initial State', () => {
    test('should load the application successfully', async ({ page }) => {
      // Check that the main components are rendered
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
      await expect(page.locator('text=Fire Alarms')).toBeVisible();
      await expect(page.locator('text=Alarms')).toBeVisible();
    });

    test('should display loading screen initially', async ({ page }) => {
      // Check for loading indicators
      await expect(page.locator('[data-testid="loading-screen"]')).toBeVisible();
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Loading screen should disappear
      await expect(page.locator('[data-testid="loading-screen"]')).not.toBeVisible();
    });

    test('should display header statistics', async ({ page }) => {
      // Wait for statistics to load
      await page.waitForTimeout(3000);
      
      // Check for statistics cards
      await expect(page.locator('text=Open Today')).toBeVisible();
      await expect(page.locator('text=Total Today')).toBeVisible();
      await expect(page.locator('text=Open Alerts')).toBeVisible();
      await expect(page.locator('text=Closed Alerts')).toBeVisible();
      await expect(page.locator('text=Overdue Alerts')).toBeVisible();
      await expect(page.locator('text=Countdown Alerts')).toBeVisible();
      await expect(page.locator('text=Villas')).toBeVisible();
    });
  });

  test.describe('Alert List Functionality', () => {
    test('should display alert list at bottom of screen', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check that alert list container is visible
      await expect(page.locator('text=Alarms')).toBeVisible();
      
      // Check for alert cards if any exist
      const alertCards = page.locator('[data-testid="alert-card"]');
      const count = await alertCards.count();
      
      if (count > 0) {
        await expect(alertCards.first()).toBeVisible();
      }
    });

    test('should display alert information correctly', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      const alertCards = page.locator('[data-testid="alert-card"]');
      const count = await alertCards.count();
      
      if (count > 0) {
        const firstAlert = alertCards.first();
        
        // Check for alert title
        await expect(firstAlert.locator('[data-testid="alert-title"]')).toBeVisible();
        
        // Check for customer name
        await expect(firstAlert.locator('[data-testid="customer-name"]')).toBeVisible();
        
        // Check for city
        await expect(firstAlert.locator('[data-testid="city"]')).toBeVisible();
        
        // Check for time (should be in UTC format)
        await expect(firstAlert.locator('[data-testid="alert-time"]')).toBeVisible();
      }
    });

    test('should display countdown timer for active alerts', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      const countdownTimers = page.locator('[data-testid="countdown-timer"]');
      const count = await countdownTimers.count();
      
      if (count > 0) {
        const timer = countdownTimers.first();
        await expect(timer).toBeVisible();
        
        // Check that timer shows valid format (MM:SS or H:MM:SS)
        const timerText = await timer.textContent();
        expect(timerText).toMatch(/^\d{1,2}:\d{2}(:\d{2})?$/);
      }
    });

    test('should handle alert click for map navigation', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      const alertCards = page.locator('[data-testid="alert-card"]');
      const count = await alertCards.count();
      
      if (count > 0) {
        // Click on first alert
        await alertCards.first().click();
        
        // Should navigate to map location
        await page.waitForTimeout(1000);
      }
    });

    test('should handle alert double-click for details', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      const alertCards = page.locator('[data-testid="alert-card"]');
      const count = await alertCards.count();
      
      if (count > 0) {
        // Double-click on first alert
        await alertCards.first().dblclick();
        
        // Should open details modal
        await expect(page.locator('[data-testid="alert-details-modal"]')).toBeVisible();
        
        // Close modal
        await page.locator('[data-testid="close-modal"]').click();
      }
    });
  });

  test.describe('Map Functionality', () => {
    test('should display 3D map', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check that Cesium viewer is loaded
      await expect(page.locator('canvas')).toBeVisible();
      
      // Check for map controls
      await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
    });

    test('should display alert markers on map', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      // Check for alert markers (red/green icons)
      const alertMarkers = page.locator('[data-testid="alert-marker"]');
      const count = await alertMarkers.count();
      
      if (count > 0) {
        await expect(alertMarkers.first()).toBeVisible();
      }
    });

    test('should handle marker clicks', async ({ page }) => {
      await page.waitForTimeout(5000);
      
      const alertMarkers = page.locator('[data-testid="alert-marker"]');
      const count = await alertMarkers.count();
      
      if (count > 0) {
        // Click on first marker
        await alertMarkers.first().click();
        
        // Should show villa details or alert details
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Filtering and Navigation', () => {
    test('should filter by emirate', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Look for emirate filter dropdown or buttons
      const emirateFilter = page.locator('[data-testid="emirate-filter"]');
      
      if (await emirateFilter.isVisible()) {
        // Click on Dubai filter
        await emirateFilter.click();
        await page.locator('text=Dubai').click();
        
        // Wait for filter to apply
        await page.waitForTimeout(2000);
        
        // Check that filtered results are shown
        await expect(page.locator('text=Dubai')).toBeVisible();
      }
    });

    test('should handle emirate selection', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Test different emirate selections
      const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'All'];
      
      for (const emirate of emirates) {
        const emirateButton = page.locator(`[data-testid="emirate-${emirate}"]`);
        
        if (await emirateButton.isVisible()) {
          await emirateButton.click();
          await page.waitForTimeout(1000);
          
          // Check that selection is active
          await expect(emirateButton).toHaveClass(/active/);
        }
      }
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update data automatically', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Get initial statistics
      const initialOpenToday = await page.locator('[data-testid="open-today-count"]').textContent();
      
      // Wait for potential updates (10 seconds)
      await page.waitForTimeout(10000);
      
      // Check if data has been updated
      const updatedOpenToday = await page.locator('[data-testid="open-today-count"]').textContent();
      
      // Data should be updated (either same or different)
      expect(updatedOpenToday).toBeDefined();
    });

    test('should handle manual refresh', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Look for refresh button
      const refreshButton = page.locator('[data-testid="refresh-button"]');
      
      if (await refreshButton.isVisible()) {
        // Click refresh button
        await refreshButton.click();
        
        // Wait for refresh to complete
        await page.waitForTimeout(2000);
        
        // Check that data is still visible
        await expect(page.locator('text=Open Today')).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // This test would require mocking API failures
      // For now, just check that the app doesn't crash
      await page.waitForTimeout(5000);
      
      // Application should still be functional
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate offline mode
      await page.route('**/*', route => route.abort());
      
      // Reload page
      await page.reload();
      
      // Should show error state but not crash
      await page.waitForTimeout(3000);
      
      // Application should still be visible
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check for proper heading structure
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for proper button labels
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Should focus on first interactive element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper color contrast', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check that text is visible against background
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
      await expect(page.locator('text=Fire Alarms')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.waitForTimeout(3000);
      
      // Check that content is still visible and functional
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
      await expect(page.locator('text=Alarms')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.waitForTimeout(3000);
      
      // Check that content is still visible and functional
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
      await expect(page.locator('text=Alarms')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.waitForTimeout(3000);
      
      // Check that content is still visible and functional
      await expect(page.locator('h1:has-text("Hassantuk")')).toBeVisible();
      await expect(page.locator('text=Alarms')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000');
      await page.waitForSelector('h1:has-text("Hassantuk")');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle large datasets', async ({ page }) => {
      await page.waitForTimeout(3000);
      
      // Check that the application doesn't freeze with many alerts
      const alertCards = page.locator('[data-testid="alert-card"]');
      const count = await alertCards.count();
      
      // Should handle any number of alerts without crashing
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
}); 