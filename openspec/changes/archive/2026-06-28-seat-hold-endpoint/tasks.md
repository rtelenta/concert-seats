## 1. Request DTO

- [x] 1.1 Create `apps/seating/src/seats/dtos/hold-seats.dto.ts` with `HoldSeatsDto`:
  - `seatIds: string[]` — decorated with `@IsArray()`, `@IsUUID('all', { each: true })`, `@ArrayMinSize(1)`
  - Import `IsArray`, `IsUUID`, `ArrayMinSize` from `class-validator`

## 2. Service — holdSeats method

- [x] 2.1 Inject `DataSource` into `SeatsService` constructor (import `DataSource` from `typeorm`)

- [x] 2.2 Add `async holdSeats(showId: string, seatIds: string[], userId: string): Promise<Seat[]>` to `SeatsService`:
  1. Create `queryRunner` via `this.dataSource.createQueryRunner()`; connect and start transaction
  2. Inside try/catch/finally:
     - **SELECT FOR UPDATE NOWAIT**: use `queryRunner.manager.createQueryBuilder(Seat, 'seat').where('seat.seatId IN (:...seatIds)', { seatIds }).andWhere('seat.showId = :showId', { showId }).setLock('pessimistic_write').setOnLocked('nowait').getMany()`
     - **Not-found check**: if `seats.length !== seatIds.length`, rollback and throw `NotFoundException`
     - **Availability check**: if any seat has `status !== SeatStatus.AVAILABLE`, rollback and throw `ConflictException`
     - **Build per-seat version WHERE**: dynamically build `(seat."seatId" = :id0 AND seat.version = :v0) OR ...` params object from the locked seats array
     - **UPDATE**: use `queryRunner.manager.createQueryBuilder().update(Seat).set({ status: SeatStatus.HELD, heldBy: userId, heldUntil: () => "NOW() + INTERVAL '5 minutes'", version: () => 'version + 1' }).where('<version-conditions>', params).execute()`
     - **Affected-count check**: if `result.affected !== seatIds.length`, rollback and throw `ConflictException('Concurrent modification detected')`
     - Commit transaction
     - Return `queryRunner.manager.findBy(Seat, { seatId: In(seatIds) })`
  3. catch: rollback and re-throw (if already a Nest exception, rethrow directly; wrap lock-timeout PG error `55P03` as `ConflictException`)
  4. finally: release queryRunner

## 3. Controller — POST endpoint

- [x] 3.1 Add route to `SeatsController`
  ```
  @Post(':showId/seats/hold')
  @HttpCode(200)
  async holdSeats(
    @Param('showId') showId: string,
    @Body() dto: HoldSeatsDto,
    @Headers('x-user-id') userId: string,
  ): Promise<SeatResponseDto[]>
  ```
  - Validate `userId` is present; throw `BadRequestException('X-User-Id header is required')` if missing
  - Call `this.seatsService.holdSeats(showId, dto.seatIds, userId)`
  - Map result with `SeatResponseDto.from(seat)` and return the array
  - Add Swagger decorators: `@ApiOperation`, `@ApiResponse({ status: 409 })`, `@ApiResponse({ status: 404 })`
