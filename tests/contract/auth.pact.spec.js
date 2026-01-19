const { test, expect } = require('@playwright/test');
const { PactV3 } = require('@pact-foundation/pact');
const path = require('path');
const { AuthService } = require('../../api/services');

test.describe('Pact Auth Contract @contract', () => {
    const provider = new PactV3({
        consumer: 'TestConsumer',
        provider: 'AuthProvider',
        port: 8989,
        host: '127.0.0.1',
        dir: path.resolve(process.cwd(), 'pacts'),
        logLevel: 'DEBUG',
    });

    test('should verify login contract with Pact V3 @smoke', async ({ request }) => {
        // Interaction Definition
        provider.addInteraction({
            state: 'user exists',
            uponReceiving: 'a request for login',
            withRequest: {
                method: 'POST',
                path: '/authenticate',
                body: {
                    username: 'testuser',
                    password: 'password123',
                },
            },
            willRespondWith: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: {
                    status: 'success',
                    message: 'You logged into a secure area!',
                },
            },
        });

        // Execute the test within Pact's execution environment
        await provider.executeTest(async (mockServer) => {
            // Use our API POM pointing to Pact Mock Server
            const authService = new AuthService(request, mockServer.url);
            const response = await authService.login('testuser', 'password123');

            // Assert response
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.status).toBe('success');
        });
    });
});
