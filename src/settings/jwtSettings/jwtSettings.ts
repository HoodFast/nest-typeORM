import { EnvironmentVariable } from '../configuration';
import { IsOptional, IsString } from 'class-validator';

export class JwtSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsOptional()
  @IsString()
  AC_SECRET = this.environmentVariables.AC_SECRET;
  @IsOptional()
  @IsString()
  AC_TIME = this.environmentVariables.AC_TIME;
  @IsOptional()
  @IsString()
  RT_SECRET = this.environmentVariables.RT_SECRET;
  @IsOptional()
  @IsString()
  RT_TIME = this.environmentVariables.RT_TIME;
  @IsOptional()
  @IsString()
  RECOVERY_SECRET = this.environmentVariables.RECOVERY_SECRET;
  @IsOptional()
  @IsString()
  RECOVERY_TIME = this.environmentVariables.RECOVERY_TIME;
}
