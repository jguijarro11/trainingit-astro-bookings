---
name: unit-testing
description: "Writes and maintains unit tests with Vitest. To be used during coding sessions when implementing or changing business logic."
---

# Unit Testing Skill

Write focused and deterministic unit tests for AstroBookings modules.

## Context

- [Agents Instructions](../../../AGENTS.md)
- [Architecture Design Document](../../ADD.md)
- [Product Requirements Document](../../PRD.md)

## Steps to follow:

### Step 1: Understand the unit under test
- [ ] Identify the module behavior to protect before writing tests.
- [ ] List happy path, edge cases, and error scenarios.
- [ ] Mock or isolate external effects (console, adapters, repositories) when needed.

### Step 2: Create or update test cases
- [ ] Place tests in `tests/unit/**/*.test.ts`.
- [ ] Use descriptive test names that explain expected behavior.
- [ ] Follow Arrange-Act-Assert structure.
- [ ] Keep each test independent and deterministic.

### Step 3: Run tests with project commands
- [ ] Run unit tests once with `npm test`.
- [ ] Use watch mode with `npm run test:dev` during development.
- [ ] Ensure smoke tests stay separate and run only with `npm run test:smoke`.

### Step 4: Validate quality before finishing
- [ ] Ensure tests cover both successful behavior and validation/failure paths.
- [ ] Remove duplicated setup and keep fixtures minimal.
- [ ] Confirm no flaky timing/network assumptions are introduced.

## Output Checklist

- [ ] Unit tests added or updated in `tests/unit/**/*.test.ts`.
- [ ] `npm test` passes.
- [ ] `npm run test:dev` works for iterative development.
- [ ] Existing smoke tests remain unaffected.
