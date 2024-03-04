import { Request, Response } from "express";
import { ShortUrlDao } from "../dao/short-url";
import { ClickEventDao } from "../dao/click";
import { BaseHandler } from "./base";
import _ from "lodash";
import { hasExpired } from "../utils/expiration-util";

type GetShortUrlHandlerRequestParams = {
    shortUrl: string;
};

type GetShortUrlHandlerResponseBody = {
    message?: string
};

export interface GetShortUrlHandlerRequest extends Request<
    GetShortUrlHandlerRequestParams
> {}

export interface GetShortUrlHandlerResponse extends Response<
    GetShortUrlHandlerResponseBody
> {}

export class GetShortUrlHandler extends BaseHandler<GetShortUrlHandlerRequest, GetShortUrlHandlerResponse> {

    /**
     * Handler to retrieve a stored short URL and redirect the client to the original URL (if it exists and not expired).
     * @param shortUrlDao 
     * @param clickEventDao 
     */
    constructor(private shortUrlDao: ShortUrlDao, private clickEventDao: ClickEventDao) {
        super();
    }

    async process(request: GetShortUrlHandlerRequest, response: GetShortUrlHandlerResponse) {
        const shortUrl = request.params.shortUrl;
        const record = await this.shortUrlDao.get({ shortUrl });

        // If record has expired, do not attempt to delete it. Return 404 Not Found status code to the client instead.
        if (!record || hasExpired(record.expiresAt)) {
            response.status(404).json({
                message: "Resource not found."
            });
            return;
        }
        console.log('Found record for short url: ', record.shortUrl);

        console.log('Processing click event for short url: ', record.shortUrl);
        await this.clickEventDao.create({ shortUrl: record.shortUrl });

        const longUrl = record.longUrl;
        console.log('Redirecting short url to long url: ', longUrl);
        response.redirect(longUrl);
    }

    isValidRequest(request: GetShortUrlHandlerRequest): boolean {
        if (!request.params.shortUrl) {
            console.log('Invalid request: short url is missing from params.');
            return false;
        }
        return true;
    }
}

