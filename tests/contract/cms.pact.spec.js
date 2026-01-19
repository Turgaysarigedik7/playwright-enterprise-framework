const { test, expect } = require('@playwright/test');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const path = require('path');
const { CmsService } = require('../../api/services');

test.describe('CMS API Contract Test @contract', () => {
    // Pact Provider yapılandırması
    const provider = new PactV3({
        consumer: 'TestConsumer',
        provider: 'CmsProvider',
        port: 8991, // Farklı bir port kullanarak çakışmaları önlüyoruz
        host: '127.0.0.1',
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'DEBUG',
    });

    test('should verify getAllByTitle contract using Pact Matchers @smoke', async ({ request }) => {
        const titleQuery = 'crt_sales_channel';

        // Sözleşme Etkileşimi Tanımlama (Interaction)
        provider.addInteraction({
            state: 'cms data exists',
            uponReceiving: 'a request for all cms items by title',
            withRequest: {
                method: 'GET',
                path: '/router/eportal/api/platform/cms/getAllByTitle',
                query: { title: titleQuery },
            },
            willRespondWith: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                // AtLeastOneLike: Listenin en az bir eleman içermesini ve elemanların bu yapıda olmasını bekler
                body: MatchersV3.atLeastOneLike({
                    title: MatchersV3.string('crt_sales_channel'),
                    salescode: MatchersV3.string(''),
                    storecode: MatchersV3.string(''),
                    isCorporate: MatchersV3.string('1'),
                    customerType: MatchersV3.string('Consumer'),
                    lineType: MatchersV3.string('Prepaid')
                }),
            },
        });

        // Testi Pact execution ortamında çalıştır
        await provider.executeTest(async (mockServer) => {
            // CmsService'i Mock Server URL'ine yönlendiriyoruz
            const cmsService = new CmsService(request, mockServer.url);
            const response = await cmsService.getAllByTitle(titleQuery);

            // Temel HTTP kontrolü
            expect(response.status()).toBe(200);

            // Yanıt gövdesini al ve doğrula
            const body = await response.json();
            expect(Array.isArray(body)).toBeTruthy();
            expect(body.length).toBeGreaterThan(0);

            // İlk eleman bazında basit mantık kontrolü
            expect(body[0].title).toBe(titleQuery);
        });
    });
});
