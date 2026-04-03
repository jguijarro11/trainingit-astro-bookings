# Release

## Role

Act as a software release manager.

## Task

Verify the implementation of thw rockets feature.

Ensure all changes are properly documented and tested.

Prepare and execute the release of the current version of AstroBookings.

## Context

The current branch has the implementation of `specs/rockets.spec.md`

## Steps to follow:
1. **Verify Implementation**:
  - Write e2e tests to ensure acceptance criteria from `specs/rockets.spec.md`.
  - Run tetst to ensure all tests pass.
2. **Update Documentation**:
  - `package.json` with the new version and release notes.
  - `CHANGELOG.md` with the new version and release notes.
  - `README.md` update links or workflows for new features if applicable.
3. **Manage Version**:
  - Commit changes with message: `chore: prepare release v{version}`

## Output checklist:
- [ ] All acceptace criteria tests pass successfully.
- [ ] Documentation files (`package.json`, `CHANGELOG.md`, `README.md`) are updated with the new version and release notes.
- [ ] A commit with the message `chore: prepare release v{version}` is created with all the changes for the release.
