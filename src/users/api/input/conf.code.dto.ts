import { IsString, Length } from 'class-validator';

export class confirmDto {
  @IsString()
  code: string;
}
