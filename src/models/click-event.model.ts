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
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({ tableName: 'click_events' })
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
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;
}

