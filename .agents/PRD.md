# AstroBookings Product Requirements Document

Backend API for managing rocket fleet, launches, customer registrations, and seat bookings for a fictional space travel company.

## Vision and Scope

AstroBookings provides operations managers with tools to manage the rocket fleet and schedule commercial launches, while allowing customers to book seats and be billed automatically through a mock payment gateway.

**Target users**: Operations managers (fleet and launch management) and customers (seat booking).

**Scope**: REST API backend with in-memory storage, focused on fleet management, launch lifecycle, customer registration, seat booking, and mock payment processing.

**Out of scope**: Authentication, authorization, persistent database, and production-grade security at the initial stages.

---

## Functional Requirements

### FR1: Rocket Fleet Management
- Operations managers can create, retrieve, update, and delete rockets. Each rocket has a name, range category (`suborbital`, `orbital`, `moon`, `mars`), and seat capacity (1–10). Duplicate names and invalid inputs are rejected with descriptive errors.
- **Status**: Implemented

### FR2: Launch Scheduling and Management
- Operations managers can schedule launches tied to existing rockets, defining a departure timestamp, price per seat, and minimum passenger threshold. Capacity is snapshotted from the rocket at creation and is immutable. Editable fields are only modifiable while the launch is in `scheduled` status.
- **Status**: Implemented

### FR3: Launch Lifecycle Transitions
- The launch status follows a controlled lifecycle: `scheduled` → `confirmed` | `suspended` | `cancelled`; `confirmed` → `successful` | `suspended` | `cancelled`; `suspended` → `scheduled` | `cancelled`. Terminal states (`successful`, `cancelled`) cannot be further transitioned.
- **Status**: Implemented

### FR4: Customer Registration
- Customers are identified by their email address and hold a name and phone number. Registration validates uniqueness by email, preventing duplicate customer records.
- **Status**: Implemented

### FR5: Seat Booking
- A registered customer can book one or more seats on a launch. The booking validates that the requested seat count does not exceed the available seats on the launch. Available seats are decremented upon successful booking.
- **Status**: NotStarted

### FR6: Payment Processing
- Customers are billed upon booking through a mock payment gateway. A booking is only persisted after the payment is accepted. Failed payments result in a rejected booking with no seat decrement.
- **Status**: NotStarted

---

## Technical Requirements

### TR1: REST API with Express
- The system exposes a typed REST API built with Express 5 and TypeScript 5. Routes are organized by resource domain and return standard HTTP status codes with JSON bodies.
- **Status**: Implemented

### TR2: In-Memory Data Store
- All data is stored in-memory via repository modules with a consistent CRUD interface (`findAll`, `findById`, `create`, `update`, `remove`). No external database is required.
- **Status**: Implemented

### TR3: Centralized Logging
- All application events use a centralized logger with timestamped, level-prefixed output. Verbosity is controlled via the `LOG_LEVEL` environment variable (`error`, `warn`, `info`, `debug`; default `info`).
- **Status**: Implemented

### TR5: Automated Testing with Playwright and Vitest
 - Unit tests must be implemented with Vitest and executed with `npm run test:unit` (single run) and `npm run test:dev` (watch mode).
- Smoke/E2E validation must continue using Playwright through `npm run test:smoke`.
- Test suites must stay isolated so unit runs do not execute Playwright specs.
- Unit tests validate business logic in services and utilities using Vitest with mocked dependencies for isolated testing.
- **Status**: Implemented
