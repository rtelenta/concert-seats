## Why

Without a correlation ID, tracing a single user request across the gateway, catalog, and seating services requires guesswork — logs and traces have no shared key to link them. Adding a correlation ID to every request makes debugging and distributed tracing reliable from day one.

## What Changes

- The gateway reads `X-Correlation-Id` from incoming requests or generates a UUID v4 if absent
- The gateway forwards the correlation ID as `X-Correlation-Id` on every outgoing HTTP call to catalog and seating
- The gateway returns the correlation ID as `X-Correlation-Id` in every response
- Catalog and seating attach the incoming `X-Correlation-Id` to their async context so it appears in all log output for that request

## Capabilities

### New Capabilities

- `gateway-correlation-id`: Middleware and HTTP interceptor in the gateway that assigns and propagates a correlation ID across all downstream service calls

### Modified Capabilities

_(none — catalog and seating changes are implementation-only; no spec-level requirements change)_

## Impact

- **gateway (concertseats)**: new middleware + `HttpService` interceptor; all outgoing requests gain the header automatically
- **catalog**: new middleware to extract and log the correlation ID
- **seating**: new middleware to extract and log the correlation ID
- **No breaking changes**: header is optional on intake; all existing clients continue to work unchanged
