import { ApiSettings } from './apiSettings/api-settings';
import { DataBaseSettings } from './dataBaseSettings/data-base-settings';
import { EnvironmentSettings } from './environmentSettings/environment-settings';
import { ConfigService } from '@nestjs/config';
import { JwtSettings } from './jwtSettings/jwtSettings';
import { ValidateNested, validateSync } from 'class-validator';
import { SqlDataBaseSettings } from './dataBaseSettings/sql-data-base-settings';

export type EnvironmentVariable = { [key: string]: string };

export type ConfigurationType = ReturnType<typeof Configuration.createConfig>;
export type ConfigServiceType = ConfigService<ConfigurationType>;

export class Configuration {
  @ValidateNested()
  apiSettings: ApiSettings;
  // @ValidateNested()
  // databaseSettings: DataBaseSettings;
  @ValidateNested()
  sqlDataBaseSettings: SqlDataBaseSettings;
  @ValidateNested()
  environmentSettings: EnvironmentSettings;
  @ValidateNested()
  jwtSettings: JwtSettings;
  private constructor(configuration: Configuration) {
    Object.assign(this, configuration);
  }
  static createConfig(
    environmentVariables: Record<string, string>,
  ): Configuration {
    return new this({
      apiSettings: new ApiSettings(environmentVariables),
      // databaseSettings: new DataBaseSettings(environmentVariables),
      sqlDataBaseSettings: new SqlDataBaseSettings(environmentVariables),
      environmentSettings: new EnvironmentSettings(environmentVariables),
      jwtSettings: new JwtSettings(environmentVariables),
    });
  }
}

export function validate(environmentVariables: Record<string, string>) {
  const config = Configuration.createConfig(environmentVariables);
  const errors = validateSync(config, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(errors.toString());
  return config;
}
export default () => {
  const environmentVariables = process.env as EnvironmentVariable;
  return Configuration.createConfig(environmentVariables);
};
