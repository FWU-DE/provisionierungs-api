import { Injectable } from '@nestjs/common';
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import {
  TimeoutError as PromiseTimeoutError,
  promiseTimeout,
} from '@nestjs/terminus/dist/utils';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseReadonlyHealthIndicator {
  constructor(
    private readonly dataSource: DataSource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('database');
    try {
      if (await promiseTimeout(30, this.isReadonly())) {
        return indicator.down('Database is readonly');
      }

      return indicator.up();
    } catch (error) {
      if (error instanceof PromiseTimeoutError) {
        return indicator.down(`timeout of 30ms exceeded`);
      }

      throw error;
    }
  }

  private async isReadonly(): Promise<boolean> {
    const result: {
      transaction_read_only: 'on' | 'off';
    }[] = await this.dataSource.query('SHOW transaction_read_only;');

    return result[0].transaction_read_only === 'on';
  }
}
