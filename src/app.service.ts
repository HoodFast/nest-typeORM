import { Injectable } from '@nestjs/common';
import { UsersSqlRepository } from './users/infrastructure/users.sql.repository';

@Injectable()
export class AppService {
  constructor(protected usersSqlRepository: UsersSqlRepository) {}
}
