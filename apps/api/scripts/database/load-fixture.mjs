#!/usr/bin/env zx
const { question } = require('zx');

const fixtureName = argv._[0];
if (!fixtureName) {
  console.error('[Error] Please provide the name of the fixture to load');
  process.exit(1);
}

await $`tsc`;

const answer = await question(
  'I am resetting the database. Are you sure? (y/N) ',
);
if (answer.toLowerCase() !== 'y') {
  console.log('Database reset skipped. Abort.');
  process.exit(0);
}

await $`pnpm db:reset`;

await $`node dist/fixtures/loadfixture.js ${fixtureName}`;
