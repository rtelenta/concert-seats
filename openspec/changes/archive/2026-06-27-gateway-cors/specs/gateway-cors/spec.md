## Purpose

Define the CORS policy for the concertseats gateway so that browser-based frontends can call it cross-origin, including routes that send an Authorization header.

## Requirements

### Requirement: CORS enabled for configured origins
The gateway SHALL respond to cross-origin requests with CORS headers only for origins listed in `CORS_ORIGINS`.

#### Scenario: Request from allowed origin
- **WHEN** a browser sends a request with an `Origin` header matching one of the configured origins
- **THEN** the gateway responds with `Access-Control-Allow-Origin` set to that origin

#### Scenario: Request from unknown origin
- **WHEN** a browser sends a request with an `Origin` not in the configured list
- **THEN** the gateway does not include `Access-Control-Allow-Origin` in the response (browser blocks the request)

### Requirement: Credentials allowed
The gateway SHALL include `Access-Control-Allow-Credentials: true` so that browsers may send the `Authorization` header on cross-origin requests.

#### Scenario: Preflight for credentialed request
- **WHEN** a browser sends an `OPTIONS` preflight with `Access-Control-Request-Headers: authorization`
- **THEN** the gateway responds with `Access-Control-Allow-Headers` including `authorization` and `Access-Control-Allow-Credentials: true`

### Requirement: CORS_ORIGINS is required at startup
The gateway SHALL read allowed origins from the `CORS_ORIGINS` environment variable (comma-separated). If the variable is absent or empty, the application SHALL fail to start with a descriptive error.

#### Scenario: Missing CORS_ORIGINS prevents startup
- **WHEN** the application starts without `CORS_ORIGINS` set
- **THEN** the application throws a configuration error during bootstrap

### Requirement: Standard HTTP methods and headers allowed
The gateway SHALL allow the methods `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, and `OPTIONS`, and the headers `Content-Type` and `Authorization`.
