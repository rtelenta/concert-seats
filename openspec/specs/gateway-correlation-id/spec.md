# Capability: gateway-correlation-id

## Overview

The gateway assigns a correlation ID to every inbound HTTP request and propagates it to all downstream service calls. Clients may supply their own ID; otherwise one is generated. The ID is echoed in the response and flows through to catalog and seating via request headers.

## Requirements

### Assign correlation ID on intake

- **Given** a request arrives at the gateway with an `X-Correlation-Id` header
  **When** the middleware processes the request
  **Then** the supplied value is used as the correlation ID for that request

- **Given** a request arrives at the gateway without an `X-Correlation-Id` header
  **When** the middleware processes the request
  **Then** a UUID v4 is generated and used as the correlation ID for that request

### Echo correlation ID in gateway responses

- **Given** any request to the gateway (with or without an incoming `X-Correlation-Id`)
  **When** the response is sent
  **Then** the response includes an `X-Correlation-Id` header containing the assigned ID

### Forward correlation ID to downstream services

- **Given** the gateway proxies a request to catalog or seating via HttpService
  **When** the outgoing HTTP request is built
  **Then** the `X-Correlation-Id` header is set to the correlation ID assigned for that inbound request

- **Given** multiple concurrent inbound requests each with different correlation IDs
  **When** each request triggers downstream calls
  **Then** each downstream call carries only its own correlation ID (no cross-request leakage)

### Catalog and seating bind the correlation ID

- **Given** a request arrives at catalog or seating with an `X-Correlation-Id` header
  **When** the request is processed
  **Then** the ID is available in the async context for the duration of that request (e.g. for structured logging)

- **Given** a request arrives at catalog or seating without an `X-Correlation-Id` header
  **When** the request is processed
  **Then** the async context has no correlation ID set (no error is thrown)
