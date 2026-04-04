---
name: unit-testing
description: "Writes and maintains unit tests with Vitest. To be used during coding sessions when implementing or changing business logic."
---

# Unit Testing Skill

Write focused and deterministic unit tests for AstroBookings modules with Vitest.

## Context

- [Agents Instructions](../../../AGENTS.md)
- [Architecture Design Document](../../ADD.md)
- [Product Requirements Document](../../PRD.md)

## When to write unit tests

- Add tests for every new service or utility module with business logic.
- Add regression tests for every bug fix affecting service behavior.
- Add tests for complex lifecycle, validation, or invariant rules.

## File naming and location

- Colocate tests with source files using `*.spec.ts`.
- Example: `src/services/rockets.service.ts` and `src/services/rockets.service.spec.ts`.
- Keep Playwright E2E tests in `tests/` and never mix them with unit tests.

## Test structure

- Use `describe`/`it` blocks with behavior-first test names.
- Prefer Arrange-Act-Assert in each test.
- Keep tests deterministic and independent (no shared mutable state across tests).

## Mocking dependencies

- Mock repositories, adapters, and external services with `vi.fn()`/`vi.mock()`.
- Assert interaction contracts with `toHaveBeenCalledWith` and call counts.
- Keep mock setup small and local to each suite.

```ts
vi.mock("../repositories/rockets.repository.js", () => ({
	rocketsRepository: { findByName: vi.fn(), create: vi.fn() },
}));

expect(mockedRepository.create).toHaveBeenCalledWith(dto);
```

## Running tests

- Use `npm run test:dev` while implementing logic.
- Use `npm run test:unit` before finishing a change.
- Use `npm run test:coverage` when validating impact and gaps.

## Coverage expectations

- Aim for more than 80% coverage on services and utilities.
- Prioritize meaningful scenario coverage over line-count inflation.
- Reference Vitest docs for advanced features (timers, snapshots, custom matchers): https://vitest.dev/guide/

## Output Checklist

- [ ] Unit tests added or updated in colocated `*.spec.ts` files.
- [ ] `npm run test:unit` passes.
- [ ] `npm run test:dev` works for iterative development.
- [ ] Existing smoke tests remain unaffected.
