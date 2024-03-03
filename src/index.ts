import express, { Express, Request, Response } from "express";
import dotenv from 'dotenv';
import { IConfig, ShortUrlsDatabase } from "./db/short-urls-db";
import { ClickEvent } from "./models/click.model";
import { ShortUrl } from "./models/short-url.model";

dotenv.config();

const app: Express = express();
const port = process.env.EXPRESS_PORT || 8080;

(async () => {
    const config: IConfig = {
        db: process.env.DB_NAME!,
        username: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT) || 5432,
    }

    const models = [ClickEvent, ShortUrl];
    const db = new ShortUrlsDatabase(config, models);
    await db.connect();

    app.get("/", (req: Request, res: Response) => {
        res.send("Express + TypeScript Server");
    });

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });

})();
