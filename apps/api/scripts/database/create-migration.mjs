#!/usr/bin/env zx
/**
 * This script creates a new migration file in the database/migrations folder.
 * @param {string} name The name of the migration.
 */
import { exit } from 'process';
import 'zx/globals';

import { DATASOURCE_PATH, MIGRATIONS_PATH } from './constants.mjs';

/**
 * Helper function to capitalize the first letter of a string.
 * @param {string} input
 * @returns string
 */
function capitalizeFirstLetter(input) {
  const string = String(input);
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Check if a name was provided
if (argv._.length !== 1) {
  // eslint-disable-next-line no-console
  console.error('[Error] Please provide a name for the migration');
  exit(1);
}

await $`pnpm db:migration:build`;

// Get the name and capitalize it
const name = argv._[0];
const capitalizedName = capitalizeFirstLetter(name);

const timestamp = new Date().getTime();

// Create the migration
const flags = [
  // Use the hardcoded local datasource
  '--dataSource',
  DATASOURCE_PATH,
  // Specify timestamp ourselves to know filename of migration for formatting
  '--timestamp',
  timestamp,
  // Pretty print the generated SQL statements for better readability
  '--pretty',
];
const migrationPath = path
  .join(MIGRATIONS_PATH, capitalizedName)
  .replaceAll('\\', '\\\\');
// ts-node does not support `paths` within tsconfig.json natively. Therefore we explicitly pass the tsconfig-paths plugin
await $`node node_modules/typeorm/cli.js migration:generate ${migrationPath} ${flags}`;

// Format the newly created migration
const migrationFile = path
  .join(MIGRATIONS_PATH, `${timestamp}-${capitalizedName}.ts`)
  .replaceAll('\\', '\\\\');

await $`pnpx prettier --write ${migrationFile}`;
