## 1. Service

- [x] 1.1 Create `apps/seating/src/seats/seats.service.ts` with a `SeatsService` that injects `@InjectRepository(Seat)` and exposes `findByShow(showId: string): Promise<Seat[]>` using `this.repository.findBy({ showId })`.

## 2. Controller

- [x] 2.1 Create `apps/seating/src/seats/seats.controller.ts` with a `SeatsController` that maps `GET /shows/:id/seats` to `SeatsService.findByShow(id)`.

## 3. Wiring

- [x] 3.1 Add `SeatsService` and `SeatsController` to `SeatsModule` providers/controllers.

## 4. Verification

- [x] 4.1 Start the seating service and call `GET /shows/<showId>/seats` — confirm the response is a JSON array of seat objects with `status: "AVAILABLE"`.
