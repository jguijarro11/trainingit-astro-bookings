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

