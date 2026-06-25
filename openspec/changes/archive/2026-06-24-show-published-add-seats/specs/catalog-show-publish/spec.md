## MODIFIED Requirements

### Requirement: Catalog emits ShowPublished event after successful publish
After persisting the `DRAFT → PUBLISHED` transition, the Catalog service SHALL publish a `ShowPublished` `EventEnvelope` (version `2`) to the `show-events` topic using `showId` as the partition key. The payload MUST include the show metadata AND the full list of seat definitions for the show at publish time. The event MUST be emitted only when the transition succeeds; failures (404, 422) MUST NOT produce an event.

#### Scenario: Event is emitted on successful publish with seats
- **WHEN** `PATCH /shows/:id/publish` succeeds for a show with `status = DRAFT` that has seat definitions
- **THEN** a `ShowPublished` message (version `2`) appears on the `show-events` topic with the `showId` as the message key, and the payload `seats` array contains one entry per seat definition with `seatDefinitionId`, `section`, `row`, `number`, and `price`

#### Scenario: Seats array is empty when show has no seats
- **WHEN** `PATCH /shows/:id/publish` succeeds for a show with `status = DRAFT` and no seat definitions
- **THEN** a `ShowPublished` message appears on `show-events` with `payload.seats = []`

#### Scenario: No event on show not found
- **WHEN** `PATCH /shows/:id/publish` is called with an unknown `id` and returns 404
- **THEN** no message is produced to `show-events`

#### Scenario: No event when transition is invalid
- **WHEN** `PATCH /shows/:id/publish` is called for a show that is already `PUBLISHED` or `CANCELLED` and returns 422
- **THEN** no message is produced to `show-events`
