const { AuthService } = require('./AuthService');
const { CmsService } = require('./CmsService');

/**
 * Tüm API servislerini tek bir noktadan dışa aktarır (Registry Pattern).
 */
module.exports = {
    AuthService,
    CmsService
};
