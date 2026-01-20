const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

/**
 * Profesyonel Ortam Yönetimi: 
 * Dışarıdan gelen ENV değişkenine göre (qa, staging vb.) ilgili .env dosyasını yükler.
 * Varsayılan olarak ana .env dosyasını kullanır.
 */
const env = process.env.ENV || '';
const envPath = env ? path.resolve(__dirname, 'environments', `.env.${env}`) : path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

/**
 * CI/CD ve Lokal Güvenlik Kontrolü:
 * BASE_URL tanımlı değilse testi hemen durdurur ve açıklayıcı hata verir.
 */
if (!process.env.BASE_URL) {
  console.error('\n--- 🚨 KRİTİK YAPILANDIRMA HATASI 🚨 ---');
  console.error('BASE_URL bulunamadı! Lütfen şunları kontrol edin:');
  console.error('1. Lokal için: .env veya environments/.env.' + (env || 'qa') + ' dosyası mevcut mu?');
  console.error('2. CI/CD için: Repo Secrets (BASE_URL) tanımlandı mı?');
  console.error('-------------------------------------------\n');
  process.exit(1);
}

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
