import dotenv from 'dotenv';
import createServer from "./app";
import { IConfig, SequelizeInstance } from './utils/db-util';
import { ClickEvent } from './models/click-event.model';
import { ShortUrl } from './models/short-url.model';
import { ModelCtor } from 'sequelize-typescript';
import { ClickEventDao } from './dao/click-event';
import { ShortUrlDao } from './dao/short-url';

(async () => {
    dotenv.config();

    const config: IConfig = {
        db: process.env.DB_NAME!,
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT) || 5432,
    }

    const models: ModelCtor[] = [ClickEvent, ShortUrl];
    const db = new SequelizeInstance(config, models);
    await db.connect();

    const clickEventDao = new ClickEventDao(db.sequelize.getRepository(ClickEvent));
    const shortUrlDao = new ShortUrlDao(db.sequelize.getRepository(ShortUrl));

    const app = await createServer(shortUrlDao, clickEventDao);
    const port = process.env.EXPRESS_PORT || 8080;

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
})();
