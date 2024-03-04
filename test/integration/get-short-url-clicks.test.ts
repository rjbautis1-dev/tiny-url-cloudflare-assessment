import createServer from "../../src/app";
import request from 'supertest';
import dotenv from 'dotenv';
import { Express } from "express";
import { IConfig, SequelizeInstance } from "../../src/utils/db-util";
import { ClickEvent } from "../../src/models/click-event.model";
import { ShortUrl } from "../../src/models/short-url.model";
import { ModelCtor } from 'sequelize-typescript';
import { ShortUrlDao } from "../../src/dao/short-url";
import { ClickEventDao } from "../../src/dao/click-event";
import { nanoid } from "nanoid";

describe('GetShortUrlClicks integration tests ', () => {
    let app: Express;
    let clickEventDao: ClickEventDao;
    let shortUrlDao: ShortUrlDao;

    beforeAll(async () => {
        dotenv.config();
        const config: IConfig = {
            db: process.env.DB_NAME!,
            username: process.env.DB_USERNAME!,
            password: process.env.DB_PASSWORD!,
            host: 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
        }
        
        const models: ModelCtor[] = [ClickEvent, ShortUrl];
        const db = new SequelizeInstance(config, models);
        await db.connect();

        clickEventDao = new ClickEventDao(db.sequelize.getRepository(ClickEvent));
        shortUrlDao = new ShortUrlDao(db.sequelize.getRepository(ShortUrl));    

        app = await createServer(shortUrlDao, clickEventDao);
    });

    it('returns the total number of clicks made to existing short url', async () => {
        const shortUrl = await shortUrlDao.create({
            shortUrl: nanoid(12) + 'GetShortUrlClicksIntegTest',
            longUrl: 'https://www.example.com/',
        });

        const totalClicks = 5;
        for (let i = 0; i < totalClicks; i++) {
            await request(app)
                .get("/" + shortUrl.shortUrl);
        }

        const res = await request(app)
            .get("/shortUrl/" + shortUrl.shortUrl + "/clicks");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            shortUrl: expect.any(String),
            clickCount: totalClicks,
        });
    });

    it('returns 404 Not Found for a non-existent short url', async () => {
        const shortUrl = 'doesNotExist';

        const res = await request(app)
            .get("/shortUrl/" + shortUrl + "/clicks");

        expect(res.statusCode).toBe(404);
    });

    it('returns 404 Not Found for an expired short url', async () => {
        const shortUrl = await shortUrlDao.create({
            shortUrl: nanoid(12) + 'GetShortUrlIntegTest',
            longUrl: 'https://www.example.com/',
            expiresAt: new Date('2023-01-01T00:00:00Z'),
        });

        const res = await request(app)
            .get("/shortUrl/" + shortUrl + "/clicks");

        expect(res.statusCode).toBe(404);
    });
});
