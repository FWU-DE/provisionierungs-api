# Saarland

This adapter represents the Saarland IDM. It is a Schulconnex-based adapter with some specific requirements.

### Special Aspects

#### "kennung" Prefix Logic

There is a difference in the formatting of the "kennung" (school identifier) between the Saarland IDM and the format used within this application (which matches the user's JWT).

- **IDM Format**: The Saarland IDM returns and expects the `SL_` prefix (e.g., `SL_12345`).
- **Internal Format**: This application uses the `DE-SL-` prefix (e.g., `DE-SL-12345`), which is consistent with the `schulkennung` in the user's JWT and the IDM's own ID formatting.

The adapter automatically handles these conversions:

- When fetching organizations or persons, it converts the `SL_` prefix to `DE-SL-` before returning the data.
- When querying the IDM using a "kennung" filter, it converts the `DE-SL-` prefix back to `SL_`.

#### X-VIDIS-CLIENT-ID Header

All requests made to the Saarland IDM API must include an `X-VIDIS-CLIENT-ID` header. The adapter ensures this header is present in all calls to the Schulconnex fetcher for fetching persons, organizations, and groups.
