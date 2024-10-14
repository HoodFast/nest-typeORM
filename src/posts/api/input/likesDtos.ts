import { IsEnum } from 'class-validator';

export enum likesStatuses {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}

export class LikesDto {
  @IsEnum(likesStatuses)
  likeStatus: likesStatuses;
}
