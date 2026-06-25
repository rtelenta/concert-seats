## 1. Restructure the scaffold to AppModule + AppController

- [x] 1.1 Rename `apps/seating/src/seating.module.ts` to `app.module.ts`, rename the class `SeatingModule` to `AppModule`, and delete `apps/seating/src/seating.service.ts`
- [x] 1.2 Replace `apps/seating/src/seating.controller.ts` with `app.controller.ts` exporting `AppController` with `GET /` (`@Redirect('health')`) and `GET /health` returning `{ status: 'ok' }`; delete the old `seating.controller.spec.ts`
- [x] 1.3 Update `apps/seating/src/main.ts` to import `AppModule` instead of `SeatingModule`

## 2. Config, Telemetry, Database, and Kafka wiring

- [x] 2.1 Add `apps/seating/src/config/app.config.ts` with `registerAs('app', ...)` reading `SEATING_PORT` (fallback `PORT`, `3000`), `SEATING_DATABASE_URL`, and `KAFKA_BROKERS` (fallback `localhost:19092`, split on comma)
- [x] 2.2 Wire `ConfigModule.forRoot`, `TelemetryModule.forRoot({ serviceName: 'seating', enabled: true })`, `TypeOrmModule.forRootAsync` (postgres, `app.databaseUrl`, ssl, `synchronize: false`, `autoLoadEntities: true`, `extra: { max: 2 }`, migrations under `database/migrations`, `migrationsTableName: 'seating_migrations'`), and `KafkaModule.forRootAsync` (clientId/groupId `seating`, brokers `app.kafkaBrokers`) into `AppModule`
- [x] 2.3 Add `apps/seating/src/database/data-source.ts` exporting `AppDataSource` (postgres, `SEATING_DATABASE_URL`, ssl, entities under `../**/*.entity`, migrations under `migrations`, `migrationsTableName: 'seating_migrations'`)
- [x] 2.4 Rewrite `apps/seating/src/main.ts` to call `bootstrapTelemetry({ serviceName: 'seating', enabled: true })` before `NestFactory.create`, serve Swagger UI at `/docs` (title `Seating Service`, version `1.0`) when `NODE_ENV !== 'production'`, and listen on `config.port`

## 3. nest-cli.json and tests

- [x] 3.1 Add `"plugins": ["@nestjs/swagger"]` to the `seating` project's `compilerOptions` in `nest-cli.json`
- [x] 3.2 Update `apps/seating/test/app.e2e-spec.ts` to import `AppModule` and assert `GET /health` returns 200 `{ status: 'ok' }`

## 4. Verify

- [x] 4.1 Run `pnpm exec nest build seating` and `pnpm test` and confirm both pass