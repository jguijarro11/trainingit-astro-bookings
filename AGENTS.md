# Agents Instructions

## Product Overview
- **AstroBookings** is a backend API for offering bookings for rocket launches.
- Launches are scheduled for specific rockets, with pricing and minimum passenger thresholds.
- Rockets have limited seats; launch requests are validated against rocket capacity.
- Launch status lifecycle: scheduled → confirmed → successful, or cancellation/suspension paths.
- A customer is identified by their email address and has a name and phone number.
- One customer can book multiple seats on a launch but cannot exceed the available seats.
- Customers are billed upon booking, and payments are processed through a mock gateway.

## Technical Implementation

### Tech Stack
- **Language**: TypeScript 5.8
- **Framework**: Express 5.2
- **Database**: In-memory (no database required at the initial stage)
- **Security**: None required at the initial stage
- **Testing**: Node.js built-in test runner (unit) + Playwright 1.59 (E2E/smoke)
- **Logging**: Centralized console logger (`src/logger.ts`) with level filtering via `LOG_LEVEL`

### Development workflow

```bash
# Set up the project
npm install

# Build/Compile the project
npm run build

# Run the project (development)
npm run dev

# Run the project (production, after build)
npm start

# Test the project (unit tests)
npm test

# Test the project (E2E smoke tests)
npm run test:smoke
```

### Folder structure
```text
.                               # Project root
├── AGENTS.md                   # This file with instructions for AI agents
├── package.json                # Node.js project config
├── tsconfig.json               # TypeScript compiler config
├── playwright.config.ts        # Playwright E2E test config
├── src/
│   ├── index.ts                # Entry point
│   ├── logger.ts               # Centralized logger utility
│   ├── server.ts               # Express server setup and startup
│   ├── repositories/           # Data access layer (in-memory)
│   │   └── rockets.repository.ts
│   ├── routes/                 # Express route handlers
│   │   ├── health.router.ts
│   │   └── rockets.router.ts
│   ├── services/               # Application services
│   │   └── rockets.service.ts
│   └── types/                  # TypeScript type definitions
│       └── rocket.type.ts
├── tests/                      # E2E / smoke tests (Playwright)
│   ├── rockets.spec.ts
│   └── smoke.spec.ts
├── test-results/                # Test run outputs
└── specs/                      # Feature specification documents
    └── rockets.spec.md
```

## Environment
- Code and documentation must be in English.
- Chat responses must be in the language of the user prompt.
- Sacrifice grammar for conciseness when needed to fit response limits.
- This is a macOS environment using zsh terminal.
- Mind the available **agent skills** when performing tasks.
- When using templates, ensure to replace {placeholders} with actual values.

### Naming Conventions

Use slugs with hyphens for any identifiers or non code file names.

Use this table to determine the prefixes:

| Spec         | GitHub Label | Git Branch   | Commit |
|--------------|--------------|--------------|--------|
| feat-<slug>  | enhancement  | feat/<slug>  | feat:  |
| bug-<slug>   | bug          | fix/<slug>   | fix:   |
| chore-<slug> | chore        | chore/<slug> | chore: |

Default git branch is `main`.
