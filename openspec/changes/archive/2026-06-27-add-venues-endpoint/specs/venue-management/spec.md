## ADDED Requirements

### Requirement: Venue listing via HTTP API
The catalog service SHALL expose the venue list through an HTTP endpoint so that clients can discover all venues without direct database access.

#### Scenario: Client retrieves all venues
- **WHEN** a caller sends an HTTP request to list venues
- **THEN** the service returns all persisted venue records in a structured response
