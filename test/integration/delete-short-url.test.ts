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

describe('DeleteShortUrl integration tests ', () => {
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

    it('deletes an existing short url', async () => {
        const shortUrl = await shortUrlDao.create({
            shortUrl: nanoid(12) + 'DeleteShortUrlIntegTest',
            longUrl: 'https://www.example.com/',
        });

        const res = await request(app)
            .delete("/shortUrl/" + shortUrl.shortUrl);

        expect(res.statusCode).toBe(204);
    });

    it('deletes a non-existent short url', async () => {
        const shortUrl = 'doesNotExist';

        const res = await request(app)
            .delete("/shortUrl/" + shortUrl);

        expect(res.statusCode).toBe(204);
    });
});
