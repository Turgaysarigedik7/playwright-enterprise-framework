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
    this.usernameInput = page.locator(locators.oktaUsername);
    this.passwordInput = page.locator(locators.oktaPassword);
    this.loginButton = page.locator(locators.oktaSubmit);
  }

  /**
   * Login sayfasına yönlendirir.
   */
  async navigateToLogin() {
    await this.navigateTo('/');
  }

  /**
   * Sisteme giriş yapar (Okta/SAML uyumlu).
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   */
  async login(username, password) {
    console.log('Starting Authentication (Okta/SAML Support)...');

    // BasePage yardımcılarını kullanarak daha temiz kod
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);

    // Submit et ve yönlendirmeyi bekle
    // CI için daha stabil: networkidle yerine load veya domcontentloaded tercih edilir
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'load' }),
      this.clickSafe(this.loginButton)
    ]);
  }
}

module.exports = { LoginPage };
