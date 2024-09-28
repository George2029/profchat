import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

export interface TimeSlotsAttributes {
  id?: number;
  professor_id?: string;
  student_id?: string;
  start_time?: Date;
  end_time?: Date;
  created_at?: Date;
}

@Table({ tableName: 'time_slots', timestamps: false })
export class TimeSlots
  extends Model<TimeSlotsAttributes, TimeSlotsAttributes>
  implements TimeSlotsAttributes
{
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
    defaultValue: Sequelize.literal("nextval('time_slots_id_seq'::regclass)"),
  })
  @Index({ name: 'time_slots_pkey', using: 'btree', unique: true })
  id?: number;

  @Column({ allowNull: true, type: DataType.BIGINT })
  @Index({ name: 'time_slots_professor_id', using: 'btree', unique: false })
  professor_id?: string;

  @Column({ allowNull: true, type: DataType.BIGINT })
  student_id?: string;

  @Column({ allowNull: true, type: DataType.DATE })
  start_time?: Date;

  @Column({ allowNull: true, type: DataType.DATE })
  end_time?: Date;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('now()'),
  })
  created_at?: Date;
}
