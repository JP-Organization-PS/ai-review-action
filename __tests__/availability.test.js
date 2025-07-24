// availability.test.js

const axios = require('axios');
require('dotenv').config();

jest.unmock('axios');

const AZURE_CONFIG = {
    key: process.env.AZURE_OPENAI_KEY,
    endpoint: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_API_VERSION}`,
};

const GEMINI_CONFIG = {
    key: process.env.GEMINI_API_KEY,
    endpoint: `${process.env.GEMINI_ENDPOINT_BASE}/v1beta/models/${process.env.GEMINI_MODEL_NAME}:generateContent`,
};

// Jest test suite
describe('AI Service Availability Tests', () => {

    /**
     * Test Case for Azure OpenAI Availability
     */
    test('should connect to Azure OpenAI and receive a successful response', async () => {
        // Skip the test if credentials are not provided
        if (!AZURE_CONFIG.key || !process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.key === 'your_azure_api_key') {
            console.warn('Azure OpenAI credentials not found or are placeholders in .env file. Skipping test.');
            return;
        }

        // A minimal, low-cost payload to check for a valid connection
        const payload = {
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 150, // Request a very small response
            temperature: 0.1,
        };

        const headers = {
            'api-key': AZURE_CONFIG.key,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.post(AZURE_CONFIG.endpoint, payload, { headers });

            console.log('Azure OpenAI Success Response:', JSON.stringify(response.data, null, 2));

            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.choices).toBeInstanceOf(Array);
            console.log('Azure OpenAI service is available.');

        } catch (error) {
            const errorMessage = error.response ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message;
            throw new Error(`Failed to connect to Azure OpenAI: ${errorMessage}`);
        }
    });

    /**
     * Test Case for Google Gemini Availability
     */
    test('should connect to Google Gemini and receive a successful response', async () => {
        // Skip the test if credentials are not provided
        if (!GEMINI_CONFIG.key || GEMINI_CONFIG.key === 'your_gemini_api_key') {
            console.warn('Google Gemini API key not found or is a placeholder in .env file. Skipping test.');
            return;
        }
        
        // A minimal, low-cost payload
        const payload = {
            contents: [{
                role: 'user',
                parts: [{ text: "Hello" }]
            }],
            generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.1,
            }
        };

        const headers = {
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.post(`${GEMINI_CONFIG.endpoint}?key=${GEMINI_CONFIG.key}`, payload, { headers });

            console.log('Google Gemini Success Response:', JSON.stringify(response.data, null, 2));

            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
            expect(response.data.candidates).toBeInstanceOf(Array);
            console.log('Google Gemini service is available.');

        } catch (error) {
            const errorMessage = error.response ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message;
            throw new Error(`Failed to connect to Google Gemini: ${errorMessage}`);
        }
    });
});
