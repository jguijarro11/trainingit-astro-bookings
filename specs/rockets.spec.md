# Rocket Management API Specification

## Problem Description

- As an **operations manager**, I want to **register rockets** with their range and capacity so that they can be assigned to future launches.
- As an **operations manager**, I want to **list and retrieve rockets** so that I can review the available fleet before planning launches.
- As an **operations manager**, I want to **update or delete rockets** so that I can keep the fleet information accurate and up to date.

## Solution Overview

Expose a REST API resource `/rockets` with standard CRUD operations backed by an in-memory store. Each rocket is identified by a generated ID and holds a name, a range category, and a passenger capacity. Input validation is enforced at the API layer before any write operation is accepted.

## Acceptance Criteria

- [ ] **[EARS-01]** When a `POST /rockets` request is received with a valid name, range, and capacity, the system shall create the rocket and return it with HTTP 201.
- [ ] **[EARS-02]** When a `GET /rockets` request is received, the system shall return the list of all rockets with HTTP 200.
- [ ] **[EARS-03]** When a `GET /rockets/:id` request is received with an existing ID, the system shall return the matching rocket with HTTP 200.
- [ ] **[EARS-04]** When a `PUT /rockets/:id` request is received with valid data and an existing ID, the system shall update the rocket and return it with HTTP 200.
- [ ] **[EARS-05]** When a `DELETE /rockets/:id` request is received with an existing ID, the system shall remove the rocket and respond with HTTP 204.
- [ ] **[EARS-06]** When a write request is received with a range value outside `["suborbital", "orbital", "moon", "mars"]`, the system shall reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-07]** When a write request is received with a capacity outside the range 1–10, the system shall reject it with HTTP 400 and a descriptive error message.
- [ ] **[EARS-08]** When a request targeting a specific rocket is received with a non-existent ID, the system shall respond with HTTP 404 and a descriptive error message.
- [ ] **[EARS-09]** When a `POST /rockets` request is received with a name that already exists, the system shall reject it with HTTP 409 and a descriptive error message.
