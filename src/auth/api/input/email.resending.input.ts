import { Trim } from '../../../base/validate/trim';
import { IsEmail, IsString } from 'class-validator';

export class emailResendingDto {
  @Trim()
  @IsString()
  @IsEmail()
  email: string;
}
