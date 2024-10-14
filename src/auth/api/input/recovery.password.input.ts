import { IsEmail } from 'class-validator';

export class recoveryPass {
  @IsEmail()
  email: string;
}
