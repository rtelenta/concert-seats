## ADDED Requirements

### Requirement: Gateway proxies show listing to catalog
The concertseats gateway SHALL expose `GET /shows` and forward the request to the catalog service, returning the catalog's response body and HTTP status code to the caller.

#### Scenario: Successful show listing
- **WHEN** a client sends `GET /shows` to the gateway
- **THEN** the gateway returns HTTP 200 with the array of published shows from the catalog service

#### Scenario: Catalog service unavailable
- **WHEN** the catalog service is unreachable
- **THEN** the gateway returns a 5xx error to the caller

### Requirement: Gateway proxies show detail to catalog
The concertseats gateway SHALL expose `GET /shows/:id` and forward the request to the catalog service, returning the catalog's response body and HTTP status code to the caller.

#### Scenario: Existing show returned
- **WHEN** a client sends `GET /shows/:id` with a valid show ID
- **THEN** the gateway returns HTTP 200 with the show object from the catalog service

#### Scenario: Non-existent show passes through 404
- **WHEN** a client sends `GET /shows/:id` with an ID that does not exist
- **THEN** the gateway returns HTTP 404 (propagated from catalog)

### Requirement: Gateway proxies seat definitions to catalog
The concertseats gateway SHALL expose `GET /shows/:id/seat-definitions` and forward the request to the catalog service, returning the catalog's response body and HTTP status code.

#### Scenario: Seat definitions returned
- **WHEN** a client sends `GET /shows/:id/seat-definitions` with a valid show ID
- **THEN** the gateway returns HTTP 200 with the array of seat definitions from the catalog service

#### Scenario: Unknown show passes through 404
- **WHEN** a client sends `GET /shows/:id/seat-definitions` with an unknown show ID
- **THEN** the gateway returns HTTP 404 (propagated from catalog)

### Requirement: Gateway proxies seats to seating service
The concertseats gateway SHALL expose `GET /shows/:id/seats` and forward the request to the seating service, returning the seating service's response body and HTTP status code.

#### Scenario: Seat inventory returned
- **WHEN** a client sends `GET /shows/:id/seats` with a valid show ID
- **THEN** the gateway returns HTTP 200 with the array of seats from the seating service

### Requirement: Gateway downstream URLs are environment-configured
The gateway SHALL read `CATALOG_URL` and `SEATING_URL` from the environment to determine the base URLs for downstream services. If either variable is absent, the application SHALL fail to start with a descriptive error.

#### Scenario: Missing CATALOG_URL prevents startup
- **WHEN** the application starts without `CATALOG_URL` set
- **THEN** the application throws a configuration error during bootstrap

#### Scenario: Missing SEATING_URL prevents startup
- **WHEN** the application starts without `SEATING_URL` set
- **THEN** the application throws a configuration error during bootstrap
