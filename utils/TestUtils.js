/**
 * Proje genelinde kullanılacak yardımcı fonksiyonlar.
 */
class TestUtils {
    /**
     * Belirtilen milisaniye kadar bekler.
     * @param {number} ms 
     */
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Rasgele bir string üretir.
     * @param {number} length 
     */
    static generateRandomString(length = 8) {
        return Math.random().toString(36).substring(2, 2 + length);
    }
}

module.exports = { TestUtils };
