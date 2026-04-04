## Implementation Plan for bug-booking-status-eligibility.spec

### Environment Context

- **Branch**: `fix/booking-status-eligibility`
- **Affected files**:
  - `src/types/launch.type.ts` — add `BOOKABLE_STATUSES` constant
  - `src/services/bookings.service.ts` — insert status eligibility guard
  - `src/services/bookings.service.spec.ts` — add unit test cases for non-eligible statuses
  - `tests/bookings.spec.ts` — add E2E test cases for EARS-01 through EARS-07 (status-specific)
- **ADD guardrails**:
  - Business rules live exclusively in `services`; routes only map errors to HTTP responses.
  - Seat decrement and booking persistence must NOT occur on rejected requests.
  - Status validation must be placed after launch existence check and before seat availability check (fail-fast order).
  - No changes to repository layer are required.

---

### Step 1: Define bookable statuses constant in the domain type

Add a typed constant that declares which launch statuses allow bookings, keeping the rule co-located with the domain types.

- [ ] Open `src/types/launch.type.ts`.
- [ ] Export a `const BOOKABLE_STATUSES` array containing `"scheduled"` and `"confirmed"`.
- [ ] Derive a `BookableStatus` type from the array (using `typeof BOOKABLE_STATUSES[number]`).

---

### Step 2: Add status eligibility guard in `bookings.service.ts`

Insert the validation immediately after the launch existence check and before the customer/seat checks, following the fail-fast order.

- [ ] Import `BOOKABLE_STATUSES` from `../types/launch.type.js`.
- [ ] After the `if (!launch)` guard, add: `if (!BOOKABLE_STATUSES.includes(launch.status as any))` → return `{ statusCode: 409, message: "Launch is not open for bookings (status: <status>)." }`.
- [ ] Verify that `bookingsRepository.create` and `launchesRepository.decrementSeats` are never reached when the guard fires (review call order).

---

### Step 3: Update unit tests in `bookings.service.spec.ts`

Cover all new paths introduced by the status eligibility guard.

- [ ] Add a test fixture `SUSPENDED_LAUNCH` (status `"suspended"`), `SUCCESSFUL_LAUNCH` (status `"successful"`), `CANCELLED_LAUNCH` (status `"cancelled"`).
- [ ] Add test: returns 409 for `suspended` launch — assert `statusCode 409`, `create` not called, `decrementSeats` not called.
- [ ] Add test: returns 409 for `successful` launch — same assertions.
- [ ] Add test: returns 409 for `cancelled` launch — same assertions.
- [ ] Add test: happy-path still passes for `confirmed` launch (complementary to existing `scheduled` test).
- [ ] Run `npm run test:unit` and confirm all specs pass with no regressions.

---

### Step 4: Add E2E smoke tests in `tests/bookings.spec.ts`

Validate acceptance criteria EARS-01 through EARS-07 via HTTP using a live server. The E2E tests require transitioning launch state via `PATCH /launches/:id/status`.

- [ ] Add helper `transitionLaunchStatus(request, launchId, status)` that calls `PATCH /launches/:id/status`.
- [ ] Add test **EARS-01-status**: create launch (defaults to `scheduled`), book seats → expect HTTP 201 (confirms existing behavior is preserved).
- [ ] Add test **EARS-02-status**: transition launch to `confirmed`, book seats → expect HTTP 201.
- [ ] Add test **EARS-03-status**: transition launch to `suspended`, attempt booking → expect HTTP 409 and descriptive error message.
- [ ] Add test **EARS-04-status**: transition launch to `successful`, attempt booking → expect HTTP 409 and descriptive error message.
- [ ] Add test **EARS-05-status**: create and cancel launch, attempt booking → expect HTTP 409 and descriptive error message.
- [ ] Verify that `availableSeats` is NOT decremented after a rejected booking (reuse pattern from existing EARS-08 test).
- [ ] Run `npm run test:smoke` and confirm all E2E scenarios pass.

---

### Step 5: Review and close

Final review to ensure correctness, no side effects, and spec traceability.

- [ ] Run full test suite: `npm run test:unit && npm run test:smoke`.
- [ ] Confirm that existing tests (EARS-01 through EARS-08 in the original `bookings.spec.ts`) still pass without modification.
- [ ] Update spec status to `"Planned"` → `"InProgress"` when implementation begins.
- [ ] Update `CHANGELOG.md` with a `fix:` entry referencing the bug slug.

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
| B1 | **Assumption** | `PATCH /launches/:id/status` endpoint exists and correctly transitions to `confirmed`, `suspended`, `successful`, and `cancelled`. Verify via `tests/launches.spec.ts` or manual smoke before writing E2E tests. |
| B2 | **Assumption** | Transitioning to `successful` from a `scheduled` launch requires going through `confirmed` first (per `LAUNCH_STATUS_TRANSITIONS` in `launch.type.ts`). E2E helper must chain transitions accordingly. |
| B3 | **Assumption** | No authentication or authorization is required; endpoints are open. |
| B4 | **Out of scope** | Payment adapter integration is excluded from this fix; the guard fires before any payment call would occur. |
| B5 | **No DB migration** | In-memory store requires no migration; fix is purely logic layer. |
