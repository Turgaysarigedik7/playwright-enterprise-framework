/**
 * @typedef {import('@playwright/test').APIRequestContext} APIRequestContext
 */

class BaseService {
    /**
     * @param {APIRequestContext} request - Playwright API request context
     * @param {string} [baseURL] - API base URL
     */
    constructor(request, baseURL) {
        this.request = request;
        this.baseURL = baseURL;
    }

    /**
     * Merkezi istek yürütücü. İstekleri sarmalar ve hataları yakalar.
     * @protected
     * @param {string} method - HTTP metodu (get, post, put, delete, patch)
     * @param {string} endpoint - İstek atılacak endpoint
     * @param {object} [options={}] - Playwright request opsiyonları
     * @returns {Promise<import('@playwright/test').APIResponse>}
     */
    async _execute(method, endpoint, options = {}) {
        const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
        const startTime = Date.now();

        try {
            const response = await this.request[method](url, options);
            const duration = Date.now() - startTime;

            // Eğer yanıt başarılı değilse (2xx dışındaysa) detaylı logla
            if (!response.ok()) {
                await this._handleError(response, method, url, options, duration);
            }

            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`\n--- 🚨 NETWORK/CRITICAL ERROR 🚨 ---`);
            console.error(`URL       : ${url}`);
            console.error(`Method    : ${method.toUpperCase()}`);
            console.error(`Duration  : ${duration}ms`);
            console.error(`Error     :`, error.message);
            console.error(`cURL      : ${this._generateCurl(method, url, options)}`);
            console.error(`------------------------------------\n`);
            throw error;
        }
    }

    /**
     * Detaylı hata loglayıcı. Hata anında tüm snapshot verisini basar.
     * @private
     * @param {import('@playwright/test').APIResponse} response - Playwright API response nesnesi
     * @param {string} method - İstek metodu
     * @param {string} url - İstek URL'i
     * @param {object} options - İstek opsiyonları
     */
    async _handleError(response, method, url, options, duration) {
        const status = response.status();
        let errorBody;

        try {
            errorBody = await response.text();
            // JSON ise güzelleştir
            try {
                errorBody = JSON.stringify(JSON.parse(errorBody), null, 2);
            } catch (e) { /* düz metin devam et */ }
        } catch (e) {
            errorBody = "Response body could not be read.";
        }

        console.error('\n--- ⛔ API ERROR DETECTED ⛔ ---');
        console.error(`Timestamp : ${new Date().toISOString()}`);
        console.error(`URL       : ${url}`);
        console.error(`Method    : ${method.toUpperCase()}`);
        console.error(`Status    : ${status} (${response.statusText()})`);
        console.error(`Duration  : ${duration}ms`);
        console.error(`Request ID: ${response.headers()['x-request-id'] || 'N/A'}`);
        console.error(`cURL      : ${this._generateCurl(method, url, options)}`);

        const requestPayload = options.data || options.params || 'None';
        const formattedRequest = typeof requestPayload === 'object' ? JSON.stringify(requestPayload, null, 2) : requestPayload;
        console.error(`Request Body/Params :\n${formattedRequest}`);

        console.error(`Response Header Content-Type: ${response.headers()['content-type']}`);
        console.error(`Response Body :\n${errorBody}`);
        console.error('-----------------------------------\n');

        if (status === 401 || status === 403) {
            console.warn('⚠️  Auth Error: Session might be expired or invalid.');
        }
    }

    /**
     * İstek verilerinden bir cURL komutu oluşturur.
     * @private
     */
    _generateCurl(method, url, options) {
        let curl = `curl -X ${method.toUpperCase()} "${url}"`;

        // Headers
        if (options.headers) {
            for (const [key, value] of Object.entries(options.headers)) {
                curl += ` -H "${key}: ${value}"`;
            }
        }

        // Data / Body
        if (options.data) {
            const data = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
            curl += ` -d '${data}'`;
        }

        // Params (Query string) - Playwright URL'e eklemiş olabilir ama biz yine de loglayalım
        if (options.params && Object.keys(options.params).length > 0) {
            const queryParams = new URLSearchParams(options.params).toString();
            if (!url.includes('?')) {
                curl = curl.replace(url, `${url}?${queryParams}`);
            }
        }

        return curl;
    }

    /**
     * GET isteği gönderir.
     * @param {string} endpoint 
     * @param {object} [params={}] - Query parametreleri
     */
    async get(endpoint, params = {}) {
        return this._execute('get', endpoint, { params });
    }

    /**
     * POST isteği gönderir.
     * @param {string} endpoint 
     * @param {object} [data={}] - Request body
     */
    async post(endpoint, data = {}) {
        return this._execute('post', endpoint, { data });
    }

    /**
     * PUT isteği gönderir.
     * @param {string} endpoint 
     * @param {object} [data={}] - Request body
     */
    async put(endpoint, data = {}) {
        return this._execute('put', endpoint, { data });
    }

    /**
     * DELETE isteği gönderir.
     * @param {string} endpoint 
     * @param {object} [params={}] - Query parametreleri
     */
    async delete(endpoint, params = {}) {
        return this._execute('delete', endpoint, { params });
    }

    /**
     * PATCH isteği gönderir.
     * @param {string} endpoint 
     * @param {object} [data={}] - Request body
     */
    async patch(endpoint, data = {}) {
        return this._execute('patch', endpoint, { data });
    }
}

module.exports = { BaseService };
