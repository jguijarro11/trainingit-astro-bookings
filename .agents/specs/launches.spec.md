# Launch Management API Specification

## Problem Description

- As an **operations manager**, I want to **schedule launches for a specific rocket** so that the company can offer time-bound trips to customers.
- As an **operations manager**, I want to **define the commercial rules of a launch** with a seat price and minimum passenger threshold so that a launch is only viable when demand is sufficient.
- As an **operations manager**, I want to **track the lifecycle of each launch** so that operations can move from planning to completion without losing historical records.

## Solution Overview

Expose a REST API resource `/launches` to manage scheduled launches. A launch is always tied to an existing rocket, inherits its seat capacity at creation time, and stores commercial settings such as `pricePerSeat` and `minimumPassengers`. The API validates all write operations against rocket existence and rocket capacity before persisting data in the in-memory store.

## Scope

### In Scope

- Create, list, and retrieve launches.
- Update launch commercial or scheduling fields while the launch is still editable.
- Change launch status through controlled lifecycle transitions.
- Validate `minimumPassengers` against the assigned rocket capacity.
- Persist the rocket seat capacity into the launch at creation time.

### Out of Scope

- Customer bookings and payment processing.
- Automatic confirmation based on booking counts.
- Seat reservation logic beyond storing launch capacity metadata.
- Authentication, authorization, and persistent database storage.

## Main Decisions

- A launch references a rocket by `rocketId`, but copies the rocket `capacity` into `totalSeats` at creation time so later rocket changes do not alter existing launches.
- `minimumPassengers` must be an integer between `1` and `totalSeats`.
- `pricePerSeat` is stored as a positive decimal number in API payloads.
- `scheduledAt` must be a valid future ISO-8601 timestamp.
- Launch history is retained; launches are not deleted through the public API in the initial version.
- Lifecycle transitions are explicit and limited to valid status changes.

## Resource Model

```json
{
  "id": "uuid",
  "rocketId": "uuid",
  "scheduledAt": "2026-05-10T09:00:00.000Z",
  "pricePerSeat": 250000,
  "minimumPassengers": 4,
  "totalSeats": 8,
  "availableSeats": 8,
  "status": "scheduled"
}
```

### Fields

- `rocketId`: existing rocket identifier.
- `scheduledAt`: planned departure timestamp in ISO-8601 format.
- `pricePerSeat`: positive number representing the amount billed per passenger seat.
- `minimumPassengers`: viability threshold for the launch.
- `totalSeats`: immutable seat capacity snapshot copied from the rocket at launch creation.
- `availableSeats`: initialized to `totalSeats`; future booking work will decrement this value.
- `status`: one of `scheduled` | `confirmed` | `suspended` | `successful` | `cancelled`.

## API Endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/launches` | Create a launch for an existing rocket | 201 |
| GET | `/launches` | List all launches | 200 |
| GET | `/launches/:id` | Get one launch by ID | 200 |
| PATCH | `/launches/:id` | Update editable launch fields | 200 |
| PATCH | `/launches/:id/status` | Transition launch status | 200 |

### Create Payload

```json
{
  "rocketId": "uuid",
  "scheduledAt": "2026-05-10T09:00:00.000Z",
  "pricePerSeat": 250000,
  "minimumPassengers": 4
}
```

### Editable Fields

- `scheduledAt`
- `pricePerSeat`
- `minimumPassengers`

Editable fields are only modifiable while the launch status is `scheduled`. Status changes must use the dedicated status endpoint.

## Status Lifecycle

- `scheduled` → `confirmed` | `suspended` | `cancelled`
- `confirmed` → `successful` | `suspended` | `cancelled`
- `suspended` → `scheduled` | `cancelled`
- `successful` and `cancelled` are terminal states.

## Acceptance Criteria

- [ ] **[EARS-01]** When a `POST /launches` request is received with an existing `rocketId`, a future `scheduledAt`, a positive `pricePerSeat`, and a `minimumPassengers` value within the rocket capacity, the system shall create the launch with HTTP 201.
- [ ] **[EARS-02]** When a launch is created, the system shall copy the assigned rocket capacity into `totalSeats`, initialize `availableSeats` with the same value, and set the initial status to `scheduled`.
- [ ] **[EARS-03]** When a `POST /launches` request is received with a `rocketId` that does not exist, the system shall reject it with HTTP 404 and a descriptive error message.
- [ ] **[EARS-04]** When a `POST /launches` or `PATCH /launches/:id` request is received with `minimumPassengers` lower than 1 or greater than `totalSeats`, the system shall reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-05]** When a `POST /launches` or `PATCH /launches/:id` request is received with a non-positive `pricePerSeat`, the system shall reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-06]** When a `POST /launches` or `PATCH /launches/:id` request is received with an invalid or past `scheduledAt`, the system shall reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-07]** When a `GET /launches` request is received, the system shall return all launches with HTTP 200.
- [ ] **[EARS-08]** When a `GET /launches/:id` request is received with an existing ID, the system shall return the matching launch with HTTP 200.
- [ ] **[EARS-09]** When a request targeting a specific launch is received with a non-existent ID, the system shall respond with HTTP 404 and a descriptive error message.
- [ ] **[EARS-10]** When a `PATCH /launches/:id` request is received for a launch in `scheduled` status with valid editable fields, the system shall update the launch and return it with HTTP 200.
- [ ] **[EARS-11]** When a `PATCH /launches/:id` request is received for a launch not in `scheduled` status, the system shall reject the update with HTTP 409 and a descriptive error message.
- [ ] **[EARS-12]** When a `PATCH /launches/:id/status` request is received with a valid next status according to the lifecycle rules, the system shall update the launch status and return the updated launch with HTTP 200.
- [ ] **[EARS-13]** When a `PATCH /launches/:id/status` request is received with an invalid status transition, the system shall reject it with HTTP 409 and a descriptive error message.
- [ ] **[EARS-14]** When a `PATCH /launches/:id/status` request is received with a status outside `scheduled`, `confirmed`, `suspended`, `successful`, or `cancelled`, the system shall reject it with HTTP 400 and a descriptive error message.

## Notes

- This specification intentionally keeps launch capacity static after creation to prevent rocket edits from retroactively changing operational commitments.
- The initial version does not derive `confirmed` automatically from bookings; that behavior can be added in a future bookings specification.