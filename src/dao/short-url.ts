import { ShortUrl } from "../models/short-url.model";
import { Repository } from 'sequelize-typescript';

interface IShortUrlDao {
    get(params: { shortUrl: string }): Promise<ShortUrl | null>
    create(params: { shortUrl: string, longUrl: string, expiresAt?: Date }): Promise<ShortUrl>
    delete(params: { shortUrl: string }): Promise<void>    
}

export class ShortUrlDao implements IShortUrlDao {

    private shortUrlRepo: Repository<ShortUrl>;

    constructor(shortUrlRepo: Repository<ShortUrl>) {
        this.shortUrlRepo = shortUrlRepo;
    }

    public async get(params: { shortUrl: string}): Promise<ShortUrl | null> {
        return this.shortUrlRepo.findByPk<ShortUrl>(params.shortUrl);
    }

    public async create(params: { shortUrl: string, longUrl: string, expiresAt?: Date }): Promise<ShortUrl> {
        return this.shortUrlRepo.create({
            shortUrl: params.shortUrl,
            longUrl: params.longUrl,
            expiresAt: params.expiresAt
        })
    }

    public async delete(params: { shortUrl: string }): Promise<void> {
        await this.shortUrlRepo.destroy<ShortUrl>({
            where: {
                shortUrl: params.shortUrl
            }
        });
    }
}
