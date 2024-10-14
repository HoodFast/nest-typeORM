import {BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import { Users } from './user.sql.entity';

@Entity()
export class EmailConfirmation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column('boolean')
  isConfirmed: boolean;

  @ManyToOne(() => Users, (Users) => Users.id, {
    onDelete: 'CASCADE',
  })
  user: string;
}
