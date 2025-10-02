#!/usr/bin/env zx
import { DATASOURCE_PATH } from './constants.mjs';

const flags = [
  // Use the hardcoded local datasource
  '--dataSource',
  DATASOURCE_PATH,
];

if (!(await fs.exists(DATASOURCE_PATH))) {
  console.error('[Error] Datasource file does not exist:', DATASOURCE_PATH);
  console.error(
    '[Error] Please run "pnpm run db:migration:build" to generate the datasource file.',
  );
}

await $`node node_modules/typeorm/cli.js migration:run ${flags}`;
