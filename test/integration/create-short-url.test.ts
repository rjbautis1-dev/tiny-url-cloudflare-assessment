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

describe('CreateShortUrl integration tests ', () => {
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

    it('creates a short url for provided long url', async () => {
        const res = await request(app)
            .post("/shortUrl")
            .send({
                longUrl: 'https://www.example.com/'
            });
      
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            shortUrl: expect.any(String),
            longUrl: 'https://www.example.com/',
            createdAt: expect.any(String)
        });
    });

    it('creates a short url for provided long url and expiration time', async () => {
        // 1 day in milliseconds
        const oneDayOffsetMs = 86400000;
        const oneDayFromNow = new Date(Date.now() + oneDayOffsetMs);

        const res = await request(app)
            .post("/shortUrl")
            .send({
                longUrl: 'https://www.example.com/',
                expiresAt: oneDayFromNow.toISOString()
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            shortUrl: expect.any(String),
            longUrl: 'https://www.example.com/',
            expiresAt: oneDayFromNow.toISOString(),
            createdAt: expect.any(String)
        });
    });

    it('fails to create a short url for provided long url with expiration time in the past', async () => {
        // 1 day in milliseconds
        const oneDayOffsetMs = 86400000;
        const oneDayAgo = new Date(Date.now() - oneDayOffsetMs);

        const res = await request(app)
            .post("/shortUrl")
            .send({
                longUrl: 'https://www.example.com/',
                expiresAt: oneDayAgo.toISOString()
            });

        expect(res.statusCode).toBe(400);
    });
});
