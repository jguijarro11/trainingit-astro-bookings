Title: Add launches management endpoint

Problem
-------
The API can manage rockets, but it cannot yet schedule launches tied to those rockets. Operations needs a dedicated resource to define departure dates, pricing, and minimum passenger thresholds, while ensuring no launch is created with rules that exceed the assigned rocket capacity.

Goal
----
Introduce a `/launches` API resource backed by the in-memory store. The first implementation should support creating, listing, retrieving, updating, and changing launch status with validation against the existing rockets catalog.

Implementation Plan (actionable)
-------------------------------
1. Define launch domain types and constants
   - Add `src/types/launch.type.ts` with the `Launch` model, DTOs, allowed statuses, and lifecycle transition rules.
   - Store `rocketId`, `scheduledAt`, `pricePerSeat`, `minimumPassengers`, `totalSeats`, `availableSeats`, and `status`.
2. Add in-memory launch repository
   - Create `src/repositories/launches.repository.ts` with `findAll`, `findById`, `create`, and `update` operations.
   - Keep repository behavior aligned with the existing rockets repository style.
3. Implement launch service rules
   - Create `src/services/launches.service.ts` to validate rocket existence by consulting `rocketsRepository`.
   - Copy rocket capacity into `totalSeats` at launch creation time.
   - Enforce editable fields only while status is `scheduled`.
   - Enforce valid status transitions and descriptive domain errors.
4. Expose `/launches` routes
   - Create `src/routes/launches.router.ts` with `POST /launches`, `GET /launches`, `GET /launches/:id`, `PATCH /launches/:id`, and `PATCH /launches/:id/status`.
   - Add request validation for ISO dates, positive price, minimum passengers, and allowed statuses.
   - Mount the router from `src/server.ts`.
5. Test the endpoint end-to-end
   - Extend Playwright coverage with happy paths and validation failures from the launches spec.
   - Cover 404 for missing rocket or launch IDs, 400 for invalid payloads, and 409 for invalid status transitions or non-editable launches.
6. Document the new resource
   - Update `README.md` API reference with the launches endpoints and launch model.
   - Keep [specs/launches.spec.md](specs/launches.spec.md) as the source of truth for acceptance criteria.
7. Delivery sequencing
   - Implement domain model and repository first.
   - Follow with service + routes.
   - Finish with tests and documentation to keep review scope clear.

Acceptance criteria
-------------------
- `/launches` supports the five operations defined in [specs/launches.spec.md](specs/launches.spec.md).
- Launch creation fails when `rocketId` does not exist.
- Launch creation and update fail when `minimumPassengers` exceeds rocket capacity.
- Launch status transitions follow the documented lifecycle rules.
- Existing rocket endpoints remain unchanged.
- Automated tests cover the main happy paths and validation scenarios.

Estimated effort
----------------
- Medium: ~1 to 2 working days including implementation, tests, and documentation.

Notes
-----
- Do not add persistence or authentication in this iteration.
- Do not implement bookings or payment side effects as part of the launches endpoint.
- Preserve stable launch capacity even if the linked rocket is updated later.

Checklist
---------
- [ ] Add `src/types/launch.type.ts`
- [ ] Add `src/repositories/launches.repository.ts`
- [ ] Add `src/services/launches.service.ts`
- [ ] Add `src/routes/launches.router.ts`
- [ ] Mount launches router in `src/server.ts`
- [ ] Add end-to-end coverage for launches
- [ ] Update `README.md`