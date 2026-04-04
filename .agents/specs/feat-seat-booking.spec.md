# Seat Booking API Specification

- **Type**: feat
- **Status**: Released
- **Feature Status**: Implemented

## Problem Description

A launch can only be sold if seats are controlled consistently across customers and launches. The product currently lacks a booking capability that validates customer eligibility, launch availability, and requested seat count in a single flow. Without this feature, available seats can be oversold, and operations cannot rely on launch occupancy data.

### User Stories

- As a **registered customer**, I want to **book one or more seats on a launch** so that I can secure my trip.
- As an **operations manager**, I want to **prevent overbooking** so that launch capacity remains accurate.
- As the **business**, I want to **decrement launch availability only after a valid booking** so that seat inventory and commercial records stay consistent.

## Solution Overview

### User/App interface

- Expose a booking creation endpoint to request seats for a specific launch.
- Accept customer identification, requested seats, and the commercial snapshot needed to confirm the booking.
- Return the created booking and updated launch availability when the booking succeeds.
- Return descriptive errors when customer, launch, or seat constraints are not met.

### Model and logic

- A booking links one registered customer to one launch and stores the number of seats purchased.
- Booking validation checks that:
  - the customer exists,
  - the launch exists,
  - the launch is in a status that allows bookings,
  - requested seats are a positive integer,
  - requested seats do not exceed current available seats.
- Available seats are decremented only after the booking is accepted and persisted.
- A customer can create multiple bookings on the same launch as long as each new request fits remaining availability.

### Persistence

- Persist booking records in the in-memory repository layer.
- Persist launch seat updates in the launch repository as part of successful booking completion.
- Keep bookings and launch availability synchronized so the remaining seats can be trusted for future requests.

## Scope

### In Scope

- Create a booking for a registered customer on an existing launch.
- Validate customer existence before booking creation.
- Validate seat availability before booking creation.
- Decrement launch available seats only after successful booking persistence.
- Return clear domain errors for validation and capacity conflicts.

### Out of Scope

- Payment authorization and payment failure handling details.
- Booking cancellation and seat refund policies.
- Automatic launch status transitions driven by booking counts.
- Authentication and authorization.

## Resource Model

```json
{
  "id": "uuid",
  "launchId": "uuid",
  "customerEmail": "jane.doe@example.com",
  "seats": 3,
  "pricePerSeat": 250000,
  "totalAmount": 750000,
  "createdAt": "2026-04-04T12:00:00.000Z"
}
```

### Fields

- `launchId`: target launch identifier.
- `customerEmail`: registered customer email.
- `seats`: number of seats purchased in the booking.
- `pricePerSeat`: launch seat price snapshot at booking time.
- `totalAmount`: computed booking amount (`seats * pricePerSeat`).

## API Endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/launches/:id/bookings` | Create a booking for a launch | 201 |
| GET | `/launches/:id/bookings` | List bookings for a launch | 200 |

### Create Payload

```json
{
  "customerEmail": "jane.doe@example.com",
  "seats": 3
}
```

## Acceptance Criteria

- [ ] **[EARS-01]** WHEN a `POST /launches/:id/bookings` request is received with an existing launch, a registered customer, and a valid positive `seats` value within availability, THE AstroBookings API SHALL create the booking and respond with HTTP 201.
- [ ] **[EARS-02]** WHEN a booking is created, THE AstroBookings API SHALL persist `launchId`, `customerEmail`, `seats`, `pricePerSeat`, and `totalAmount` in the booking record.
- [ ] **[EARS-03]** IF a booking request is received for a launch that does not exist, THEN THE AstroBookings API SHALL reject the request with HTTP 404 and a descriptive error message.
- [ ] **[EARS-04]** IF a booking request is received for a customer that is not registered, THEN THE AstroBookings API SHALL reject the request with HTTP 404 and a descriptive error message.
- [ ] **[EARS-05]** IF a booking request is received with a `seats` value that is not a positive integer, THEN THE AstroBookings API SHALL reject the request with HTTP 400 and a descriptive error message.
- [ ] **[EARS-06]** IF a booking request is received with `seats` greater than the launch `availableSeats`, THEN THE AstroBookings API SHALL reject the request with HTTP 409 and a descriptive error message.
- [ ] **[EARS-07]** WHEN a booking is successfully persisted, THE AstroBookings API SHALL decrement launch `availableSeats` by exactly the number of booked seats.
- [ ] **[EARS-08]** IF booking persistence fails, THEN THE AstroBookings API SHALL NOT decrement launch `availableSeats`.
- [ ] **[EARS-09]** WHEN a `GET /launches/:id/bookings` request is received for an existing launch, THE AstroBookings API SHALL return all bookings for that launch with HTTP 200.

## Notes

- This specification defines seat booking behavior and seat inventory consistency for FR5.
- Payment orchestration details are intentionally specified in FR6 and must be aligned before implementation completion.
