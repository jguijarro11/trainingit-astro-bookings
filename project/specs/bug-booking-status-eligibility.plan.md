## Implementation Plan for bug-booking-status-eligibility.spec

### Environment Context

- **Branch**: `fix/booking-status-eligibility`
- **Status**: ✅ Fully implemented and released
- **Affected files**:
  - `src/types/launch.type.ts` — added `BOOKABLE_STATUSES`, `BookableStatus`, and `isBookableLaunchStatus` guard
  - `src/services/bookings.service.ts` — status eligibility guard inserted at fail-fast position
  - `src/services/bookings.service.spec.ts` — unit tests for all 5 statuses + call-order test
  - `tests/bookings.spec.ts` — E2E tests covering EARS-01-status through EARS-08-status and all non-bookable cases
- **ADD guardrails**:
  - Business rules live exclusively in `services`; routes only map errors to HTTP responses.
  - Seat decrement and booking persistence must NOT occur on rejected requests.
  - Status validation must be placed after launch existence check and before seat availability check (fail-fast order).
  - No changes to repository layer are required.

---

### Step 1: Define bookable statuses constant in the domain type

Add a typed constant that declares which launch statuses allow bookings, keeping the rule co-located with the domain types.

- [x] Open `src/types/launch.type.ts`.
- [x] Export a `const BOOKABLE_STATUSES` array containing `"scheduled"` and `"confirmed"`.
- [x] Derive a `BookableStatus` type from the array (using `typeof BOOKABLE_STATUSES[number]`).
- [x] _(extra)_ Export `isBookableLaunchStatus(status): status is BookableStatus` type-guard function.

---

### Step 2: Add status eligibility guard in `bookings.service.ts`

Insert the validation immediately after the launch existence check and before the customer/seat checks, following the fail-fast order.

- [x] Import `isBookableLaunchStatus` from `../types/launch.type.js`.
- [x] After the `if (!launch)` guard, call `isBookableLaunchStatus(launch.status)` → return `{ statusCode: 409, message: "Launch is not open for bookings (status: ${launch.status})." }` on falsy.
- [x] Verified: `bookingsRepository.create` and `launchesRepository.decrementSeats` are never reached when the guard fires.

---

### Step 3: Update unit tests in `bookings.service.spec.ts`

Cover all new paths introduced by the status eligibility guard.

- [x] Added fixtures `SUSPENDED_LAUNCH`, `SUCCESSFUL_LAUNCH`, `CANCELLED_LAUNCH` and `NON_BOOKABLE_LAUNCH_CASES` table.
- [x] `it.each(NON_BOOKABLE_LAUNCH_CASES)` covers 409 + no `create` + no `decrementSeats` for all three ineligible statuses.
- [x] Added test: happy-path passes for `confirmed` launch (EARS-02).
- [x] Added test: `preserves overbooking protection for confirmed launch (EARS-08)` (regression coverage).
- [x] `npm run test:unit` passes with no regressions.

---

### Step 4: Add E2E smoke tests in `tests/bookings.spec.ts`

Validate acceptance criteria EARS-01 through EARS-07 via HTTP using a live server. The E2E tests require transitioning launch state via `PATCH /launches/:id/status`.

- [x] Added helpers `transitionLaunchStatus` and `transitionLaunchStatuses` (chains multiple transitions, needed for `successful`).
- [x] Added `NON_BOOKABLE_STATUS_CASES` table driving parameterised tests for `suspended`, `successful`, `cancelled`.
- [x] **EARS-01-status**: `scheduled` launch → HTTP 201.
- [x] **EARS-02-status**: transition to `confirmed`, book → HTTP 201.
- [x] **EARS-08-status**: `confirmed` launch still rejects overbooking (HTTP 409, `availableSeats` unchanged).
- [x] Parameterised test for each non-bookable status: HTTP 409, error body contains status string, `availableSeats` unchanged, no booking record persisted (EARS-03/04/05/06/07).
- [x] `npm run test:smoke` passes with no regressions.

---

### Step 5: Review and close

Final review to ensure correctness, no side effects, and spec traceability.

- [x] Full test suite `npm run test:unit && npm run test:smoke` passes.
- [x] Existing EARS-01 through EARS-08 tests pass without modification.
- [x] Spec status updated to **Released / Implemented**.
- [x] `CHANGELOG.md` updated with `fix:` entry for `bug-booking-status-eligibility`.

---

### Verification Strategy

#### Unit tests (`src/services/bookings.service.spec.ts`)

| Case | Expected return | `create` called | `decrementSeats` called |
|---|---|---|---|
| Launch status `scheduled` | Booking object | Yes | Yes |
| Launch status `confirmed` | Booking object | Yes | Yes |
| Launch status `suspended` | `{ statusCode: 409, … }` | No | No |
| Launch status `successful` | `{ statusCode: 409, … }` | No | No |
| Launch status `cancelled` | `{ statusCode: 409, … }` | No | No |

#### E2E tests (`tests/bookings.spec.ts`)

| EARS | Scenario | Expected HTTP |
|---|---|---|
| EARS-01 | Booking on `scheduled` launch | 201 |
| EARS-02 | Booking on `confirmed` launch | 201 |
| EARS-03 | Booking on `suspended` launch | 409 |
| EARS-04 | Booking on `successful` launch | 409 |
| EARS-05 | Booking on `cancelled` launch | 409 |
| EARS-06 | Rejected booking — no record persisted (confirmed via repeat GET) | — |
| EARS-07 | Rejected booking — `availableSeats` unchanged | — |

---

### Blockers and Assumptions

| # | Type | Description |
|---|---|---|
| B1 | **Resolved** | `PATCH /launches/:id/status` exists and was used successfully in E2E tests. |
| B2 | **Resolved** | `transitionLaunchStatuses` helper chains `["confirmed", "successful"]` for the `successful` case. |
| B3 | **Resolved** | No auth required; all endpoints are open. |
| B4 | **Out of scope** | Payment adapter integration excluded; guard fires before any payment call. |
| B5 | **Resolved** | No migration required; fix is purely logic-layer. |
