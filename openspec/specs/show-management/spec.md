# Spec: show-management

## Purpose

TBD

## Requirements

### Requirement: UUID format for generated identifiers
All system-generated `id` fields in the catalog service SHALL use UUIDv7 (time-ordered UUID as defined in RFC 9562).

### Requirement: Create a show
The catalog service SHALL persist a new show with a system-generated UUIDv7, a `venue_id` FK, a `title`, an `artist`, a `date_time` (timestamptz), and an initial `status` of `DRAFT`.

#### Scenario: Valid show creation
- **WHEN** a caller provides a valid `venue_id`, `title`, `artist`, and `date_time`
- **THEN** a show record is inserted with `status = DRAFT`, a generated `id`, and `created_at` / `updated_at` set to the current timestamp

#### Scenario: Missing required field
- **WHEN** a caller omits `title`, `artist`, `date_time`, or `venue_id`
- **THEN** the operation is rejected with a validation error and no record is persisted

### Requirement: Show status state machine
The catalog service SHALL enforce the following status transitions only:
- `DRAFT → PUBLISHED`
- `DRAFT → CANCELLED`

Any other transition SHALL be rejected.

#### Scenario: Publish a draft show
- **WHEN** a caller requests a status change from `DRAFT` to `PUBLISHED` on an existing show
- **THEN** the show's `status` is updated to `PUBLISHED` and `updated_at` is refreshed

#### Scenario: Cancel a draft show
- **WHEN** a caller requests a status change from `DRAFT` to `CANCELLED` on an existing show
- **THEN** the show's `status` is updated to `CANCELLED` and `updated_at` is refreshed

#### Scenario: Invalid transition from PUBLISHED
- **WHEN** a caller requests any status change on a `PUBLISHED` show
- **THEN** the operation is rejected with a domain error indicating the transition is not allowed

#### Scenario: Invalid transition from CANCELLED
- **WHEN** a caller requests any status change on a `CANCELLED` show
- **THEN** the operation is rejected with a domain error indicating the transition is not allowed

### Requirement: Retrieve a show by ID
The catalog service SHALL return the full show record for a given `id`.

#### Scenario: Existing show
- **WHEN** a caller requests a show with a known `id`
- **THEN** the service returns the record including `id`, `venue_id`, `title`, `artist`, `date_time`, `status`, `created_at`, and `updated_at`

#### Scenario: Non-existent show
- **WHEN** a caller requests a show with an unknown `id`
- **THEN** the service returns a not-found error
