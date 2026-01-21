const { BasePage } = require('../BasePage');
const locators = require('./locators.json');

/**
 * Login sayfası işlemlerini yöneten Page Object Model sınıfı.
 */
class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page nesnesi
   */
  constructor(page) {
    super(page); // BasePage constructor'ını çağır
    this.usernameInput = page.locator(locators.username);
    this.passwordInput = page.locator(locators.password);
    this.nextButton = page.locator(locators.nextButton); // Yeni "İleri" butonu
    this.loginButton = page.locator(locators.submit);
  }

  /**
   * Login sayfasına yönlendirir.
   */
  async navigateToLogin() {
    const loginUrl = process.env.LOGIN_URL;
    if (!loginUrl) {
      throw new Error('LOGIN_URL tanımlı değil! Lütfen .env dosyanızı kontrol edin.');
    }

    await this.logger.info(`Navigating to specific login URL: ${loginUrl}`);
    await this.page.goto(loginUrl);
  }

  /**
   * Sisteme giriş yapar (Multi-Step: Username -> Next -> Password).
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   */
  async login(username, password) {
    console.log('Starting Authentication (Multi-Step)...');

    // 1. Adım: Kullanıcı adını gir ve İleri'ye bas
    await this.fillInput(this.usernameInput, username);
    await this.logger.info('Clicking Next button...');
    await this.clickSafe(this.nextButton);

    // 2. Adım: Şifre alanının gelmesini bekle
    // Sayfa değişebilir veya dinamik yüklenebilir, bu yüzden password alanının görünürlüğünü beklemek en güvenlisidir.
    await this.logger.info('Waiting for password field...');
    await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });

    // 3. Adım: Şifreyi gir ve giriş yap
    await this.fillInput(this.passwordInput, password);

    // Submit et ve yönlendirmeyi bekle
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'load' }),
      this.clickSafe(this.loginButton)
    ]);
  }
}

module.exports = { LoginPage };
