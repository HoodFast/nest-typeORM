import { EnvironmentVariable } from '../configuration';
import { IsOptional, IsString } from 'class-validator';

export class DataBaseSettings {
  constructor(private environmentVariables: EnvironmentVariable) {}
  @IsOptional()
  @IsString()
  MONGO_CONNECTION_URI: string = this.environmentVariables.MONGO_URL;
  @IsOptional()
  @IsString()
  MONGO_CONNECTION_URI_FOR_TESTS: string =
    this.environmentVariables.MONGO_URL_TEST;
}
