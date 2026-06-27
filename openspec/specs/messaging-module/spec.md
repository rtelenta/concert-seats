# messaging-module

## Purpose

A dedicated `MessagingModule` in the seating app that owns all event consumers. This isolates messaging infrastructure from feature modules and provides a single registration point for Kafka consumers.

## Requirements

### Requirement: MessagingModule declares and owns all Kafka consumers
`MessagingModule` SHALL be imported by `AppModule` and SHALL declare and export all Kafka consumer classes. Feature modules such as `SeatsModule` SHALL NOT be responsible for declaring consumers.

#### Scenario: ShowPublishedConsumer is registered via MessagingModule
- **GIVEN** the seating app starts
- **WHEN** the app bootstraps
- **THEN** `MessagingModule` is imported by `AppModule`
- **AND** `MessagingModule` declares and exports `ShowPublishedConsumer`
- **AND** `SeatsModule` is NOT responsible for declaring the consumer

#### Scenario: MessagingModule has no feature module dependencies
- **GIVEN** `ShowPublishedConsumer` injects `KafkaConsumer` and `DataSource`
- **WHEN** `MessagingModule` is configured
- **THEN** it declares no imports (both dependencies are globally provided)
- **AND** `SeatsModule` requires no changes to its exports

### Requirement: ShowPublishedConsumer delegates seat creation to SeatsService
`ShowPublishedConsumer` SHALL process `ShowPublished` Kafka events by delegating seat creation to `SeatsService`, preserving identical behavior to before the messaging refactor.

#### Scenario: ShowPublishedConsumer processes a ShowPublished event
- **GIVEN** a `ShowPublished` Kafka message arrives
- **WHEN** the consumer handles the message
- **THEN** it delegates seat creation to `SeatsService`
- **AND** the behavior is identical to before the refactor
