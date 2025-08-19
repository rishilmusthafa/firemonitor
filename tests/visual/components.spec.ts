import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForSelector('h1:has-text("Hassantuk")');
    
    // Wait for content to stabilize
    await page.waitForTimeout(3000);
  });

  test.describe('Header Component', () => {
    test('should match header component screenshot', async ({ page }) => {
      // Wait for header to load
      await page.waitForSelector('text=Open Today');
      
      // Take screenshot of header section
      const header = page.locator('header');
      await expect(header).toHaveScreenshot('header-component.png', {
        animations: 'disabled'
      });
    });

    test('should match header statistics cards', async ({ page }) => {
      // Wait for statistics to load
      await page.waitForSelector('text=Open Today');
      await page.waitForTimeout(2000);
      
      // Take screenshot of statistics cards
      const statsCards = page.locator('[data-testid="stats-cards"]').first();
      if (await statsCards.isVisible()) {
        await expect(statsCards).toHaveScreenshot('header-stats-cards.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match theme toggle button', async ({ page }) => {
      // Find theme toggle button
      const themeToggle = page.locator('button[aria-label*="theme"]');
      if (await themeToggle.isVisible()) {
        await expect(themeToggle).toHaveScreenshot('theme-toggle-button.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Alert List Component', () => {
    test('should match alert list container', async ({ page }) => {
      // Wait for alert list to load
      await page.waitForSelector('text=Alarms');
      await page.waitForTimeout(2000);
      
      // Take screenshot of alert list container
      const alertList = page.locator('[data-testid="alert-list"]').first();
      if (await alertList.isVisible()) {
        await expect(alertList).toHaveScreenshot('alert-list-container.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match individual alert card', async ({ page }) => {
      // Wait for alert cards to load
      await page.waitForSelector('[data-testid="alert-card"]');
      await page.waitForTimeout(2000);
      
      // Take screenshot of first alert card
      const alertCard = page.locator('[data-testid="alert-card"]').first();
      if (await alertCard.isVisible()) {
        await expect(alertCard).toHaveScreenshot('alert-card.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match alert card hover state', async ({ page }) => {
      // Wait for alert cards to load
      await page.waitForSelector('[data-testid="alert-card"]');
      await page.waitForTimeout(2000);
      
      // Hover over first alert card
      const alertCard = page.locator('[data-testid="alert-card"]').first();
      if (await alertCard.isVisible()) {
        await alertCard.hover();
        await page.waitForTimeout(500);
        
        // Take screenshot of hover state
        await expect(alertCard).toHaveScreenshot('alert-card-hover.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Map Component', () => {
    test('should match map container', async ({ page }) => {
      // Wait for map to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(5000);
      
      // Take screenshot of map container
      const mapContainer = page.locator('[data-testid="cesium-viewer"]').first();
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toHaveScreenshot('map-container.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match map with markers', async ({ page }) => {
      // Wait for map and markers to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(8000); // Allow time for markers to load
      
      // Take screenshot of map with markers
      const mapContainer = page.locator('[data-testid="cesium-viewer"]').first();
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toHaveScreenshot('map-with-markers.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Modal Components', () => {
    test('should match alert details modal', async ({ page }) => {
      // Wait for alert cards to load
      await page.waitForSelector('[data-testid="alert-card"]');
      await page.waitForTimeout(2000);
      
      // Click on first alert card to open modal
      const alertCard = page.locator('[data-testid="alert-card"]').first();
      if (await alertCard.isVisible()) {
        await alertCard.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot of modal
        const modal = page.locator('[data-testid="alert-details-modal"]').first();
        if (await modal.isVisible()) {
          await expect(modal).toHaveScreenshot('alert-details-modal.png', {
            animations: 'disabled'
          });
        }
      }
    });

    test('should match villa details modal', async ({ page }) => {
      // Wait for map to load
      await page.waitForSelector('canvas');
      await page.waitForTimeout(5000);
      
      // Click on map to open villa details (if available)
      const mapContainer = page.locator('[data-testid="cesium-viewer"]').first();
      if (await mapContainer.isVisible()) {
        await mapContainer.click({ position: { x: 400, y: 300 } });
        await page.waitForTimeout(1000);
        
        // Take screenshot of modal if it appears
        const modal = page.locator('[data-testid="villa-details-modal"]').first();
        if (await modal.isVisible()) {
          await expect(modal).toHaveScreenshot('villa-details-modal.png', {
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Loading States', () => {
    test('should match loading spinner', async ({ page }) => {
      // Reload page to capture loading state
      await page.reload();
      
      // Look for loading spinner
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]').first();
      if (await loadingSpinner.isVisible()) {
        await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match skeleton loading', async ({ page }) => {
      // Reload page to capture loading state
      await page.reload();
      
      // Look for skeleton loading
      const skeleton = page.locator('[data-testid="skeleton"]').first();
      if (await skeleton.isVisible()) {
        await expect(skeleton).toHaveScreenshot('skeleton-loading.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Error States', () => {
    test('should match error message', async ({ page }) => {
      // Navigate to non-existent route to trigger error
      await page.goto('/non-existent-route');
      await page.waitForTimeout(2000);
      
      // Look for error message
      const errorMessage = page.locator('[data-testid="error-message"]').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toHaveScreenshot('error-message.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match network error state', async ({ page }) => {
      // Simulate network error by blocking requests
      await page.route('**/*', route => route.abort());
      
      // Navigate to trigger error
      await page.goto('/');
      await page.waitForTimeout(3000);
      
      // Look for network error
      const networkError = page.locator('[data-testid="network-error"]').first();
      if (await networkError.isVisible()) {
        await expect(networkError).toHaveScreenshot('network-error.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Interactive Elements', () => {
    test('should match button states', async ({ page }) => {
      // Find buttons
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        
        // Normal state
        await expect(firstButton).toHaveScreenshot('button-normal.png', {
          animations: 'disabled'
        });
        
        // Hover state
        await firstButton.hover();
        await page.waitForTimeout(500);
        await expect(firstButton).toHaveScreenshot('button-hover.png', {
          animations: 'disabled'
        });
        
        // Focus state
        await firstButton.focus();
        await page.waitForTimeout(500);
        await expect(firstButton).toHaveScreenshot('button-focus.png', {
          animations: 'disabled'
        });
      }
    });

    test('should match form elements', async ({ page }) => {
      // Look for form elements
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const firstInput = inputs.first();
        
        // Normal state
        await expect(firstInput).toHaveScreenshot('input-normal.png', {
          animations: 'disabled'
        });
        
        // Focus state
        await firstInput.focus();
        await page.waitForTimeout(500);
        await expect(firstInput).toHaveScreenshot('input-focus.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('should match focus indicators', async ({ page }) => {
      // Focus on first interactive element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      // Take screenshot of focus state
      await expect(page).toHaveScreenshot('focus-indicators.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('should match high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
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

    test('should match reduced motion mode', async ({ page }) => {
      // Simulate reduced motion preference
      await page.addStyleTag({
        content: `
          * {
            animation: none !important;
            transition: none !important;
          }
        `
      });
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await expect(page).toHaveScreenshot('reduced-motion-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
}); 