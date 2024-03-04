import { Request, Response } from "express";
import { ShortUrlDao } from "../dao/short-url";
import { ClickEventDao, QUERY_PERIOD } from "../dao/click";
import { BaseHandler } from "./base";
import _ from "lodash";
import { hasExpired } from "../utils/expiration-util";

const queryPeriodParamToEnumMapping = {
    'OneDay': QUERY_PERIOD.ONE_DAY,
    'OneWeek': QUERY_PERIOD.ONE_WEEK,
    'AllTime': QUERY_PERIOD.ALL_TIME,
}

type GetShortUrlClicksHandlerRequestParams = {
    shortUrl: string;
};

type GetShortUrlClicksRequestQueryParams = {
    queryPeriod?: 'OneDay' | 'OneWeek' | 'AllTime';
}

type GetShortUrlClicksHandlerResponseBody = {
    message?: string;
    shortUrl?: string;
    queryPeriod?: 'OneDay' | 'OneWeek' | 'AllTime';
    clickCount?: number;
};

export interface GetShortUrlClicksHandlerRequest extends Request<
    GetShortUrlClicksHandlerRequestParams,
    {},
    {},
    GetShortUrlClicksRequestQueryParams
> {}

export interface GetShortUrlClicksHandlerResponse extends Response<
    GetShortUrlClicksHandlerResponseBody
> {}

export class GetShortUrlClicksHandler extends BaseHandler<GetShortUrlClicksHandlerRequest, GetShortUrlClicksHandlerResponse> {

    /**
     * Handler for getting the total number of clicks for a short URL in a one day, one week, or all time period.
     * By default, data from a one day period is shown if no period is specified in the request.
     * @param shortUrlDao 
     * @param clickEventDao 
     */
    constructor(private shortUrlDao: ShortUrlDao, private clickEventDao: ClickEventDao) {
        super();
    }

    async process(request: GetShortUrlClicksHandlerRequest, response: GetShortUrlClicksHandlerResponse) {
        const shortUrl = request.params.shortUrl;
        const record = await this.shortUrlDao.get({ shortUrl });

        if (!record || hasExpired(record.expiresAt)) {
            response.status(404).json({
                message: "Resource not found."
            });
            return;
        }
        console.log('Found record for short url: ', record.shortUrl);

        // Default to showing clicks in past day if no query period is defined in the request parameters.
        const queryPeriod = request.query.queryPeriod || 'OneDay';
        const count = await this.clickEventDao.getCount({ shortUrl, queryPeriod: queryPeriodParamToEnumMapping[queryPeriod] });

        console.log('Short url: %s has click count: %s over period: %s', shortUrl, count, queryPeriod);
        response.status(200).json({
            shortUrl,
            clickCount: count
        })
    }

    isValidRequest(request: GetShortUrlClicksHandlerRequest): boolean {
        if (!request.params.shortUrl) {
            console.log('Invalid request - `shortUrl` is missing from params.');
            return false;
        }

        const queryPeriod = request.query.queryPeriod;
        if (!_.isNil(queryPeriod) && !_.has(queryPeriodParamToEnumMapping, queryPeriod)) {
            console.log('Invalid request - `queryPeriod`: %s is not supported.', queryPeriod);
            return false;
        }

        return true;
    }
}

