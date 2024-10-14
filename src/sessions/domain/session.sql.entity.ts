import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from '../../users/domain/user.sql.entity';

@Entity()
export class Sessions extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  iat: Date;
  @Column()
  expireDate: Date;
  @ManyToOne(() => Users, (Users) => Users.id, {
    onDelete: 'CASCADE',
  })
  user: string;
  @Column()
  deviceId: string;
  @Column()
  ip: string;
  @Column({ nullable: true })
  title: string;
}
