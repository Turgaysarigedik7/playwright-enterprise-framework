const { test: setup, expect } = require('@playwright/test');
const { AuthService } = require('../api/services/AuthService');
const authFile = 'playwright/.auth/user.json';

/**
 * Global API Authentication Setup
 * UI yerine API üzerinden sessizce login olarak hız ve stabilite sağlar.
 */
setup('authenticate', async ({ request, baseURL }) => {
    const authService = new AuthService(request, baseURL);

    console.log('Starting API-based (Silent) Authentication...');

    // 1. API üzerinden login isteği at
    const response = await authService.login(
        process.env.APP_USERNAME,
        process.env.PASSWORD
    );

    // 2. Başarılı girişi doğrula (200 veya 302 dönebilir)
    expect(response.ok(), 'API Login failed! Check credentials or endpoint.').toBeTruthy();

    // 3. Oturum bilgisini (Cookies/Token) dosyaya kaydet
    // Playwright APIRequestContext içindeki cookie'leri otomatik olarak yakalar
    await request.storageState({ path: authFile });

    console.log('API Authentication Successful. Storage state saved to:', authFile);
});
