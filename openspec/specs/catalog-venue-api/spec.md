# Spec: catalog-venue-api

## Purpose

TBD

## Requirements

### Requirement: List all venues
The catalog service SHALL expose `GET /venues` returning an array of all venue records.

#### Scenario: Venues exist
- **WHEN** a caller sends `GET /venues`
- **THEN** the service returns HTTP 200 with an array of venue objects, each containing `id`, `name`, `city`, and `capacity`

#### Scenario: No venues in system
- **WHEN** a caller sends `GET /venues` and no venues have been created
- **THEN** the service returns HTTP 200 with an empty array

### Requirement: Retrieve a venue by ID via HTTP
The catalog service SHALL expose `GET /venues/:id` returning the full venue record for the given ID.

#### Scenario: Existing venue
- **WHEN** a caller sends `GET /venues/:id` with a known venue ID
- **THEN** the service returns HTTP 200 with the venue object containing `id`, `name`, `city`, and `capacity`

#### Scenario: Non-existent venue
- **WHEN** a caller sends `GET /venues/:id` with an unknown venue ID
- **THEN** the service returns HTTP 404

### Requirement: Venue response shape
The catalog service SHALL return venue data using a consistent response shape with fields `id` (UUID string), `name` (string), `city` (string), and `capacity` (integer).

#### Scenario: Response fields present
- **WHEN** any venue endpoint returns a venue record
- **THEN** the response object SHALL contain exactly the fields `id`, `name`, `city`, and `capacity` with correct types
