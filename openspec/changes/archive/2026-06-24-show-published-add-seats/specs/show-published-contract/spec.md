## MODIFIED Requirements

### Requirement: ShowPublished event contract is defined in @app/contracts
`libs/contracts` SHALL export a `ShowPublishedPayload` interface, a `ShowPublishedSeat` interface, a `SHOW_PUBLISHED` string constant (`'ShowPublished'`), and a `SHOW_EVENTS_TOPIC` string constant (`'show-events'`). No service may define these inline; they MUST be imported from `@app/contracts`.

`ShowPublishedPayload` MUST include `showId`, `title`, `artist`, `dateTime` (ISO 8601 string), `venueId`, and `seats: ShowPublishedSeat[]`.

`ShowPublishedSeat` MUST include `seatDefinitionId`, `section`, `row`, `number` (integer), and `price` (number).

#### Scenario: Payload type is importable with seats
- **WHEN** a producer or consumer imports `ShowPublishedPayload` and `ShowPublishedSeat` from `@app/contracts`
- **THEN** the TypeScript compiler resolves both types without error, `ShowPublishedPayload` includes a `seats` field typed as `ShowPublishedSeat[]`, and `ShowPublishedSeat` includes `seatDefinitionId`, `section`, `row`, `number`, and `price`

#### Scenario: Constants are importable
- **WHEN** a producer or consumer imports `SHOW_PUBLISHED` and `SHOW_EVENTS_TOPIC` from `@app/contracts`
- **THEN** their values are `'ShowPublished'` and `'show-events'` respectively

### Requirement: ShowPublished envelope conforms to EventEnvelope
A `ShowPublished` message on the `show-events` topic SHALL be a valid `EventEnvelope<ShowPublishedPayload>` with `eventType` set to `SHOW_PUBLISHED` and `version` set to `2`.

#### Scenario: Envelope fields are present with version 2
- **WHEN** a `ShowPublished` message is produced to `show-events`
- **THEN** the JSON body contains `eventId` (UUID), `eventType` (`'ShowPublished'`), `occurredAt` (ISO 8601), `correlationId`, `causationId`, `version` (`2`), and a `payload` object that includes a `seats` array

#### Scenario: Partition key is showId
- **WHEN** a `ShowPublished` message is produced to `show-events`
- **THEN** the Kafka message key equals the `showId` of the published show
