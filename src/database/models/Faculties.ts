import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

export interface FacultiesAttributes {
  slug: string;
}

@Table({ tableName: 'faculties', timestamps: false })
export class Faculties
  extends Model<FacultiesAttributes, FacultiesAttributes>
  implements FacultiesAttributes
{
  @Column({ primaryKey: true, type: DataType.STRING(255) })
  @Index({ name: 'faculties_pkey', using: 'btree', unique: true })
  slug!: string;
}
