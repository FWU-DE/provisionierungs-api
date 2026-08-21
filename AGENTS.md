# AGENTS.md

## Project overview

FWU VIDIS Rostering — a pnpm/turborepo monorepo with two apps:

- `apps/api` — NestJS backend (GraphQL + REST/OpenAPI), TypeORM/Postgres, provides a rostering API using [Schulconnex](https://schulconnex.de). Runs on port `3010`.
- `apps/ui` — Next.js (App Router) frontend, Apollo Client + gql.tada, Tailwind CSS, next-intl, OpenID Connect auth. Runs on port `3000`.

Shared packages live under `packages/`: `eslint-config`, `typescript-config`, `ui`, `utils`.

## Setup

```bash
pnpm install
```

For the API, copy `apps/api/.env.example` to `apps/api/.env` and adjust values.

## Common commands

Run from the repo root (Turborepo fans these out to the relevant workspace):

```bash
pnpm dev              # all apps
pnpm api:dev          # API only
pnpm ui:dev           # UI only
pnpm build            # build all
pnpm lint             # lint all (eslint --max-warnings=0)
pnpm check-types      # tsc --noEmit across workspaces
pnpm test             # test all
pnpm test:cov         # test with coverage
pnpm format           # prettier --write
pnpm prettier:check   # prettier --check
```

Filter to one workspace with `--filter`, e.g. `pnpm --filter @fwu/vidis-rostering-api test`.

### Infra (Docker Compose, for local dev/test dependencies e.g. Postgres)

```bash
pnpm infra:up / infra:down             # dev dependencies
pnpm test:infra:up / test:infra:down   # test dependencies
```

### API database migrations (run from `apps/api`, or via `pnpm --filter @fwu/vidis-rostering-api ...`)

```bash
pnpm db:migration:generate <name>   # delete dist/ first — stale entities can pollute the migration
pnpm db:migration:build
pnpm db:migration:run
pnpm db:migration:revert
pnpm db:reset
pnpm db:fixture <name>              # resets the DB, then loads a fixture
```

## Testing

- API: Jest (`apps/api`), run in-band. Boot test infra first: `pnpm test:infra:up`.
  - Single test file: `pnpm --filter @fwu/vidis-rostering-api test -- --watch --testPathPatterns <pattern>`
- UI: no test suite is currently configured; verify changes via `pnpm check-types`, `pnpm lint`, and manual/browser checks.

Always run `pnpm lint` and `pnpm check-types` for the workspace(s) you touched before considering a change done.

## Code style

- Formatting is enforced by Prettier (`pnpm format`) with `@trivago/prettier-plugin-sort-imports` and `prettier-plugin-tailwindcss`; don't hand-format imports or Tailwind class order.
- Linting is `eslint --max-warnings=0` per workspace — treat warnings as errors.
- husky + lint-staged run on commit; don't bypass with `--no-verify`.
- TypeScript strict typing via shared `@fwu-rostering/typescript-config`.

## Notes

- `apps/ui/app/lib/gql-tada/graphql-env.d.ts` is generated (via `gql-tada generate output`, run as the UI's `prebuild` step) from the API's GraphQL schema — regenerate after changing API GraphQL types rather than hand-editing it.
- OpenAPI docs for the API are served at `http://localhost:3010/openapi` when running.
- Architecture and integration docs live under `doc/` (`architektur.md`, `anbindung-angebot.md`, `anbindung-landessystem.md`).
- Per-app details: `apps/api/README.md`, `apps/ui/README.md`.
