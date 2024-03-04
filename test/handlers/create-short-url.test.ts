import { ClickEventDao } from "../../src/dao/click-event";
import { ShortUrlDao } from "../../src/dao/short-url";
import { CreateShortUrlHandler, CreateShortUrlHandlerRequest } from "../../src/handlers/create-short-url";
import { createRequest, createResponse } from 'node-mocks-http';
import { IShortUrl } from "../../src/models/short-url.model";

describe('CreateShortUrl', () => {
    let shortUrlDaoMock: ShortUrlDao;
    let clickEventDaoMock: ClickEventDao;
    let handler: CreateShortUrlHandler;

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
        shortUrlDaoMock.create = jest.fn();
        shortUrlDaoMock.delete = jest.fn();
        
        clickEventDaoMock = jest.genMockFromModule<ClickEventDao>('../../src/dao/click-event');
        clickEventDaoMock.delete = jest.fn();

        handler = new CreateShortUrlHandler(shortUrlDaoMock, clickEventDaoMock);
    });

    it('returns 201 status code when short url is created with no expiration time', async () => {
        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'https://www.example.com/' } });
        const response = createResponse();
        
        shortUrlDaoMock.create = jest.fn().mockReturnValue(fakeShortUrlEntry);

        await handler.handle(request, response);
        expect(response.statusCode).toBe(201);
        expect(response._getJSONData()).toEqual({
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            createdAt: mockDate.toISOString()
        });
    });

    it('returns 201 status code when short url is created with an expiration time', async () => {
        const mockExpirationDate = new Date('2025-01-01T00:00:00Z');
        
        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'https://www.example.com/', expiresAt: mockExpirationDate.toISOString() } });
        const response = createResponse();
        
        fakeShortUrlEntry = {
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            expiresAt: mockExpirationDate,
            createdAt: mockDate
        };
        shortUrlDaoMock.create = jest.fn().mockReturnValue(fakeShortUrlEntry);

        await handler.handle(request, response);
        expect(response.statusCode).toBe(201);
        expect(response._getJSONData()).toEqual({
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            expiresAt: mockExpirationDate.toISOString(),
            createdAt: mockDate.toISOString()
        });
    });

    it('returns 201 status code when short url already exists but expired; old records are deleted and a new record is created', async () => {
        const mockExpirationDate = new Date('2023-01-01T00:00:00Z');

        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'https://www.example.com/' } });
        const response = createResponse();
        
        let originalFakeShortUrlEntry: IShortUrl = {
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            expiresAt: mockExpirationDate,
            createdAt: mockDate
        };
        
        shortUrlDaoMock.get = jest.fn().mockReturnValue(originalFakeShortUrlEntry);
        shortUrlDaoMock.create = jest.fn().mockReturnValue(fakeShortUrlEntry);

        await handler.handle(request, response);
        expect(shortUrlDaoMock.delete).toHaveBeenCalledTimes(1);
        expect(clickEventDaoMock.delete).toHaveBeenCalledTimes(1);

        expect(response.statusCode).toBe(201);
        expect(response._getJSONData()).toEqual({
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            createdAt: mockDate.toISOString()
        });
    });

    it('returns 400 status code when long url is missing from the body', async () => {
        const request: CreateShortUrlHandlerRequest = createRequest();
        const response = createResponse();

        await handler.handle(request, response);
        expect(response.statusCode).toBe(400);
        expect(response._getJSONData()).toEqual({
            message: 'Bad request.'
        });
    });

    it('returns 400 status code when long url is not a valid URL', async () => {
        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'invalid url' } });
        const response = createResponse();
        
        await handler.handle(request, response);
        expect(response.statusCode).toBe(400);
        expect(response._getJSONData()).toEqual({
            message: 'Bad request.'
        });
    });

    it('returns 400 status code when expiresAt time is in the past', async () => {
        const mockExpirationDate = new Date('2023-01-01T00:00:00Z');
        
        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'https://www.example.com/', expiresAt: mockExpirationDate.toISOString() } });
        const response = createResponse();
        
        await handler.handle(request, response);
        expect(response.statusCode).toBe(400);
        expect(response._getJSONData()).toEqual({
            message: 'Bad request.'
        });
    });

    it('returns 400 status code when expiresAt time is not a valid date', async () => {

        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'https://www.example.com/', expiresAt: 'invalid date' } });
        const response = createResponse();
        
        await handler.handle(request, response);
        expect(response.statusCode).toBe(400);
        expect(response._getJSONData()).toEqual({
            message: 'Bad request.'
        });
    });

    it('returns 409 status code when short url is already exists', async () => {
        const request: CreateShortUrlHandlerRequest = createRequest({ body: { longUrl: 'https://www.example.com/' } });
        const response = createResponse();
        
        shortUrlDaoMock.get = jest.fn().mockReturnValue({
            shortUrl: 'shortUrl',
            longUrl: 'https://www.example.com/',
            expiresAt: null,
            createdAt: new Date(Date.now())
        });

        await handler.handle(request, response);
        expect(response.statusCode).toBe(409);
        expect(response._getJSONData()).toEqual({
            message: 'Resource already exists.'
        });
    });
});