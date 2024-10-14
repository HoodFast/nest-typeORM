import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Users } from '../../users/domain/user.sql.entity';
import { Posts } from '../../posts/domain/post.sql.entity';
import { likesStatuses } from '../../posts/domain/likes.statuses';

@Entity()
export class Comments extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column()
  content: string;
  @Column()
  userLogin: string;
  @Column()
  createdAt: Date;
  @OneToMany(() => CommentsLikes, (CommentsLikes) => CommentsLikes.comment, {
    cascade: true,
    nullable: true,
  })
  commentLikes: CommentsLikes[];
  @ManyToOne(() => Users, (Users) => Users.comments, { onDelete: 'CASCADE' })
  user: string;
  @ManyToOne(() => Posts, (Posts) => Posts.comments, { onDelete: 'CASCADE' })
  post: string;
}

@Entity()
export class CommentsLikes extends BaseEntity {
  @PrimaryColumn('uuid')
  id: string;
  @Column({ type: 'enum', enum: likesStatuses, default: likesStatuses.none })
  likesStatus: likesStatuses;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @ManyToOne(() => Comments, (Comments) => Comments.commentLikes, {
    onDelete: 'CASCADE',
  })
  comment: string;
  @ManyToOne(() => Users, (Users) => Users.commentLikes, {
    onDelete: 'CASCADE',
  })
  user: string;
}
