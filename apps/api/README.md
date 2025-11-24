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
# boot dependencies
$ pnpm test:infra:up
# run all
$ pnpm test

# watch
$ pnpm --filter @fwu/vidis-rostering-api test -- --watch

# run specific tests
$ pnpm --filter @fwu/vidis-rostering-api test -- --watch --testPathPatterns personen-info
```

### Database migrations

#### Create migration

```bash
$ pnpm db:migration:generate <migration-name>
```

#### Run migrations

```bash
$ pnpm db:migration:build
$ pnpm db:migration:run
```

#### Revert last migration

```bash
$ pnpm db:migration:revert
```

#### Reset Database

```bash
$ pnpm db:reset
```

#### Fixtures

We can load fixtures into the production database for testing purposes.
Note that this will reset your database first.

```bash
# Loads the example.fixture.ts fixture
$ pnpm db:fixture example
```

## OpenAPI (Swagger)

The OpenAPI documentation is available at `http://localhost:3010/openapi` when the server is running.

## GraphQL

### Clearance

**all**:

```
query AllClearances {
	allClearances {
		idmId,
		schoolId,
		groupId
	}
}
```

**create**:

```
mutation CreateClearance(
  $offerId: Int!
  $idmId: String!
  $groupId: String!
  $schoolId: String!
) {
  createClearance(
    offerId: $offerId
    idmId: $idmId
    groupId: $groupId
    schoolId: $schoolId
  ) {
		id
    offerId
    idmId
    groupId
    schoolId
  }
}

# Variables
{
	"offerId": 54321,
	"groupId": "group-id-123",
	"idmId": "idm-id",
	"schoolId": "school-id"
}
```

**delete**:

```
mutation DeleteClearance(
  $id: String!
) {
  deleteClearance(
    id: $id
  ) {
		deleted
  }
}

# Variables
{
	"id": "76798772-c4d8-4388-ad3a-8430018d75bd"
}
```

### Offer

**all**:

```
query AllOffers {
	allOffers {
		offerId
	}
}
```

### Groups

**all**:

```
query AllGroups {
	allGroups {
		id
		name
	}
}
```
