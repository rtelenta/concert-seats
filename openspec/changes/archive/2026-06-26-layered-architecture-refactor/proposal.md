## Why

As the codebase grows, all files within each module live flat in the module root folder, making it harder to navigate and reason about layer boundaries. Establishing explicit subfolders for each layer (`controllers/`, `services/`, `entities/`, `dtos/`) enforces consistent structure across all modules and isolates messaging concerns from feature modules.

## What Changes

- Move each module's files into typed subfolders: `controllers/`, `services/`, `entities/`, `dtos/`
- Apply to all modules in both apps: `shows`, `seat-definitions`, `venues` (catalog); `seats` (seating)
- Extract `show-published.consumer.ts` from `seats/` into a new top-level `messaging/` folder with a dedicated `MessagingModule`
- Update all import paths across the affected apps to reflect the new structure

## Capabilities

### New Capabilities

- `messaging-module`: Dedicated messaging layer in the seating app that hosts event consumers (starting with `ShowPublishedConsumer`) and registers them independently from feature modules

### Modified Capabilities

<!-- No requirement or behavior changes — this is a pure structural refactor -->

## Impact

- All internal import paths within `catalog/src/` and `seating/src/` will change
- `SeatsModule` will import `MessagingModule` instead of declaring the consumer directly
- No API surface, database schema, or event contract changes
- `openspec/specs/` entries are not affected (no behavior changes)
