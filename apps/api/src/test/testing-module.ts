import type { ModuleMetadata } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { QueryRunner } from 'typeorm';
import { DataSource } from 'typeorm';
import type { BaseEntity } from '../database/base.entity';
import { Persister } from './fixture/persister';

export function createTestingModule(
  metadata: ModuleMetadata,
): TestingModuleBuilder {
  metadata.imports = [
    ConfigModule.forRoot({ envFilePath: ['.env.test', '.env'] }),
    // TestDatabaseProviderModule, // TODO: enable when needed
    ...(metadata.imports ?? []),
  ];
  return Test.createTestingModule(metadata);
}

let hasCreatedSchema = false;

export class TestingInfrastructure {
  private app: NestExpressApplication | null = null;
  private queryRunner: QueryRunner | null = null;

  constructor(
    public readonly module: TestingModule,
    private readonly fixtures: BaseEntity[],
    private databaseEnabled: boolean,
  ) {}

  async getApp(): Promise<NestExpressApplication> {
    if (!this.app) {
      this.app = this.module.createNestApplication<NestExpressApplication>();
      this.app.useGlobalPipes(
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      );

      await this.app.init();
    }

    return this.app;
  }

  async setUp() {
    if (
      !hasCreatedSchema &&
      (this.databaseEnabled || this.fixtures.length > 0)
    ) {
      await this.module.get(DataSource).synchronize(true);
      hasCreatedSchema = true;
    }

    if (this.databaseEnabled || this.fixtures.length > 0) {
      await this.setUpTransactionsInDatabase();

      if (this.fixtures.length > 0) {
        await new Persister(
          this.module.get(DataSource).manager,
          this.fixtures,
        ).persist();
      }
    }
  }

  async addFixtures(...fixtures: BaseEntity[]) {
    await new Persister(
      this.module.get(DataSource).manager,
      fixtures,
    ).persist();
  }

  async addComplexFixtures(
    ...fixtures: (BaseEntity[] | Record<string, BaseEntity>)[]
  ) {
    const ret: BaseEntity[] = [];
    for (let fixture of fixtures) {
      if (!(fixture instanceof Array)) {
        fixture = Object.values(fixture);
      }
      ret.push(...fixture);
    }

    await new Persister(this.module.get(DataSource).manager, ret).persist();
  }

  /**
   * We overwrite the query runner so that
   * 1. we always use the same query runner
   * 2. that query runner tracks nested transactions
   */
  private async setUpTransactionsInDatabase() {
    const ds = this.module.get(DataSource);
    // Ensure that a query runner is set on the the manager that is used everywhere.
    const queryRunner = (this.queryRunner = ds.createQueryRunner());
    // We need to release the queryrunner back to the pool. We do not want that as we always return the same queryrunner.
    const origRelease = queryRunner.release.bind(queryRunner);
    queryRunner.release = async () => {
      await origRelease();
      (queryRunner as unknown as { isReleased: boolean }).isReleased = false;
    };

    (ds.manager as unknown as { queryRunner: QueryRunner }).queryRunner =
      this.queryRunner;
    ds.createQueryRunner = () => {
      return queryRunner;
    };
    await this.queryRunner.startTransaction();
  }

  async tearDown() {
    await this.queryRunner?.rollbackTransaction();
    await this.module.close();
    await this.app?.close();
  }
}

export class TestingInfrastructureBuilder {
  private fixtures: BaseEntity[] = [];
  private databaseEnabled = false;
  constructor(public readonly testingModuleBuilder: TestingModuleBuilder) {}

  async build(): Promise<TestingInfrastructure> {
    return new TestingInfrastructure(
      await this.testingModuleBuilder.compile(),
      this.fixtures,
      this.databaseEnabled,
    );
  }

  addFixtures(
    ...fixtures: (BaseEntity[] | Record<string, BaseEntity>)[]
  ): this {
    for (let fixture of fixtures) {
      if (!(fixture instanceof Array)) {
        fixture = Object.values(fixture);
      }
      this.fixtures = [...this.fixtures, ...fixture];
    }
    return this;
  }

  enableDatabase(): this {
    this.databaseEnabled = true;
    return this;
  }

  configureModule(cb: (builder: TestingModuleBuilder) => void): this {
    cb(this.testingModuleBuilder);

    return this;
  }
}

export function createTestingInfrastructure(
  metadata: ModuleMetadata,
): TestingInfrastructureBuilder {
  return new TestingInfrastructureBuilder(createTestingModule(metadata));
}
