## Implementation Plan for feat-customer-registration

### Step 1: Define Customer types
Add the `Customer` domain type, its DTOs, and the email validation constant.
- [x] Create `src/types/customer.type.ts` with `Customer` type (`email`, `name`, `phone`).
- [x] Add `CreateCustomerDto` as `Customer` (all fields required on creation).
- [x] Export a named constant `EMAIL_REGEX` for basic email format validation.

### Step 2: Create customers repository
Implement the in-memory persistence layer keyed by normalized email.
- [x] Create `src/repositories/customers.repository.ts`.
- [x] Store customers in a `Customer[]` in-process array.
- [x] Implement `findAll(): Customer[]`.
- [x] Implement `findByEmail(email: string): Customer | undefined` using normalized (lowercase + trimmed) comparison.
- [x] Implement `create(dto: CreateCustomerDto): Customer` that normalizes the email before storing.

### Step 3: Create customers service
Enforce business rules: email uniqueness and input completeness.
- [x] Create `src/services/customers.service.ts`.
- [x] Implement `getCustomers(): Customer[]` delegating to repository.
- [x] Implement `getCustomerByEmail(email: string): Customer | undefined` delegating to repository.
- [x] Implement `createCustomer(dto: CreateCustomerDto): Customer | string` returning an error string on duplicate email.

### Step 4: Create customers router
Handle HTTP transport, input validation, and error mapping for `/customers`.
- [x] Create `src/routes/customers.router.ts`.
- [x] Implement `validateCreateDto(body: unknown): CreateCustomerDto | string` validating `email` format, `name`, and `phone` presence.
- [x] Implement `GET /customers` → `200` with customer array.
- [x] Implement `GET /customers/:email` → `200` on found, `404` on missing.
- [x] Implement `POST /customers` → `201` on created, `400` on invalid payload, `409` on duplicate email.

### Step 5: Register customers router in server
Wire the new router into the Express application.
- [x] Import `customersRouter` in `src/server.ts`.
- [x] Register `app.use("/customers", customersRouter)`.
- [x] Verify the server starts without errors (`npm run dev`).

### Step 6: Write unit tests
Cover the service layer and the repository email-normalization logic.
- [x] Create `src/services/customers.service.spec.ts`.
- [x] Test `createCustomer` happy path returns a customer.
- [x] Test `createCustomer` returns an error string when email is already registered.
- [x] Test `createCustomer` treats emails differing only by case as duplicates.
- [x] Test `getCustomerByEmail` returns `undefined` for an unknown email.
