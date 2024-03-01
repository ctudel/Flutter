const {describe, expect, test} = require("@jest/globals");

// supertest is a framework that allows to easily test web APIs
const supertest = require('supertest');
const app = require('./../app');
const request = supertest(app);

describe('REST APIs for samples', () =>
{
    describe('GET /samples', () =>
    {
        test('should return a 200 (ok) status code', async() =>
        {
            const response = await request.get('/samples');
            expect(response.status).toBe(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/samples');
            expect(response.header['content-type']).toMatch(/application\/json/);
        });

        test('should contain the key "tbd" in the first sample returned as a JSON response', async() =>
        {
            const response = await request.get('/samples');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0]).toHaveProperty('tbd');
        });

        test('should contain "value1" in the first sample tbd field returned as a JSON response', async() =>
        {
            const response = await request.get('/samples');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0].tbd).toBe('value1');
        });
    });


});
