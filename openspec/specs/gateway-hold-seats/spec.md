# Capability: gateway-hold-seats

## Overview

A protected gateway endpoint that proxies hold-seat requests to the seating service. Auth is enforced at the gateway; the verified user identity is forwarded to the seating service via `x-user-id` header.

## Requirements

### Authenticated hold-seats request succeeds

- **Given** a client sends `POST /shows/:id/hold-seats` with a valid Clerk JWT and a body containing `seatIds: string[]`
  **When** the gateway processes the request
  **Then** the gateway forwards the request to the seating service with the `x-user-id` header set to the JWT subject (`payload.sub`) and returns the seating service's response with HTTP 200

### Missing or invalid JWT is rejected before proxying

- **Given** a client sends `POST /shows/:id/hold-seats` with no `Authorization` header, or an expired / invalid token
  **When** the gateway processes the request
  **Then** the gateway returns HTTP 401 and no call is made to the seating service

### Seating service error is propagated to the client

- **Given** a client sends `POST /shows/:id/hold-seats` with a valid JWT
  **When** the seating service returns a 409 (seats unavailable) or 404 (seats not found)
  **Then** the gateway returns the same HTTP status code to the client

### User identity comes from the verified token, not the request body

- **Given** a valid JWT with subject `user_abc`
  **When** the gateway proxies the hold request
  **Then** the `x-user-id` header on the downstream call is `user_abc`, regardless of any user ID the client may have supplied in the body or headers
