const { test } = require('@playwright/test');

/**
 * Enterprise düzeyinde loglama mekanizması.
 * Hem terminale renkli çıktı verir hem de Playwright raporuna (test.step) ekler.
 */
class Logger {
    constructor(context = 'Global') {
        this.context = context;
    }

    /**
     * Mesajı formatlar ve zaman damgası ekler.
     */
    _format(message, level) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:mm:ss
        return `[${timestamp}][${level}][${this.context}] ${message}`;
    }

    /**
     * BİLGİ seviyesinde log atar.
     */
    async info(message) {
        const formattedMessage = this._format(message, 'INFO');
        console.log(`\x1b[36m%s\x1b[0m`, formattedMessage); // Cyan
        await this._addStepToReport(message, 'info');
    }

    /**
     * BAŞARI seviyesinde log atar.
     */
    async success(message) {
        const formattedMessage = this._format(message, 'SUCCESS');
        console.log(`\x1b[32m%s\x1b[0m`, formattedMessage); // Green
        await this._addStepToReport(message, 'success');
    }

    /**
     * UYARI seviyesinde log atar.
     */
    async warn(message) {
        const formattedMessage = this._format(message, 'WARN');
        console.log(`\x1b[33m%s\x1b[0m`, formattedMessage); // Yellow
        await this._addStepToReport(message, 'warn');
    }

    /**
     * HATA seviyesinde log atar.
     */
    async error(message, error = null) {
        const formattedMessage = this._format(message, 'ERROR');
        console.log(`\x1b[31m%s\x1b[0m`, formattedMessage); // Red
        if (error) console.error(error);
        await this._addStepToReport(message, 'error');
    }

    /**
     * Playwright raporuna adım olarak ekler.
     * @private
     */
    async _addStepToReport(message, type) {
        try {
            // Eğer test aktifse rapora ekle
            await test.step(`[${type.toUpperCase()}] ${message}`, async () => { });
        } catch (e) {
            // Test dışındaki kullanımlarda sessizce geç
        }
    }
}

module.exports = { Logger };
