import { Repository } from "sequelize-typescript";
import { Op } from "sequelize";
import { ShortUrlDao } from "../../../src/dao/short-url";
import { ShortUrl } from "../../../src/models/short-url.model";

describe('ShortUrlDao', () => {
    let shortUrlRepoMock: Repository<ShortUrl>;
    let dao: ShortUrlDao;

    const realDate = Date.now;

    beforeAll(() => {
        global.Date.now = jest.fn(() => new Date('2024-01-01T00:00:00Z').getTime());
    })

    afterAll(() => {
        global.Date.now = realDate;
    })

    beforeEach(() => {
        shortUrlRepoMock = jest.genMockFromModule<Repository<ShortUrl>>('sequelize-typescript');
        shortUrlRepoMock.findByPk = jest.fn();
        shortUrlRepoMock.create = jest.fn();
        shortUrlRepoMock.destroy = jest.fn();
        
        dao = new ShortUrlDao(shortUrlRepoMock);
    });

    it('creates a table entry with the ORM repo when create is invoked', async () => {
        const params = {
            shortUrl: 'shortUrl',
            longUrl: 'longUrl',
            expiresAt: undefined,
        };

        await dao.create(params);
        expect(shortUrlRepoMock.create).toHaveBeenCalledTimes(1);
        expect(shortUrlRepoMock.create).toHaveBeenCalledWith({
            shortUrl: 'shortUrl',
            longUrl: 'longUrl',
            expiresAt: undefined,
        });
    });

    it('retrieves a table entry with the ORM repo when get is invoked', async () => {
        const params = {
            shortUrl: 'shortUrl',
        };

        await dao.get(params);
        expect(shortUrlRepoMock.findByPk).toHaveBeenCalledTimes(1);
        expect(shortUrlRepoMock.findByPk).toHaveBeenCalledWith('shortUrl');
    });

    it('deletes a table entry with the ORM repo when delete is invoked', async () => {
        const params = {
            shortUrl: 'shortUrl',
        };

        await dao.delete(params);
        expect(shortUrlRepoMock.destroy).toHaveBeenCalledTimes(1);
        expect(shortUrlRepoMock.destroy).toHaveBeenCalledWith({
            where: {
                shortUrl: 'shortUrl',
            }
        });
    });


});