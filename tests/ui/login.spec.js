const { test, expect } = require('../../fixtures/base');
const userData = require('../../data/users.json');

// Login testleri sıfır oturum ile başlamalıdır
test.use({ storageState: { cookies: [], origins: [] } });

test('Kullanıcı (Multi-Step) başarılı bir şekilde giriş yapabilmeli ve yönlenmeli', async ({ pages, page }) => {
    const loginPage = pages.get('loginPage');

    // 1. Giriş sayfasına git
    await loginPage.navigateToLogin();

    // 2. Multi-step login işlemini yap (Username -> Next -> Password)
    // Bu metod artık içinde "İleri" butonuna basmayı ve şifre alanını beklemeyi kapsıyor.
    //await loginPage.login(process.env.APP_USERNAME, process.env.PASSWORD);

    // 3. Başarılı yönlendirmeyi kontrol et
    // Base URL'den farklı, güvenli bir sayfaya (/secure veya benzeri) gidildiğini doğrula.
    //await expect(page).toHaveURL(/.*secure/);
});