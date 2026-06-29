## 1. Gateway DTO

- [x] 1.1 Create `apps/concertseats/src/shows/dtos/hold-seats.dto.ts` with `seatIds: string[]` field

## 2. Gateway service method

- [x] 2.1 Add `holdSeats(showId: string, dto: HoldSeatsDto, userId: string): Promise<SeatResponseDto[]>` to `ShowsQueryService` — POST to `${this.seatingUrl}/shows/${showId}/seats/hold` with body `dto` and header `x-user-id: userId`, using `lastValueFrom`

## 3. Gateway controller action

- [x] 3.1 Add `POST :id/hold-seats` action to `ShowsController` decorated with `@UseGuards(ClerkAuthGuard)`, `@HttpCode(200)`, `@Post(':id/hold-seats')`, and Swagger annotations
- [x] 3.2 Extract `userId` via `@CurrentUser() user: ClerkJwtPayload` and call `this.showsQueryService.holdSeats(id, dto, user.sub)`

## 4. Verification

- [ ] 4.1 `curl -X POST http://localhost:3000/shows/<id>/hold-seats -H "Authorization: Bearer <token>" -d '{"seatIds":["<id>"]}' -i` — confirm 200 and held seats in response
- [ ] 4.2 Same request without Authorization header — confirm 401 with no downstream call
