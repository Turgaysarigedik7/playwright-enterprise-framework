const { test: base } = require('@playwright/test');
const { PageFactory } = require('../pages/PageFactory');

exports.test = base.extend({
    /**
     * Tüm sayfaları dinamik olarak üreten merkezi anahtar.
     * Kullanım: async ({ pages }) => { const loginPage = pages.get('loginPage'); }
     */
    pages: async ({ page }, use) => {
        const factory = new PageFactory(page);
        await use(factory);
    },
});

exports.expect = base.expect;
