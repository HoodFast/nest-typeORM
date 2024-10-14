import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from '../../../base/validate/trim';

export class UserInputDto {
  @Trim()
  @IsString()
  @Length(3, 10)
  login: string;
  @Length(6, 20)
  password: string;
  @IsEmail()
  email: string;
}
