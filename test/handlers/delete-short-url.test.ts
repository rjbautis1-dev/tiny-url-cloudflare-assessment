import { ClickEventDao } from "../../src/dao/click-event";
import { ShortUrlDao } from "../../src/dao/short-url";
import { createRequest, createResponse } from 'node-mocks-http';
import { IShortUrl } from "../../src/models/short-url.model";
import { DeleteShortUrlHandler, DeleteShortUrlHandlerRequest } from "../../src/handlers/delete-short-url";

describe('DeleteShortUrl', () => {
    let shortUrlDaoMock: ShortUrlDao;
    let clickEventDaoMock: ClickEventDao;
    let handler: DeleteShortUrlHandler;

    beforeEach(() => {
        shortUrlDaoMock = jest.genMockFromModule<ShortUrlDao>('../../src/dao/short-url');
        shortUrlDaoMock.get = jest.fn();
        shortUrlDaoMock.create = jest.fn();
        shortUrlDaoMock.delete = jest.fn();
        
        clickEventDaoMock = jest.genMockFromModule<ClickEventDao>('../../src/dao/click-event');
        clickEventDaoMock.getCount = jest.fn();
        clickEventDaoMock.create = jest.fn();
        clickEventDaoMock.delete = jest.fn();

        handler = new DeleteShortUrlHandler(shortUrlDaoMock, clickEventDaoMock);
    });

    it('returns 204 status code when short url is deleted', async () => {
        const request: DeleteShortUrlHandlerRequest = createRequest({ params: { shortUrl: 'shortUrl' } });
        const response = createResponse();

        await handler.handle(request, response);
        expect(response.statusCode).toBe(204);
        expect(shortUrlDaoMock.delete).toHaveBeenCalledTimes(1);
        expect(clickEventDaoMock.delete).toHaveBeenCalledTimes(1);
    });

    it('returns 400 status code when short url is missing from the params', async () => {
        const request: DeleteShortUrlHandlerRequest = createRequest();
        const response = createResponse();

        await handler.handle(request, response);
        expect(response.statusCode).toBe(400);
        expect(response._getJSONData()).toEqual({
            message: 'Bad request.'
        });
    });
});