# Spec: seat-definition-management

## Purpose

TBD

## Requirements

### Requirement: UUID format for generated identifiers
All system-generated `id` fields in the catalog service SHALL use UUIDv7 (time-ordered UUID as defined in RFC 9562).

### Requirement: Create seat definitions for a show
The catalog service SHALL persist one or more seat definition records for a given `show_id`, each with a `section`, `row`, `number`, and `price`.

#### Scenario: Valid seat definition creation
- **WHEN** a caller provides a valid `show_id`, `section`, `row`, `number`, and a non-negative `price`
- **THEN** a seat definition record is inserted with a generated `id` and `created_at` set to the current timestamp

#### Scenario: Seat creation for a non-existent show
- **WHEN** a caller provides a `show_id` that does not exist
- **THEN** the operation is rejected with a constraint error

#### Scenario: Seat creation for a CANCELLED show
- **WHEN** a caller attempts to create a seat definition for a show with `status = CANCELLED`
- **THEN** the operation is rejected with a domain error

### Requirement: Unique seat identity within a show
The catalog service SHALL enforce that the combination `(show_id, section, row, number)` is unique. No two seat definition records for the same show SHALL share the same section, row, and seat number.

#### Scenario: Duplicate seat definition
- **WHEN** a caller attempts to insert a seat definition with a `(show_id, section, row, number)` tuple that already exists
- **THEN** the operation is rejected with a uniqueness violation error and no record is persisted

### Requirement: Retrieve seat definitions by show
The catalog service SHALL return all seat definition records associated with a given `show_id`.

#### Scenario: Show with seat definitions
- **WHEN** a caller requests seat definitions for a known `show_id`
- **THEN** the service returns all records for that show, each including `id`, `show_id`, `section`, `row`, `number`, `price`, and `created_at`

#### Scenario: Show with no seat definitions
- **WHEN** a caller requests seat definitions for a `show_id` that exists but has no seat definitions
- **THEN** the service returns an empty list
