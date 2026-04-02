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
- **Language**: TypeScript
- **Framework**: Astro
- **Database**: None (not required at the initial stage)
- **Security**: None (not required at the initial stage)
- **Testing**: TBD
- **Logging**: TBD

### Development workflow

```bash
# Set up the project
npm install

# Build/Compile the project
npm run build

# Run the project
npm run dev

# Test the project
npm run test

# Deploy the project
npm run preview
```

### Folder structure
```text
.                         # Project root
├── AGENTS.md             # This file with instructions for AI agents
├── README.md             # Project documentation
├── src/                  # Source code
│   ├── pages/            # Astro pages and API routes
│   └── components/       # Reusable components
└── public/               # Static assets
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

| Spec        | GitHub Label  | Git Branch    | Commit  |
|-------------|---------------|---------------|---------|
| feat-<slug> | enhancement   | feat/<slug>   | feat:   |
| bug-<slug>  | bug           | fix/<slug>    | fix:    |
| chore-<slug>| chore         | chore/<slug>  | chore:  |

Default git branch is `main` unless specified otherwise.
