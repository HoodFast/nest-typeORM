import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from '../../users/domain/user.sql.entity';

@Entity()
export class TokensBlackList extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  token: string;
  @ManyToOne(() => Users, (Users) => Users.id, {
    onDelete: 'CASCADE',
  })
  user: string;
}
