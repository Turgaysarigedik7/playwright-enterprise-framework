const { Logger } = require('../utils/Logger');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// AJV instance'ını bir kez oluşturup reuse ediyoruz
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

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
        this.logger = new Logger(this.constructor.name);
    }

    /**
     * API yanıtının şemasını doğrular.
     * @param {object} schema - JSON Şema objesi
     * @param {object} data - Doğrulanacak veri (response body)
     * @returns {void}
     */
    async validateSchema(schema, data) {
        const validate = ajv.compile(schema);
        const valid = validate(data);

        if (!valid) {
            const errorDetails = ajv.errorsText(validate.errors);
            const logMsg = `SCHEMA VALIDATION ERROR: Yanıt yapısı beklenen şema ile uyuşmuyor!`;
            await this.logger.error(logMsg);

            console.error(`\x1b[91m┌─── Schema Validation Details ───┐\x1b[0m`);
            validate.errors.forEach((err, index) => {
                console.error(`\x1b[91m│\x1b[0m ${index + 1}. Hata: ${err.instancePath} ${err.message}`);
                console.error(`\x1b[91m│\x1b[0m    Beklenen: ${JSON.stringify(err.params)}`);
            });
            console.error(`\x1b[91m└─────────────────────────────────┘\x1b[0m\n`);

            throw new Error(`Schema validation failed: ${errorDetails}`);
        }

        await this.logger.success('Schema validation successful.');
    }

    /**
     * Merkezi istek yürütücü.
     * @protected
     */
    async _execute(method, endpoint, options = {}) {
        const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
        const startTime = Date.now();

        await this.logger.info(`API Request: ${method.toUpperCase()} ${url}`);

        try {
            const response = await this.request[method](url, options);
            const duration = Date.now() - startTime;

            if (!response.ok()) {
                await this._handleError(response, method, url, options, duration);
            } else {
                await this.logger.success(`API Response: ${response.status()} (${duration}ms)`);
            }

            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.logger.error(`CRITICAL NETWORK ERROR: ${method.toUpperCase()} ${url} (${duration}ms)`, error);
            throw error;
        }
    }

    /**
     * Detaylı hata loglayıcı.
     * @private
     */
    async _handleError(response, method, url, options, duration) {
        const status = response.status();
        let errorBody;

        try {
            errorBody = await response.text();
            try {
                errorBody = JSON.stringify(JSON.parse(errorBody), null, 2);
            } catch (e) { /* text format */ }
        } catch (e) {
            errorBody = "Response body could not be read.";
        }

        const logMsg = `API Error: ${status} ${response.statusText()} | ${method.toUpperCase()} ${url}`;
        await this.logger.error(logMsg);

        // Detaylı teknik metadata (Terminalde gruplanmış görünür)
        console.error(`\x1b[90m┌─── API Error Details ───┐\x1b[0m`);
        console.error(`\x1b[90m│\x1b[0m Status    : ${status}`);
        console.error(`\x1b[90m│\x1b[0m Method    : ${method.toUpperCase()}`);
        console.error(`\x1b[90m│\x1b[0m Duration  : ${duration}ms`);
        console.error(`\x1b[90m│\x1b[0m Request ID: ${response.headers()['x-request-id'] || 'N/A'}`);

        const requestPayload = options.data || options.params || 'None';
        const formattedRequest = typeof requestPayload === 'object' ? JSON.stringify(requestPayload, null, 2) : requestPayload;
        console.error(`\x1b[90m│\x1b[0m Request Payload :\n${formattedRequest}`);

        console.error(`\x1b[90m│\x1b[0m cURL      : ${this._generateCurl(method, url, options)}`);
        console.error(`\x1b[90m│\x1b[0m Response Body :\n${errorBody}`);
        console.error(`\x1b[90m└─────────────────────────┘\x1b[0m\n`);
    }

    /**
     * cURL komutu oluşturur (Hata ayıklama için).
     */
    _generateCurl(method, url, options) {
        let curl = `curl -X ${method.toUpperCase()} "${url}"`;
        if (options.headers) {
            for (const [key, value] of Object.entries(options.headers)) {
                curl += ` -H "${key}: ${value}"`;
            }
        }
        if (options.data) {
            const data = JSON.stringify(options.data);
            curl += ` -d '${data}'`;
        }
        return curl;
    }

    async get(endpoint, params = {}) { return this._execute('get', endpoint, { params }); }
    async post(endpoint, data = {}) { return this._execute('post', endpoint, { data }); }
    async put(endpoint, data = {}) { return this._execute('put', endpoint, { data }); }
    async delete(endpoint, params = {}) { return this._execute('delete', endpoint, { params }); }
    async patch(endpoint, data = {}) { return this._execute('patch', endpoint, { data }); }
}

module.exports = { BaseService };
