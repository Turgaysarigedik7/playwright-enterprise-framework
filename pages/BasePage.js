const { expect } = require('@playwright/test');

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
    }

    /**
     * Belirtilen URL'e gider.
     * @param {string} path - Gidilecek path (baseURL'e eklenir)
     */
    async navigateTo(path = '') {
        await this.page.goto(path);
    }

    /**
     * Bir elementin görünür olmasını bekler.
     * @param {string|import('@playwright/test').Locator} selector 
     * @param {number} timeout 
     */
    async waitForVisible(selector, timeout = 10000) {
        const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await locator.waitFor({ state: 'visible', timeout });
        return locator;
    }

    /**
     * Güvenli tıklama işlemi. Elementin hazır olmasını bekler ve tıklar.
     * @param {string|import('@playwright/test').Locator} selector 
     */
    async clickSafe(selector) {
        const locator = await this.waitForVisible(selector);
        await locator.click();
    }

    /**
     * Input alanını temizler ve veri girişi yapar.
     * @param {string|import('@playwright/test').Locator} selector 
     * @param {string} text 
     */
    async fillInput(selector, text) {
        const locator = await this.waitForVisible(selector);
        await locator.fill(text);
    }

    /**
     * Sayfanın başlığının beklenen değer olduğunu doğrular.
     * @param {string|RegExp} title 
     */
    async verifyTitle(title) {
        await expect(this.page).toHaveTitle(title);
    }

    /**
     * Mevcut sayfanın ekran görüntüsünü alır (Hata ayıklama için).
     * Hem diske kaydeder hem de Playwright HTML raporuna ekler.
     * @param {string} name 
     */
    async takeScreenshot(name) {
        const path = `test-results/manual-screenshots/${name}-${Date.now()}.png`;
        await this.page.screenshot({ path });

        // Playwright raporuna ekle
        const { test } = require('@playwright/test');
        await test.info().attach(name, {
            path: path,
            contentType: 'image/png'
        });
    }
}

module.exports = { BasePage };
