import { ModelCtor, Sequelize } from 'sequelize-typescript';

export interface IConfig {
    db: string;
    username: string;
    password: string;
    host: string;
    port: number;
}

export class SequelizeInstance {

    public sequelize: Sequelize;

    constructor(config: IConfig, models: ModelCtor[]) {
        this.sequelize = new Sequelize({
            repositoryMode: true,
            quoteIdentifiers: false,
            database: config.db,
            username: config.username,
            password: config.password,
            host: config.host,
            port: config.port,
            dialect: 'postgres',
            models: models,
        });
    }

    public async connect() {
        await this.sequelize.authenticate()
            .then(() => {
            console.log("Successfully authenticated to the DB.");
            })
            .catch((err) => {
            console.error("Unable to connect to the DB:", err);
            });

        await this.sequelize
            .sync()
            .then(() => {
                console.log("Successfully synced models to the DB.");
            })
            .catch((err) => {
                console.error("Unable to sync models to the DB:", err)
            });
    }
}