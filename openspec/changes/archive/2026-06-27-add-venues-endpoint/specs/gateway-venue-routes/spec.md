## ADDED Requirements

### Requirement: Gateway proxies venue listing to catalog
The concertseats gateway SHALL expose `GET /venues` and forward the request to the catalog service, returning the catalog's response body and HTTP status code to the caller.

#### Scenario: Successful venue listing
- **WHEN** a client sends `GET /venues` to the gateway
- **THEN** the gateway returns HTTP 200 with the array of venues from the catalog service

#### Scenario: Catalog service unavailable
- **WHEN** the catalog service is unreachable
- **THEN** the gateway returns a 5xx error to the caller

### Requirement: Gateway proxies venue detail to catalog
The concertseats gateway SHALL expose `GET /venues/:id` and forward the request to the catalog service, returning the catalog's response body and HTTP status code to the caller.

#### Scenario: Existing venue returned
- **WHEN** a client sends `GET /venues/:id` with a valid venue ID
- **THEN** the gateway returns HTTP 200 with the venue object from the catalog service

#### Scenario: Non-existent venue passes through 404
- **WHEN** a client sends `GET /venues/:id` with an ID that does not exist in catalog
- **THEN** the gateway returns HTTP 404 (propagated from catalog)

### Requirement: Gateway venue routes reuse CATALOG_URL
The gateway SHALL resolve venue downstream URLs using the existing `CATALOG_URL` environment variable. No additional environment variables are required.

#### Scenario: CATALOG_URL used for venue routes
- **WHEN** the gateway forwards `GET /venues` or `GET /venues/:id`
- **THEN** the request is sent to `${CATALOG_URL}/venues` or `${CATALOG_URL}/venues/:id` respectively
