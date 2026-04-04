# Customer Registration API Specification

- **Type**: feat
- **Status**: Planned

## Problem Description

The product needs a reliable way to register customers before they can book seats on a launch. A customer must be uniquely identified by email address and must keep basic contact data that operations and future booking flows can use consistently. Without a dedicated customer registration capability, bookings cannot validate customer identity or prevent duplicate customer records.

### User Stories

- As a **customer**, I want to **register with my email, name, and phone number** so that I can be recognized when booking seats.
- As an **operations manager**, I want to **retrieve registered customer records** so that I can confirm customer details before assisting with bookings.
- As the **business**, I want to **prevent duplicate customers by email** so that future booking and billing flows stay consistent.

## Solution Overview

### User/App interface

- Expose a REST API resource `/customers` for customer registration and lookup.
- Allow customer creation through `POST /customers`.
- Allow customer retrieval through `GET /customers` and `GET /customers/:email`.
- Return standard JSON responses and descriptive validation errors.

### Model and logic

- A customer record contains `email`, `name`, and `phone`.
- `email` is the unique customer identifier for the initial version.
- Registration accepts only complete and valid customer data.
- Email uniqueness is enforced before a new customer is stored.
- Email matching uses a normalized value so casing or surrounding whitespace does not create duplicate records.
- This scope does not include customer update, customer deletion, bookings, or payment behavior.

### Persistence

- Store customer records in the in-memory repository layer.
- Preserve one customer record per unique email address.
- Make registered customers available for future booking validation flows.

## Scope

### In Scope

- Register a customer with email, name, and phone number.
- Retrieve all registered customers.
- Retrieve a single registered customer by email.
- Validate uniqueness by email address.
- Reject invalid customer registration payloads with descriptive errors.

### Out of Scope

- Updating customer records.
- Deleting customer records.
- Booking seats for a launch.
- Processing payments.
- Authentication and authorization.

## Resource Model

```json
{
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "phone": "+34-600-123-456"
}
```

### Fields

- `email`: unique customer email address.
- `name`: customer full name.
- `phone`: customer contact phone number.

## API Endpoints

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| POST | `/customers` | Register a new customer | 201 |
| GET | `/customers` | List all registered customers | 200 |
| GET | `/customers/:email` | Get one customer by email | 200 |

### Create Payload

```json
{
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "phone": "+34-600-123-456"
}
```

## Acceptance Criteria

- [ ] **[EARS-01]** WHEN a `POST /customers` request is received with a valid `email`, `name`, and `phone`, THE AstroBookings API SHALL create the customer and return it with HTTP 201.
- [ ] **[EARS-02]** WHEN a customer is created, THE AstroBookings API SHALL persist `email`, `name`, and `phone` and use `email` as the unique customer identifier.
- [ ] **[EARS-03]** IF a `POST /customers` request is received with an `email` that is already registered, THEN THE AstroBookings API SHALL reject it with HTTP 409 and a descriptive error message.
- [ ] **[EARS-04]** IF a `POST /customers` request is received with an `email` that only differs from an existing customer by casing or surrounding whitespace, THEN THE AstroBookings API SHALL reject it with HTTP 409 and a descriptive error message.
- [ ] **[EARS-05]** IF a `POST /customers` request is received with a missing, blank, or invalid `email`, THEN THE AstroBookings API SHALL reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-06]** IF a `POST /customers` request is received with a missing or blank `name`, THEN THE AstroBookings API SHALL reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-07]** IF a `POST /customers` request is received with a missing or blank `phone`, THEN THE AstroBookings API SHALL reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-08]** WHEN a `GET /customers` request is received, THE AstroBookings API SHALL return all registered customers with HTTP 200.
- [ ] **[EARS-09]** WHEN a `GET /customers/:email` request is received with an existing email, THE AstroBookings API SHALL return the matching customer with HTTP 200.
- [ ] **[EARS-10]** IF a request targeting a specific customer is received with an email that is not registered, THEN THE AstroBookings API SHALL respond with HTTP 404 and a descriptive error message.

## Notes

- This specification keeps customer identity tied to email so future booking flows can validate customers without introducing a separate customer ID in the initial version.
- Customer maintenance operations can be specified later if product needs expand beyond registration and lookup.