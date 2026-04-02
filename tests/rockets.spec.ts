import { test, expect } from "@playwright/test";

const ROCKETS_PATH = "/rockets";

const VALID_ROCKET = { name: "Falcon 9", range: "orbital", capacity: 8 };

test.describe("Rockets API", () => {
  let createdId: string;

  // EARS-01: POST with valid data returns 201
  test("EARS-01: POST /rockets with valid data creates rocket and returns 201", async ({ request }) => {
    const response = await request.post(ROCKETS_PATH, { data: VALID_ROCKET });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe(VALID_ROCKET.name);
    expect(body.range).toBe(VALID_ROCKET.range);
    expect(body.capacity).toBe(VALID_ROCKET.capacity);

    createdId = body.id;
  });

  // EARS-02: GET /rockets returns all rockets with 200
  test("EARS-02: GET /rockets returns list with HTTP 200", async ({ request }) => {
    const response = await request.get(ROCKETS_PATH);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  // EARS-03: GET /rockets/:id with existing ID returns rocket with 200
  test("EARS-03: GET /rockets/:id with existing ID returns rocket with HTTP 200", async ({ request }) => {
    const createResponse = await request.post(ROCKETS_PATH, {
      data: { name: "Starship Test", range: "mars", capacity: 10 },
    });
    const { id } = await createResponse.json();

    const response = await request.get(`${ROCKETS_PATH}/${id}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(id);
    expect(body.name).toBe("Starship Test");
  });

  // EARS-04: PUT /rockets/:id with valid data updates rocket and returns 200
  test("EARS-04: PUT /rockets/:id with valid data updates rocket and returns HTTP 200", async ({ request }) => {
    const createResponse = await request.post(ROCKETS_PATH, {
      data: { name: "Rocket to Update", range: "suborbital", capacity: 3 },
    });
    const { id } = await createResponse.json();

    const response = await request.put(`${ROCKETS_PATH}/${id}`, {
      data: { capacity: 5 },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(id);
    expect(body.capacity).toBe(5);
  });

  // EARS-05: DELETE /rockets/:id with existing ID returns 204
  test("EARS-05: DELETE /rockets/:id with existing ID removes rocket and returns HTTP 204", async ({ request }) => {
    const createResponse = await request.post(ROCKETS_PATH, {
      data: { name: "Rocket to Delete", range: "moon", capacity: 2 },
    });
    const { id } = await createResponse.json();

    const response = await request.delete(`${ROCKETS_PATH}/${id}`);

    expect(response.status()).toBe(204);

    const getResponse = await request.get(`${ROCKETS_PATH}/${id}`);
    expect(getResponse.status()).toBe(404);
  });

  // EARS-06: Invalid range returns 400
  test("EARS-06: POST /rockets with invalid range returns HTTP 400 with error message", async ({ request }) => {
    const response = await request.post(ROCKETS_PATH, {
      data: { name: "Bad Range Rocket", range: "jupiter", capacity: 5 },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.error).toContain("range");
  });

  // EARS-07: Invalid capacity returns 400
  test("EARS-07: POST /rockets with invalid capacity returns HTTP 400 with error message", async ({ request }) => {
    const response = await request.post(ROCKETS_PATH, {
      data: { name: "Bad Capacity Rocket", range: "orbital", capacity: 99 },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.error).toContain("capacity");
  });

  // EARS-08: Non-existent ID returns 404
  test("EARS-08: GET /rockets/:id with non-existent ID returns HTTP 404 with error message", async ({ request }) => {
    const response = await request.get(`${ROCKETS_PATH}/non-existent-id`);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-09: Duplicate name returns 409
  test("EARS-09: POST /rockets with duplicate name returns HTTP 409 with error message", async ({ request }) => {
    const name = "Unique Rocket Name";
    await request.post(ROCKETS_PATH, {
      data: { name, range: "orbital", capacity: 4 },
    });

    const response = await request.post(ROCKETS_PATH, {
      data: { name, range: "moon", capacity: 6 },
    });

    expect(response.status()).toBe(409);

    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.error).toContain(name);
  });
});
