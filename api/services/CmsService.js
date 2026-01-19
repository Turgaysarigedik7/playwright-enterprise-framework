const { BaseService } = require('../BaseService');

/**
 * CMS (İçerik Yönetim Sistemi) işlemleri için servis.
 */
class CmsService extends BaseService {
    /**
     * Başlığa göre tüm içerikleri getirir.
     * @param {string} title - Aranacak başlık
     * @returns {Promise<import('@playwright/test').APIResponse>}
     */
    async getAllByTitle(title) {
        return this.get('/router/eportal/api/platform/cms/getAllByTitle', { title });
    }
}

module.exports = { CmsService };