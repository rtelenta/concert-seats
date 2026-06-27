# Spec: venue-management

## Purpose

TBD

## Requirements

### Requirement: UUID format for generated identifiers
All system-generated `id` fields in the catalog service SHALL use UUIDv7 (time-ordered UUID as defined in RFC 9562).

### Requirement: Create a venue
The catalog service SHALL persist a new venue with a system-generated UUIDv7, a name, a city, and an integer capacity.

#### Scenario: Valid venue creation
- **WHEN** a caller provides a valid name, city, and positive integer capacity
- **THEN** a venue record is inserted with a generated `id` and the provided fields

#### Scenario: Missing required field
- **WHEN** a caller omits name or city
- **THEN** the operation is rejected with a validation error and no record is persisted

### Requirement: Retrieve a venue by ID
The catalog service SHALL return the full venue record for a given `id`.

#### Scenario: Existing venue
- **WHEN** a caller requests a venue with a known `id`
- **THEN** the service returns the venue record including `id`, `name`, `city`, and `capacity`

#### Scenario: Non-existent venue
- **WHEN** a caller requests a venue with an unknown `id`
- **THEN** the service returns a not-found error

### Requirement: Venue ID referenced by shows
The catalog service SHALL enforce referential integrity so that a `show` row MUST reference a valid `venue_id`.

#### Scenario: Show created with invalid venue
- **WHEN** a caller attempts to create a show with a `venue_id` that does not exist
- **THEN** the operation is rejected with a constraint error

### Requirement: Venue listing via HTTP API
The catalog service SHALL expose the venue list through an HTTP endpoint so that clients can discover all venues without direct database access.

#### Scenario: Client retrieves all venues
- **WHEN** a caller sends an HTTP request to list venues
- **THEN** the service returns all persisted venue records in a structured response
