# Booking Status Eligibility Specification

- **Type**: bug
- **Status**: Planned
- **Feature Status**: NotStarted

## Problem Description

The booking flow currently validates launch existence, customer existence, seat format, and seat availability, but it does not consistently enforce launch status eligibility before accepting bookings. This can allow bookings on launches that should not be sellable, causing operational and inventory inconsistencies.

### User Stories

- As an **operations manager**, I want bookings to be allowed only on sellable launch statuses so that seat sales match launch operations.
- As a **customer**, I want a clear error when trying to book on a non-sellable launch so that I can choose a valid option.
- As the **business**, I want invalid booking attempts blocked before persistence so that booking records and seat inventory remain trustworthy.

## Solution Overview

### User/App interface

- Keep the current booking endpoints unchanged.
- Return a conflict error with a descriptive message when booking is requested for a launch in a non-sellable status.

### Model and logic

- Define launch booking eligibility based on launch status.
- Allow booking only when launch status is `scheduled` or `confirmed`.
- Reject booking when launch status is `suspended`, `successful`, or `cancelled`.
- Apply status validation before booking persistence and before seat decrement.

### Persistence

- Do not persist booking records when launch status is not eligible.
- Do not decrement launch `availableSeats` when booking is rejected by status.

## Scope

### In Scope

- Enforce launch status eligibility validation in booking creation flow.
- Return clear domain/HTTP error semantics for non-eligible statuses.
- Preserve current successful booking behavior for eligible statuses.

### Out of Scope

- Payment adapter integration and payment failure handling.
- Booking cancellation and refund behavior.
- Automatic launch status transitions.

## Acceptance Criteria

- [ ] **[EARS-01]** WHEN `POST /launches/:id/bookings` is received for a launch in `scheduled` status with valid customer and seats, THE AstroBookings API SHALL create the booking and return HTTP 201.
- [ ] **[EARS-02]** WHEN `POST /launches/:id/bookings` is received for a launch in `confirmed` status with valid customer and seats, THE AstroBookings API SHALL create the booking and return HTTP 201.
- [ ] **[EARS-03]** IF a booking request is received for a launch in `suspended` status, THEN THE AstroBookings API SHALL reject the request with HTTP 409 and a descriptive error message.
- [ ] **[EARS-04]** IF a booking request is received for a launch in `successful` status, THEN THE AstroBookings API SHALL reject the request with HTTP 409 and a descriptive error message.
- [ ] **[EARS-05]** IF a booking request is received for a launch in `cancelled` status, THEN THE AstroBookings API SHALL reject the request with HTTP 409 and a descriptive error message.
- [ ] **[EARS-06]** IF a booking request is rejected due to launch status eligibility, THEN THE AstroBookings API SHALL NOT persist a booking record.
- [ ] **[EARS-07]** IF a booking request is rejected due to launch status eligibility, THEN THE AstroBookings API SHALL NOT decrement launch `availableSeats`.
- [ ] **[EARS-08]** WHEN the booking request is valid and eligible, THE AstroBookings API SHALL preserve existing seat validation and overbooking protection behavior.

## Notes

- This bug fix hardens FR5 consistency and aligns booking behavior with lifecycle constraints in `launches`.
- Payment-first ordering remains specified in FR6 and ADD guardrails, but is not included in this bug scope.