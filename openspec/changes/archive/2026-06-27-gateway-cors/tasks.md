## 1. Config

- [x] 1.1 Add `corsOrigins: string[]` to `apps/concertseats/src/config/app.config.ts` by splitting `process.env.CORS_ORIGINS` on `,` — throw if the variable is absent or results in an empty list

## 2. Bootstrap

- [x] 2.1 In `apps/concertseats/src/main.ts`, call `app.enableCors()` before `app.listen()` with:
  - `origin`: the `corsOrigins` array from app config
  - `credentials: true`
  - `methods`: `['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']`
  - `allowedHeaders`: `['Content-Type', 'Authorization']`
