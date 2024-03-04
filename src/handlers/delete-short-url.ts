import { Request, Response } from "express";
import { ShortUrlDao } from "../dao/short-url";
import { BaseHandler } from "./base";
import _ from 'lodash';
import { ClickEventDao } from "../dao/click-event";

/**
 * 
 */
type DeleteShortUrlHandlerRequestParams = {
    shortUrl: string;
};

type DeleteShortUrlHandlerResponseBody = {
    message: string
};

export interface DeleteShortUrlHandlerRequest extends Request<
    DeleteShortUrlHandlerRequestParams
> {}

export interface DeleteShortUrlHandlerResponse extends Response<
    DeleteShortUrlHandlerResponseBody
> {}

export class DeleteShortUrlHandler extends BaseHandler<DeleteShortUrlHandlerRequest, DeleteShortUrlHandlerResponse> {

    /**
     * Handler for deleting a short URL and all click events associated with it.
     * @param shortUrlDao 
     * @param clickEventDao 
     */
    constructor(private shortUrlDao: ShortUrlDao, private clickEventDao: ClickEventDao) {
        super();
    }

    async process(request: DeleteShortUrlHandlerRequest, response: DeleteShortUrlHandlerResponse) {
        const shortUrl = request.params.shortUrl;
        await this.deleteShortUrlRecords(shortUrl);

        response.status(204).json();
    }

    isValidRequest(request: DeleteShortUrlHandlerRequest): boolean {
        if (!request.params.shortUrl) {
            console.log('Invalid request - `shortUrl` is missing from params.');
            return false;
        }
        return true;
    }

    private async deleteShortUrlRecords(shortUrl: string): Promise<void> {
        console.log('Deleting click records for short url: %s', shortUrl);
        await this.clickEventDao.delete({ shortUrl });

        console.log('Deleting record for short url: %s', shortUrl);
        await this.shortUrlDao.delete({ shortUrl });
    }
}