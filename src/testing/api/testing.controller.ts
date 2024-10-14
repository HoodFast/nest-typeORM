import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestingSqlQueryRepository } from '../infrastructure/testing.query.repository';

@Controller('testing/all-data')
export class TestingController {
  constructor(private testingQueryRepository: TestingSqlQueryRepository) {}
  @HttpCode(204)
  @Delete()
  async deleteAll() {
    await this.testingQueryRepository.deleteAll();
    return;
  }
}
