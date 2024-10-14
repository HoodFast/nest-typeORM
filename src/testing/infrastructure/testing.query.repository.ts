import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteAll(): Promise<boolean> {
    await this.dataSource.query(`DELETE FROM public."users"`);
    await this.dataSource.query(`DELETE FROM public."blogs"`);
    return true;
  }
}
