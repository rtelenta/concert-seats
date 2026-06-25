## ADDED Requirements

### Requirement: ShowPublished event contract is defined in @app/contracts
`libs/contracts` SHALL export a `ShowPublishedPayload` interface, a `SHOW_PUBLISHED` string constant (`'ShowPublished'`), and a `SHOW_EVENTS_TOPIC` string constant (`'show-events'`). No service may define these inline; they MUST be imported from `@app/contracts`.

#### Scenario: Payload type is importable
- **WHEN** a producer or consumer imports `ShowPublishedPayload` from `@app/contracts`
- **THEN** the TypeScript compiler resolves the type without error, and the type includes `showId`, `title`, `artist`, `dateTime` (ISO string), and `venueId`

#### Scenario: Constants are importable
- **WHEN** a producer or consumer imports `SHOW_PUBLISHED` and `SHOW_EVENTS_TOPIC` from `@app/contracts`
- **THEN** their values are `'ShowPublished'` and `'show-events'` respectively

### Requirement: ShowPublished envelope conforms to EventEnvelope
A `ShowPublished` message on the `show-events` topic SHALL be a valid `EventEnvelope<ShowPublishedPayload>` with `eventType` set to `SHOW_PUBLISHED` and `version` set to `1`.

#### Scenario: Envelope fields are present
- **WHEN** a `ShowPublished` message is produced to `show-events`
- **THEN** the JSON body contains `eventId` (UUID), `eventType` (`'ShowPublished'`), `occurredAt` (ISO 8601), `correlationId`, `causationId`, `version` (`1`), and a `payload` object

#### Scenario: Partition key is showId
- **WHEN** a `ShowPublished` message is produced to `show-events`
- **THEN** the Kafka message key equals the `showId` of the published show
