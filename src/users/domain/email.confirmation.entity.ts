import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from './user.sql.entity';

@Entity()
export class EmailConfirmation extends BaseEntity {
  @PrimaryColumn('uuid')
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
