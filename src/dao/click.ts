import moment from 'moment';
import { Repository } from "sequelize-typescript";
import { ClickEvent, IClickEvent } from "../models/click.model"
import { WhereOptions } from "sequelize";

export enum QUERY_PERIOD {
    ONE_DAY,
    ONE_WEEK,
    ALL_TIME,
}

interface IClickEventDao {
    create(params: { shortUrl: string }): Promise<ClickEvent>
    list(params: { shortUrl: string, queryPeriod: QUERY_PERIOD }): Promise<number>
    delete(params: { shortUrl: string }): Promise<void>
}

export class ClickEventDao implements IClickEventDao {

    private clickEventRepo: Repository<ClickEvent>;

    constructor(clickEventRepo: Repository<ClickEvent>) {
        this.clickEventRepo = clickEventRepo;
    }

    public async create(params: { shortUrl: string }): Promise<ClickEvent> {
        return this.clickEventRepo.create({
            shortUrl: params.shortUrl
        });
    }

    public async list(params: { shortUrl: string, queryPeriod: QUERY_PERIOD}): Promise<number> {
        const whereClause: WhereOptions<IClickEvent> = {
            shortUrl: params.shortUrl
        }

        const currentMoment = moment().utc();
        switch (params.queryPeriod) {
            case QUERY_PERIOD.ONE_DAY:
                currentMoment.subtract(1, 'days');
                whereClause.createdAt = currentMoment.toDate();

            case QUERY_PERIOD.ONE_WEEK:
                currentMoment.subtract(1, 'week');
                whereClause.createdAt = currentMoment.toDate();

            case QUERY_PERIOD.ALL_TIME:
                break;
        }

        return this.clickEventRepo.count({
            where: whereClause
        });
    }
    
    public async delete(params: { shortUrl: string }): Promise<void> {
        await this.clickEventRepo.destroy<ClickEvent>({
            where: {
                shortUrl: params.shortUrl
            }
        });
    }
}
