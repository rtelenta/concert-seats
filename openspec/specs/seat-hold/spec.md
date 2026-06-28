## Purpose

Define the all-or-nothing seat hold contract for the seating service, including concurrency guarantees, status transition rules, and error cases.

## Requirements

### Requirement: Hold seats atomically
The seating service SHALL expose `POST /shows/:showId/seats/hold` that transitions the requested seats from `AVAILABLE` to `HELD` as a single atomic operation. If any seat in the batch cannot be held, no seat is modified.

#### Scenario: All seats available — hold succeeds
- **WHEN** a caller sends `POST /shows/:showId/seats/hold` with `seatIds` that all exist for the show and have `status = AVAILABLE`
- **THEN** the service returns HTTP 200 with the array of updated seats, each showing `status = HELD`, `heldBy = <userId from header>`, and `heldUntil = approx now + 5 minutes`

#### Scenario: One seat not available — nothing changes
- **WHEN** a caller sends a hold request and at least one seat has `status != AVAILABLE`
- **THEN** the service returns HTTP 409, no seat's status changes

#### Scenario: Seat not found for this show
- **WHEN** a caller includes a `seatId` that does not exist or belongs to a different show
- **THEN** the service returns HTTP 404, no seat's status changes

#### Scenario: Empty seatIds array rejected
- **WHEN** a caller sends an empty `seatIds` array
- **THEN** the service returns HTTP 400 (validation error)

### Requirement: Concurrent hold requests are serialised per seat
The seating service SHALL prevent two simultaneous requests from holding the same seat. If two concurrent requests target the same seat, exactly one SHALL succeed and the other SHALL receive HTTP 409.

#### Scenario: Concurrent hold on overlapping seats
- **WHEN** two requests arrive simultaneously targeting at least one common seat
- **THEN** one request succeeds with HTTP 200 and the other receives HTTP 409

### Requirement: Version is incremented on hold
Each seat transitioned to `HELD` SHALL have its `version` field incremented by 1. The update SHALL be conditioned on the version read at the start of the transaction so that a stale write is detected and rejected.

#### Scenario: Version mismatch causes conflict
- **WHEN** the seat's version changes between the read and write within the transaction
- **THEN** the service returns HTTP 409 and no seats are modified

### Requirement: User identity from X-User-Id header
The service SHALL read the holding user's identity from the `X-User-Id` HTTP request header and write it to `heldBy` on each held seat. If the header is absent, the service SHALL return HTTP 400.

#### Scenario: Missing X-User-Id
- **WHEN** a caller sends the hold request without the `X-User-Id` header
- **THEN** the service returns HTTP 400
