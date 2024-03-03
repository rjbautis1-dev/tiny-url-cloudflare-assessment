import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt
} from 'sequelize-typescript';

export interface IShortUrl {
    shortUrl: string;
    longUrl: string;
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({ tableName: 'short_urls' })
export class ShortUrl extends Model<IShortUrl> {

    @Column({
        type: DataType.STRING,
        primaryKey: true,
    })
    shortUrl!: string;

    @Column({
        type: DataType.STRING,
    })
    longUrl!: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    @Column({
        type: DataType.DATE,
    })
    expiresAt?: Date;
}

