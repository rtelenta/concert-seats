# kafka-module

## Purpose

Provides a NestJS module that configures and manages a shared KafkaJS client for the application, including lifecycle management (connect on boot, disconnect on shutdown) and global scoping so all feature modules can inject Kafka services without re-importing.

## Requirements

### Requirement: KafkaModule configures a shared KafkaJS client
`KafkaModule` SHALL expose `forRoot(options: KafkaModuleOptions)` and `forRootAsync(asyncOptions)` static factory methods that register a KafkaJS `Kafka` instance as a shared, module-global provider.

`KafkaModuleOptions` SHALL include: `brokers: string[]`, `clientId: string`, `groupId: string`, and optional `ssl` and `sasl` fields.

#### Scenario: Module registered with forRoot
- **WHEN** an application module calls `KafkaModule.forRoot({ brokers, clientId, groupId })`
- **THEN** a single KafkaJS `Kafka` instance is created with the supplied options and made available for injection as `KafkaProducer`, `KafkaConsumer`, and `KafkaAdminService`

#### Scenario: Module registered with forRootAsync from ConfigService
- **WHEN** an application module calls `KafkaModule.forRootAsync({ useFactory: (cfg) => cfg.kafka, inject: [ConfigService] })`
- **THEN** the factory is called with the injected `ConfigService` and the resolved options are used to create the KafkaJS instance

### Requirement: KafkaModule connects the producer on application bootstrap
The producer client SHALL be connected during `OnApplicationBootstrap` so that the service fails fast on startup if the broker is unreachable.

#### Scenario: Broker unreachable at startup
- **WHEN** the application boots and the KafkaJS producer cannot connect to any broker within the configured timeout
- **THEN** the bootstrap promise rejects and the NestJS application fails to start

### Requirement: KafkaModule disconnects all clients on shutdown
On `OnApplicationShutdown`, the module SHALL gracefully disconnect the producer, consumer, and admin clients so in-flight messages are flushed and offsets are committed before the process exits.

#### Scenario: Graceful shutdown
- **WHEN** the application receives a shutdown signal (SIGTERM)
- **THEN** the producer flushes pending sends, the consumer commits the current offset and pauses polling, and all KafkaJS clients call `disconnect()` before the process exits

### Requirement: KafkaModule is globally scoped
`KafkaModule` SHALL be decorated with `@Global()` so it only needs to be imported once (in the root `AppModule`) and its providers are available throughout the application without re-importing.

#### Scenario: Single import at root
- **WHEN** `KafkaModule.forRoot(...)` is imported in `AppModule`
- **THEN** `KafkaProducer` and `KafkaConsumer` can be injected in any feature module without importing `KafkaModule` again
