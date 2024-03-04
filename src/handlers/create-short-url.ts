import { Request, Response } from "express";
import { ShortUrlDao } from "../dao/short-url";
import { BaseHandler } from "./base";
import _ from 'lodash';
import moment from 'moment';
import { hasExpired } from "../utils/expiration-util";
import { ClickEventDao } from "../dao/click";
import { nanoid } from 'nanoid';

type CreateShortUrlHandlerRequestParams = {};
type CreateShortUrlHandlerRequestBody = {
    longUrl: string;
    expiresAt?: string;
};
type CreateShortUrlHandlerResponseBody = {
    message?: string;
    shortUrl?: string;
    longUrl?: string;
    expiresAt?: Date;
    createdAt?: Date;
};

export interface CreateShortUrlHandlerRequest extends Request<
    CreateShortUrlHandlerRequestParams,
    {},
    CreateShortUrlHandlerRequestBody
> {}

export interface CreateShortUrlHandlerResponse extends Response<
    CreateShortUrlHandlerResponseBody
> {}

const SHORT_URL_LENGTH = 12;

export class CreateShortUrlHandler extends BaseHandler<CreateShortUrlHandlerRequest, CreateShortUrlHandlerResponse> {

    /**
     * Handler for creating a new short URL with a unique identifier from a given URL.
     * @param shortUrlDao 
     * @param clickEventDao 
     * @param shortenUrlGenerator 
     */
    constructor(private shortUrlDao: ShortUrlDao, private clickEventDao: ClickEventDao) {
        super();
    }

    async process(request: CreateShortUrlHandlerRequest, response: CreateShortUrlHandlerResponse) {
        const longUrl = request.body.longUrl;
        const shortUrl = nanoid(SHORT_URL_LENGTH);
        console.log('Generated short url: %s for long url: %s', shortUrl, longUrl);

        let record = await this.shortUrlDao.get({ shortUrl });
        if (record) {
            console.log('Existing record found for the generated short url: ', record);

            if (!hasExpired(record.expiresAt)) {
                response.status(409).json({
                    message: "Resource already exists."
                });
                return;
            }

            // Delete the expired record before re-creating it.
            // In an idea world, expired records should be deleted by an async cron job that scans the table instead of here.
            await this.deleteExpiredShortUrlRecords(record.shortUrl, record.expiresAt!);
        }

        const expiresAt = !_.isNil(request.body.expiresAt)
            ? new Date(Date.parse(request.body.expiresAt))
            : undefined;

        const params = {
            shortUrl,
            longUrl,
            expiresAt,
        }
        console.log('Creating short url entry with params: ', params);
        record = await this.shortUrlDao.create(params);
        console.log('Successfully created short url entry: ', record);

        response.status(201).json({
            shortUrl: record.shortUrl,
            longUrl: record.longUrl,
            expiresAt: record.expiresAt,
            createdAt: record.createdAt
        });
    }

    isValidRequest(request: CreateShortUrlHandlerRequest): boolean {
        if (!request.body.longUrl) {
            console.log('Invalid request - `longUrl` is missing from params.');
            return false;
        }

        if (!this.isValidUrl(request.body.longUrl)) {
            console.log('Invalid request - `longUrl`: %s is not a valid URL.', request.body.longUrl);
            return false;
        }

        if (request.body.expiresAt) {
            const date = moment(Date.parse(request.body.expiresAt))
            if (!date.isValid() || date.toDate().getTime() < Date.now()) {
                console.log('Invalid request - `expiresAt`: %s is in the past.', request.body.expiresAt);
                return false;
            }
        }

        return true;
    }

    private async deleteExpiredShortUrlRecords(shortUrl: string, expiresAt: Date): Promise<void> {
        console.log('Deleting click records for short url: %s with surpassed expiration date: %s', shortUrl, expiresAt)
        await this.clickEventDao.delete({ shortUrl });

        console.log('Deleting record for short url: %s with surpassed expiration date: %s', shortUrl, expiresAt)
        await this.shortUrlDao.delete({ shortUrl });
    }


    private isValidUrl(url: string) {
        try {
            const newUrl = new URL(url);
            return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
        } catch (err) {
            return false;
        }
    }
}
  
