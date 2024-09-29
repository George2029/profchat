import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

export interface RequestsAttributes {
  id?: number;
  professor_id?: string;
  student_id?: string;
  request_status?: any;
  created_at?: Date;
}

@Table({ tableName: 'requests', timestamps: false })
export class Requests
  extends Model<RequestsAttributes, RequestsAttributes>
  implements RequestsAttributes
{
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
    defaultValue: Sequelize.literal("nextval('requests_id_seq'::regclass)"),
  })
  @Index({ name: 'requests_pkey', using: 'btree', unique: true })
  id?: number;

  @Column({ allowNull: true, type: DataType.BIGINT })
  @Index({ name: 'requests_professor_id', using: 'btree', unique: false })
  professor_id?: string;

  @Column({ allowNull: true, type: DataType.BIGINT })
  @Index({ name: 'requests_student_id', using: 'btree', unique: false })
  student_id?: string;

  @Column({
    allowNull: true,
    defaultValue: Sequelize.literal("'PENDING'::enum_requests_request_status"),
  })
  request_status?: RequestStatus;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('now()'),
  })
  created_at?: Date;
}
