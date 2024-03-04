import { ClickEventDao } from "../../src/dao/click";
import { ShortUrlDao } from "../../src/dao/short-url";
import { createRequest, createResponse } from 'node-mocks-http';
import { IShortUrl } from "../../src/models/short-url.model";
import { GetShortUrlHandler, GetShortUrlHandlerRequest } from "../../src/handlers/get-short-url";

describe('GetShortUrl', () => {
    let shortUrlDaoMock: ShortUrlDao;
    let clickEventDaoMock: ClickEventDao;
    let handler: GetShortUrlHandler;

    const realDate = Date.now;

    let mockDate: Date;
    let fakeShortUrlEntry: IShortUrl;

    beforeAll(() => {
        global.Date.now = jest.fn(() => new Date('2024-01-01T00:00:00Z').getTime());
    })

    afterAll(() => {
        global.Date.now = realDate;
    })

    beforeEach(() => {
        mockDate = new Date(Date.now());
        fakeShortUrlEntry = {
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            expiresAt: undefined,
            createdAt: mockDate
        };

        shortUrlDaoMock = jest.genMockFromModule<ShortUrlDao>('../../src/dao/short-url');
        shortUrlDaoMock.get = jest.fn();
        
        clickEventDaoMock = jest.genMockFromModule<ClickEventDao>('../../src/dao/click');
        clickEventDaoMock.create = jest.fn();

        handler = new GetShortUrlHandler(shortUrlDaoMock, clickEventDaoMock);
    });

    it('returns 302 status code when short url is retrieved', async () => {
        const request: GetShortUrlHandlerRequest = createRequest({ params: { shortUrl: 'shortUrl' } });
        const response = createResponse();
        
        shortUrlDaoMock.get = jest.fn().mockReturnValue(fakeShortUrlEntry);

        await handler.handle(request, response);
        expect(response.statusCode).toBe(302);
    });

    it('returns 400 status code when short url is missing from the params', async () => {
        const request: GetShortUrlHandlerRequest = createRequest();
        const response = createResponse();

        await handler.handle(request, response);
        expect(response.statusCode).toBe(400);
        expect(response._getJSONData()).toEqual({
            message: 'Bad request.'
        });
    });

    it('returns 404 status code when short url does not exist', async () => {
        const request: GetShortUrlHandlerRequest = createRequest({ params: { shortUrl: 'shortUrl' } });
        const response = createResponse();

        shortUrlDaoMock.get = jest.fn().mockReturnValue(null);

        await handler.handle(request, response);
        expect(response.statusCode).toBe(404);
        expect(response._getJSONData()).toEqual({
            message: 'Resource not found.'
        });
    });

    it('returns 404 status code when short url exists but expired', async () => {
        const request: GetShortUrlHandlerRequest = createRequest({ params: { shortUrl: 'shortUrl' } });
        const response = createResponse();

        const mockExpirationDate = new Date('2023-01-01T00:00:00Z');
        fakeShortUrlEntry = {
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            expiresAt: mockExpirationDate,
            createdAt: mockDate
        };
        shortUrlDaoMock.get = jest.fn().mockReturnValue(fakeShortUrlEntry);

        await handler.handle(request, response);
        expect(response.statusCode).toBe(404);
        expect(response._getJSONData()).toEqual({
            message: 'Resource not found.'
        });
    });

});