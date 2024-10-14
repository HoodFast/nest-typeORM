import { IsString, Length } from 'class-validator';

export class recoveryPassInputDto {
  @IsString()
  @Length(6, 20)
  newPassword: string;
  @IsString()
  @Length(10)
  recoveryCode: string;
}
