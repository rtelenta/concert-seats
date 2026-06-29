## ADDED Requirements

### Requirement: Held seats have a finite lifetime and are automatically released
A seat in `HELD` status SHALL not remain held indefinitely. The `held_until` timestamp set at hold time SHALL be enforced by an automatic scheduler that releases expired holds back to `AVAILABLE` and emits a `SeatHoldExpired` event. The `heldUntil = NOW() + 5 minutes` interval set by `holdSeats` is the maximum hold duration; after it passes, the seat is no longer holdable by the original holder and returns to the available pool.

#### Scenario: Held seat becomes available after expiration
- **WHEN** a seat is held with `heldUntil = T + 5 minutes` and the scheduler fires at `T + 5 minutes + 30 seconds`
- **THEN** the seat is transitioned back to `status = AVAILABLE` with `heldBy = null` and `heldUntil = null`, and a `SeatHoldExpired` event is emitted

#### Scenario: A re-hold is possible after expiration
- **WHEN** a seat was held, expired, and released by the scheduler (now `status = AVAILABLE`)
- **AND** a new `POST /shows/:showId/seats/hold` request targets that seat
- **THEN** the hold succeeds because the seat is `AVAILABLE` again
