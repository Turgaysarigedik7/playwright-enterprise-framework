const { test, expect } = require('../../fixtures/base');
const userData = require('../../data/users.json');

// Login testleri sıfır oturum ile başlamalıdır
test.use({ storageState: { cookies: [], origins: [] } });

test('Kullanıcı .env verisi (Ana Hesap) ile başarılı bir şekilde giriş yapabilmeli @smoke', async ({ pages, page }) => {
    const loginPage = pages.get('loginPage');
    // Giriş sayfasına git
    await loginPage.navigateToLogin();
    // .env dosyasından gelen ana veri ile giriş yap
    await loginPage.login(process.env.APP_USERNAME, process.env.PASSWORD);
    // Başarılı giriş mesajını kontrol et
    await expect(page).toHaveURL(/.*secure/);
});

test('Geçersiz kullanıcı bilgileri ile hata mesajı alınmalı @regression', async ({ pages, page }) => {
    const loginPage = pages.get('loginPage');
    await loginPage.navigateToLogin();
    // JSON dosyasından gelen HATALI veri ile giriş yap
    await loginPage.login(userData.invalidUser.username, userData.invalidUser.password);

    // Örn: Hata mesajı kontrolü (Selector uygulamanıza göre değişebilir)
    // await expect(page.locator('#flash')).toContainText('Your username is invalid!');
});
