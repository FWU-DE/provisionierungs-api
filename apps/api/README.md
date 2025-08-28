# VIDIS Rostering API

The VIDIS Rostering API is built with [NestJS](https://nestjs.com/).
It provides a rostering API using [Schulconnex](https://schulconnex.de).

# Dev

## Compile and run the project

```bash
# watch mode
$ pnpm run api:dev
```

## Run tests

```bash
# run all
$ pnpm run test

# watch
$ pnpm --filter @fwu/vidis-rostering-api test -- --watch

# run specific tests
$ pnpm --filter @fwu/vidis-rostering-api test -- --watch --testPathPatterns personen-info
```

## OpenAPI (Swagger)

The OpenAPI documentation is available at `http://localhost:3000/openapi` when the server is running.
