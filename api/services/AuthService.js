const { BaseService } = require('../BaseService');

/**
 * Kimlik doğrulama işlemleri için servis.
 */
class AuthService extends BaseService {
    /**
     * Kullanıcı girişi yapar.
     * @param {string} username - Kullanıcı adı
     * @param {string} password - Şifre
     * @returns {Promise<import('@playwright/test').APIResponse>}
     */
    async login(username, password) {
        return this.post('/authenticate', {
            username: username,
            password: password
        });
    }
}

module.exports = { AuthService };
