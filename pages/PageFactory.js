const { LoginPage } = require('./login/LoginPage');

/**
 * Fixture Factory (PageFactory): Sayfaları dinamik olarak üretir.
 * Testler içinde her sayfayı ayrı fixture olarak tanımlamak yerine
 * merkezi bir yerden talep etmemizi sağlar.
 */
class PageFactory {
    /**
     * @param {import('@playwright/test').Page} page 
     */
    constructor(page) {
        this.page = page;
        this.pages = {
            loginPage: LoginPage,
            // Yeni sayfalar buraya eklenecek (Key: ClassName)
        };
        this.instances = {};
    }

    /**
     * İstenen sayfa objesini döner. Eğer daha önce üretilmişse cache'den döner.
     * @param {string} pageName 
     */
    get(pageName) {
        const PageClass = this.pages[pageName];
        if (!PageClass) {
            throw new Error(`Sayfa bulunamadı: ${pageName}. Lütfen PageFactory.js içine kaydedin.`);
        }

        if (!this.instances[pageName]) {
            this.instances[pageName] = new PageClass(this.page);
        }
        return this.instances[pageName];
    }
}

module.exports = { PageFactory };
