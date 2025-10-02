#!/usr/bin/env zx
import { DATASOURCE_PATH } from './constants.mjs';

const flags = [
  // Use the hardcoded local datasource
  '--dataSource',
  DATASOURCE_PATH,
];

// ts-node does not support `paths` within tsconfig.json natively. Therefore we explicitly pass the tsconfig-paths plugin
await $`node -r ./tsconfig-paths ./node_modules/.bin/typeorm migration:revert ${flags}`;
