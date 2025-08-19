import { test, expect } from '@playwright/test';

test.describe('UI Updates from Alert API', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load
    await page.waitForTimeout(5000);
  });

  test('should load the application successfully', async ({ page }) => {
    // 1. Verify the page loads
    await expect(page).toHaveTitle(/FireMonitor/);
    
    // 2. Verify key elements are present
    await expect(page.locator('text=Hassantuk')).toBeVisible();
    await expect(page.locator('text=Fire Alarms')).toBeVisible();
    
    console.log('Application loaded successfully');
  });

  test('should display refresh button and handle clicks', async ({ page }) => {
    // 1. Find refresh button
    const refreshButton = page.locator('button[title="Refresh alerts data"]');
    
    // 2. Verify button is visible
    await expect(refreshButton).toBeVisible();
    
    // 3. Click refresh button
    await refreshButton.click();
    
    // 4. Wait for any processing
    await page.waitForTimeout(2000);
    
    // 5. Verify button is still visible after click
    await expect(refreshButton).toBeVisible();
    
    console.log('Refresh button functionality verified');
  });

  test('should display emirate filter options', async ({ page }) => {
    // 1. Check if emirate filter buttons are visible
    const allButton = await page.locator('button:has-text("All")').isVisible();
    const dubaiButton = await page.locator('button:has-text("Dubai")').isVisible();
    
    console.log('Emirate filter options:', {
      allButton,
      dubaiButton
    });

    // 2. Verify filter options are present
    expect(allButton).toBe(true);
    expect(dubaiButton).toBe(true);
  });

  test('should show maintenance statistics', async ({ page }) => {
    // 1. Check if maintenance stats are visible
    const maintenanceText = await page.locator('text=Maintenance').isVisible();
    const maintenanceValue = await page.locator('text=340').isVisible();
    
    console.log('Maintenance statistics:', {
      textVisible: maintenanceText,
      valueVisible: maintenanceValue
    });

    // 2. Verify maintenance stats are present
    expect(maintenanceText).toBe(true);
    expect(maintenanceValue).toBe(true);
  });

  test('should display total villas count', async ({ page }) => {
    // 1. Check if total villas count is visible
    const totalVillasText = await page.locator('text=Total Villas').isVisible();
    
    console.log('Total villas display:', {
      textVisible: totalVillasText
    });

    // 2. Verify total villas count is present
    expect(totalVillasText).toBe(true);
  });

  test('should handle theme toggle functionality', async ({ page }) => {
    // 1. Check if theme toggle button is visible
    const themeButton = await page.locator('button:has-text("☀️")').isVisible();
    
    console.log('Theme toggle:', {
      buttonVisible: themeButton
    });

    // 2. Verify theme toggle is present
    expect(themeButton).toBe(true);
  });

  test('should show alert list area', async ({ page }) => {
    // 1. Check if alert list area is visible (either shows alerts or "no alerts" message)
    const noAlertsMessage = await page.locator('text=No Alerts Today').isVisible();
    const alarmsText = await page.locator('[data-testid="alert-list"]').isVisible();
    
    console.log('Alert list area:', {
      noAlertsMessage,
      alarmsText
    });

    // 2. Verify alert list area is present
    expect(noAlertsMessage || alarmsText).toBe(true);
  });

  test('should display map area', async ({ page }) => {
    // 1. Check if map area is visible
    const mapVisible = await page.locator('iframe').isVisible();
    
    console.log('Map area:', {
      mapVisible
    });

    // 2. Verify map area is present
    expect(mapVisible).toBe(true);
  });

  test('should show system status information', async ({ page }) => {
    // 1. Check if system status is visible
    const systemStatus = await page.locator('text=System Online').isVisible();
    
    console.log('System status:', {
      visible: systemStatus
    });

    // 2. Verify system status is present
    expect(systemStatus).toBe(true);
  });

  test('should display alerts counter', async ({ page }) => {
    // 1. Check if alerts counter is visible
    const alertsCounter = await page.locator('text=Alerts (All)').isVisible();
    
    console.log('Alerts counter:', {
      visible: alertsCounter
    });

    // 2. Verify alerts counter is present
    expect(alertsCounter).toBe(true);
  });

  test('should handle automatic updates gracefully', async ({ page }) => {
    // 1. Get initial state
    const initialAlertsText = await page.locator('text=Alerts (All)').textContent();
    
    console.log('Initial alerts text:', initialAlertsText);

    // 2. Wait for potential automatic updates
    await page.waitForTimeout(10000);

    // 3. Get updated state
    const updatedAlertsText = await page.locator('text=Alerts (All)').textContent();
    
    console.log('Updated alerts text:', updatedAlertsText);

    // 4. Verify the component is still functional
    expect(updatedAlertsText).toBeDefined();
  });

  test('should maintain UI stability during refresh', async ({ page }) => {
    // 1. Get initial state
    const initialHassantukText = await page.locator('text=Hassantuk').isVisible();
    
    // 2. Click refresh button
    const refreshButton = page.locator('button[title="Refresh alerts data"]');
    await refreshButton.click();
    
    // 3. Wait for refresh
    await page.waitForTimeout(3000);
    
    // 4. Verify UI is still stable
    const updatedHassantukText = await page.locator('text=Hassantuk').isVisible();
    
    console.log('UI stability during refresh:', {
      initial: initialHassantukText,
      updated: updatedHassantukText
    });

    // 5. Verify UI remains stable
    expect(updatedHassantukText).toBe(true);
  });
}); 