## Implementation Plan for feat-customer-registration

### Step 1: Define Customer types
Add the `Customer` domain type, its DTOs, and the email validation constant.
- [ ] Create `src/types/customer.type.ts` with `Customer` type (`email`, `name`, `phone`).
- [ ] Add `CreateCustomerDto` as `Omit<Customer, never>` (all fields required on creation).
- [ ] Export a named constant `EMAIL_REGEX` for basic email format validation.

### Step 2: Create customers repository
Implement the in-memory persistence layer keyed by normalized email.
- [ ] Create `src/repositories/customers.repository.ts`.
- [ ] Store customers in a `Customer[]` in-process array.
- [ ] Implement `findAll(): Customer[]`.
- [ ] Implement `findByEmail(email: string): Customer | undefined` using normalized (lowercase + trimmed) comparison.
- [ ] Implement `create(dto: CreateCustomerDto): Customer` that normalizes the email before storing.

### Step 3: Create customers service
Enforce business rules: email uniqueness and input completeness.
- [ ] Create `src/services/customers.service.ts`.
- [ ] Implement `getCustomers(): Customer[]` delegating to repository.
- [ ] Implement `getCustomerByEmail(email: string): Customer | undefined` delegating to repository.
- [ ] Implement `createCustomer(dto: CreateCustomerDto): Customer | string` returning an error string on duplicate email.

### Step 4: Create customers router
Handle HTTP transport, input validation, and error mapping for `/customers`.
- [ ] Create `src/routes/customers.router.ts`.
- [ ] Implement `validateCreateDto(body: unknown): CreateCustomerDto | string` validating `email` format, `name`, and `phone` presence.
- [ ] Implement `GET /customers` → `200` with customer array.
- [ ] Implement `GET /customers/:email` → `200` on found, `404` on missing.
- [ ] Implement `POST /customers` → `201` on created, `400` on invalid payload, `409` on duplicate email.

### Step 5: Register customers router in server
Wire the new router into the Express application.
- [ ] Import `customersRouter` in `src/server.ts`.
- [ ] Register `app.use("/customers", customersRouter)`.
- [ ] Verify the server starts without errors (`npm run dev`).

### Step 6: Write unit tests
Cover the service layer and the repository email-normalization logic.
- [ ] Create `src/services/customers.service.test.ts`.
- [ ] Test `createCustomer` happy path returns a customer.
- [ ] Test `createCustomer` returns an error string when email is already registered.
- [ ] Test `createCustomer` treats emails differing only by case as duplicates.
- [ ] Test `getCustomerByEmail` returns `undefined` for an unknown email.
