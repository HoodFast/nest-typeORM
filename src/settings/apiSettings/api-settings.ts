import { EnvironmentVariable } from '../configuration';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ApiSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsOptional()
  PORT = this.environmentVariables.PORT;
  @IsOptional()
  @IsString()
  LOCAL_HOST: string | undefined = this.environmentVariables.LOCAL_HOST;
}
