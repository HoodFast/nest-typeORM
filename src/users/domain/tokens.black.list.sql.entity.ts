import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/user.sql.entity';

@Entity()
export class TokensBlackList extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  token: string;
  @ManyToOne(() => Users, (Users) => Users.id, {
    onDelete: 'CASCADE',
  })
  user: Users;
}
