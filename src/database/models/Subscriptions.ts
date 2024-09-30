import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

export interface SubscriptionsAttributes {
  id?: number;
  professor_id?: string;
  student_id?: string;
  created_at?: Date;
}

@Table({ tableName: 'subscriptions', timestamps: false })
export class Subscriptions
  extends Model<SubscriptionsAttributes, SubscriptionsAttributes>
  implements SubscriptionsAttributes
{
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
    defaultValue: Sequelize.literal(
      "nextval('subscriptions_id_seq'::regclass)",
    ),
  })
  @Index({ name: 'subscriptions_pkey', using: 'btree', unique: true })
  id?: number;

  @Column({ allowNull: true, type: DataType.BIGINT })
  @Index({ name: 'subscriptions_professor_id', using: 'btree', unique: false })
  professor_id?: string;

  @Column({ allowNull: true, type: DataType.BIGINT })
  @Index({ name: 'subscriptions_student_id', using: 'btree', unique: false })
  student_id?: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('now()'),
  })
  created_at?: Date;
}
