import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

const ROCKETS_PATH = "/rockets";
const LAUNCHES_PATH = "/launches";

const VALID_ROCKET_BASE = { range: "orbital", capacity: 8 };

const FUTURE_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const PAST_DATE = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

test.describe("Launches API", () => {
  let rocketId: string;

  test.beforeEach(async ({ request }) => {
    const res = await request.post(ROCKETS_PATH, {
      data: { ...VALID_ROCKET_BASE, name: `Test Rocket ${randomUUID()}` },
    });
    const body = await res.json();
    rocketId = body.id;
  });

  // EARS-01 + EARS-02: POST with valid data creates launch with correct defaults
  test("EARS-01/02: POST /launches with valid data creates launch and returns 201", async ({ request }) => {
    const response = await request.post(LAUNCHES_PATH, {
      data: {
        rocketId,
        scheduledAt: FUTURE_DATE,
        pricePerSeat: 250000,
        minimumPassengers: 4,
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.id).toBeDefined();
    expect(body.rocketId).toBe(rocketId);
    expect(body.totalSeats).toBe(VALID_ROCKET_BASE.capacity);
    expect(body.availableSeats).toBe(VALID_ROCKET_BASE.capacity);
    expect(body.status).toBe("scheduled");
    expect(body.pricePerSeat).toBe(250000);
    expect(body.minimumPassengers).toBe(4);
  });

  // EARS-03: POST with non-existent rocketId returns 404
  test("EARS-03: POST /launches with non-existent rocketId returns 404", async ({ request }) => {
    const response = await request.post(LAUNCHES_PATH, {
      data: {
        rocketId: "00000000-0000-0000-0000-000000000000",
        scheduledAt: FUTURE_DATE,
        pricePerSeat: 100,
        minimumPassengers: 1,
      },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-04: minimumPassengers exceeds rocket capacity returns 400
  test("EARS-04: POST /launches with minimumPassengers exceeding capacity returns 400", async ({ request }) => {
    const response = await request.post(LAUNCHES_PATH, {
      data: {
        rocketId,
        scheduledAt: FUTURE_DATE,
        pricePerSeat: 100,
        minimumPassengers: 99,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(body.error).toContain("minimumPassengers");
  });

  // EARS-05: non-positive pricePerSeat returns 400
  test("EARS-05: POST /launches with non-positive pricePerSeat returns 400", async ({ request }) => {
    const response = await request.post(LAUNCHES_PATH, {
      data: {
        rocketId,
        scheduledAt: FUTURE_DATE,
        pricePerSeat: 0,
        minimumPassengers: 2,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("pricePerSeat");
  });

  // EARS-06: past scheduledAt returns 400
  test("EARS-06: POST /launches with past scheduledAt returns 400", async ({ request }) => {
    const response = await request.post(LAUNCHES_PATH, {
      data: {
        rocketId,
        scheduledAt: PAST_DATE,
        pricePerSeat: 100,
        minimumPassengers: 2,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("scheduledAt");
  });

  // EARS-07: GET /launches returns all
  test("EARS-07: GET /launches returns list with HTTP 200", async ({ request }) => {
    await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });

    const response = await request.get(LAUNCHES_PATH);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  // EARS-08: GET /launches/:id with existing ID
  test("EARS-08: GET /launches/:id with existing ID returns launch with HTTP 200", async ({ request }) => {
    const createRes = await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });
    const { id } = await createRes.json();

    const response = await request.get(`${LAUNCHES_PATH}/${id}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(id);
  });

  // EARS-09: GET /launches/:id with non-existent ID returns 404
  test("EARS-09: GET /launches/:id with non-existent ID returns 404", async ({ request }) => {
    const response = await request.get(`${LAUNCHES_PATH}/non-existent-id`);
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-10: PATCH /launches/:id while scheduled updates successfully
  test("EARS-10: PATCH /launches/:id while scheduled returns updated launch with HTTP 200", async ({ request }) => {
    const createRes = await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });
    const { id } = await createRes.json();

    const newDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const response = await request.patch(`${LAUNCHES_PATH}/${id}`, {
      data: { pricePerSeat: 999, scheduledAt: newDate },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.pricePerSeat).toBe(999);
    expect(body.scheduledAt).toBe(newDate);
  });

  // EARS-11: PATCH /launches/:id while not in scheduled status returns 409
  test("EARS-11: PATCH /launches/:id while not scheduled returns 409", async ({ request }) => {
    const createRes = await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });
    const { id } = await createRes.json();

    await request.patch(`${LAUNCHES_PATH}/${id}/status`, { data: { status: "confirmed" } });

    const response = await request.patch(`${LAUNCHES_PATH}/${id}`, {
      data: { pricePerSeat: 500 },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-12: PATCH /launches/:id/status with valid transition
  test("EARS-12: PATCH /launches/:id/status with valid transition returns updated launch with HTTP 200", async ({ request }) => {
    const createRes = await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });
    const { id } = await createRes.json();

    const response = await request.patch(`${LAUNCHES_PATH}/${id}/status`, {
      data: { status: "confirmed" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("confirmed");
  });

  // EARS-13: PATCH /launches/:id/status with invalid transition returns 409
  test("EARS-13: PATCH /launches/:id/status with invalid transition returns 409", async ({ request }) => {
    const createRes = await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });
    const { id } = await createRes.json();

    // scheduled → successful is not a valid transition
    const response = await request.patch(`${LAUNCHES_PATH}/${id}/status`, {
      data: { status: "successful" },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  // EARS-14: PATCH /launches/:id/status with unknown status returns 400
  test("EARS-14: PATCH /launches/:id/status with unknown status returns 400", async ({ request }) => {
    const createRes = await request.post(LAUNCHES_PATH, {
      data: { rocketId, scheduledAt: FUTURE_DATE, pricePerSeat: 100, minimumPassengers: 1 },
    });
    const { id } = await createRes.json();

    const response = await request.patch(`${LAUNCHES_PATH}/${id}/status`, {
      data: { status: "blastoff" },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("status");
  });
});
