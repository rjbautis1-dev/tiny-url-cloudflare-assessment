import { Repository } from "sequelize-typescript";
import { ClickEvent } from "../../src/models/click.model";
import { ClickEventDao, QUERY_PERIOD } from "../../src/dao/click";
import { Op } from "sequelize";

describe('ClickEventDao', () => {
    let clickEventRepoMock: Repository<ClickEvent>;
    let dao: ClickEventDao;

    const realDate = Date.now;

    beforeAll(() => {
        global.Date.now = jest.fn(() => new Date('2024-01-01T00:00:00Z').getTime());
    })

    afterAll(() => {
        global.Date.now = realDate;
    })

    beforeEach(() => {
        clickEventRepoMock = jest.genMockFromModule<Repository<ClickEvent>>('sequelize-typescript');
        clickEventRepoMock.count = jest.fn();
        clickEventRepoMock.create = jest.fn();
        clickEventRepoMock.destroy = jest.fn();
        
        dao = new ClickEventDao(clickEventRepoMock);
    });

    it('creates a table entry with the ORM repo when create is invoked', async () => {
        const params = {
            shortUrl: 'shortUrl'
        };

        await dao.create(params);
        expect(clickEventRepoMock.create).toHaveBeenCalledTimes(1);
        expect(clickEventRepoMock.create).toHaveBeenCalledWith({
            shortUrl: 'shortUrl'
        });
    });

    it('retrieves the count of table entries with the ORM repo when getCount is invoked for OneDate query period', async () => {
        const params = {
            shortUrl: 'shortUrl',
            queryPeriod: QUERY_PERIOD.ONE_DAY
        };

        const mockDateOneDayAgo = new Date('2023-12-31T00:00:00Z')

        await dao.getCount(params);
        expect(clickEventRepoMock.count).toHaveBeenCalledTimes(1);
        expect(clickEventRepoMock.count).toHaveBeenCalledWith({
            where: {
                shortUrl: 'shortUrl',
                createdAt: { [Op.gte]: mockDateOneDayAgo }
            }
        });
    });

    it('retrieves the count of table entries with the ORM repo when getCount is invoked for OneWeek query period', async () => {
        const params = {
            shortUrl: 'shortUrl',
            queryPeriod: QUERY_PERIOD.ONE_WEEK
        };

        const mockDateOneWeekAgo = new Date('2023-12-25T00:00:00Z')

        await dao.getCount(params);
        expect(clickEventRepoMock.count).toHaveBeenCalledTimes(1);
        expect(clickEventRepoMock.count).toHaveBeenCalledWith({
            where: {
                shortUrl: 'shortUrl',
                createdAt: { [Op.gte]: mockDateOneWeekAgo }
            }
        });
    });

    it('retrieves the count of table entries with the ORM repo when getCount is invoked for AllTime query period', async () => {
        const params = {
            shortUrl: 'shortUrl',
            queryPeriod: QUERY_PERIOD.ALL_TIME
        };

        await dao.getCount(params);
        expect(clickEventRepoMock.count).toHaveBeenCalledTimes(1);
        expect(clickEventRepoMock.count).toHaveBeenCalledWith({
            where: {
                shortUrl: 'shortUrl',
            }
        });
    });

    it('deletes all table entries with the ORM repo when delete is invoked', async () => {
        const params = {
            shortUrl: 'shortUrl',
        };

        await dao.delete(params);
        expect(clickEventRepoMock.destroy).toHaveBeenCalledTimes(1);
        expect(clickEventRepoMock.destroy).toHaveBeenCalledWith({
            where: {
                shortUrl: 'shortUrl',
            }
        });
    });

});