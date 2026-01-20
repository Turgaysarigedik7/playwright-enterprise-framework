const { expect } = require('@playwright/test');
const { Logger } = require('../utils/Logger');

/**
 * Tüm Page Object sınıfları için temel sınıf.
 * Ortak metodları ve yardımcı fonksiyonları içerir.
 */
class BasePage {
    /**
     * @param {import('@playwright/test').Page} page - Playwright page nesnesi
     */
    constructor(page) {
        this.page = page;
        // Sınıf ismine göre log bağlamı oluşturur (Örn: LoginPage)
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * Belirtilen URL'e gider.
     */
    async navigateTo(path = '') {
        await this.logger.info(`Navigating to: ${path || 'Base URL'}`);
        await this.page.goto(path);
    }

    /**
     * Bir elementin görünür olmasını bekler.
     */
    async waitForVisible(selector, timeout = 10000) {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return locator;
        } catch (error) {
            await this.logger.error(`Element not visible within ${timeout}ms: ${selector}`);
            throw error;
        }
    }

    /**
     * Güvenli tıklama işlemi. Elementin hazır olmasını bekler ve tıklar.
     */
    async clickSafe(selector) {
        await this.logger.info(`Clicking on: ${selector}`);
        const locator = await this.waitForVisible(selector);
        await locator.click();
    }

    /**
     * Input alanını temizler ve veri girişi yapar.
     */
    async fillInput(selector, text) {
        await this.logger.info(`Filling '${selector}' with text: ${text}`);
        const locator = await this.waitForVisible(selector);
        await locator.clear(); // Güvenlik: Önce temizle
        await locator.fill(text);
    }

    /**
     * Sayfanın başlığının beklenen değer olduğunu doğrular.
     */
    async verifyTitle(title) {
        await this.logger.info(`Verifying title: ${title}`);
        await expect(this.page).toHaveTitle(title);
    }

    /**
     * Ağ trafiği durulana kadar bekler (Stabilite için).
     */
    async waitForNetworkIdle() {
        await this.logger.info('Waiting for network idle...');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Mevcut sayfanın ekran görüntüsünü alır.
     */
    async takeScreenshot(name) {
        const path = `test-results/manual-screenshots/${name}-${Date.now()}.png`;
        await this.page.screenshot({ path });
        await this.logger.success(`Screenshot taken: ${name}`);

        const { test } = require('@playwright/test');
        await test.info().attach(name, {
            path: path,
            contentType: 'image/png'
        });
    }
}

module.exports = { BasePage };
