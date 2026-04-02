Title: Add simple console-based logger

Problem
-------
The application currently lacks centralized logging. Developers and operators rely on ad-hoc `console.log` calls scattered through the codebase, which leads to inconsistent message formats, missing timestamps, and no way to control log verbosity.

Goal
----
Introduce a minimal, centralized logging utility that wraps `console.log` calls and provides consistent formatting, basic log levels, and an environment-controlled verbosity switch. Implementation will use only `console.log` (no external dependencies).

Implementation Plan (actionable)
-------------------------------
1. Create logger module
   - Add `src/logger.ts` exporting `info()`, `warn()`, `error()`, and `debug()` wrappers around `console.log`.
   - Each wrapper should prepend an ISO-8601 timestamp and the log level (e.g., `[2026-04-02T12:00:00.000Z] [INFO]`), and accept an optional context object.
2. Add simple log level filtering
   - Introduce `LOG_LEVEL` environment variable (values: `error`, `warn`, `info`, `debug`).
   - Logger should skip messages below the configured level.
3. Integrate logger across the app
   - Replace ad-hoc `console.log` in `src/server.ts`, `src/index.ts`, `src/routes/*.ts`, and `src/repositories/*.ts` with the new logger functions.
   - Add request-level logs for incoming requests (method, path, status) and critical lifecycle events (startup, shutdown, errors, booking creation/validation events).
4. Keep behavior backward-compatible
   - Default `LOG_LEVEL` to `info` so typical console output remains similar.
   - Ensure no breaking change in message flow or error handling.
5. Tests and verification
   - Add unit tests for `src/logger.ts` verifying timestamped output and level filtering (using string matching or function spies).
   - Run existing test suite and smoke tests to ensure no regressions.
6. Documentation and onboarding
   - Document the logger and `LOG_LEVEL` in `README.md` and developer setup docs.
   - Provide short migration notes for contributors (how to use `logger.info()` vs `console.log`).
7. Rollout
   - Create a small feature branch and single PR that implements the logger and replaces a handful of `console.log` instances.
   - Iterate: merge when tests pass, then progressively replace remaining `console.log` usages in follow-up PRs to keep changes reviewable.

Acceptance criteria
-------------------
- `src/logger.ts` exists and exports the four wrappers.
- Core app files use the logger for startup, errors, and important events.
- `LOG_LEVEL` controls verbosity and defaults to `info`.
- Unit tests cover logger formatting and filtering.
- README updated with usage and env var description.

Estimated effort
----------------
- Small: ~2–4 hours to implement, test, and open the initial PR (depending on CI/setup).

Notes
-----
- Implementation will not add external dependencies—only a thin wrapper around `console.log`.
- Keep message formats simple and human-readable (no structured JSON required at this stage).

Checklist
---------
- [ ] Add `src/logger.ts` with wrappers
- [ ] Add unit tests for logger
- [ ] Replace high-priority `console.log` calls in core files
- [ ] Document `LOG_LEVEL` in README
- [ ] Open PR with implementation
