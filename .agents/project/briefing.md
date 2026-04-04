# Briefing — AstroBookings

AstroBookings provides a backend API for rocket launch bookings.
It lets operators schedule launches and customers reserve seats.

Rockets have fixed seats and launches enforce seat limits.
Bookings charge customers via a mock gateway on success.

Services follow layered architecture: routes, services, repositories.
Tests use Vitest for unit tests and Playwright for E2E.

Key focus: correctness of seat invariants and clear service APIs.
Keep changes small, test-driven, and documented in specs.
