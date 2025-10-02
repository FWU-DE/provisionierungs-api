/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { argv } from 'process';
import { MainModule } from '../src/main.module';
import { Persister } from '../src/test/fixture/persister';
import { DataSource } from 'typeorm';
import type { BaseEntity } from '../src/database/base.entity';

async function main() {
  const fixtureName = argv[argv.length - 1];

  console.log(`Loading database fixture "${fixtureName}"...`);

  const app = await NestFactory.create(MainModule);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
  const fixtures: BaseEntity[] = require(`./${fixtureName}.fixture`).default;

  console.log(`Persisting ${String(fixtures.length)} entities...`);

  await new Persister(app.get(DataSource).manager, fixtures).persist();

  await app.close();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
