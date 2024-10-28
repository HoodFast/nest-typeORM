import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/user.sql.entity';
import { Posts } from './post.sql.entity';
import { likesStatuses } from './likes.statuses';

@Entity()
export class LikePost extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @Column()
  login: string;
  @ManyToOne(() => Users, (Users) => Users.postLikes, {
    onDelete: 'CASCADE',
  })
  user: string;
  @Column()
  userId: string;
  @ManyToOne(() => Posts, (Posts) => Posts.postLikes, {
    onDelete: 'CASCADE',
  })
  post: string;
  @Column()
  postId: string;
  @Column({ type: 'enum', enum: likesStatuses, default: likesStatuses.none })
  likesStatus: likesStatuses;
}
