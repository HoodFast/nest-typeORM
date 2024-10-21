import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LikePost } from './likePost.sql.entity';
import { Blogs } from '../../blogs/domain/blog.sql.entity';
import { Comments } from '../../comments/domain/comment.sql.entity';
export enum likesStatuses {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}
@Entity()
export class Posts extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  blogId: string;
  @Column()
  blogName: string;
  @OneToMany(() => LikePost, (LikePost) => LikePost.post, {
    cascade: true,
    nullable: true,
  })
  postLikes: LikePost[];
  @ManyToOne(() => Blogs, (Blogs) => Blogs.post, { onDelete: 'CASCADE' })
  blog: string;
  @Column()
  createdAt: Date;
  @OneToMany(() => Comments, (Comments) => Comments.post, {
    cascade: true,
    nullable: true,
  })
  comments: Comments[];
}
