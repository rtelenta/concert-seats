## ADDED Requirements

### Requirement: Catalog emits ShowPublished event after successful publish
After persisting the `DRAFT → PUBLISHED` transition, the Catalog service SHALL publish a `ShowPublished` `EventEnvelope` to the `show-events` topic using `showId` as the partition key. The event MUST be emitted only when the transition succeeds; failures (404, 422) MUST NOT produce an event.

#### Scenario: Event is emitted on successful publish
- **WHEN** `PATCH /shows/:id/publish` succeeds for a show with `status = DRAFT`
- **THEN** a `ShowPublished` message appears on the `show-events` topic with the correct `showId` as the message key and a valid `EventEnvelope<ShowPublishedPayload>` as the value

#### Scenario: No event on show not found
- **WHEN** `PATCH /shows/:id/publish` is called with an unknown `id` and returns 404
- **THEN** no message is produced to `show-events`

#### Scenario: No event when transition is invalid
- **WHEN** `PATCH /shows/:id/publish` is called for a show that is already `PUBLISHED` or `CANCELLED` and returns 422
- **THEN** no message is produced to `show-events`
