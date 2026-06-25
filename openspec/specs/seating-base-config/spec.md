# Spec: Seating Base Config

## Purpose

Defines the infrastructure baseline for the seating service: a health endpoint, environment-driven configuration, OpenTelemetry tracing bootstrap, a dedicated Postgres database connection, Kafka client wiring, and Swagger UI in non-production environments.

## Requirements

### Requirement: Seating service exposes a health endpoint
The seating service SHALL expose `GET /health` returning HTTP 200 with a JSON body `{ "status": "ok" }`, and `GET /` SHALL redirect to `health`.

#### Scenario: Health endpoint returns ok
- **WHEN** a caller sends `GET /health` to the seating service
- **THEN** the response is HTTP 200 with body `{ "status": "ok" }`

#### Scenario: Root redirects to health
- **WHEN** a caller sends `GET /` to the seating service
- **THEN** the response is an HTTP redirect to `health`

### Requirement: Seating service loads configuration from environment
The seating service SHALL register a global `ConfigModule` loading an `app` namespace that reads `SEATING_PORT` (falling back to `PORT`, then `3000`), `SEATING_DATABASE_URL`, and `KAFKA_BROKERS` (falling back to `localhost:19092`, split on comma).

#### Scenario: Port defaults to 3000 when unset
- **WHEN** the seating service boots without `SEATING_PORT` or `PORT` set
- **THEN** the service listens on port `3000`

#### Scenario: Database URL is read from SEATING_DATABASE_URL
- **WHEN** `SEATING_DATABASE_URL` is set in the environment
- **THEN** `app.databaseUrl` resolves to that value for the TypeORM connection

### Requirement: Seating service connects to its own Postgres database
The seating service SHALL connect to a Postgres database using `app.databaseUrl` (from `SEATING_DATABASE_URL`) with `ssl`, `synchronize: false`, `autoLoadEntities: true`, a connection pool `max` of `2`, and a migrations table named `seating_migrations`. The service MUST NOT share a database with any other service.

#### Scenario: Database connection uses SEATING_DATABASE_URL
- **WHEN** the seating service boots with `SEATING_DATABASE_URL` set
- **THEN** the TypeORM datasource connects to that URL with SSL enabled and uses the `seating_migrations` table for migration tracking

#### Scenario: Migration CLI data source targets seating database
- **WHEN** `apps/seating/src/database/data-source.ts` is loaded by the TypeORM CLI
- **THEN** the `DataSource` is configured with `SEATING_DATABASE_URL`, SSL, entities under `apps/seating/src`, and `migrationsTableName: 'seating_migrations'`

### Requirement: Seating service registers the Kafka client
The seating service SHALL register `KafkaModule` with `clientId: 'seating'`, `groupId: 'seating'`, and brokers from `app.kafkaBrokers`. No topics are subscribed or produced in this change; the client is wired for future event consumption. When a consumer is later added, it SHALL use the `seating` groupId and key by `showId` for seat/show flows.

#### Scenario: Kafka client is wired with seating identity
- **WHEN** the seating service boots
- **THEN** the `KafkaModule` is registered with `clientId` and `groupId` equal to `seating` and brokers from `app.kafkaBrokers`

### Requirement: Seating service bootstraps OpenTelemetry tracing
The seating service SHALL call `bootstrapTelemetry({ serviceName: 'seating', enabled: true })` before `NestFactory.create` in `main.ts`, and register `TelemetryModule.forRoot({ serviceName: 'seating', enabled: true })` in `AppModule`.

#### Scenario: Telemetry is bootstrapped with seating service name
- **WHEN** the seating service boots
- **THEN** spans are exported with the `service.name` resource attribute set to `seating`

### Requirement: Seating service serves Swagger UI in non-production
The seating service SHALL serve Swagger UI at `/docs` and the OpenAPI JSON at `/docs-json` when `NODE_ENV` is not `production`, with a document title of `Seating Service` and version `1.0`.

#### Scenario: Swagger UI is available in development
- **WHEN** the seating service is started with `NODE_ENV` not `production`
- **THEN** `GET /docs` returns HTTP 200 with an HTML page containing the Swagger UI

#### Scenario: Swagger UI is not served in production
- **WHEN** the seating service is started with `NODE_ENV=production`
- **THEN** `GET /docs` returns HTTP 404
