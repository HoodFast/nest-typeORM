import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from '../../users/domain/user.sql.entity';
import { Posts } from './post.sql.entity';
import { likesStatuses } from './likes.statuses';

@Entity()
export class LikePost extends BaseEntity {
  @PrimaryColumn('uuid')
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
  @ManyToOne(() => Posts, (Posts) => Posts.postLikes, {
    onDelete: 'CASCADE',
  })
  post: string;
  @Column({ type: 'enum', enum: likesStatuses, default: likesStatuses.none })
  likesStatus: likesStatuses;
}
