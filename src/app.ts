import express, { Express } from 'express';
import { ClickEventDao } from './dao/click-event';
import { ShortUrlDao } from './dao/short-url';
import { ShortUrlRouter } from './short-url.router';

async function createServer(shortUrlDao: ShortUrlDao, clickEventDao: ClickEventDao) {
    const app: Express = express();

    app.use(express.json());
    app.use('/', new ShortUrlRouter(shortUrlDao, clickEventDao).router)

    return app;
}

export default createServer;