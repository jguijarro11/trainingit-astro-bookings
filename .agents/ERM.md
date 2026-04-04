# AstroBookings Entity-Relationship Model

## Entities

### Rocket
- **id**: UUID (primary key, generated)
- **name**: string (unique)
- **range**: `suborbital` | `orbital` | `moon` | `mars`
- **capacity**: integer (1–10)

### Launch
- **id**: UUID (primary key, generated)
- **rocketId**: UUID (foreign key → Rocket)
- **scheduledAt**: ISO-8601 DateTime (future)
- **pricePerSeat**: positive number
- **minimumPassengers**: integer (1–totalSeats)
- **totalSeats**: integer (snapshot of Rocket.capacity at creation, immutable)
- **availableSeats**: integer (initialized to totalSeats; decremented on booking)
- **status**: `scheduled` | `confirmed` | `suspended` | `successful` | `cancelled`

- `totalSeats` is immutable after creation.
- `availableSeats` cannot be negative.
- Status transitions follow a controlled lifecycle; terminal states are `successful` and `cancelled`.

### Customer
- **email**: string (primary key, unique; normalized to lowercase and trimmed)
- **name**: string (non-empty)
- **phone**: string (non-empty)

- Email is the unique customer identifier.
- Email matching is case-insensitive (stored and compared normalized).

## Relationships

```mermaid
erDiagram
    ROCKET {
        string id PK
        string name
        string range
        int capacity
    }

    LAUNCH {
        string id PK
        string rocketId FK
        datetime scheduledAt
        number pricePerSeat
        int minimumPassengers
        int totalSeats
        int availableSeats
        string status
    }

    CUSTOMER {
        string email PK
        string name
        string phone
    }

    ROCKET ||--o{ LAUNCH : "is assigned to"
```

> Booking and Payment entities will be added when FR5 and FR6 are specified. The `CUSTOMER` and `LAUNCH` relationship will be established through a future `BOOKING` entity.
