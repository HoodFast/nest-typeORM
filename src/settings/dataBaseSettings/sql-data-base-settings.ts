import { EnvironmentVariable } from '../configuration';
import { IsOptional, IsString } from 'class-validator';

export class SqlDataBaseSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsOptional()
  @IsString()
  SQL_HOST: string = this.environmentVariables.SQL_HOST;
  @IsOptional()
  @IsString()
  SQL_USERNAME: string = this.environmentVariables.SQL_USERNAME;
  @IsOptional()
  @IsString()
  SQL_PASS: string = this.environmentVariables.SQL_PASS;
  @IsOptional()
  @IsString()
  SQL_DATABASE: string = this.environmentVariables.SQL_HOST;
}
