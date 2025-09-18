# VIDIS Rostering API

The VIDIS Rostering API is built with [NestJS](https://nestjs.com/).
It provides a rostering API using [Schulconnex](https://schulconnex.de).

## Configuration

Create a `.env` file by copying the `.env.example` and adjust its values to match the app's environment.

## Development

### Compile and run the project

```bash
# watch mode
$ pnpm dev
```

The application will be started at `http://localhost:3010`.

### Run tests

```bash
# run all
$ pnpm test

# watch
$ pnpm --filter @fwu/vidis-rostering-api test -- --watch

# run specific tests
$ pnpm --filter @fwu/vidis-rostering-api test -- --watch --testPathPatterns personen-info
```

## OpenAPI (Swagger)

The OpenAPI documentation is available at `http://localhost:3010/openapi` when the server is running.
