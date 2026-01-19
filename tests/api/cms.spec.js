const { test, expect } = require('@playwright/test');
const { CmsService } = require('../../api/services');
const cmsTestData = require('../../data/cms_data.json');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

// CMS API Yanıt Şeması (JSON Schema)
const cmsSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            title: { type: "string" },
            salescode: { type: "string" },
            storecode: { type: "string" },
            isCorporate: { type: "string" },
            customerType: { type: "string" },
            lineType: { type: "string" }
        },
        required: ["title", "customerType"] // Zorunlu alanlar
    }
};

const validate = ajv.compile(cmsSchema);

test.describe('CMS API - Data Driven Tests @api', () => {

    for (const data of cmsTestData) {
        test(`Sorgu: ${data.desc} - Başlık: "${data.title}" @regression`, async ({ request, baseURL }) => {
            const cmsService = new CmsService(request, baseURL);

            console.log(`Running test for: ${data.desc}`);
            const response = await cmsService.getAllByTitle(data.title);

            // 1. Statü Kodu Kontrolü
            expect(response.status()).toBe(data.expectedStatus);

            // 2. Şema Doğrulama (Sadece Başarılı Yanıtlarda)
            if (response.ok()) {
                const body = await response.json();

                const valid = validate(body);
                if (!valid) {
                    console.error('AJV Schema Hataları:', ajv.errorsText(validate.errors));
                }

                // Eğer şema hatalıysa testi fail et
                expect(valid, `JSON Şema hatası: ${ajv.errorsText(validate.errors)}`).toBe(true);
            }
        });
    }
});