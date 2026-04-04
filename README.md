# AstroBookings 

A **backend API** for offering bookings for rocket launches.

- Launches are scheduled for specific rockets, with pricing and minimum passenger thresholds.

- Rockets have limited seats; launch requests are validated against rocket capacity.

- Launch status lifecycle: scheduled → confirmed → successful, or cancellation/suspension paths.

- A customer is identified by their email address and has a name and phone number.

- One customer can book multiple seats on a launch but cannot exceed the available seats.

- Customers are billed upon booking, and payments are processed through a mock gateway.

> [!WARNING]
> AstroBookings is a fictional space travel company.
> The system is designed for demonstration and training purposes. 
> Not for production use; no security or database is required at the initial stage.

---

## API Reference

### Health

| Method | Path      | Description          | Status |
|--------|-----------|----------------------|--------|
| GET    | `/health` | Server health check  | 200    |

### Rockets

| Method | Path            | Description                  | Status |
|--------|-----------------|------------------------------|--------|
| GET    | `/rockets`      | List all rockets             | 200    |
| GET    | `/rockets/:id`  | Get a rocket by ID           | 200    |
| POST   | `/rockets`      | Create a new rocket          | 201    |
| PUT    | `/rockets/:id`  | Update a rocket by ID        | 200    |
| DELETE | `/rockets/:id`  | Delete a rocket by ID        | 204    |

**Rocket model:**

```json
{
  "id": "uuid",
  "name": "Falcon 9",
  "range": "orbital",
  "capacity": 8
}
```

- `range`: one of `suborbital` | `orbital` | `moon` | `mars`
- `capacity`: integer between 1 and 10

### Launches

| Method | Path                      | Description                          | Status |
|--------|---------------------------|--------------------------------------|--------|
| GET    | `/launches`               | List all launches                    | 200    |
| GET    | `/launches/:id`           | Get a launch by ID                   | 200    |
| POST   | `/launches`               | Create a launch for an existing rocket | 201  |
| PATCH  | `/launches/:id`           | Update editable launch fields        | 200    |
| PATCH  | `/launches/:id/status`    | Transition launch status             | 200    |

**Launch model:**

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

- `scheduledAt`: future ISO-8601 timestamp.
- `pricePerSeat`: positive number.
- `minimumPassengers`: integer between 1 and `totalSeats`.
- `totalSeats`: copied from the rocket capacity at creation time (immutable).
- `availableSeats`: initialized to `totalSeats`; decremented by future bookings.
- `status`: one of `scheduled` | `confirmed` | `suspended` | `successful` | `cancelled`.

**Status lifecycle:**

- `scheduled` → `confirmed` | `suspended` | `cancelled`
- `confirmed` → `successful` | `suspended` | `cancelled`
- `suspended` → `scheduled` | `cancelled`
- `successful` and `cancelled` are terminal states.

### Customers

| Method | Path                  | Description                    | Status |
|--------|-----------------------|--------------------------------|--------|
| GET    | `/customers`          | List all registered customers  | 200    |
| GET    | `/customers/:email`   | Get a customer by email        | 200    |
| POST   | `/customers`          | Register a new customer        | 201    |

**Customer model:**

```json
{
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "phone": "+34-600-123-456"
}
```

- `email`: unique customer identifier (normalized by trim + lowercase).
- `name`: required non-empty string.
- `phone`: required non-empty string.

**Validation and conflicts:**

- Duplicate customer email returns `409`.
- Invalid or missing `email`, `name`, or `phone` returns `400`.
- Unknown customer email on `GET /customers/:email` returns `404`.

### Bookings

| Method | Path                           | Description                                | Status |
|--------|--------------------------------|--------------------------------------------|--------|
| POST   | `/launches/:id/bookings`       | Create a booking for a launch              | 201    |
| GET    | `/launches/:id/bookings`       | List bookings for a launch                 | 200    |

**Booking model:**

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

- `launchId`: target launch identifier.
- `customerEmail`: registered customer email.
- `seats`: positive integer number of seats.
- `pricePerSeat`: launch price snapshot at booking time.
- `totalAmount`: computed as `seats * pricePerSeat`.

**Validation and conflicts:**

- Unknown launch on booking creation returns `404`.
- Unknown customer on booking creation returns `404`.
- Invalid `seats` (non-positive integer) returns `400`.
- Overbooking (`seats` > `availableSeats`) returns `409`.
- Successful booking decrements launch `availableSeats` exactly by booked seats.

---

## Logging

The API uses a centralized console logger.

- Logger module: `src/logger.ts`
- Available methods: `info`, `warn`, `error`, `debug`
- Output format: `[<ISO_TIMESTAMP>] [<LEVEL>] message`

### `LOG_LEVEL`

Use `LOG_LEVEL` to control verbosity:

- `error`
- `warn`
- `info` (default)
- `debug`

Example:

```bash
LOG_LEVEL=debug npm run dev
```

---

- [Repository at GitHub](https://github.com/jguijarro11/trainingit-astro-bookings)
- Default branch: `main`

- **Author**: [Jorge Guijarro](https://www.linkedin.com/in/jorge-guijarro-del-nuevo/)
- **Socials**:
  - [LinkedIn](https://www.linkedin.com/in/jorge-guijarro-del-nuevo/)
  - [GitHub](https://github.com/jguijarro11)

