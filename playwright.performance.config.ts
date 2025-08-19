import { defineConfig, devices } from '@playwright/test';

/**
 * Performance Testing Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/performance',
  /* Run tests in files in parallel */
  fullyParallel: false, // Performance tests should run sequentially
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1, // Performance tests should run one at a time
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'test-results/performance' }],
    ['json', { outputFile: 'test-results/performance/results.json' }],
    ['junit', { outputFile: 'test-results/performance/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace for performance analysis */
    trace: 'on',

    /* Record video for performance analysis */
    video: 'on',

    /* Take screenshots */
    screenshot: 'on',

    /* Disable animations for consistent performance testing */
    launchOptions: {
      args: ['--disable-animations', '--disable-gpu']
    }
  },

  /* Configure projects for performance testing */
  projects: [
    {
      name: 'performance-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'performance-mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
}); 