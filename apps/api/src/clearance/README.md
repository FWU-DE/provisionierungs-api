# Clearance Process

The Clearance system is responsible for controlling access to Schulconnex data for individual offers (clients). It ensures that only data which has been explicitly cleared by a school administrator is accessible to the offer.

## Overview

The clearance process consists of three layers of filtering that are applied when an offer requests data from the API:

1.  **Organization-level Clearance (`SchoolClearance`)**: Access is restricted to specific schools/organizations.
2.  **Group-level Clearance (`GroupClearance`)**: Access is restricted to specific groups (e.g., classes, courses) within those schools.
3.  **Field-level Clearance**: Only specific data fields (e.g., role, email, groups) within the student/teacher records are exposed to the offer.

## Data Model

The clearance configuration is stored in the database through two main entities:

- **`SchoolClearance`**: Represents a clearance for an entire school.
  - `offerId`: The ID of the offer being granted access.
  - `idmId`: The identifier of the Identity Management (IDM) system managing the school.
  - `schoolId`: The identifier of the school.
- **`GroupClearance`**: Represents a clearance for a specific group within a school.
  - `offerId`: The ID of the offer being granted access.
  - `idmId`: The identifier of the IDM.
  - `schoolId`: The identifier of the school.
  - `groupId`: The identifier of the specific Schulconnex group.

_Note: Field-level clearance is currently under development and uses a preliminary static configuration in the API._

## Clearance Flow

### 1. Configuration (UI App)

A school administrator configures what data is shared with which offer through the management UI:

1.  The administrator logs in with their VIDIS credentials.
2.  The user's JWT contains information about their related IDMs and schools.
3.  The UI fetches all Schulconnex groups for these schools and all offers activated for the school.
4.  The administrator defines which groups or schools should be accessible to specific offers.
5.  These relations are stored as `SchoolClearance` or `GroupClearance` entries in the database.

### 2. Data Request (API App)

When an offer's client requests data (e.g., via the Schulconnex `/persons` endpoint), the following steps occur:

1.  **Offer Identification**: The API looks up the `offerId` based on the client's credentials.
2.  **Clearance Retrieval**: All `SchoolClearance` and `GroupClearance` entries for that `offerId` are fetched from the database.
3.  **IDM Query**: The API queries the relevant IDMs for the requested data.
4.  **Clearance Filtering**:
    - **Group/School Filter**: The `Aggregator` filters the raw data from IDMs. It ensures only records belonging to cleared groups (from `GroupClearance`) or cleared schools (from `SchoolClearance`) are kept.
    - **Pseudonymization**: The data is pseudonymized based on the offer's context.
    - **Field Filter**: Finally, a field-level filter is applied to remove properties that have not been cleared (e.g., hiding email addresses if not cleared).
5.  **Parameter Filtering**: Standard API query parameters (like searching by ID) are applied to the already filtered and pseudonymized data.

## Implementation Details

The core logic for clearance filtering resides in `apps/api/src/clearance/filter/`:

- `clearance-group.filter.ts`: Filters identities by group membership.
- `clearance-school.filter.ts`: Filters identities by organization membership.
- `clearance-field.filter.ts`: Removes sensitive fields from the Schulconnex response objects.

These filters are integrated into the `Aggregator` service within the `identity-management` module, which orchestrates the data retrieval and processing pipeline.
