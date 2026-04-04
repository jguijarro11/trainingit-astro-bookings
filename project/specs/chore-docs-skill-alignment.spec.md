# Documentation Skill Workflow Alignment Specification

- **Type**: chore
- **Status**: Draft
- **Feature Status**: InProgress

## Problem

Project documentation is partially misaligned with the current skill-driven workflow and with the real implementation status of requirements. This creates confusion about what is already delivered, what is pending, and which skill should be used for each documentation or delivery task.

## Goals

- Align core project docs with the skill-driven workflow used by contributors and agents.
- Reflect current implementation status consistently across PRD, specs, and supporting docs.
- Define a single, clear documentation baseline for future changes.

## Out of Scope

- Implementing product features, bug fixes, or refactors in source code.
- Changing API behavior, routes, services, repositories, or tests.
- Introducing new workflow tools beyond the existing skill set.

## Acceptance Criteria

- [ ] **AC-01** Given the current project docs, when the alignment chore is completed, then workflow guidance explicitly maps common tasks to the existing skills.
- [ ] **AC-02** Given requirement status entries in project docs, when reviewed after the update, then status values are consistent with the current implementation state.
- [ ] **AC-03** Given contributors following documentation instructions, when they start a task, then they can identify where to find PRD, ADD, specs, and relevant skills without ambiguity.
- [ ] **AC-04** Given duplicated or conflicting workflow guidance, when the update is applied, then conflicts are removed and one authoritative instruction path remains.
- [ ] **AC-05** Given this chore is documentation-only, when completed, then no runtime behavior changes are introduced in the application.

## Deliverables

- Updated PRD sections that reference the skill-driven workflow and accurate requirement statuses.
- Updated architecture/process guidance (ADD/agent instructions) where workflow mapping is unclear or outdated.
- Updated or added cross-reference notes in specs to ensure status and workflow consistency.
- A short documentation change summary in the related tracking artifact (changelog or equivalent project note).
