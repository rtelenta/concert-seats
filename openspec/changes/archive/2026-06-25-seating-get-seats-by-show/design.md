## Context

`apps/seating` already stores seats in the `seats` table (populated by `ShowPublishedConsumer`). `SeatsModule` owns the `Seat` entity but has no HTTP surface — there is no `SeatsController` or `SeatsService` yet. The gateway routes client requests to `apps/seating` over HTTP, so a standard NestJS controller pattern is all that is needed.

## Goals / Non-Goals

**Goals:**
- Expose `GET /shows/:id/seats` returning all seats for a show with id, section, row, number, price, and status.
- Keep the response shape typed and consistent with the rest of the codebase.

**Non-Goals:**
- Filtering, sorting, or pagination (not requested; can be added later).
- Authentication / authorisation (validated at the gateway; seating trusts the propagated request).
- Writing seat data — this is a read-only endpoint.

## Decisions

### D1 — `SeatsService.findByShow(showId)` + `SeatsController`

Introduce a thin `SeatsService` with a single `findByShow(showId: string): Promise<Seat[]>` method using the TypeORM repository injected via `TypeOrmModule.forFeature`. The `SeatsController` maps `GET /shows/:id/seats` to this method and returns the raw entity array (NestJS serialises it to JSON automatically).

**Alternatives:**
- Query directly in the controller: works for now but mixes concerns as queries grow.
- Raw SQL via `DataSource`: unnecessary — the ORM query is trivial.

### D2 — Response shape: direct entity serialisation

Return `Seat[]` as-is. All fields are safe to expose (`heldBy` / `heldUntil` carry no sensitive data). No dedicated DTO class is needed at this stage.

**Alternatives:**
- Explicit DTO: cleaner contract but premature given one consumer (the gateway).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| No seats found (show not published yet) → empty array | Return `[]` with 200 — consistent with standard list endpoints |
| Very large seat sets (10k+ rows) slow response | Acceptable for now; pagination can be added when profiling shows a problem |
