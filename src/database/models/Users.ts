import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

export interface UsersAttributes {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
  created_at?: Date;
}

@Table({ tableName: 'users', timestamps: false })
export class Users
  extends Model<UsersAttributes, UsersAttributes>
  implements UsersAttributes
{
  @Column({ primaryKey: true, type: DataType.BIGINT })
  @Index({ name: 'users_pkey', using: 'btree', unique: true })
  id!: string;

  @Column({ allowNull: true, type: DataType.STRING(255) })
  username?: string;

  @Column({ allowNull: true, type: DataType.STRING(255) })
  first_name?: string;

  @Column({ allowNull: true, type: DataType.STRING(255) })
  last_name?: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    defaultValue: Sequelize.literal("'en'::character varying"),
  })
  language_code?: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('now()'),
  })
  created_at?: Date;
}
