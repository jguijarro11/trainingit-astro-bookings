# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-02

### Added

- **Launch Management API** (`/launches`) with the following operations:
  - `POST /launches` — Create a launch for an existing rocket (returns 201).
  - `GET /launches` — List all launches (returns 200).
  - `GET /launches/:id` — Get a launch by ID (returns 200).
  - `PATCH /launches/:id` — Update editable launch fields while scheduled (returns 200).
  - `PATCH /launches/:id/status` — Transition launch status according to lifecycle rules (returns 200).
- Launch domain model with `rocketId`, `scheduledAt`, `pricePerSeat`, `minimumPassengers`, `totalSeats`, `availableSeats`, and `status`.
- Lifecycle transition rules for `scheduled`, `confirmed`, `suspended`, `successful`, and `cancelled` launch states.
- In-memory launches repository and service layer enforcing rocket existence, capacity snapshotting, editability rules, and status transition validation.
- End-to-end Playwright coverage for launches acceptance criteria EARS-01 to EARS-14.
- Product specification for launches in `specs/launches.spec.md` and implementation plan in `.github/ISSUES/feat-launches-endpoint.md`.

### Changed

- API reference in `README.md` now documents the launches endpoints, launch resource model, and status lifecycle.

## [1.1.0] - 2026-04-02

### Added

- Centralized logger module at `src/logger.ts` with `info`, `warn`, `error`, and `debug` helpers.
- Timestamped log format with ISO-8601 date and uppercase level prefix.
- Environment-based verbosity control through `LOG_LEVEL` (`error`, `warn`, `info`, `debug`) with default `info`.

### Changed

- Server startup logs now use the centralized logger instead of direct `console.log` calls.

## [1.0.0] - 2026-04-02

### Added

- **Rocket Management API** (`/rockets`) with full CRUD operations:
  - `POST /rockets` — Create a new rocket (returns 201).
  - `GET /rockets` — List all rockets (returns 200).
  - `GET /rockets/:id` — Get a rocket by ID (returns 200).
  - `PUT /rockets/:id` — Update a rocket by ID (returns 200).
  - `DELETE /rockets/:id` — Delete a rocket by ID (returns 204).
- Input validation for rocket `range` (must be one of `suborbital`, `orbital`, `moon`, `mars`) returning 400 on failure.
- Input validation for rocket `capacity` (integer between 1 and 10) returning 400 on failure.
- Duplicate name detection on `POST /rockets` returning 409.
- 404 responses with descriptive messages for non-existent rocket IDs.
- In-memory rockets repository with `findAll`, `findById`, `findByName`, `create`, `update`, and `remove` operations.
- E2E acceptance tests covering all EARS criteria (EARS-01 to EARS-09).

### Infrastructure

- Health endpoint (`GET /health`) returning status and timestamp.
- Express server with typed routes and DTOs.
- Playwright e2e test suite.
