## Implementation Plan for feat-seat-booking

### Step 1: Define Booking types
Add the `Booking` domain type, its DTO, and service-error alias.
- [ ] Create `src/types/booking.type.ts` with a `Booking` type: `id`, `launchId`, `customerEmail`, `seats`, `pricePerSeat`, `totalAmount`, `createdAt`.
- [ ] Add `CreateBookingDto` type: `launchId` (from route param), `customerEmail`, `seats`.
- [ ] Export `BookingError` as a type alias `{ statusCode: number; message: string }`.
- [ ] Add constant `SEATS_MIN = 1` for the minimum seat validation guard.

### Step 2: Create bookings repository
Implement the in-memory persistence layer for booking records.
- [ ] Create `src/repositories/bookings.repository.ts` with an internal `Booking[]` array.
- [ ] Implement `findByLaunchId(launchId: string): Booking[]` filtering the array.
- [ ] Implement `create(booking: Booking): Booking` that pushes and returns the record.

### Step 3: Extend launches repository with seat decrement
Add a targeted method to safely decrement `availableSeats` on an existing launch.
- [ ] Add `decrementSeats(id: string, seats: number): Launch | undefined` to `src/repositories/launches.repository.ts`.
- [ ] The method must return `undefined` if the launch is not found or the resulting seats would be negative.

### Step 4: Create bookings service
Enforce all booking business rules and orchestrate repository calls.
- [ ] Create `src/services/bookings.service.ts`.
- [ ] Implement `getBookingsByLaunch(launchId: string): Booking[]` delegating to the booking repository.
- [ ] Implement `createBooking(dto: CreateBookingDto): Booking | BookingError`:
  - Return 404 `BookingError` if launch does not exist.
  - Return 404 `BookingError` if customer does not exist.
  - Return 400 `BookingError` if `seats` is not a positive integer.
  - Return 409 `BookingError` if `seats` exceeds launch `availableSeats`.
  - Persist the booking with a generated `id`, snapshot `pricePerSeat`, computed `totalAmount`, and current `createdAt`.
  - Decrement launch `availableSeats` only after successful booking persistence.

### Step 5: Write unit tests for bookings service
Validate business rules in isolation with Vitest mocked dependencies.
- [ ] Create `src/services/bookings.service.spec.ts`.
- [ ] Mock `launchesRepository`, `customersRepository`, and `bookingsRepository`.
- [ ] Test `createBooking` happy path returns a fully populated `Booking`.
- [ ] Test `createBooking` returns 404 when launch does not exist.
- [ ] Test `createBooking` returns 404 when customer is not registered.
- [ ] Test `createBooking` returns 400 when `seats` is not a positive integer.
- [ ] Test `createBooking` returns 409 when `seats` exceeds `availableSeats`.
- [ ] Test that `decrementSeats` is called only after booking persistence succeeds.

### Step 6: Add bookings endpoints to launches router
Wire booking creation and listing as nested routes under `/launches/:id/bookings`.
- [ ] Add `isBookingError` type guard in `src/routes/launches.router.ts`.
- [ ] Add `validateCreateBookingDto(body: unknown): Pick<CreateBookingDto, 'customerEmail' | 'seats'> | string` to validate `customerEmail` (non-empty string) and `seats` (positive integer).
- [ ] Implement `POST /launches/:id/bookings` → call `bookingsService.createBooking`, return `201` on success, `400`/`404`/`409` on typed errors.
- [ ] Implement `GET /launches/:id/bookings` → call `bookingsService.getBookingsByLaunch`, return `200` with booking array; return `404` if launch does not exist.

### Step 7: Verify, run tests, and build
Confirm the implementation compiles and all test suites remain green.
- [ ] Run `npm run build` and fix any TypeScript errors.
- [ ] Run `npm run test:unit` and confirm all unit tests pass.
- [ ] Run `npm test` (Playwright) and confirm smoke/E2E tests pass.
