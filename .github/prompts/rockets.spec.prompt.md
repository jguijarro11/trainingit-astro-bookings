# Spec

## Role

Act as a software analyst 

## Task

Generate a specification to implement the funcionallity described below. Do not write any code or tests, just the specification.

## Context 

- An API endpoint to manage rockets in the AstroBookings travel application.
- Each rocket has:
  - name,
  - range ("suborbital", "orbital", "moon", "mars"),
  - capacity (1 to 10 passengers)

Ask for any additional context you need to generate the specification.

### Specification Template

Follow this template to generate the specification file `specs/rockets.spec.md`:  

````md
# Rocket Management API Specification
## Problem Description
- As {role}, I want to **{goal}** so that {reason}.
## Solution overview
- {Simple approach to solve the problem, no techinal details.}
## Acceptance Criteria
- [ ] EARS format
`````

## Steps to follow:

1. **Define the Problem**:
  - Clearly outline the problem with up to 3 user stories.
2. **Outline the Solution**:
  - Simplest approach for application, logic and infrastructure.
3. **Set Acceptance Criteria**:
  - Up to 9 acceptance criteria in EARS format (Event-Action-Result-Scenario).

## Output checklist:

- [ ] The output is a markdown file named `rockets.spec.md` in the `specs` folder.
- [ ] The specification with:
  - Problem Description,
  - Solution overview,
  - Acceptance Criteria in EARS format.


