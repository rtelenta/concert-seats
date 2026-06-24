## Purpose

TBD

## Requirements

### Requirement: Get show by ID
`GET /shows/:id` SHALL return the show matching the given `id`. The response body MUST include at minimum: `id`, `title`, `artist`, `dateTime`, `status`, `venueId`, `createdAt`, `updatedAt`. The endpoint SHALL return shows of any status (not limited to `PUBLISHED`).

#### Scenario: Show found
- **GIVEN** a show with the requested `id` exists
- **WHEN** `GET /shows/:id` is requested
- **THEN** the response is `200 OK` with the show's fields in the JSON body

#### Scenario: Show not found
- **GIVEN** no show with the requested `id` exists
- **WHEN** `GET /shows/:id` is requested
- **THEN** the response is `404 Not Found`
