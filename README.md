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

---

- [Repository at GitHub](https://github.com/AlbertoBasaloLabs/astro-bookings)
- Default branch: `main`

- **Author**: [Alberto Basalo](https://albertobasalo.dev)
- **Ai Code Academy en Español**: [AI code Academy](https://aicode.academy)
- **Socials**:
  - [X](https://x.com/albertobasalo)
  - [LinkedIn](https://www.linkedin.com/in/albertobasalo/)
  - [GitHub](https://github.com/albertobasalo)

