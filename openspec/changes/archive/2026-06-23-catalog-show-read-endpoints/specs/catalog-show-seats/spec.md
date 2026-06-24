## ADDED Requirements

### Requirement: List seat definitions for a show
`GET /shows/:id/seats` SHALL return an array of all seat definitions belonging to the show identified by `:id`. Each element MUST include at minimum: `id`, `showId`, `section`, `row`, `number`, `price`, `createdAt`. `price` MUST be a JSON number (not a string).

#### Scenario: Seats exist for the show
- **GIVEN** a show with the requested `id` exists and has one or more seat definitions
- **WHEN** `GET /shows/:id/seats` is requested
- **THEN** the response is `200 OK` with a JSON array of those seat definitions

#### Scenario: Show has no seats
- **GIVEN** a show with the requested `id` exists but has no seat definitions
- **WHEN** `GET /shows/:id/seats` is requested
- **THEN** the response is `200 OK` with an empty JSON array `[]`

#### Scenario: Show not found
- **GIVEN** no show with the requested `id` exists
- **WHEN** `GET /shows/:id/seats` is requested
- **THEN** the response is `404 Not Found`

#### Scenario: Price is a number in the response
- **GIVEN** a seat definition with `price = 150.00` stored as `numeric(10,2)` in the database
- **WHEN** `GET /shows/:id/seats` is requested
- **THEN** the returned `price` field is the JSON number `150` (or `150.0`), not the string `"150.00"`
