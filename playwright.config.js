const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL,
    // Hata anında görsel kanıt topla
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },
    {
      name: 'chromium',
      testDir: './tests/ui', // Sadece UI klasörüne bak
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testDir: './tests/api', // Sadece API klasörüne bak
      use: {
        ...devices['Desktop Chrome'],
        // API testlerinde de session kullan
        storageState: 'playwright/.auth/user.json',
      },
      // dependencies: ['setup'], // Bağımsız çalışabilmesi için kapalı tutulabilir
    },
    {
      name: 'contract',
      testDir: './tests/contract', // Sadece Contract klasörüne bak
      testMatch: /.*\.pact\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
