#!/usr/bin/env zx
import { DATASOURCE_PATH } from './constants.mjs';

const flags = [
  // Use the hardcoded local datasource
  '--dataSource',
  DATASOURCE_PATH,
];
await $`node node_modules/typeorm/cli.js schema:drop ${flags}`;
await $`pnpm db:migration:build`;
await $`pnpm db:migration:run`;
