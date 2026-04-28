# IDM connectivity and processing

This module incorporates the data retrieval from IDMs and its processing into the Schulconnex data schema. It acts as a bridge between the internal roster data requirements and various external Identity Management Systems (IDMs).

## Fetchers

Fetchers are responsible for the low-level communication with specific IDM APIs. They handle:

- Executing HTTP requests to the IDM endpoints.
- Authentication (e.g., using Bearer tokens).
- Schema validation of the received data using Zod.
- Handling technical API specifics (e.g., mandatory query parameters for Schulconnex).

The `AbstractFetcher` provides a common base for different IDM API schemas. The `SchulconnexFetcher` is the primary implementation, adhering to the Schulconnex standard.

## Adapters

Adapters wrap Fetchers and provide specific configurations for individual IDM instances. Each IDM (e.g., Saarland, Eduplaces) has its own adapter that implements the `AdapterInterface`. Adapters are responsible for:

- Providing the IDM-specific endpoint URLs.
- Managing credentials (e.g., client IDs and secrets) for authentication.
- Implementing high-level methods like `getPersons`, `getOrganizations`, and `getGroups`.
- Handling IDM-specific logic before or after calling the fetcher.

## Aggregator

The `Aggregator` is the central service that orchestrates multiple adapters. It allows querying data across all enabled IDMs simultaneously. Its responsibilities include:

- Selecting the appropriate adapters based on the request.
- Aggregating results from multiple IDMs into a single response.
- Integrating with the `PseudonymizationService` to handle pseudonymized PIDs.
- Integrating with `PostRequestFilter` to ensure the final output matches the requested criteria.

## Filtration

Due to the nature of pseudonymization, some filtering cannot be performed directly at the IDM level. The `PostRequestFilter` is responsible for filtering the data after it has been fetched and aggregated.

**NOTE**:
The `pid` filtration is not performed with the request towards an IDM but instead afterward on the fetched data because the `pid` provided by the client is a pseudonymized version. The `Aggregator` and `PostRequestFilter` work together to map these pseudonymized IDs back to the data retrieved from the IDMs.

It also handles filtering based on other parameters like `personenkontext.id`, `gruppe.id`, and `organisation.id`, and ensures only the requested fields are included in the final output (handling the `vollstaendig` parameter).

## Validation

The `ValidationService` provides additional consistency checks on the aggregated data. For example, it can verify if certain groups are still part of the specified schools, preventing stale clearance entries from exposing data for groups that have been moved or deleted in the IDM.

## Authentication

The module supports various authentication methods for IDMs:

- **Client Credentials**: Standard OAuth2 client credentials flow.
- **Form URL Encoded**: Handling authentication where credentials are passed in form-encoded bodies.

## Sources

- [Schulconnex documentation](https://schulconnex.de/docs/generated/openapi/dienste/schulconnex)
