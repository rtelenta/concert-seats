## 1. Controller

- [x] 1.1 Add `PATCH :id/publish` handler to `ShowsController` that calls `showsService.transitionStatus(id, ShowStatus.PUBLISHED)` and returns `ShowResponseDto.from(show)`

## 2. Verification

- [x] 2.1 Start the catalog service and send `PATCH /shows/:id/publish` with a valid DRAFT show id — confirm HTTP 200 and `status: "PUBLISHED"` in the response body
- [x] 2.2 Repeat with a PUBLISHED show id — confirm HTTP 422
- [x] 2.3 Repeat with an unknown id — confirm HTTP 404
