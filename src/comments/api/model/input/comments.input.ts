import { IsString, Length } from 'class-validator';

export class CommentsInput {
  @IsString()
  @Length(20, 300)
  content: string;
}
