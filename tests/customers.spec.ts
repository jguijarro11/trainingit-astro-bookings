import { test, expect } from "@playwright/test";

const CUSTOMERS_PATH = "/customers";

const VALID_CUSTOMER = {
  email: "jane.doe@example.com",
  name: "Jane Doe",
  phone: "+34-600-123-456",
};

test.describe("Customers API", () => {
  // EARS-01: POST with valid data returns 201 with customer data
  test("EARS-01: POST /customers with valid data creates customer and returns 201", async ({ request }) => {
    const uniqueEmail = `ears01.${Date.now()}@example.com`;
    const response = await request.post(CUSTOMERS_PATH, {
      data: { ...VALID_CUSTOMER, email: uniqueEmail },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.email).toBe(uniqueEmail);
    expect(body.name).toBe(VALID_CUSTOMER.name);
    expect(body.phone).toBe(VALID_CUSTOMER.phone);
  });

  // EARS-02: Created customer persists email, name, phone
  test("EARS-02: Created customer persists email, name, and phone", async ({ request }) => {
    const uniqueEmail = `ears02.${Date.now()}@example.com`;
    await request.post(CUSTOMERS_PATH, {
      data: { email: uniqueEmail, name: "Test User", phone: "+1-555-000-0001" },
    });

    const response = await request.get(`${CUSTOMERS_PATH}/${uniqueEmail}`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.email).toBe(uniqueEmail);
    expect(body.name).toBe("Test User");
    expect(body.phone).toBe("+1-555-000-0001");
  });

  // EARS-03: Duplicate email returns 409
  test("EARS-03: POST /customers with duplicate email returns 409", async ({ request }) => {
    const uniqueEmail = `ears03.${Date.now()}@example.com`;
    await request.post(CUSTOMERS_PATH, {
      data: { ...VALID_CUSTOMER, email: uniqueEmail },
    });

    const response = await request.post(CUSTOMERS_PATH, {
      data: { ...VALID_CUSTOMER, email: uniqueEmail },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-04: Email differing only in case returns 409
  test("EARS-04: POST /customers with email differing only in casing returns 409", async ({ request }) => {
    const baseEmail = `ears04.${Date.now()}@example.com`;
    await request.post(CUSTOMERS_PATH, {
      data: { ...VALID_CUSTOMER, email: baseEmail },
    });

    const upperEmail = baseEmail.toUpperCase();
    const response = await request.post(CUSTOMERS_PATH, {
      data: { ...VALID_CUSTOMER, email: upperEmail },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-05: Missing / blank / invalid email returns 400
  test("EARS-05a: POST /customers without email returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { name: "No Email", phone: "+1-555-000-0002" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("EARS-05b: POST /customers with blank email returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { email: "  ", name: "Blank Email", phone: "+1-555-000-0003" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("EARS-05c: POST /customers with invalid email format returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { email: "not-an-email", name: "Bad Email", phone: "+1-555-000-0004" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-06: Missing / blank name returns 400
  test("EARS-06a: POST /customers without name returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { email: `ears06a.${Date.now()}@example.com`, phone: "+1-555-000-0005" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("EARS-06b: POST /customers with blank name returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { email: `ears06b.${Date.now()}@example.com`, name: "   ", phone: "+1-555-000-0006" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-07: Missing / blank phone returns 400
  test("EARS-07a: POST /customers without phone returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { email: `ears07a.${Date.now()}@example.com`, name: "No Phone" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("EARS-07b: POST /customers with blank phone returns 400", async ({ request }) => {
    const response = await request.post(CUSTOMERS_PATH, {
      data: { email: `ears07b.${Date.now()}@example.com`, name: "Blank Phone", phone: "  " },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-08: GET /customers returns all customers with 200
  test("EARS-08: GET /customers returns all registered customers with HTTP 200", async ({ request }) => {
    const response = await request.get(CUSTOMERS_PATH);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  // EARS-09: GET /customers/:email with existing email returns customer
  test("EARS-09: GET /customers/:email with existing email returns customer with HTTP 200", async ({ request }) => {
    const uniqueEmail = `ears09.${Date.now()}@example.com`;
    await request.post(CUSTOMERS_PATH, {
      data: { email: uniqueEmail, name: "Ears Nine", phone: "+1-555-000-0009" },
    });

    const response = await request.get(`${CUSTOMERS_PATH}/${uniqueEmail}`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.email).toBe(uniqueEmail);
    expect(body.name).toBe("Ears Nine");
  });

  // EARS-10: GET /customers/:email with unknown email returns 404
  test("EARS-10: GET /customers/:email with unknown email returns 404", async ({ request }) => {
    const response = await request.get(`${CUSTOMERS_PATH}/unknown.user@example.com`);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});
