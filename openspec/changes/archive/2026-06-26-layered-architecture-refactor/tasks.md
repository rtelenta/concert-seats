## 1. Refactor `catalog` — shows module

- [x] 1.1 Create `shows/controllers/`, `shows/services/`, `shows/entities/`, `shows/dtos/` directories
- [x] 1.2 Move `show.entity.ts` and `show-status.enum.ts` → `shows/entities/`
- [x] 1.3 Move `shows.service.ts` → `shows/services/`
- [x] 1.4 Move `shows.controller.ts` → `shows/controllers/`
- [x] 1.5 Move `dto/show-response.dto.ts` → `shows/dtos/show-response.dto.ts` (rename folder `dto` → `dtos`)
- [x] 1.6 Update all imports inside `shows.module.ts`, `shows.controller.ts`, `shows.service.ts`, and `show-response.dto.ts`

## 2. Refactor `catalog` — seat-definitions module

- [x] 2.1 Create `seat-definitions/services/`, `seat-definitions/entities/`, `seat-definitions/dtos/` directories
- [x] 2.2 Move `seat-definition.entity.ts` → `seat-definitions/entities/`
- [x] 2.3 Move `seat-definitions.service.ts` → `seat-definitions/services/`
- [x] 2.4 Move `dto/seat-definition-response.dto.ts` → `seat-definitions/dtos/seat-definition-response.dto.ts`
- [x] 2.5 Update all imports inside `seat-definitions.module.ts`, `seat-definitions.service.ts`, and `seat-definition-response.dto.ts`

## 3. Refactor `catalog` — venues module

- [x] 3.1 Create `venues/entities/` directory
- [x] 3.2 Move `venue.entity.ts` → `venues/entities/`
- [x] 3.3 Update import in `venues.module.ts`

## 4. Refactor `seating` — seats module

- [x] 4.1 Create `seats/controllers/`, `seats/services/`, `seats/entities/` directories
- [x] 4.2 Move `seat.entity.ts` and `seat-status.enum.ts` → `seats/entities/`
- [x] 4.3 Move `seats.service.ts` → `seats/services/`
- [x] 4.4 Move `seats.controller.ts` → `seats/controllers/`
- [x] 4.5 Update all imports inside `seats.module.ts`, `seats.controller.ts`, and `seats.service.ts`
- [x] 4.6 Remove `ShowPublishedConsumer` from `seats.module.ts` providers (no export changes needed)

## 5. Create `seating` — messaging module

- [x] 5.1 Create `messaging/consumers/` directory structure
- [x] 5.2 Move `seats/show-published.consumer.ts` → `messaging/consumers/show-published.consumer.ts`
- [x] 5.3 Update all imports inside `show-published.consumer.ts` (SeatsService path changes)
- [x] 5.4 Create `messaging/messaging.module.ts` with `ShowPublishedConsumer` as the only provider (no imports needed — `KafkaConsumer` and `DataSource` are globally provided)

## 6. Wire up app modules

- [x] 6.1 Add `MessagingModule` to imports in `seating/src/app.module.ts`

## 7. Build verification

- [x] 7.1 Run `pnpm build` for the catalog app and fix any import errors
- [x] 7.2 Run `pnpm build` for the seating app and fix any import errors
- [x] 7.3 Run the test suite (`pnpm test`) for both apps and confirm no regressions
