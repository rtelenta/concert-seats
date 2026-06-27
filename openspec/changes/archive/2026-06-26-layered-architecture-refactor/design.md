## Approach

Pure file-move refactor — no logic changes. Each module gains explicit layer subfolders (`controllers/`, `services/`, `entities/`, `dtos/`). The `show-published.consumer.ts` moves out of `seats/` into a new sibling `messaging/` folder that registers its own `MessagingModule`.

## Directory Structure

### Before → After: `catalog/src/`

```
# BEFORE
shows/
  shows.module.ts
  shows.controller.ts
  shows.service.ts
  show.entity.ts
  show-status.enum.ts
  dto/
    show-response.dto.ts

seat-definitions/
  seat-definitions.module.ts
  seat-definitions.service.ts
  seat-definition.entity.ts
  dto/
    seat-definition-response.dto.ts

venues/
  venues.module.ts
  venue.entity.ts

# AFTER
shows/
  shows.module.ts
  controllers/
    shows.controller.ts
  services/
    shows.service.ts
  entities/
    show.entity.ts
    show-status.enum.ts
  dtos/
    show-response.dto.ts

seat-definitions/
  seat-definitions.module.ts
  services/
    seat-definitions.service.ts
  entities/
    seat-definition.entity.ts
  dtos/
    seat-definition-response.dto.ts

venues/
  venues.module.ts
  entities/
    venue.entity.ts
```

### Before → After: `seating/src/`

```
# BEFORE
seats/
  seats.module.ts
  seats.controller.ts
  seats.service.ts
  seat.entity.ts
  seat-status.enum.ts
  show-published.consumer.ts

# AFTER
seats/
  seats.module.ts
  controllers/
    seats.controller.ts
  services/
    seats.service.ts
  entities/
    seat.entity.ts
    seat-status.enum.ts

messaging/
  messaging.module.ts
  consumers/
    show-published.consumer.ts
```

## Module Wiring Changes

### `seating/src/seats/seats.module.ts`
- Remove `ShowPublishedConsumer` from `providers`
- No other changes (`SeatsService` is not used by the consumer)

### `seating/src/messaging/messaging.module.ts` (new file)
```ts
@Module({
  providers: [ShowPublishedConsumer],
})
export class MessagingModule {}
```

`ShowPublishedConsumer` injects `KafkaConsumer` (globally provided by `@Global() KafkaModule`) and `DataSource` (globally provided by `TypeOrmModule.forRootAsync`). No additional module imports required.

### `seating/src/app.module.ts`
- Add `MessagingModule` to imports (alongside existing `SeatsModule`)

## Import Path Updates

Every `import` referencing moved files must be updated. Pattern:

| Old path | New path |
|---|---|
| `./show.entity` | `./entities/show.entity` |
| `./shows.service` | `./services/shows.service` |
| `./shows.controller` | `./controllers/shows.controller` |
| `../dto/show-response.dto` | `../dtos/show-response.dto` |
| `./show-published.consumer` | `../../messaging/consumers/show-published.consumer` |

## Non-Goals

- No changes to TypeORM entity metadata, decorators, or table names
- No changes to Kafka topic/group configuration
- No changes to exported API surface, DTOs, or response shapes
- No changes to `concertseats/` app (placeholder, no feature modules)
- No changes to `database/` migrations or seeders

## Risks & Trade-offs

- **Risk**: Missed import path → compile error. Mitigation: run `pnpm build` for both apps after each module is moved.
- **Migration**: No data migration required; this is compile-time only.
