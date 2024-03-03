import {
    Model,
    Table,
    Column,
    DataType,
    ForeignKey,
    CreatedAt,
    UpdatedAt
} from 'sequelize-typescript';
import { ShortUrl } from './short-url.model';

export interface IClickEvent {
    shortUrl: string;
}

@Table({ tableName: 'clicks' })
export class ClickEvent extends Model<IClickEvent> {

    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    clickId!: number;

    @ForeignKey(() => ShortUrl)
    @Column({
        type: DataType.STRING,
    })
    shortUrl!: string;

    @CreatedAt
    createdAt!: string;

    @UpdatedAt
    updatedAt!: string;
}

