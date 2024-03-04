import { Router } from "express";
import { ShortUrlDao } from "./dao/short-url";
import { ClickEventDao } from "./dao/click-event";
import { GetShortUrlHandler, GetShortUrlHandlerRequest, GetShortUrlHandlerResponse } from "./handlers/get-short-url";
import { CreateShortUrlHandler, CreateShortUrlHandlerRequest, CreateShortUrlHandlerResponse } from "./handlers/create-short-url";
import { DeleteShortUrlHandler, DeleteShortUrlHandlerRequest, DeleteShortUrlHandlerResponse } from "./handlers/delete-short-url";
import { GetShortUrlClicksHandler, GetShortUrlClicksHandlerRequest } from "./handlers/get-short-url-clicks";

export class ShortUrlRouter {

    router: Router;
    private shortUrlDao: ShortUrlDao;
    private clickEventDao: ClickEventDao;

    constructor(shortUrlDao: ShortUrlDao, clickEventDao: ClickEventDao) {
        this.router = Router();
        this.shortUrlDao = shortUrlDao;
        this.clickEventDao = clickEventDao;

        this.buildRoutes();
    }

    private buildRoutes() {
        this.router.get('/:shortUrl', (request: GetShortUrlHandlerRequest, response: GetShortUrlHandlerResponse) => {
            new GetShortUrlHandler(this.shortUrlDao, this.clickEventDao).handle(request, response)
        });

        this.router.post('/shortUrl', (request: CreateShortUrlHandlerRequest, response: CreateShortUrlHandlerResponse) => {
            new CreateShortUrlHandler(this.shortUrlDao, this.clickEventDao).handle(request, response)
        });

        this.router.get('/shortUrl/:shortUrl/clicks', (request: GetShortUrlClicksHandlerRequest, response: GetShortUrlHandlerResponse) => {
            new GetShortUrlClicksHandler(this.shortUrlDao, this.clickEventDao).handle(request, response)
        });

        this.router.delete('/shortUrl/:shortUrl', (request: DeleteShortUrlHandlerRequest, response: DeleteShortUrlHandlerResponse) => {
            new DeleteShortUrlHandler(this.shortUrlDao, this.clickEventDao).handle(request, response)
        });
    }

}
