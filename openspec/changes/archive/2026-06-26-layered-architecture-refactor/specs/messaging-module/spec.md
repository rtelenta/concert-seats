# Spec: messaging-module

## Overview

A dedicated `MessagingModule` in the seating app that owns all event consumers. This isolates messaging infrastructure from feature modules and provides a single registration point for Kafka consumers.

## Scenarios

#### Scenario: ShowPublishedConsumer is registered via MessagingModule

- **Given** the seating app starts
- **When** the app bootstraps
- **Then** `MessagingModule` is imported by `AppModule`
- **And** `MessagingModule` declares and exports `ShowPublishedConsumer`
- **And** `SeatsModule` is NOT responsible for declaring the consumer

#### Scenario: ShowPublishedConsumer processes a ShowPublished event

- **Given** a `ShowPublished` Kafka message arrives
- **When** the consumer handles the message
- **Then** it delegates seat creation to `SeatsService`
- **And** the behavior is identical to before the refactor

#### Scenario: MessagingModule has no feature module dependencies

- **Given** `ShowPublishedConsumer` injects `KafkaConsumer` and `DataSource`
- **When** `MessagingModule` is configured
- **Then** it declares no imports (both dependencies are globally provided)
- **And** `SeatsModule` requires no changes to its exports
